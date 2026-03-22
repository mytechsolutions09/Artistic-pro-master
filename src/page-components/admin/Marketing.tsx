'use client'

import React, { useState, useEffect } from 'react';
import { Save, TrendingUp, Facebook, BarChart3, Eye, CheckCircle, AlertCircle, ExternalLink, Copy, Check, Search, Link2, FileText } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import MarketingSecondaryNav from '../../components/admin/MarketingSecondaryNav';
import { supabase } from '../../services/supabaseService';
import MetaPixelService from '../../services/metaPixelService';

const inputCls =
  'h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const textareaCls =
  'w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const labelCls = 'block text-[11px] font-medium text-gray-600 mb-1';
const cardCls = 'rounded-lg border border-gray-200 bg-white p-3 shadow-sm';
const stickyBarCls = 'sticky bottom-2 z-10 rounded-lg border border-gray-200 bg-white p-2 shadow-md';
const btnPrimary =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed';
const btnOutline =
  'inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';

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
  internal_linking_suggestions?: string;
}

const FIXED_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const DAILY_SEO_TASKS = [
  { id: 'search_console', label: 'Check Google Search Console for indexing issues and errors.' },
  { id: 'optimize_page', label: 'Improve one page title, meta description, and internal links.' },
  { id: 'refresh_content', label: 'Publish new content or refresh one old page with updated info.' },
  { id: 'technical_check', label: 'Fix one technical SEO item (speed, alt text, broken link, schema).' },
  { id: 'llm_seo', label: 'Validate LLM SEO files (llms.txt, llms-full.txt, robots + sitemap references).' },
  { id: 'keyword_tracking', label: 'Track up to 10 priority keywords and record movement.' },
  { id: 'distribution', label: 'Share one page/post for traffic and backlink opportunities.' },
] as const;

const getTodayKey = () => new Date().toISOString().slice(0, 10);
const getStorageKey = () => `seo_daily_checklist_${getTodayKey()}`;
const getTaskStatusKey = () => `seo_daily_task_status_${getTodayKey()}`;
const getKeywordKey = () => `seo_daily_keywords_${getTodayKey()}`;
const getSeoStudioKey = () => `seo_studio_settings_${FIXED_ID}`;
const getKeywordTrackerKey = () => `seo_keyword_tracker_${FIXED_ID}`;
const MAX_KEYWORDS = 10;
const PRIORITY_KEYWORD_SEEDS = [
  'luxury wall art India',
  'buy digital art prints online',
  'premium wall decor for home',
  'how to decorate with wall prints',
  'Indian contemporary art online',
  'modern art prints for living room',
  'digital art download high resolution',
  'art prints gift India',
  'framed art prints for bedroom India',
  'unique home decor gifts online',
] as const;

type DailyTaskStatus = {
  lastRunAt: string;
  note: string;
};

type KeywordRow = {
  keyword: string;
  previousPosition: string;
  currentPosition: string;
  movementNote: string;
};

const Marketing: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'seo' | 'keyword_tracking' | 'seo_daily'>('tracking');
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
  const [copySuggestionsDone, setCopySuggestionsDone] = useState(false);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [seoStudioTarget, setSeoStudioTarget] = useState<'home' | 'category' | 'product'>('home');
  const [seoWorkflowState, setSeoWorkflowState] = useState({
    generatedSuggestions: false,
    appliedChanges: false,
    copiedLinks: false,
    openedEditor: false,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [pixelStatus, setPixelStatus] = useState<'active' | 'inactive' | 'checking'>('checking');
  const [copied, setCopied] = useState(false);
  const [dailyChecklist, setDailyChecklist] = useState<Record<string, boolean>>({});
  const [dailyTaskStatus, setDailyTaskStatus] = useState<Record<string, DailyTaskStatus>>({});
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [keywordRows, setKeywordRows] = useState<KeywordRow[]>(
    Array.from({ length: MAX_KEYWORDS }).map(() => ({
      keyword: '',
      previousPosition: '',
      currentPosition: '',
      movementNote: '',
    }))
  );
  const [keywordTrackingSavedAt, setKeywordTrackingSavedAt] = useState<string>('');
  const [savingKeywordTracking, setSavingKeywordTracking] = useState(false);
  const [autofillingKeywords, setAutofillingKeywords] = useState(false);
  const [keywordActionPlan, setKeywordActionPlan] = useState('');
  const [copiedKeywordPlan, setCopiedKeywordPlan] = useState(false);
  const [seoSettings, setSeoSettings] = useState({
    page_title: '',
    meta_description: '',
    meta_keywords: '',
    og_image: '',
    robots: 'index, follow',
    internal_linking_suggestions: '',
  });

  useEffect(() => {
    loadSettings();
    checkPixelStatus();
    loadDailyChecklist();
    loadKeywordTracking();
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
          const envPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
          setSettings(prev => ({ ...prev, meta_pixel_id: envPixelId }));
        } else {
          throw error;
        }
      } else if (data) {
        setSettings(data);
        const localStudioRaw = localStorage.getItem(getSeoStudioKey());
        const localStudio = localStudioRaw
          ? (JSON.parse(localStudioRaw) as {
              internal_linking_suggestions?: string;
              seoStudioTarget?: 'home' | 'category' | 'product';
            })
          : {};
        setSeoSettings({
          page_title: data.page_title || '',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
          og_image: data.og_image || '',
          robots: data.robots || 'index, follow',
          internal_linking_suggestions: localStudio.internal_linking_suggestions || data.internal_linking_suggestions || '',
        });
        if (localStudio.seoStudioTarget) {
          setSeoStudioTarget(localStudio.seoStudioTarget);
        }
      }
    } catch (error) {
      console.error('Error loading marketing settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadKeywordTracking = () => {
    try {
      const raw = localStorage.getItem(getKeywordTrackerKey());
      if (!raw) {
        const seededRows = Array.from({ length: MAX_KEYWORDS }).map((_, idx) => ({
          keyword: PRIORITY_KEYWORD_SEEDS[idx] || '',
          previousPosition: '',
          currentPosition: '',
          movementNote: '',
        }));
        setKeywordRows(seededRows);
        return;
      }
      const parsed = JSON.parse(raw) as { rows?: KeywordRow[]; savedAt?: string };
      if (Array.isArray(parsed.rows) && parsed.rows.length > 0) {
        const normalized = Array.from({ length: MAX_KEYWORDS }).map((_, idx) => {
          const row = parsed.rows?.[idx];
          return {
            keyword: row?.keyword || '',
            previousPosition: row?.previousPosition || '',
            currentPosition: row?.currentPosition || '',
            movementNote: row?.movementNote || '',
          };
        });
        setKeywordRows(normalized);
      }
      if (parsed.savedAt) {
        setKeywordTrackingSavedAt(parsed.savedAt);
      }
    } catch (error) {
      console.error('Failed to load keyword tracking settings:', error);
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
      const { internal_linking_suggestions, ...dbSeoSettings } = seoSettings;

      const { error } = await supabase
        .from('marketing_settings')
        .upsert([{ id: FIXED_ID, ...settings, ...dbSeoSettings }], { onConflict: 'id' });

      if (error) throw error;
      localStorage.setItem(
        getSeoStudioKey(),
        JSON.stringify({
          internal_linking_suggestions,
          seoStudioTarget,
        })
      );

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

  const saveSeoSettings = async () => {
    try {
      setSavingSeo(true);
      const { internal_linking_suggestions, ...dbSeoSettings } = seoSettings;
      const { error } = await supabase
        .from('marketing_settings')
        .upsert([{ id: FIXED_ID, ...settings, ...dbSeoSettings }], { onConflict: 'id' });
      if (error) throw error;
      localStorage.setItem(
        getSeoStudioKey(),
        JSON.stringify({
          internal_linking_suggestions,
          seoStudioTarget,
        })
      );
      showMessage('success', 'SEO settings saved successfully! Refresh the page to apply changes.');
      return true;
    } catch (error: any) {
      console.error('Error saving SEO settings:', error);
      showMessage('error', error?.message || 'Failed to save SEO settings');
      return false;
    } finally {
      setSavingSeo(false);
    }
  };

  const handleSaveSeo = () => {
    void saveSeoSettings();
  };

  const handleKeywordRowChange = (index: number, field: keyof KeywordRow, value: string) => {
    setKeywordRows((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const extractKeywordCandidates = (text: string): string[] => {
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'our', 'are', 'was', 'were',
      'have', 'has', 'had', 'not', 'but', 'all', 'any', 'can', 'will', 'into', 'about', 'their', 'them',
      'its', 'it', 'to', 'of', 'in', 'on', 'by', 'at', 'as', 'or', 'is', 'be', 'an', 'a',
      'shop', 'buy', 'online',
    ]);

    const words = text
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 3 && !stopWords.has(w));

    const scores = new Map<string, number>();

    // Single-word candidates
    for (const w of words) {
      scores.set(w, (scores.get(w) || 0) + 1);
    }

    // Two-word phrases
    for (let i = 0; i < words.length - 1; i += 1) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (words[i] === words[i + 1]) continue;
      scores.set(phrase, (scores.get(phrase) || 0) + 2);
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => keyword)
      .filter((keyword) => keyword.length >= 4);
  };

  const autofillKeywordsFromContent = async () => {
    try {
      setAutofillingKeywords(true);

      const sources: string[] = [
        seoSettings.page_title,
        seoSettings.meta_description,
        seoSettings.meta_keywords,
        seoSettings.internal_linking_suggestions,
      ];

      // Pull lightweight live content so suggestions reflect current catalog.
      const [{ data: categories }, { data: products }] = await Promise.all([
        supabase
          .from('categories')
          .select('name, description')
          .eq('is_active', true)
          .limit(25),
        supabase
          .from('products')
          .select('title, description')
          .eq('status', 'active')
          .limit(40),
      ]);

      for (const c of categories ?? []) {
        if (c?.name) sources.push(c.name);
        if (c?.description) sources.push(c.description);
      }
      for (const p of products ?? []) {
        if (p?.title) sources.push(p.title);
        if (p?.description) sources.push(p.description);
      }

      const ranked = extractKeywordCandidates(sources.join(' '));
      const unique = Array.from(new Set(ranked)).slice(0, MAX_KEYWORDS);

      if (unique.length === 0) {
        showMessage('error', 'Not enough content found to auto-fill keywords.');
        return;
      }

      setKeywordRows((prev) =>
        prev.map((row, idx) => ({
          ...row,
          keyword: unique[idx] ?? row.keyword,
        }))
      );

      showMessage('success', `Auto-filled ${Math.min(unique.length, MAX_KEYWORDS)} keywords from current content.`);
    } catch (error) {
      console.error('Failed to auto-fill keywords:', error);
      showMessage('error', 'Failed to auto-fill keywords from content.');
    } finally {
      setAutofillingKeywords(false);
    }
  };

  const getMovementDelta = (row: KeywordRow): string => {
    const prev = Number.parseInt(row.previousPosition.trim(), 10);
    const curr = Number.parseInt(row.currentPosition.trim(), 10);
    if (!Number.isFinite(prev) || !Number.isFinite(curr)) return '—';
    const delta = prev - curr;
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `${delta}`;
    return '0';
  };

  const saveKeywordTracking = () => {
    const filled = keywordRows.filter((row) => row.keyword.trim());
    if (filled.length < 3 || filled.length > MAX_KEYWORDS) {
      showMessage('error', `Please fill between 3 and ${MAX_KEYWORDS} keywords.`);
      return;
    }

    const savedAt = new Date().toISOString();
    try {
      setSavingKeywordTracking(true);
      localStorage.setItem(
        getKeywordTrackerKey(),
        JSON.stringify({
          rows: keywordRows,
          savedAt,
        })
      );
      setKeywordTrackingSavedAt(savedAt);
      showMessage('success', `Keyword tracking saved (${filled.length} keywords).`);
    } catch (error) {
      console.error('Failed to save keyword tracking settings:', error);
      showMessage('error', 'Failed to save keyword tracking.');
    } finally {
      setSavingKeywordTracking(false);
    }
  };

  const generateKeywordActionPlan = () => {
    const filled = keywordRows.filter((row) => row.keyword.trim());
    if (filled.length === 0) {
      showMessage('error', 'Add at least one keyword before generating actions.');
      return;
    }

    const lines = filled.map((row) => {
      const keyword = row.keyword.trim();
      const prev = Number.parseInt(row.previousPosition.trim(), 10);
      const curr = Number.parseInt(row.currentPosition.trim(), 10);

      if (!Number.isFinite(prev) || !Number.isFinite(curr)) {
        return `- ${keyword}: set baseline rank, improve title + H1 + first paragraph match, add 2 internal links with this anchor.`;
      }

      const delta = prev - curr;
      if (delta > 0) {
        return `- ${keyword}: improved (+${delta}). Keep momentum with one content refresh and 1 new internal link this week.`;
      }
      if (delta === 0) {
        return `- ${keyword}: flat. Strengthen intent-match in title/meta and add FAQ/schema snippet for this page.`;
      }

      return `- ${keyword}: dropped (${delta}). Audit top competing page, refresh content depth, and add 3 high-context internal links.`;
    });

    const plan = [
      `Weekly Keyword Ranking Plan (${filled.length} keywords)`,
      '',
      ...lines,
      '',
      'Execution checklist:',
      '1) Update title/meta for top 3 keywords.',
      '2) Add internal links from homepage/categories/shop.',
      '3) Refresh one page section per dropped keyword.',
      '4) Recheck positions in 7 days.',
    ].join('\n');

    setKeywordActionPlan(plan);
    showMessage('success', 'Generated keyword ranking action plan.');
  };

  const copyKeywordActionPlan = async () => {
    if (!keywordActionPlan.trim()) {
      showMessage('error', 'Generate an action plan first.');
      return;
    }
    try {
      await navigator.clipboard.writeText(keywordActionPlan);
      setCopiedKeywordPlan(true);
      setTimeout(() => setCopiedKeywordPlan(false), 1500);
      showMessage('success', 'Keyword action plan copied.');
    } catch {
      showMessage('error', 'Failed to copy keyword action plan.');
    }
  };

  const handleCopySuggestions = async () => {
    try {
      if (!seoSettings.internal_linking_suggestions.trim()) {
        showMessage('error', 'No internal linking suggestions to copy.');
        return;
      }
      await navigator.clipboard.writeText(seoSettings.internal_linking_suggestions);
      setCopySuggestionsDone(true);
      setTimeout(() => setCopySuggestionsDone(false), 2000);
      setSeoWorkflowState((prev) => ({ ...prev, copiedLinks: true }));
      showMessage('success', 'Internal linking suggestions copied.');
    } catch {
      showMessage('error', 'Failed to copy suggestions.');
    }
  };

  const handleAutoGenerateSuggestions = async () => {
    try {
      setGeneratingSuggestions(true);

      // Built from core high-value pages that typically drive discovery + conversion.
      const suggestions = [
        'Homepage (/) -> /categories (anchor: Explore Luxury Collections)',
        'Homepage (/) -> /shop (anchor: Shop Premium Picks)',
        '/categories -> /browse (anchor: Browse Curated Artworks)',
        '/browse -> /shop (anchor: View Bestselling Luxury Pieces)',
        '/shop -> /contact-us (anchor: Contact Lurevi Concierge)',
        '/faq -> /shipping-info (anchor: Shipping Information)',
        '/shipping-info -> /returns-and-refunds (anchor: Returns and Refunds Policy)',
        '/returns-and-refunds -> /contact-us (anchor: Need Help? Contact Support)',
        '/privacy -> /terms-and-conditions (anchor: Terms and Conditions)',
      ].join('\n');

      setSeoSettings((prev) => ({
        ...prev,
        internal_linking_suggestions: suggestions,
      }));
      setSeoWorkflowState((prev) => ({ ...prev, generatedSuggestions: true }));

      showMessage('success', 'Auto-generated internal linking suggestions.');
    } catch {
      showMessage('error', 'Failed to auto-generate suggestions.');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const runSeoStudioAction = async () => {
    const saved = await saveSeoSettings();
    if (!saved) return;
    setSeoWorkflowState((prev) => ({ ...prev, appliedChanges: true }));

    if (seoSettings.internal_linking_suggestions.trim()) {
      await handleCopySuggestions();
    }
  };

  const openHomepageEditorFromStudio = () => {
    window.open('/admin/homepage', '_blank', 'noopener,noreferrer');
    setSeoWorkflowState((prev) => ({ ...prev, openedEditor: true }));
  };

  const titleLength = seoSettings.page_title.trim().length;
  const descriptionLength = seoSettings.meta_description.trim().length;

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
        window.open('/admin/homepage', '_blank', 'noopener,noreferrer');
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

        // Broken-link sweep for core SEO routes
        const coreRoutes = ['/', '/categories', '/browse', '/shop', '/contact-us', '/faq', '/shipping-info', '/returns-and-refunds'];
        const brokenRoutes: string[] = [];
        for (const route of coreRoutes) {
          try {
            const res = await fetch(route, { cache: 'no-store' });
            if (!res.ok) brokenRoutes.push(`${route} (${res.status})`);
          } catch {
            brokenRoutes.push(`${route} (unreachable)`);
          }
        }
        checks.push(
          brokenRoutes.length === 0
            ? 'core internal links OK'
            : `broken internal links: ${brokenRoutes.slice(0, 3).join(', ')}${brokenRoutes.length > 3 ? '...' : ''}`
        );

        // Alt-text audit for currently rendered page images
        const pageImages = Array.from(document.querySelectorAll('img'));
        const missingAltCount = pageImages.filter((img) => {
          const alt = img.getAttribute('alt');
          return alt === null || alt.trim() === '';
        }).length;
        checks.push(
          pageImages.length === 0
            ? 'no <img> found on current view'
            : missingAltCount === 0
            ? 'all rendered images have alt text'
            : `${missingAltCount}/${pageImages.length} images missing alt text`
        );

        checks.push(document.querySelector('meta[name="description"]') ? 'meta description found' : 'meta description missing');
        checks.push(document.querySelector('link[rel="canonical"]') ? 'canonical found' : 'canonical missing');
        checks.push(document.querySelector('meta[property="og:image"]') ? 'og:image found' : 'og:image missing');
        checks.push(document.querySelector('script[type="application/ld+json"]') ? 'schema JSON-LD found' : 'schema JSON-LD missing');

        // One concrete auto-fix: normalize robots directive and persist.
        const normalizedRobots = (seoSettings.robots || '').trim().toLowerCase();
        let autoFixNote = 'no auto-fix needed';
        if (!normalizedRobots || !normalizedRobots.includes('index')) {
          const nextSeoSettings = { ...seoSettings, robots: 'index, follow' };
          setSeoSettings(nextSeoSettings);
          autoFixNote = 'auto-fixed robots to "index, follow"';

          try {
            setSavingSeo(true);
            const { internal_linking_suggestions, ...dbSeoSettings } = nextSeoSettings;
            const { error } = await supabase
              .from('marketing_settings')
              .upsert([{ id: FIXED_ID, ...settings, ...dbSeoSettings }], { onConflict: 'id' });
            if (error) throw error;
            localStorage.setItem(
              getSeoStudioKey(),
              JSON.stringify({
                internal_linking_suggestions,
                seoStudioTarget,
              })
            );
          } catch (err) {
            autoFixNote = `auto-fix attempted but save failed: ${err instanceof Error ? err.message : 'unknown error'}`;
          } finally {
            setSavingSeo(false);
          }
        }

        return `Technical check finished: ${checks.join(', ')}. ${autoFixNote}.`;
      }
      case 'llm_seo': {
        const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

        try {
          const llmsRes = await fetch('/llms.txt', { cache: 'no-store' });
          checks.push({
            name: 'llms.txt',
            ok: llmsRes.ok,
            detail: llmsRes.ok ? 'OK' : 'missing',
          });
        } catch {
          checks.push({
            name: 'llms.txt',
            ok: false,
            detail: 'check failed',
          });
        }

        try {
          const llmsFullRes = await fetch('/llms-full.txt', { cache: 'no-store' });
          checks.push({
            name: 'llms-full.txt',
            ok: llmsFullRes.ok,
            detail: llmsFullRes.ok ? 'OK' : 'missing',
          });
        } catch {
          checks.push({
            name: 'llms-full.txt',
            ok: false,
            detail: 'check failed',
          });
        }

        try {
          const robotsRes = await fetch('/robots.txt', { cache: 'no-store' });
          if (robotsRes.ok) {
            const robotsText = await robotsRes.text();
            const hasLlmsRefs =
              robotsText.includes('/llms.txt') &&
              robotsText.includes('/llms-full.txt');
            checks.push({
              name: 'robots references llms files',
              ok: hasLlmsRefs,
              detail: hasLlmsRefs ? 'OK' : 'missing one or both llms references',
            });
            const hasSitemap = robotsText.toLowerCase().includes('sitemap:');
            checks.push({
              name: 'robots sitemap reference',
              ok: hasSitemap,
              detail: hasSitemap ? 'OK' : 'missing sitemap reference',
            });
          } else {
            checks.push({
              name: 'robots references llms files',
              ok: false,
              detail: 'robots.txt missing',
            });
            checks.push({
              name: 'robots sitemap reference',
              ok: false,
              detail: 'robots.txt missing',
            });
          }
        } catch {
          checks.push({
            name: 'robots references llms files',
            ok: false,
            detail: 'robots.txt check failed',
          });
          checks.push({
            name: 'robots sitemap reference',
            ok: false,
            detail: 'robots.txt check failed',
          });
        }

        window.open('/llms.txt', '_blank', 'noopener,noreferrer');
        const passed = checks.filter((check) => check.ok).length;
        const total = checks.length;
        const failed = checks.filter((check) => !check.ok);
        const failedSummary =
          failed.length > 0
            ? ` Failed checks: ${failed
                .map((check) => `${check.name} (${check.detail})`)
                .join('; ')}.`
            : '';

        return `LLM SEO validation ${passed === total ? 'passed' : 'completed'}: ${passed}/${total}.${failedSummary} Opened /llms.txt for manual review.`;
      }
      case 'keyword_tracking': {
        const existingKeywords = localStorage.getItem(getKeywordKey());
        const defaultValue = existingKeywords
          ? (JSON.parse(existingKeywords) as string[]).join(', ')
          : PRIORITY_KEYWORD_SEEDS.join(', ');
        const input = window.prompt(`Enter 3-${MAX_KEYWORDS} keywords separated by commas`, defaultValue);

        if (input === null) {
          throw new Error('Keyword tracking was cancelled.');
        }

        const keywords = input
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, MAX_KEYWORDS);

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
      <AdminLayout title="Marketing" noHeader>
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          <span className="text-[11px] text-gray-500">Loading marketing settings…</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Marketing" noHeader>
      <MarketingSecondaryNav activeTab={activeSubTab} onTabChange={setActiveSubTab} />
      <div className="ml-24 flex flex-1 flex-col overflow-hidden">
      <div className="space-y-3 px-3 py-4 sm:px-5">
        <div className={cardCls}>
          <div className="flex items-start gap-2">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
              <TrendingUp className="h-4 w-4 text-gray-800" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-gray-900">Marketing &amp; analytics</h1>
              <p className="text-[11px] text-gray-500">Tracking pixels, SEO, and keyword routines</p>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 text-xs ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            <span className="font-medium leading-snug">{message.text}</span>
          </div>
        )}

        <div className={activeSubTab === 'tracking' ? 'space-y-3' : 'hidden'}>
        <div className={cardCls}>
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-2">
            <div className="flex min-w-0 items-start gap-2">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
                <Facebook className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-gray-900">Meta (Facebook) Pixel</h2>
                <p className="text-[11px] text-gray-500">Conversions and ad optimization</p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                pixelStatus === 'active'
                  ? 'bg-green-50 text-green-800'
                  : pixelStatus === 'inactive'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Eye className="h-3 w-3" />
              {pixelStatus === 'active' ? 'Active' : pixelStatus === 'inactive' ? 'Inactive' : 'Checking…'}
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className={labelCls}>Meta Pixel ID</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={settings.meta_pixel_id}
                  onChange={(e) => setSettings({ ...settings, meta_pixel_id: e.target.value })}
                  className={`${inputCls} min-w-0 flex-1`}
                  placeholder="1234567890123456"
                />
                <button
                  type="button"
                  onClick={handleCopyPixelId}
                  className={btnOutline}
                  title="Copy Pixel ID"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-0.5 text-[10px] text-gray-500">From Meta Events Manager</p>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-md border border-gray-100 bg-gray-50/80 px-2.5 py-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800">Enable Meta Pixel</p>
                <p className="text-[10px] text-gray-500">Page views, conversions, behavior</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.meta_pixel_enabled}
                  onChange={(e) => setSettings({ ...settings, meta_pixel_enabled: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="relative h-5 w-9 shrink-0 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-gray-900 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300" />
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={testPixel} className={`${btnPrimary} flex-1 min-w-[8rem]`}>
                <BarChart3 className="h-3.5 w-3.5" />
                Test pixel
              </button>
              <a
                href="https://business.facebook.com/events_manager"
                target="_blank"
                rel="noopener noreferrer"
                className={btnOutline}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Events Manager
              </a>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2">
              <h4 className="mb-1 text-[11px] font-semibold text-gray-800">Events tracked</h4>
              <ul className="grid gap-0.5 text-[10px] text-gray-600 sm:grid-cols-2">
                <li>PageView</li>
                <li>ViewContent</li>
                <li>AddToCart</li>
                <li>InitiateCheckout</li>
                <li>Purchase</li>
                <li>CompleteRegistration</li>
                <li>AddToWishlist</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`${cardCls} opacity-60`}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
            <div className="flex items-start gap-2">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-gray-900">Google Analytics</h2>
                <p className="text-[11px] text-gray-500">Traffic &amp; behavior (GA4)</p>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">Soon</span>
          </div>
          <div>
            <label className={labelCls}>Measurement ID</label>
            <input
              type="text"
              value={settings.google_analytics_id}
              onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
              className={`${inputCls} opacity-80`}
              placeholder="G-XXXXXXXXXX"
              disabled
            />
            <p className="mt-0.5 text-[10px] text-gray-500">GA4 measurement ID</p>
          </div>
        </div>

        <div className={`${cardCls} opacity-60`}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
            <div className="flex items-start gap-2">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
                <Eye className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-gray-900">Google Tag Manager</h2>
                <p className="text-[11px] text-gray-500">Tags without deploys</p>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">Soon</span>
          </div>
          <div>
            <label className={labelCls}>Container ID</label>
            <input
              type="text"
              value={settings.google_tag_manager_id}
              onChange={(e) => setSettings({ ...settings, google_tag_manager_id: e.target.value })}
              className={`${inputCls} opacity-80`}
              placeholder="GTM-XXXXXXX"
              disabled
            />
            <p className="mt-0.5 text-[10px] text-gray-500">GTM container ID</p>
          </div>
        </div>

        <div className={stickyBarCls}>
          <button type="button" onClick={handleSave} disabled={saving} className={`${btnPrimary} w-full`}>
            {saving ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save marketing settings
              </>
            )}
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-3">
          <h3 className="mb-2 text-xs font-semibold text-gray-900">Quick links</h3>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {[
              ['https://business.facebook.com/events_manager', 'Meta Events Manager'],
              ['https://developers.facebook.com/docs/meta-pixel', 'Meta Pixel docs'],
              [
                'https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc',
                'Pixel Helper',
              ],
              ['https://www.facebook.com/business/help/952192354843755', 'Setup guide'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ExternalLink className="h-3 w-3 shrink-0 text-gray-500" />
                {label}
              </a>
            ))}
          </div>
        </div>
        </div>

        {/* SEO: single tab (merged former SEO + SEO Studio — no duplicate fields) */}
        <div className={activeSubTab === 'seo' ? 'space-y-3' : 'hidden'}>
          <div className="rounded-lg border border-gray-200 bg-gray-50/90 p-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-gray-900">SEO workflow</h3>
              <span className="text-[10px] font-medium text-gray-500">
                {Object.values(seoWorkflowState).filter(Boolean).length}/4
              </span>
            </div>
            <ol className="list-inside list-decimal space-y-0.5 text-[11px] text-gray-600">
              <li>Pick target (home / category / product).</li>
              <li>Title 50–60 chars, meta 150–160.</li>
              <li>Auto-generate internal links, edit, save.</li>
              <li>Copy links into content as needed.</li>
            </ol>
          </div>

          <div className={cardCls}>
            <div className="mb-2 flex items-start gap-2 border-b border-gray-100 pb-2">
              <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
                <Search className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-gray-900">Site SEO</h2>
                <p className="text-[11px] text-gray-500">
                  Homepage metadata and internal linking in one place.
                </p>
              </div>
            </div>

            <div className="mb-3">
              <label className={labelCls}>Target page focus</label>
              <select
                value={seoStudioTarget}
                onChange={(e) => setSeoStudioTarget(e.target.value as 'home' | 'category' | 'product')}
                className={`${inputCls} max-w-md`}
              >
                <option value="home">Homepage</option>
                <option value="category">Category page</option>
                <option value="product">Product page</option>
              </select>
              <p className="mt-0.5 text-[10px] text-gray-500">Planning label — maps to global marketing fields.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="space-y-2">
                <div>
                  <label className={labelCls}>Page title</label>
                  <input
                    type="text"
                    value={seoSettings.page_title}
                    onChange={(e) => setSeoSettings({ ...seoSettings, page_title: e.target.value })}
                    className={inputCls}
                    placeholder="Lurevi | Luxury Lifestyle Brand India"
                  />
                  <p
                    className={`mt-0.5 text-[10px] ${titleLength >= 50 && titleLength <= 60 ? 'text-green-700' : 'text-amber-700'}`}
                  >
                    {titleLength}/60 (50–60)
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Meta description</label>
                  <textarea
                    value={seoSettings.meta_description}
                    onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })}
                    rows={3}
                    className={textareaCls}
                    placeholder="Discover curated digital artworks, premium prints, and exclusive collections."
                  />
                  <p
                    className={`mt-0.5 text-[10px] ${descriptionLength >= 150 && descriptionLength <= 160 ? 'text-green-700' : 'text-amber-700'}`}
                  >
                    {descriptionLength}/160 (150–160)
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Meta keywords</label>
                  <input
                    type="text"
                    value={seoSettings.meta_keywords}
                    onChange={(e) => setSeoSettings({ ...seoSettings, meta_keywords: e.target.value })}
                    className={inputCls}
                    placeholder="digital art, wall art, prints, modern art, online gallery"
                  />
                </div>

                <div>
                  <label className={labelCls}>Open Graph image URL</label>
                  <input
                    type="text"
                    value={seoSettings.og_image}
                    onChange={(e) => setSeoSettings({ ...seoSettings, og_image: e.target.value })}
                    className={inputCls}
                    placeholder="https://your-domain.com/og-image.jpg"
                  />
                </div>

                <div>
                  <label className={labelCls}>Robots directive</label>
                  <select
                    value={seoSettings.robots}
                    onChange={(e) => setSeoSettings({ ...seoSettings, robots: e.target.value })}
                    className={inputCls}
                  >
                    <option value="index, follow">index, follow (default)</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-2.5">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-[11px] font-medium text-gray-700">Internal linking</label>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => void handleAutoGenerateSuggestions()}
                      disabled={generatingSuggestions}
                      className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-white px-2 text-[10px] font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {generatingSuggestions ? 'Generating…' : 'Auto-generate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopySuggestions()}
                      className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-white px-2 text-[10px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {copySuggestionsDone ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={seoSettings.internal_linking_suggestions}
                  onChange={(e) =>
                    setSeoSettings({ ...seoSettings, internal_linking_suggestions: e.target.value })
                  }
                  rows={10}
                  className={`${textareaCls} min-h-[8rem] bg-white`}
                  placeholder={`Homepage -> /categories (anchor: Explore Luxury Collections)\n/categories -> /shop (anchor: Shop Bestsellers)\n/shop -> /contact-us (anchor: Contact Lurevi Concierge)`}
                />
                <p className="mt-1 text-[10px] text-gray-500">
                  Tip: <code className="rounded bg-gray-100 px-0.5">source -&gt; target (anchor: text)</code>
                </p>
                {seoSettings.internal_linking_suggestions.trim() && (
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <p className="mb-1 text-[10px] font-medium text-gray-600">Preview</p>
                    <ul className="space-y-0.5">
                      {seoSettings.internal_linking_suggestions
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .slice(0, 8)
                        .map((line, idx) => (
                          <li key={`${line}-${idx}`} className="flex items-start gap-1.5 text-[11px] text-gray-700">
                            <span className="mt-0.5 text-gray-400">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={stickyBarCls}>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={handleSaveSeo} disabled={savingSeo} className={btnPrimary}>
                {savingSeo ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save SEO
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => void runSeoStudioAction()}
                disabled={savingSeo}
                className={`${btnPrimary} bg-gray-700 hover:bg-gray-600`}
              >
                <Save className="h-3.5 w-3.5" />
                {savingSeo ? 'Saving…' : 'Save & copy links'}
              </button>
              <button type="button" onClick={() => void handleCopySuggestions()} className={btnOutline}>
                <Link2 className="h-3.5 w-3.5" />
                {copySuggestionsDone ? 'Copied' : 'Links only'}
              </button>
              <button type="button" onClick={openHomepageEditorFromStudio} className={btnOutline}>
                <FileText className="h-3.5 w-3.5" />
                Homepage
              </button>
              <button
                type="button"
                onClick={() => window.open('https://search.google.com/search-console', '_blank', 'noopener,noreferrer')}
                className={btnOutline}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Search Console
              </button>
            </div>
          </div>
        </div>

        {/* Keyword tracking */}
        <div className={activeSubTab === 'keyword_tracking' ? 'space-y-3' : 'hidden'}>
          <div className={cardCls}>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-2">
              <div>
                <h2 className="text-xs font-semibold text-gray-900">Keyword tracking</h2>
                <p className="text-[11px] text-gray-500">3–10 keywords, previous vs current rank.</p>
              </div>
              {keywordTrackingSavedAt && (
                <span className="text-[10px] text-gray-500">
                  Saved {new Date(keywordTrackingSavedAt).toLocaleString()}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {keywordRows.map((row, index) => (
                <div
                  key={`keyword-row-${index}`}
                  className="grid grid-cols-1 gap-1.5 rounded-md border border-gray-200 p-2 lg:grid-cols-12"
                >
                  <div className="lg:col-span-4">
                    <label className={labelCls}>Keyword {index + 1}</label>
                    <input
                      type="text"
                      value={row.keyword}
                      onChange={(e) => handleKeywordRowChange(index, 'keyword', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. luxury wall art india"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelCls}>Prev</label>
                    <input
                      type="number"
                      min={1}
                      value={row.previousPosition}
                      onChange={(e) => handleKeywordRowChange(index, 'previousPosition', e.target.value)}
                      className={inputCls}
                      placeholder="#"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelCls}>Curr</label>
                    <input
                      type="number"
                      min={1}
                      value={row.currentPosition}
                      onChange={(e) => handleKeywordRowChange(index, 'currentPosition', e.target.value)}
                      className={inputCls}
                      placeholder="#"
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <label className={labelCls}>Δ</label>
                    <div className="flex h-8 items-center rounded-md border border-gray-200 bg-gray-50 px-2 text-xs tabular-nums text-gray-800">
                      {getMovementDelta(row)}
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <label className={labelCls}>Notes</label>
                    <input
                      type="text"
                      value={row.movementNote}
                      onChange={(e) => handleKeywordRowChange(index, 'movementNote', e.target.value)}
                      className={inputCls}
                      placeholder="why / action"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} space-y-2`}>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={saveKeywordTracking} disabled={savingKeywordTracking} className={btnPrimary}>
                {savingKeywordTracking ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save keywords
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => void autofillKeywordsFromContent()}
                disabled={autofillingKeywords}
                className={btnOutline}
              >
                {autofillingKeywords ? 'Filling…' : 'Auto-fill'}
              </button>
              <button type="button" onClick={generateKeywordActionPlan} className={btnOutline}>
                Rank actions
              </button>
              <button type="button" onClick={() => void copyKeywordActionPlan()} className={btnOutline}>
                {copiedKeywordPlan ? 'Copied' : 'Copy plan'}
              </button>
            </div>
            <textarea
              value={keywordActionPlan}
              onChange={(e) => setKeywordActionPlan(e.target.value)}
              rows={6}
              className={textareaCls}
              placeholder="Generated action plan…"
            />
          </div>
        </div>

        {/* SEO Daily Sub-tab Content */}
        <div className={activeSubTab === 'seo_daily' ? 'space-y-3' : 'hidden'}>
          <div className={cardCls}>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-start gap-2">
                <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
                  <CheckCircle className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-900">SEO daily checklist</h2>
                  <p className="text-[11px] text-gray-500">Short routine for steady gains.</p>
                </div>
              </div>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-800">
                {completedDailyTasks}/{DAILY_SEO_TASKS.length}
              </span>
            </div>

            <div className="space-y-1">
              {DAILY_SEO_TASKS.map((task) => (
                <label
                  key={task.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 transition-colors ${
                    dailyChecklist[task.id]
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(dailyChecklist[task.id])}
                    onChange={() => void toggleDailyTask(task.id)}
                    disabled={runningTaskId === task.id}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <div className="min-w-0 flex-1">
                    <span className={`block text-[11px] leading-snug ${dailyChecklist[task.id] ? 'text-gray-900' : 'text-gray-700'}`}>
                      {task.label}
                    </span>
                    {dailyTaskStatus[task.id] && (
                      <span className="mt-0.5 block text-[10px] text-gray-500">
                        {new Date(dailyTaskStatus[task.id].lastRunAt).toLocaleTimeString()}
                      </span>
                    )}
                    {runningTaskId === task.id && (
                      <span className="mt-0.5 block text-[10px] text-gray-600">Running…</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={`${cardCls} flex flex-wrap items-center justify-between gap-2`}>
            <p className="text-[11px] text-gray-600">Stored in this browser; resets by date.</p>
            <button type="button" onClick={resetDailyChecklist} className={btnOutline}>
              Reset today
            </button>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default Marketing;





