import React, { useState, useRef, useEffect } from 'react';
import { Save, Upload, Trash2, Eye, Loader2 } from 'lucide-react';
import { LogoService, LogoSettings as LogoSettingsType } from '../../../services/logoService';

const LogoSettings: React.FC = () => {
  const [logoSettings, setLogoSettings] = useState({
    currentLogo: '/lurevi-logo.svg',
    logoText: 'Lurevi',
    logoColor: '#F0B0B0',
    backgroundColor: '#FFFFFF',
    showUnderline: true,
    underlineColor: '#F0B0B0',
    fontSize: 42,
    fontFamily: 'Brush Script MT'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLogoSettings();
  }, []);

  const loadLogoSettings = async () => {
    try {
      setIsLoading(true);
      const settings = await LogoService.getActiveLogoSettings();
      if (settings) {
        setLogoSettings({
          currentLogo: settings.logo_url,
          logoText: settings.logo_text,
          logoColor: settings.logo_color,
          backgroundColor: settings.background_color,
          showUnderline: settings.show_underline,
          underlineColor: settings.underline_color,
          fontSize: settings.font_size,
          fontFamily: settings.font_family
        });
      }
    } catch (error) {
      console.error('Error loading logo settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      console.log('Saving logo settings:', logoSettings);
      
      let logoUrl = logoSettings.currentLogo;
      
      if (uploadedFile) {
        console.log('Uploading file to Supabase storage...');
        const uploadedUrl = await LogoService.uploadLogoFile(uploadedFile, uploadedFile.name);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
          console.log('File uploaded successfully:', uploadedUrl);
        } else {
          throw new Error('Failed to upload logo file');
        }
      } else if (logoSettings.currentLogo.startsWith('data:')) {
        console.log('Converting data URL to file and uploading...');
        const file = dataURLtoFile(logoSettings.currentLogo, 'custom-logo.png');
        const uploadedUrl = await LogoService.uploadLogoFile(file, 'custom-logo.png');
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
          console.log('Data URL uploaded successfully:', uploadedUrl);
        } else {
          throw new Error('Failed to upload logo from data URL');
        }
      } else if (logoSettings.logoText !== 'Lurevi' || logoSettings.logoColor !== '#F0B0B0') {
        console.log('Generating and uploading SVG...');
        const svgSettings: LogoSettingsType = {
          logo_url: '',
          logo_text: logoSettings.logoText,
          logo_color: logoSettings.logoColor,
          background_color: logoSettings.backgroundColor,
          show_underline: logoSettings.showUnderline,
          underline_color: logoSettings.underlineColor,
          font_size: logoSettings.fontSize,
          font_family: logoSettings.fontFamily,
          is_active: true
        };
        
        const uploadedUrl = await LogoService.uploadGeneratedSVG(svgSettings);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
          console.log('SVG uploaded successfully:', uploadedUrl);
        } else {
          throw new Error('Failed to upload generated SVG');
        }
      }
      
      console.log('Saving settings to database with URL:', logoUrl);
      const success = await LogoService.updateLogoSettings({
        logo_url: logoUrl,
        logo_text: logoSettings.logoText,
        logo_color: logoSettings.logoColor,
        background_color: logoSettings.backgroundColor,
        show_underline: logoSettings.showUnderline,
        underline_color: logoSettings.underlineColor,
        font_size: logoSettings.fontSize,
        font_family: logoSettings.fontFamily,
        is_active: true
      });
      
      if (success) {
        alert('Logo settings saved successfully! The changes will be visible after page refresh.');
        setLogoSettings(prev => ({ ...prev, currentLogo: logoUrl }));
        setUploadedFile(null);
        window.dispatchEvent(new CustomEvent('logoUpdated', { detail: { logoUrl: logoUrl } }));
        await loadLogoSettings();
      } else {
        throw new Error('Failed to save logo settings to database');
      }
    } catch (error) {
      console.error('Error saving logo settings:', error);
      alert(`Failed to save logo settings: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const generateLogoSVG = () => {
    return `<svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg"><defs><style>.logo-text{font-family:'${logoSettings.fontFamily}','Lucida Handwriting','Comic Sans MS',cursive,sans-serif;font-size:${logoSettings.fontSize}px;font-weight:400;fill:${logoSettings.logoColor};stroke:none;}.logo-underline{fill:none;stroke:${logoSettings.underlineColor};stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round;}</style></defs><rect width="200" height="80" fill="${logoSettings.backgroundColor}"/><text x="100" y="50" text-anchor="middle" class="logo-text">${logoSettings.logoText}</text>${logoSettings.showUnderline ? '<path d="M 60 58 Q 80 61 100 58 T 140 58" class="logo-underline"/>' : ''}</svg>`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, SVG, or GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoSettings(prev => ({ ...prev, currentLogo: result }));
    };
    reader.readAsDataURL(file);
  };

  const resetToDefault = () => {
    setLogoSettings({
      currentLogo: '/lurevi-logo.svg',
      logoText: 'Lurevi',
      logoColor: '#F0B0B0',
      backgroundColor: '#FFFFFF',
      showUnderline: true,
      underlineColor: '#F0B0B0',
      fontSize: 42,
      fontFamily: 'Brush Script MT'
    });
    setUploadedFile(null);
  };

  if (isLoading) {
    return (<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div className="animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div><div className="h-32 bg-gray-200 rounded mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div></div>);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Logo Settings</h2>
          <p className="text-sm text-gray-600">Customize your site's logo and branding</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setPreviewMode(!previewMode)} className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"><Eye className="w-4 h-4" /><span>{previewMode ? 'Hide Preview' : 'Show Preview'}</span></button>
          <button onClick={handleSave} disabled={isUploading} className="flex items-center space-x-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">{isUploading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>) : (<><Save className="w-4 h-4" /><span>Save Settings</span></>)}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Logo Upload</label>
            <div className="flex items-center space-x-3">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"><Upload className="w-4 h-4" /><span>Upload Logo</span></button>
              <button onClick={resetToDefault} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"><Trash2 className="w-4 h-4" /><span>Reset to Default</span></button>
            </div>
            {uploadedFile && (<p className="text-xs text-green-600">File selected: {uploadedFile.name}</p>)}
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Logo Text</label>
            <div><input type="text" value={logoSettings.logoText} onChange={(e) => setLogoSettings(prev => ({ ...prev, logoText: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" placeholder="Enter logo text" /></div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Font Family</label>
              <select value={logoSettings.fontFamily} onChange={(e) => setLogoSettings(prev => ({ ...prev, fontFamily: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"><option value="Brush Script MT">Brush Script MT</option><option value="Dancing Script">Dancing Script</option><option value="Pacifico">Pacifico</option><option value="Satisfy">Satisfy</option><option value="Kalam">Kalam</option></select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Font Size (px)</label>
              <input type="number" value={logoSettings.fontSize} onChange={(e) => setLogoSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 42 }))} className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" min="20" max="80" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Logo Color</label>
              <div className="flex items-center space-x-2">
                <input type="color" value={logoSettings.logoColor} onChange={(e) => setLogoSettings(prev => ({ ...prev, logoColor: e.target.value }))} className="w-10 h-8 border border-gray-300 rounded cursor-pointer" />
                <input type="text" value={logoSettings.logoColor} onChange={(e) => setLogoSettings(prev => ({ ...prev, logoColor: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Background Color</label>
              <div className="flex items-center space-x-2">
                <input type="color" value={logoSettings.backgroundColor} onChange={(e) => setLogoSettings(prev => ({ ...prev, backgroundColor: e.target.value }))} className="w-10 h-8 border border-gray-300 rounded cursor-pointer" />
                <input type="text" value={logoSettings.backgroundColor} onChange={(e) => setLogoSettings(prev => ({ ...prev, backgroundColor: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="showUnderline" checked={logoSettings.showUnderline} onChange={(e) => setLogoSettings(prev => ({ ...prev, showUnderline: e.target.checked }))} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                <label htmlFor="showUnderline" className="text-xs font-medium text-gray-700">Show Underline</label>
              </div>
              {logoSettings.showUnderline && (<div className="ml-6 space-y-2"><label className="text-xs font-medium text-gray-700">Underline Color</label><div className="flex items-center space-x-2"><input type="color" value={logoSettings.underlineColor} onChange={(e) => setLogoSettings(prev => ({ ...prev, underlineColor: e.target.value }))} className="w-10 h-8 border border-gray-300 rounded cursor-pointer" /><input type="text" value={logoSettings.underlineColor} onChange={(e) => setLogoSettings(prev => ({ ...prev, underlineColor: e.target.value }))} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" /></div></div>)}
            </div>
          </div>
        </div>
        {previewMode && (<div className="space-y-4"><h3 className="text-sm font-medium text-gray-700">Logo Preview</h3><div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300"><div className="flex justify-center">{logoSettings.currentLogo.startsWith('data:') || logoSettings.currentLogo.startsWith('http') ? (<img src={logoSettings.currentLogo} alt="Logo Preview" className="max-w-full max-h-32 object-contain" />) : (<div dangerouslySetInnerHTML={{ __html: generateLogoSVG() }} className="max-w-full" />)}</div></div><div className="text-xs text-gray-500 space-y-1"><p><strong>Current Logo:</strong> {logoSettings.currentLogo.includes('http') ? 'Uploaded File' : logoSettings.currentLogo.includes('data:') ? 'Custom Upload' : 'Default'}</p><p><strong>Text:</strong> {logoSettings.logoText}</p><p><strong>Font:</strong> {logoSettings.fontFamily} ({logoSettings.fontSize}px)</p><p><strong>Colors:</strong> {logoSettings.logoColor} on {logoSettings.backgroundColor}</p>{uploadedFile && <p className="text-green-600"><strong>Ready to upload:</strong> {uploadedFile.name}</p>}</div></div>)}
      </div>
    </div>
  );
};

export default LogoSettings;
