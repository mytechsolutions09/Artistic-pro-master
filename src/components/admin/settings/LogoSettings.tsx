import React, { useState, useRef, useEffect } from 'react';
import { Save, Upload, Image, Trash2, Eye, Download } from 'lucide-react';

const LogoSettings: React.FC = () => {
  const [logoSettings, setLogoSettings] = useState({
    currentLogo: '/lurevi-logo.svg',
    logoText: 'Lurevi',
    logoColor: '#F0B0B0',
    backgroundColor: '#000000',
    showUnderline: true,
    underlineColor: '#F0B0B0',
    fontSize: 48,
    fontFamily: 'Brush Script MT'
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('logoSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setLogoSettings(parsed);
      } catch (error) {
        console.error('Error loading logo settings:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      console.log('Saving logo settings:', logoSettings);
      
      // Update the logo file if it's a custom upload
      if (logoSettings.currentLogo.startsWith('data:')) {
        await updateLogoFile();
      } else if (logoSettings.logoText !== 'Lurevi') {
        await updateLogoFile();
      }
      
      // Save settings to localStorage for persistence
      localStorage.setItem('logoSettings', JSON.stringify(logoSettings));
      
      // Update the actual logo files used in the app
      await updateAppLogo();
      
      alert('Logo settings saved successfully! The changes will be visible after page refresh.');
    } catch (error) {
      console.error('Error saving logo settings:', error);
      alert('Failed to save logo settings. Please try again.');
    }
  };

  const updateLogoFile = async () => {
    const svgContent = generateLogoSVG();
    
    // In a real application, you would upload this to your server
    // For now, we'll create a blob and download it
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to download the new logo
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lurevi-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateAppLogo = async () => {
    try {
      // If it's a custom uploaded image, we need to handle it differently
      if (logoSettings.currentLogo.startsWith('data:')) {
        // For uploaded images, we'll store them in localStorage and update the components
        localStorage.setItem('customLogo', logoSettings.currentLogo);
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('logoUpdated', { 
          detail: { logoUrl: logoSettings.currentLogo } 
        }));
      } else {
        // For text-based logos, generate and update the SVG
        const svgContent = generateLogoSVG();
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        // Store the generated logo URL
        localStorage.setItem('customLogo', url);
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('logoUpdated', { 
          detail: { logoUrl: url } 
        }));
      }
    } catch (error) {
      console.error('Error updating app logo:', error);
      throw error;
    }
  };

  const generateLogoSVG = () => {
    return `<svg width="200" height="80" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .logo-text {
        font-family: '${logoSettings.fontFamily}', 'Lucida Handwriting', 'Comic Sans MS', cursive, sans-serif;
        font-size: ${logoSettings.fontSize}px;
        font-weight: 400;
        fill: ${logoSettings.logoColor};
        stroke: none;
      }
      .logo-underline {
        fill: none;
        stroke: ${logoSettings.underlineColor};
        stroke-width: 1.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="200" height="80" fill="${logoSettings.backgroundColor}"/>
  
  <!-- Logo Text -->
  <text x="100" y="50" text-anchor="middle" class="logo-text">${logoSettings.logoText}</text>
  
  <!-- Wavy Underline -->
  ${logoSettings.showUnderline ? '<path d="M 60 58 Q 80 61 100 58 T 140 58" class="logo-underline"/>' : ''}
</svg>`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, etc.).');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('File uploaded successfully:', file.name, file.type, file.size);
        setLogoSettings(prev => ({
          ...prev,
          currentLogo: result
        }));
        setIsUploading(false);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the file. Please try again.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
      setIsUploading(false);
    }
  };

  const resetToDefault = () => {
    setLogoSettings({
      currentLogo: '/lurevi-logo.svg',
      logoText: 'Lurevi',
      logoColor: '#F0B0B0',
      backgroundColor: '#000000',
      showUnderline: true,
      underlineColor: '#F0B0B0',
      fontSize: 48,
      fontFamily: 'Brush Script MT'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Logo Settings</h2>
          <p className="text-sm text-gray-600">Customize your site's logo and branding</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white text-gray-900 rounded transition-colors text-xs"
          >
            <Eye className="w-3 h-3" />
            <span>{previewMode ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-3 py-1.5 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors text-xs"
          >
            <Save className="w-3 h-3" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Configuration */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Logo Configuration</h3>
            
            {/* Logo Text */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Logo Text</label>
              <input
                type="text"
                value={logoSettings.logoText}
                onChange={(e) => setLogoSettings(prev => ({ ...prev, logoText: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Enter logo text"
              />
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Font Family</label>
              <select
                value={logoSettings.fontFamily}
                onChange={(e) => setLogoSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="Brush Script MT">Brush Script MT</option>
                <option value="Dancing Script">Dancing Script</option>
                <option value="Lucida Handwriting">Lucida Handwriting</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="cursive">Cursive</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Font Size (px)</label>
              <input
                type="number"
                value={logoSettings.fontSize}
                onChange={(e) => setLogoSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 42 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                min="20"
                max="80"
              />
            </div>

            {/* Logo Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Logo Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={logoSettings.logoColor}
                  onChange={(e) => setLogoSettings(prev => ({ ...prev, logoColor: e.target.value }))}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={logoSettings.logoColor}
                  onChange={(e) => setLogoSettings(prev => ({ ...prev, logoColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Background Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={logoSettings.backgroundColor}
                  onChange={(e) => setLogoSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={logoSettings.backgroundColor}
                  onChange={(e) => setLogoSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Underline Settings */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showUnderline"
                  checked={logoSettings.showUnderline}
                  onChange={(e) => setLogoSettings(prev => ({ ...prev, showUnderline: e.target.checked }))}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="showUnderline" className="text-xs font-medium text-gray-700">
                  Show Underline
                </label>
              </div>
              
              {logoSettings.showUnderline && (
                <div className="ml-6 space-y-2">
                  <label className="text-xs font-medium text-gray-700">Underline Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={logoSettings.underlineColor}
                      onChange={(e) => setLogoSettings(prev => ({ ...prev, underlineColor: e.target.value }))}
                      className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={logoSettings.underlineColor}
                      onChange={(e) => setLogoSettings(prev => ({ ...prev, underlineColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Upload Custom Logo</h3>
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-pink-400', 'bg-pink-50');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-pink-400', 'bg-pink-50');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-pink-400', 'bg-pink-50');
                  const files = e.dataTransfer.files;
                  if (files.length > 0) {
                    const file = files[0];
                    const event = {
                      target: { files: [file] }
                    } as React.ChangeEvent<HTMLInputElement>;
                    handleFileUpload(event);
                  }
                }}
                className={`w-full flex flex-col items-center justify-center space-y-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-colors cursor-pointer ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    {isUploading ? 'Uploading...' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, SVG formats • Max 5MB • Recommended: 200x80px
                  </p>
                </div>
              </div>
              
              {/* Upload Status */}
              {isUploading && (
                <div className="flex items-center justify-center space-x-2 text-sm text-pink-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent"></div>
                  <span>Processing your logo...</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={resetToDefault}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Reset to Default</span>
            </button>
            <button
              onClick={() => {
                const svgContent = generateLogoSVG();
                const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'lurevi-logo.svg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs"
            >
              <Download className="w-3 h-3" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Preview</h3>
            {previewMode ? (
              <div className="space-y-4">
                {/* Current Logo Display */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-700">Current Logo</h4>
                  <div className="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-200 flex items-center justify-center">
                    {logoSettings.currentLogo.startsWith('data:') ? (
                      <img 
                        src={logoSettings.currentLogo} 
                        alt="Current Logo" 
                        className="max-h-16 max-w-full object-contain"
                      />
                    ) : (
                      <img 
                        src={logoSettings.currentLogo} 
                        alt="Current Logo" 
                        className="max-h-16 max-w-full object-contain"
                        onError={(e) => {
                          console.error('Error loading logo:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Header Preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-700">Header Preview</h4>
                  <div className="bg-teal-800 p-4 rounded">
                    <div className="flex items-center">
                      {logoSettings.currentLogo.startsWith('data:') ? (
                        <img 
                          src={logoSettings.currentLogo} 
                          alt="Logo Preview" 
                          className="h-12 w-auto"
                        />
                      ) : (
                        <div 
                          className="text-3xl font-handwriting relative transform -translate-y-1"
                          style={{
                            fontFamily: logoSettings.fontFamily,
                            fontSize: `${logoSettings.fontSize}px`,
                            color: logoSettings.logoColor
                          }}
                        >
                          {logoSettings.logoText}
                          {logoSettings.showUnderline && (
                            <div 
                              className="absolute bottom-0 left-0 right-0 h-0.5 transform translate-y-1"
                              style={{
                                background: `linear-gradient(to right, ${logoSettings.underlineColor} 0%, ${logoSettings.underlineColor} 100%)`,
                                clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Standalone Preview */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-700">Standalone Preview</h4>
                  <div 
                    className="p-4 rounded flex items-center justify-center"
                    style={{ backgroundColor: logoSettings.backgroundColor }}
                  >
                    {logoSettings.currentLogo.startsWith('data:') ? (
                      <img 
                        src={logoSettings.currentLogo} 
                        alt="Logo Preview" 
                        className="h-16 w-auto"
                      />
                    ) : (
                      <div 
                        className="text-3xl font-handwriting relative transform -translate-y-1"
                        style={{
                          fontFamily: logoSettings.fontFamily,
                          fontSize: `${logoSettings.fontSize}px`,
                          color: logoSettings.logoColor
                        }}
                      >
                        {logoSettings.logoText}
                        {logoSettings.showUnderline && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-0.5 transform translate-y-1"
                            style={{
                              background: `linear-gradient(to right, ${logoSettings.underlineColor} 0%, ${logoSettings.underlineColor} 100%)`,
                              clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Click "Show Preview" to see your logo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSettings;
