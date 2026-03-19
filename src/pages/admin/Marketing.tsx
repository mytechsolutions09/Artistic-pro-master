import React, { useState, useEffect } from 'react';
import { Save, TrendingUp, Facebook, BarChart3, Eye, CheckCircle, AlertCircle, ExternalLink, Copy, Check, Search } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import MarketingSecondaryNav from '../../components/admin/MarketingSecondaryNav';
import { supabase } from '../../services/supabaseService';
import MetaPixelService from '../../services/metaPixelService';

interface MarketingSettings {
  meta_pixel_id: string;
  meta_pixel_enabled: boolean;
  google_analytics_id: string;
  google_analytics_enabled: boolean;
  google_tag_manager_id: string;
  google_tag_manager_enabled: boolean;
  page_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  robots?: string;
}

const FIXED_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const DAILY_SEO_TASKS = [
  { id: 'search_console', label: 'Check Google Search Console for indexing issues and errors.' },
  { id: 'optimize_page', label: 'Improve one page title, meta description, and internal links.' },
  { id: 'refresh_content', label: 'Publish new content or refresh one old page with updated info.' },
  { id: 'technical_check', label: 'Fix one technical SEO item (speed, alt text, broken link, schema).' },
  { id: 'llm_seo', label: 'Validate LLM SEO files (llms.txt, llms-full.txt, robots + sitemap references).' },
  { id: 'keyword_tracking', label: 'Track 3-5 priority keywords and record movement.' },
  { id: 'distribution', label: 'Share one page/post for traffic and backlink opportunities.' },
] as const;

const getTodayKey = () => new Date().toISOString().slice(0, 10);
const getStorageKey = () => `seo_daily_checklist_${getTodayKey()}`;
const getTaskStatusKey = () => `seo_daily_task_status_${getTodayKey()}`;
const getKeywordKey = () => `seo_daily_keywords_${getTodayKey()}`;

type DailyTaskStatus = {
  lastRunAt: string;
  note: string;
};

const Marketing: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'seo' | 'seo_daily'>('tracking');
  const [settings, setSettings] = useState<MarketingSettings>({
    meta_pixel_id: '',
    meta_pixel_enabled: true,
    google_analytics_id: '',
    google_analytics_enabled: false,
    google_tag_manager_id: '',
    google_tag_manager_enabled: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSeo, setSavingSeo] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pixelStatus, setPixelStatus] = useState<'active' | 'inactive' | 'checking'>('checking');
  const [copied, setCopied] = useState(false);
  const [dailyChecklist, setDailyChecklist] = useState<Record<string, boolean>>({});
  const [dailyTaskStatus, setDailyTaskStatus] = useState<Record<string, DailyTaskStatus>>({});
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [seoSettings, setSeoSettings] = useState({
    page_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
    robots: 'index, follow',
  });

  useEffect(() => {
    loadSettings();
    checkPixelStatus();
    loadDailyChecklist();
  }, []);

  const loadDailyChecklist = () => {
    const defaultChecklist = DAILY_SEO_TASKS.reduce((acc, task) => {
      acc[task.id] = false;
      return acc;
    }, {} as Record<string, boolean>);

    try {
      const savedChecklist = localStorage.getItem(getStorageKey());
      if (!savedChecklist) {
        setDailyChecklist(defaultChecklist);
        return;
      }

      const parsed = JSON.parse(savedChecklist) as Record<string, boolean>;
      const merged = { ...defaultChecklist, ...parsed };
      setDailyChecklist(merged);

      const savedTaskStatus = localStorage.getItem(getTaskStatusKey());
      if (savedTaskStatus) {
        setDailyTaskStatus(JSON.parse(savedTaskStatus) as Record<string, DailyTaskStatus>);
      } else {
        setDailyTaskStatus({});
      }
    } catch (error) {
      console.error('Failed to load SEO daily checklist:', error);
      setDailyChecklist(defaultChecklist);
      setDailyTaskStatus({});
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketing_settings')
        .select('*')
        .eq('id', FIXED_ID)
        .single();

      if (error) {
        // If no settings exist, use defaults
        if (error.code === 'PGRST116') {
          // Get from env
          const envPixelId = import.meta.env.VITE_META_PIXEL_ID || '';
          setSettings(prev => ({ ...prev, meta_pixel_id: envPixelId }));
        } else {
          throw error;
        }
      } else if (data) {
        setSettings(data);
        setSeoSettings({
          page_title: data.page_title || '',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
          og_image: data.og_image || '',
          robots: data.robots || 'index, follow',
        });
      }
    } catch (error) {
      console.error('Error loading marketing settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const checkPixelStatus = () => {
    setPixelStatus('checking');
    setTimeout(() => {
      const isLoaded = MetaPixelService.isLoaded();
      setPixelStatus(isLoaded ? 'active' : 'inactive');
    }, 1000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('marketing_settings')
        .upsert([{ id: FIXED_ID, ...settings, ...seoSettings }], { onConflict: 'id' });

      if (error) throw error;

      showMessage('success', 'Marketing settings saved successfully! Refresh the page to apply changes.');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showMessage('error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCopyPixelId = () => {
    if (settings.meta_pixel_id) {
      navigator.clipboard.writeText(settings.meta_pixel_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const testPixel = () => {
    if (MetaPixelService.isLoaded()) {
      MetaPixelService.trackCustomEvent('TestEvent', {
        test_parameter: 'Admin Marketing Page Test',
        timestamp: new Date().toISOString()
      });
      showMessage('success', 'Test event sent! Check your Meta Events Manager.');
    } else {
      showMessage('error', 'Meta Pixel is not loaded. Please check your Pixel ID and refresh the page.');
    }
  };

  const handleSaveSeo = () => {
    (async () => {
      try {
        setSavingSeo(true);
        const { error } = await supabase
          .from('marketing_settings')
          .upsert([{ id: FIXED_ID, ...settings, ...seoSettings }], { onConflict: 'id' });
        if (error) throw error;
        showMessage('success', 'SEO settings saved successfully! Refresh the page to apply changes.');
      } catch (error) {
        console.error('Error saving SEO settings:', error);
        showMessage('error', 'Failed to save SEO settings');
      } finally {
        setSavingSeo(false);
      }
    })();
  };

  const saveDailyTaskStatus = (status: Record<string, DailyTaskStatus>) => {
    localStorage.setItem(getTaskStatusKey(), JSON.stringify(status));
  };

  const runDailyTaskAutomation = async (taskId: string) => {
    switch (taskId) {
      case 'search_console': {
        window.open('https://search.google.com/search-console', '_blank', 'noopener,noreferrer');
        return 'Opened Google Search Console in a new tab.';
      }
      case 'optimize_page': {
        setActiveSubTab('seo');
        return 'Switched to SEO settings. Update metadata fields, then click Save SEO Settings.';
      }
      case 'refresh_content': {
        window.open('/admin/homepage-management', '_blank', 'noopener,noreferrer');
        return 'Opened Homepage Management so you can update content quickly.';
      }
      case 'technical_check': {
        const checks: string[] = [];

        try {
          const robotsRes = await fetch('/robots.txt', { cache: 'no-store' });
          checks.push(robotsRes.ok ? 'robots.txt OK' : 'robots.txt missing');
        } catch {
          checks.push('robots.txt check failed');
        }

        try {
          const sitemapRes = await fetch('/sitemap.xml', { cache: 'no-store' });
          checks.push(sitemapRes.ok ? 'sitemap.xml OK' : 'sitemap.xml missing');
        } catch {
          checks.push('sitemap.xml check failed');
        }

        checks.push(document.querySelector('meta[name="description"]') ? 'meta description found' : 'meta description missing');
        checks.push(document.querySelector('link[rel="canonical"]') ? 'canonical found' : 'canonical missing');
        checks.push(document.querySelector('meta[property="og:image"]') ? 'og:image found' : 'og:image missing');

        return `Technical check finished: ${checks.join(', ')}.`;
      }
      case 'llm_seo': {
        const checks: string[] = [];

        try {
          const llmsRes = await fetch('/llms.txt', { cache: 'no-store' });
          checks.push(llmsRes.ok ? 'llms.txt OK' : 'llms.txt missing');
        } catch {
          checks.push('llms.txt check failed');
        }

        try {
          const llmsFullRes = await fetch('/llms-full.txt', { cache: 'no-store' });
          checks.push(llmsFullRes.ok ? 'llms-full.txt OK' : 'llms-full.txt missing');
        } catch {
          checks.push('llms-full.txt check failed');
        }

        try {
          const robotsRes = await fetch('/robots.txt', { cache: 'no-store' });
          if (robotsRes.ok) {
            const robotsText = await robotsRes.text();
            checks.push(robotsText.includes('/llms.txt') ? 'robots includes llms.txt' : 'robots missing llms.txt');
            checks.push(robotsText.includes('/llms-full.txt') ? 'robots includes llms-full.txt' : 'robots missing llms-full.txt');
            checks.push(robotsText.toLowerCase().includes('sitemap:') ? 'robots includes sitemap' : 'robots missing sitemap');
          } else {
            checks.push('robots.txt missing');
          }
        } catch {
          checks.push('robots.txt check failed');
        }

        window.open('/llms.txt', '_blank', 'noopener,noreferrer');
        return `LLM SEO check finished: ${checks.join(', ')}.`;
      }
      case 'keyword_tracking': {
        const existingKeywords = localStorage.getItem(getKeywordKey());
        const defaultValue = existingKeywords ? (JSON.parse(existingKeywords) as string[]).join(', ') : '';
        const input = window.prompt('Enter 3-5 keywords separated by commas', defaultValue);

        if (input === null) {
          throw new Error('Keyword tracking was cancelled.');
        }

        const keywords = input
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, 5);

        if (keywords.length < 3) {
          throw new Error('Please enter at least 3 keywords.');
        }

        localStorage.setItem(getKeywordKey(), JSON.stringify(keywords));
        return `Saved ${keywords.length} keywords for today: ${keywords.join(', ')}.`;
      }
      case 'distribution': {
        const targetUrl = `${window.location.origin}/`;
        await navigator.clipboard.writeText(targetUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}`, '_blank', 'noopener,noreferrer');
        return 'Copied homepage URL and opened share dialog.';
      }
      default:
        return 'Task action completed.';
    }
  };

  const toggleDailyTask = async (taskId: string) => {
    const currentlyChecked = Boolean(dailyChecklist[taskId]);
    if (currentlyChecked) {
      const next = { ...dailyChecklist, [taskId]: false };
      setDailyChecklist(next);
      localStorage.setItem(getStorageKey(), JSON.stringify(next));
      return;
    }

    try {
      setRunningTaskId(taskId);
      const note = await runDailyTaskAutomation(taskId);

      const nextChecklist = { ...dailyChecklist, [taskId]: true };
      setDailyChecklist(nextChecklist);
      localStorage.setItem(getStorageKey(), JSON.stringify(nextChecklist));

      const nextStatus = {
        ...dailyTaskStatus,
        [taskId]: {
          lastRunAt: new Date().toISOString(),
          note,
        },
      };
      setDailyTaskStatus(nextStatus);
      saveDailyTaskStatus(nextStatus);
      showMessage('success', note);
    } catch (error: any) {
      showMessage('error', error?.message || 'Task automation failed. Please try again.');
    } finally {
      setRunningTaskId(null);
    }
  };

  const resetDailyChecklist = () => {
    const reset = DAILY_SEO_TASKS.reduce((acc, task) => {
      acc[task.id] = false;
      return acc;
    }, {} as Record<string, boolean>);

    setDailyChecklist(reset);
    localStorage.setItem(getStorageKey(), JSON.stringify(reset));
    setDailyTaskStatus({});
    saveDailyTaskStatus({});
  };

  const completedDailyTasks = DAILY_SEO_TASKS.filter((task) => dailyChecklist[task.id]).length;

  if (loading) {
    return (
      <AdminLayout title="Marketing & Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Marketing & Analytics" noHeader={true}>
      <MarketingSecondaryNav activeTab={activeSubTab} onTabChange={setActiveSubTab} />
      <div className="flex-1 flex flex-col overflow-hidden ml-24">
      <div className="space-y-3 p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Marketing & Analytics</h1>
              <p className="text-sm text-pink-100">Track user behavior and optimize ad campaigns</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className={activeSubTab === 'tracking' ? 'space-y-3' : 'hidden'}>
        {/* Meta (Facebook) Pixel */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Meta (Facebook) Pixel</h2>
                <p className="text-sm text-gray-500">Track conversions and optimize Facebook Ads</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                pixelStatus === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : pixelStatus === 'inactive'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                <Eye className="w-4 h-4" />
                <span>
                  {pixelStatus === 'active' ? 'Active' : pixelStatus === 'inactive' ? 'Inactive' : 'Checking...'}
                </span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Pixel ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Pixel ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={settings.meta_pixel_id}
                  onChange={(e) => setSettings({ ...settings, meta_pixel_id: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="1234567890123456"
                />
                <button
                  onClick={handleCopyPixelId}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
                  title="Copy Pixel ID"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Find your Pixel ID in Meta Events Manager
              </p>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">Enable Meta Pixel</p>
                <p className="text-sm text-gray-500">Track page views, conversions, and user behavior</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.meta_pixel_enabled}
                  onChange={(e) => setSettings({ ...settings, meta_pixel_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Test Pixel Button */}
            <div className="flex space-x-2">
              <button
                onClick={testPixel}
                className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Test Pixel</span>
              </button>
              <a
                href="https://business.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2 font-medium"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Events Manager</span>
              </a>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Events Being Tracked:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• PageView - All page views</li>
                <li>• ViewContent - Product views</li>
                <li>• AddToCart - Cart additions</li>
                <li>• InitiateCheckout - Checkout starts</li>
                <li>• Purchase - Completed orders</li>
                <li>• CompleteRegistration - User sign-ups</li>
                <li>• AddToWishlist - Favorites</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Google Analytics (Coming Soon) */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm opacity-60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Google Analytics</h2>
                <p className="text-sm text-gray-500">Website traffic and user insights</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              Coming Soon
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement ID
              </label>
              <input
                type="text"
                value={settings.google_analytics_id}
                onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="G-XXXXXXXXXX"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Google Analytics 4 (GA4) tracking ID
              </p>
            </div>
          </div>
        </div>

        {/* Google Tag Manager (Coming Soon) */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm opacity-60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Google Tag Manager</h2>
                <p className="text-sm text-gray-500">Manage marketing tags without code changes</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
              Coming Soon
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Container ID
              </label>
              <input
                type="text"
                value={settings.google_tag_manager_id}
                onChange={(e) => setSettings({ ...settings, google_tag_manager_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="GTM-XXXXXXX"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Your GTM container ID
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-4 bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Marketing Settings</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Links & Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">Meta Events Manager</span>
            </a>
            <a
              href="https://developers.facebook.com/docs/meta-pixel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">Meta Pixel Docs</span>
            </a>
            <a
              href="https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">Meta Pixel Helper</span>
            </a>
            <a
              href="https://www.facebook.com/business/help/952192354843755"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 bg-white hover:bg-gray-50 rounded border border-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">Setup Guide</span>
            </a>
          </div>
        </div>
        </div>

        {/* SEO Sub-tab Content */}
        <div className={activeSubTab === 'seo' ? 'space-y-3' : 'hidden'}>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Search className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">SEO Settings</h2>
                <p className="text-sm text-gray-500">Configure homepage metadata for better search visibility</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                <input
                  type="text"
                  value={seoSettings.page_title}
                  onChange={(e) => setSeoSettings({ ...seoSettings, page_title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Artistic Pro | Premium Digital Art & Wall Prints"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={seoSettings.meta_description}
                  onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Discover curated digital artworks, premium prints, and exclusive collections."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                <input
                  type="text"
                  value={seoSettings.meta_keywords}
                  onChange={(e) => setSeoSettings({ ...seoSettings, meta_keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="digital art, wall art, prints, modern art, online gallery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Open Graph Image URL</label>
                <input
                  type="text"
                  value={seoSettings.og_image}
                  onChange={(e) => setSeoSettings({ ...seoSettings, og_image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://your-domain.com/og-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Robots Directive</label>
                <select
                  value={seoSettings.robots}
                  onChange={(e) => setSeoSettings({ ...seoSettings, robots: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="index, follow">index, follow (default)</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 bg-white border border-gray-200 p-3 rounded-lg shadow-lg">
            <button
              onClick={handleSaveSeo}
              disabled={savingSeo}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingSeo ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save SEO Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SEO Daily Sub-tab Content */}
        <div className={activeSubTab === 'seo_daily' ? 'space-y-3' : 'hidden'}>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">SEO Daily Checklist</h2>
                  <p className="text-sm text-gray-500">Use this routine every day to steadily improve rankings.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {completedDailyTasks}/{DAILY_SEO_TASKS.length} done
              </span>
            </div>

            <div className="space-y-2">
              {DAILY_SEO_TASKS.map((task) => (
                <label
                  key={task.id}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    dailyChecklist[task.id]
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(dailyChecklist[task.id])}
                    onChange={() => void toggleDailyTask(task.id)}
                    disabled={runningTaskId === task.id}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className={`text-sm block ${dailyChecklist[task.id] ? 'text-emerald-800' : 'text-gray-700'}`}>
                      {task.label}
                    </span>
                    {dailyTaskStatus[task.id] && (
                      <span className="text-xs text-gray-500 mt-1 block">
                        Last run: {new Date(dailyTaskStatus[task.id].lastRunAt).toLocaleTimeString()}
                      </span>
                    )}
                    {runningTaskId === task.id && (
                      <span className="text-xs text-emerald-600 mt-1 block">Running automation...</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Checklist resets by date and is stored in your browser for quick daily tracking.
            </p>
            <button
              onClick={resetDailyChecklist}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Reset Today
            </button>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default Marketing;

