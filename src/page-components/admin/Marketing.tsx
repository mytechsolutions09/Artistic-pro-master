'use client'

import React, { useState, useEffect } from 'react';
import { Save, TrendingUp, Facebook, BarChart3, Eye, CheckCircle, AlertCircle, ExternalLink, Copy, Check, Search, Wand2, Link2, FileText } from 'lucide-react';
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
  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'seo' | 'seo_studio' | 'keyword_tracking' | 'seo_daily'>('tracking');
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
      <div className="space-y-2 p-3">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-lg shadow-sm">
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
          <div className={`p-3 rounded-lg flex items-center space-x-2 ${
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
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Meta (Facebook) Pixel</h2>
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

          <div className="space-y-3">
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
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm opacity-60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Google Analytics</h2>
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
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm opacity-60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Google Tag Manager</h2>
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
        <div className="sticky bottom-3 bg-white border border-gray-200 p-2.5 rounded-lg shadow-md">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
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
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Search className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">SEO Settings</h2>
                <p className="text-sm text-gray-500">Configure homepage metadata for better search visibility</p>
              </div>
            </div>

            <div className="space-y-3">
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

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Internal Linking Suggestions
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleAutoGenerateSuggestions()}
                      disabled={generatingSuggestions}
                      className="px-2.5 py-1.5 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md transition-colors disabled:opacity-50"
                    >
                      {generatingSuggestions ? 'Generating...' : 'Auto-generate suggestions'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopySuggestions()}
                      className="px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    >
                      {copySuggestionsDone ? 'Copied' : 'Copy suggestions'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={seoSettings.internal_linking_suggestions}
                  onChange={(e) =>
                    setSeoSettings({ ...seoSettings, internal_linking_suggestions: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder={`Homepage -> /categories (anchor: Explore Luxury Collections)\n/categories -> /shop (anchor: Shop Bestsellers)\n/shop -> /contact-us (anchor: Contact Lurevi Concierge)`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Use format <code>source -&gt; target (anchor: text)</code> so content editors can apply links quickly.
                </p>
                {seoSettings.internal_linking_suggestions.trim() && (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Quick preview</p>
                    <ul className="space-y-1">
                      {seoSettings.internal_linking_suggestions
                        .split('\n')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .slice(0, 8)
                        .map((line, idx) => (
                          <li key={`${line}-${idx}`} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-emerald-600 mt-0.5">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-3 bg-white border border-gray-200 p-2.5 rounded-lg shadow-md">
            <button
              onClick={handleSaveSeo}
              disabled={savingSeo}
              className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* SEO Studio Sub-tab Content */}
        <div className={activeSubTab === 'seo_studio' ? 'space-y-3' : 'hidden'}>
          <div className="bg-violet-50 p-3 rounded-lg border border-violet-200">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-violet-900">SEO Studio Workflow</h3>
              <span className="text-xs text-violet-700">
                {Object.values(seoWorkflowState).filter(Boolean).length}/4 completed
              </span>
            </div>
            <ol className="space-y-1.5 text-xs text-violet-900">
              <li>1. Pick one target page this week (home/category/product).</li>
              <li>2. Fill Page Title (50-60 chars) and Meta Description (150-160 chars).</li>
              <li>3. Click Auto-generate suggestions.</li>
              <li>4. Review/edit internal link lines.</li>
              <li>5. Click Apply SEO Changes.</li>
              <li>6. Click Copy Internal Links.</li>
              <li>7. Open Homepage Editor and place links in content.</li>
            </ol>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Wand2 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">SEO Studio (All-in-One)</h2>
                <p className="text-xs text-gray-500">Update title/meta + internal links from one workspace.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Page This Week</label>
                  <select
                    value={seoStudioTarget}
                    onChange={(e) => setSeoStudioTarget(e.target.value as 'home' | 'category' | 'product')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="home">Homepage</option>
                    <option value="category">Category Page</option>
                    <option value="product">Product Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Page Title</label>
                  <input
                    type="text"
                    value={seoSettings.page_title}
                    onChange={(e) => setSeoSettings({ ...seoSettings, page_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Lurevi | Luxury Lifestyle Brand India"
                  />
                  <p className={`text-xs mt-1 ${titleLength >= 50 && titleLength <= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {titleLength}/60 characters (target: 50-60)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                  <textarea
                    value={seoSettings.meta_description}
                    onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Write a 150-160 character search snippet for your selected page."
                  />
                  <p className={`text-xs mt-1 ${descriptionLength >= 150 && descriptionLength <= 160 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {descriptionLength}/160 characters (target: 150-160)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Internal Linking Suggestions</label>
                    <button
                      type="button"
                      onClick={() => void handleAutoGenerateSuggestions()}
                      className="px-2 py-1 text-xs bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-md transition-colors"
                    >
                      Auto-generate
                    </button>
                  </div>
                  <textarea
                    value={seoSettings.internal_linking_suggestions}
                    onChange={(e) => setSeoSettings({ ...seoSettings, internal_linking_suggestions: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder={`Homepage -> /categories (anchor: Explore Luxury Collections)\n/categories -> /shop (anchor: Shop Bestsellers)`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void runSeoStudioAction()}
                disabled={savingSeo}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingSeo ? 'Applying...' : 'Apply SEO Changes'}</span>
              </button>
              <button
                onClick={() => void handleCopySuggestions()}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Link2 className="w-4 h-4" />
                <span>{copySuggestionsDone ? 'Copied' : 'Copy Internal Links'}</span>
              </button>
              <button
                onClick={openHomepageEditorFromStudio}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Open Homepage Editor</span>
              </button>
              <button
                onClick={() => window.open('https://search.google.com/search-console', '_blank', 'noopener,noreferrer')}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Search Console</span>
              </button>
            </div>
          </div>
        </div>

        {/* SEO Daily Sub-tab Content */}
        <div className={activeSubTab === 'keyword_tracking' ? 'space-y-3' : 'hidden'}>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Keyword Tracking</h2>
                <p className="text-sm text-gray-500">
                  Add 3-10 priority keywords and record movement (previous vs current position).
                </p>
              </div>
              {keywordTrackingSavedAt && (
                <span className="text-xs text-gray-500">
                  Last saved: {new Date(keywordTrackingSavedAt).toLocaleString()}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {keywordRows.map((row, index) => (
                <div key={`keyword-row-${index}`} className="grid grid-cols-1 lg:grid-cols-12 gap-2 p-2.5 border border-gray-200 rounded-lg">
                  <div className="lg:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Keyword {index + 1}</label>
                    <input
                      type="text"
                      value={row.keyword}
                      onChange={(e) => handleKeywordRowChange(index, 'keyword', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. luxury wall art india"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Previous</label>
                    <input
                      type="number"
                      min={1}
                      value={row.previousPosition}
                      onChange={(e) => handleKeywordRowChange(index, 'previousPosition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="#"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Current</label>
                    <input
                      type="number"
                      min={1}
                      value={row.currentPosition}
                      onChange={(e) => handleKeywordRowChange(index, 'currentPosition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="#"
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Move</label>
                    <div className="h-10 px-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center text-sm text-gray-700">
                      {getMovementDelta(row)}
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                    <input
                      type="text"
                      value={row.movementNote}
                      onChange={(e) => handleKeywordRowChange(index, 'movementNote', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="why it moved / action"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveKeywordTracking}
                disabled={savingKeywordTracking}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingKeywordTracking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Keyword Tracking</span>
                  </>
                )}
              </button>
              <button
                onClick={() => void autofillKeywordsFromContent()}
                disabled={autofillingKeywords}
                className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-800 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                {autofillingKeywords ? 'Auto-filling...' : 'Auto-fill Keywords'}
              </button>
              <button
                onClick={generateKeywordActionPlan}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Generate Rank-Higher Actions
              </button>
              <button
                onClick={() => void copyKeywordActionPlan()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                {copiedKeywordPlan ? 'Copied' : 'Copy Action Plan'}
              </button>
            </div>
            <textarea
              value={keywordActionPlan}
              onChange={(e) => setKeywordActionPlan(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Generated weekly action plan will appear here..."
            />
          </div>
        </div>

        {/* SEO Daily Sub-tab Content */}
        <div className={activeSubTab === 'seo_daily' ? 'space-y-3' : 'hidden'}>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">SEO Daily Checklist</h2>
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

          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
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





