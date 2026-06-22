'use client'

import React, { useState, useEffect } from 'react';
import { 
  Link2, Upload, Send, Download, TrendingUp, RefreshCw, Search, 
  ChevronDown, Check, Copy, ExternalLink, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '../../services/supabaseService';
import { generateSlug } from '../../utils/slugUtils';

const inputCls =
  'h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const textareaCls =
  'w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const labelCls = 'block text-[11px] font-medium text-gray-600 mb-1';
const cardCls = 'rounded-lg border border-gray-200 bg-white p-3 shadow-sm';
const btnPrimary =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed';
const btnOutline =
  'inline-flex h-8 items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';

interface SiteUrlItem {
  type: 'Static' | 'Category' | 'Product' | 'Blog';
  path: string;
  title: string;
  date?: string;
}

const STATIC_PAGES: { path: string; title: string }[] = [
  { path: '/', title: 'Home' },
  { path: '/browse', title: 'Browse Art' },
  { path: '/categories', title: 'Categories' },
  { path: '/categories/digital-art', title: 'Digital Art' },
  { path: '/categories/digital-art-prints', title: 'Digital Art Prints' },
  { path: '/shop', title: 'Shop' },
  { path: '/blog', title: 'Blog' },
  { path: '/clothes', title: 'Clothes' },
  { path: '/about-us', title: 'About Us' },
  { path: '/contact-us', title: 'Contact Us' },
  { path: '/gifts', title: 'Gifts' },
  { path: '/faq', title: 'FAQ' },
  { path: '/help-center', title: 'Help Center' },
  { path: '/shipping-info', title: 'Shipping Info' },
  { path: '/returns-and-refunds', title: 'Returns & Refunds' },
  { path: '/privacy', title: 'Privacy Policy' },
  { path: '/terms-and-conditions', title: 'Terms & Conditions' },
];

export default function SitemapUrlManager() {
  const [urlsList, setUrlsList] = useState<SiteUrlItem[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [urlsSearch, setUrlsSearch] = useState('');
  const [urlsTypeFilter, setUrlsTypeFilter] = useState<'all' | 'Static' | 'Category' | 'Product' | 'Blog'>('all');
  const [urlsPage, setUrlsPage] = useState(1);
  const [importUrlsInput, setImportUrlsInput] = useState('');
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  
  const [auditResults, setAuditResults] = useState<Record<string, any>>({});
  const [auditingPaths, setAuditingPaths] = useState<Record<string, boolean>>({});
  const [expandedAuditIndex, setExpandedAuditIndex] = useState<number | null>(null);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<number | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmittingIndexNow, setIsSubmittingIndexNow] = useState(false);
  const [isAuditingAll, setIsAuditingAll] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadSeoAuditCache = () => {
    try {
      const raw = localStorage.getItem('seo_audit_results_cache');
      if (raw) {
        setAuditResults(JSON.parse(raw));
      }
    } catch (error) {
      console.error('Failed to load SEO audit cache:', error);
    }
  };

  const fetchUrls = async () => {
    setUrlsLoading(true);
    try {
      const items: SiteUrlItem[] = STATIC_PAGES.map(p => ({
        type: 'Static',
        path: p.path,
        title: p.title
      }));

      const [{ data: categories }, { data: products }, { data: blogPosts }, { data: dbScores }] = await Promise.all([
        supabase
          .from('categories')
          .select('slug, name, updated_at'),
        supabase
          .from('products')
          .select('title, categories, updated_at')
          .eq('status', 'active'),
        supabase
          .from('blog_posts')
          .select('slug, title, updated_at')
          .eq('status', 'published'),
        supabase
          .from('seo_scores')
          .select('path, score, audit_data, is_indexed'),
      ]);

      if (dbScores) {
        const scoresMap: Record<string, any> = {};
        dbScores.forEach((row) => {
          if (row.path && row.audit_data) {
            scoresMap[row.path] = {
              score: row.score,
              is_indexed: row.is_indexed || false,
              title: row.audit_data.title,
              description: row.audit_data.description,
              h1: row.audit_data.h1,
              headings: row.audit_data.headings,
              images: row.audit_data.images,
              og: row.audit_data.og
            };
          }
        });
        setAuditResults(scoresMap);
      }

      if (categories) {
        categories.forEach((category) => {
          if (category.slug) {
            items.push({
              type: 'Category',
              path: `/categories/${category.slug}`,
              title: category.name || category.slug,
              date: category.updated_at
            });
          }
        });
      }

      if (products) {
        products.forEach((product) => {
          const pSlug = generateSlug(product.title);
          if (pSlug && Array.isArray(product.categories) && product.categories.length > 0) {
            const catName = product.categories[0];
            const catSlug = generateSlug(catName);
            if (catSlug) {
              items.push({
                type: 'Product',
                path: `/categories/${catSlug}/${pSlug}`,
                title: product.title || pSlug,
                date: product.updated_at
              });
            }
          }
        });
      }

      if (blogPosts) {
        blogPosts.forEach((post) => {
          if (post.slug) {
            items.push({
              type: 'Blog',
              path: `/blog/${post.slug}`,
              title: post.title || post.slug,
              date: post.updated_at
            });
          }
        });
      }

      setUrlsList(items);
    } catch (err) {
      console.error('Error fetching URLs:', err);
      showMessage('error', 'Failed to retrieve site URLs from the database.');
    } finally {
      setUrlsLoading(false);
    }
  };

  useEffect(() => {
    loadSeoAuditCache();
    void fetchUrls();
  }, []);

  useEffect(() => {
    setUrlsPage(1);
  }, [urlsSearch, urlsTypeFilter]);

  const auditUrl = async (path: string) => {
    setAuditingPaths((prev) => ({ ...prev, [path]: true }));
    try {
      const response = await fetch(path, { headers: { 'Accept': 'text/html' } });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // 1. Analyze Title
      const titleTag = doc.querySelector('title');
      const titleText = titleTag ? titleTag.textContent || '' : '';
      const titleLen = titleText.trim().length;
      let titleStatus: 'good' | 'warning' | 'error' = 'good';
      let titleMessage = 'Title tag is optimized.';
      let titleScore = 20;

      if (titleLen === 0) {
        titleStatus = 'error';
        titleMessage = 'Title tag is missing.';
        titleScore = 0;
      } else if (titleLen < 30) {
        titleStatus = 'warning';
        titleMessage = `Title is too short (${titleLen} chars). Recommend 30-60 chars.`;
        titleScore = 10;
      } else if (titleLen > 65) {
        titleStatus = 'warning';
        titleMessage = `Title is too long (${titleLen} chars). Recommend 30-60 chars.`;
        titleScore = 12;
      }

      // 2. Analyze Description
      const descTag = doc.querySelector('meta[name="description"]');
      const descText = descTag ? descTag.getAttribute('content') || '' : '';
      const descLen = descText.trim().length;
      let descStatus: 'good' | 'warning' | 'error' = 'good';
      let descMessage = 'Meta description is optimized.';
      let descScore = 20;

      if (descLen === 0) {
        descStatus = 'error';
        descMessage = 'Meta description is missing.';
        descScore = 0;
      } else if (descLen < 80) {
        descStatus = 'warning';
        descMessage = `Meta description is too short (${descLen} chars). Recommend 120-160 chars.`;
        descScore = 10;
      } else if (descLen > 170) {
        descStatus = 'warning';
        descMessage = `Meta description is too long (${descLen} chars). Recommend 120-160 chars.`;
        descScore = 12;
      }

      // 3. Analyze H1
      const h1Tags = doc.querySelectorAll('h1');
      const h1Count = h1Tags.length;
      let h1Status: 'good' | 'warning' | 'error' = 'good';
      let h1Message = 'Exactly one H1 tag found.';
      let h1Score = 20;

      if (h1Count === 0) {
        h1Status = 'error';
        h1Message = 'H1 tag is missing. Every page should have exactly one H1.';
        h1Score = 0;
      } else if (h1Count > 1) {
        h1Status = 'warning';
        h1Message = `Multiple H1 tags found (${h1Count}). Recommend using only one H1 per page.`;
        h1Score = 10;
      }

      // 4. Analyze Subheadings
      const h2Count = doc.querySelectorAll('h2').length;
      const h3Count = doc.querySelectorAll('h3').length;
      let headingsStatus: 'good' | 'warning' | 'error' = 'good';
      let headingsMessage = `Found ${h2Count} H2s and ${h3Count} H3s.`;
      let headingsScore = 10;

      if (h2Count === 0 && h3Count === 0) {
        headingsStatus = 'warning';
        headingsMessage = 'No H2 or H3 subheadings found. Use subheadings to structure content.';
        headingsScore = 0;
      }

      // 5. Analyze Images
      const imagesList = doc.querySelectorAll('img');
      const totalImages = imagesList.length;
      let missingAltCount = 0;
      imagesList.forEach((img) => {
        if (!img.getAttribute('alt')) {
          missingAltCount++;
        }
      });
      let imagesStatus: 'good' | 'warning' | 'error' = 'good';
      let imagesMessage = `All images (${totalImages}) have alt tags.`;
      let imagesScore = 20;

      if (totalImages > 0 && missingAltCount > 0) {
        const pct = Math.round(((totalImages - missingAltCount) / totalImages) * 20);
        imagesScore = pct;
        imagesStatus = missingAltCount === totalImages ? 'error' : 'warning';
        imagesMessage = `${missingAltCount} of ${totalImages} images are missing alt attributes.`;
      } else if (totalImages === 0) {
        imagesScore = 20;
        imagesMessage = 'No images found on page.';
      }

      // 6. Analyze Open Graph
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      const ogDesc = doc.querySelector('meta[property="og:description"]');
      const ogImg = doc.querySelector('meta[property="og:image"]');
      const hasOgTitle = !!ogTitle;
      const hasOgDesc = !!ogDesc;
      const hasOgImg = !!ogImg;
      let ogStatus: 'good' | 'warning' | 'error' = 'good';
      let ogMessage = 'Open Graph tags are present.';
      let ogScore = 10;

      const missingOg: string[] = [];
      if (!hasOgTitle) missingOg.push('og:title');
      if (!hasOgDesc) missingOg.push('og:description');
      if (!hasOgImg) missingOg.push('og:image');

      if (missingOg.length > 0) {
        ogStatus = missingOg.length === 3 ? 'error' : 'warning';
        ogMessage = `Missing Open Graph tags: ${missingOg.join(', ')}.`;
        ogScore = 10 - missingOg.length * 3;
      }

      const totalScore = titleScore + descScore + h1Score + headingsScore + imagesScore + ogScore;
      const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));
      const auditPayload = {
        title: { text: titleText, status: titleStatus, message: titleMessage },
        description: { text: descText, status: descStatus, message: descMessage },
        h1: { count: h1Count, status: h1Status, message: h1Message },
        headings: { h2Count, h3Count, status: headingsStatus, message: headingsMessage },
        images: { total: totalImages, missingAlt: missingAltCount, status: imagesStatus, message: imagesMessage },
        og: { hasTitle: hasOgTitle, hasDesc: hasOgDesc, hasImage: hasOgImg, status: ogStatus, message: ogMessage },
      };

      setAuditResults((prev) => {
        const existing = prev[path] || {};
        const updated = {
          ...prev,
          [path]: {
            ...existing,
            score: finalScore,
            ...auditPayload
          },
        };
        try {
          localStorage.setItem('seo_audit_results_cache', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save SEO audit cache:', error);
        }
        return updated;
      });

      try {
        const currentIndexed = auditResults[path]?.is_indexed || false;
        const { error } = await supabase
          .from('seo_scores')
          .upsert({
            path,
            score: finalScore,
            audit_data: auditPayload,
            is_indexed: currentIndexed
          }, { onConflict: 'path' });

        if (error) {
          console.error('Failed to save SEO score to database:', error);
        }
      } catch (dbErr) {
        console.error('Database connection error saving SEO score:', dbErr);
      }
    } catch (err) {
      console.error('Audit failed for path:', path, err);
      const errorPayload = {
        title: { text: '', status: 'error' as const, message: 'Failed to access the URL page.' },
        description: { text: '', status: 'error' as const, message: 'Could not fetch page HTML.' },
        h1: { count: 0, status: 'error' as const, message: 'N/A' },
        headings: { h2Count: 0, h3Count: 0, status: 'error' as const, message: 'N/A' },
        images: { total: 0, missingAlt: 0, status: 'warning' as const, message: 'N/A' },
        og: { hasTitle: false, hasDesc: false, hasImage: false, status: 'error' as const, message: 'N/A' },
      };

      setAuditResults((prev) => {
        const existing = prev[path] || {};
        const updated = {
          ...prev,
          [path]: {
            ...existing,
            score: 0,
            ...errorPayload
          },
        };
        try {
          localStorage.setItem('seo_audit_results_cache', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save SEO audit cache:', error);
        }
        return updated;
      });

      try {
        const currentIndexed = auditResults[path]?.is_indexed || false;
        const { error } = await supabase
          .from('seo_scores')
          .upsert({
            path,
            score: 0,
            audit_data: errorPayload,
            is_indexed: currentIndexed
          }, { onConflict: 'path' });

        if (error) {
          console.error('Failed to save error SEO score to database:', error);
        }
      } catch (dbErr) {
        console.error('Database connection error saving error SEO score:', dbErr);
      }
    } finally {
      setAuditingPaths((prev) => ({ ...prev, [path]: false }));
    }
  };

  const auditAllUrls = async () => {
    const targetList = urlsList.filter((item) => {
      const query = urlsSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (urlsTypeFilter === 'all') return true;
      return item.type === urlsTypeFilter;
    });

    setIsAuditingAll(true);
    try {
      for (const item of targetList) {
        await auditUrl(item.path);
      }
      showMessage('success', `Completed SEO audit of ${targetList.length} pages.`);
    } catch (error) {
      console.error('Error during bulk audit:', error);
      showMessage('error', 'SEO audit was interrupted.');
    } finally {
      setIsAuditingAll(false);
    }
  };

  const toggleIndexed = async (path: string, currentIndexed: boolean) => {
    const nextIndexed = !currentIndexed;

    setAuditResults((prev) => {
      const existing = prev[path] || {
        score: 0,
        title: { text: '', status: 'warning', message: 'Not audited yet' },
        description: { text: '', status: 'warning', message: 'Not audited yet' },
        h1: { count: 0, status: 'warning', message: 'N/A' },
        headings: { h2Count: 0, h3Count: 0, status: 'warning', message: 'N/A' },
        images: { total: 0, missingAlt: 0, status: 'warning', message: 'N/A' },
        og: { hasTitle: false, hasDesc: false, hasImage: false, status: 'warning', message: 'N/A' }
      };
      const updated = {
        ...prev,
        [path]: {
          ...existing,
          is_indexed: nextIndexed
        }
      };
      try {
        localStorage.setItem('seo_audit_results_cache', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save SEO audit cache:', error);
      }
      return updated;
    });

    try {
      const existingRecord = auditResults[path];
      const auditPayload = existingRecord?.score !== undefined ? {
        title: existingRecord.title,
        description: existingRecord.description,
        h1: existingRecord.h1,
        headings: existingRecord.headings,
        images: existingRecord.images,
        og: existingRecord.og
      } : {
        title: { text: '', status: 'warning', message: 'Not audited yet' },
        description: { text: '', status: 'warning', message: 'Not audited yet' },
        h1: { count: 0, status: 'warning', message: 'N/A' },
        headings: { h2Count: 0, h3Count: 0, status: 'warning', message: 'N/A' },
        images: { total: 0, missingAlt: 0, status: 'warning', message: 'N/A' },
        og: { hasTitle: false, hasDesc: false, hasImage: false, status: 'warning', message: 'N/A' }
      };

      const { error } = await supabase
        .from('seo_scores')
        .upsert({
          path,
          score: existingRecord?.score ?? 0,
          audit_data: auditPayload,
          is_indexed: nextIndexed
        }, { onConflict: 'path' });

      if (error) {
        console.error('Failed to update indexed status in database:', error);
        showMessage('error', 'Failed to update indexed status in database.');
        setAuditResults((prev) => ({
          ...prev,
          [path]: {
            ...prev[path],
            is_indexed: currentIndexed
          }
        }));
      } else {
        showMessage('success', `${nextIndexed ? 'Marked as' : 'Unmarked as'} Indexed.`);
      }
    } catch (dbErr) {
      console.error('Database connection error updating indexed status:', dbErr);
      showMessage('error', 'Database connection error.');
      setAuditResults((prev) => ({
        ...prev,
        [path]: {
          ...prev[path],
          is_indexed: currentIndexed
        }
      }));
    }
  };

  const handleImportIndexedUrls = async () => {
    if (!importUrlsInput.trim()) {
      showMessage('error', 'Please enter at least one URL path.');
      return;
    }

    setIsImporting(true);
    try {
      const rawLines = importUrlsInput.split('\n');
      const targetPaths: string[] = [];

      rawLines.forEach((line) => {
        let clean = line.trim();
        if (!clean) return;

        if (clean.includes('://')) {
          try {
            const urlObj = new URL(clean);
            clean = urlObj.pathname + urlObj.search + urlObj.hash;
          } catch (e) {
            clean = clean.replace(/^https?:\/\/[^\/]+/, '');
          }
        } else if (clean.startsWith('lurevi.in')) {
          clean = clean.substring('lurevi.in'.length);
        }

        if (!clean.startsWith('/')) {
          clean = '/' + clean;
        }

        targetPaths.push(clean);
      });

      if (targetPaths.length === 0) {
        showMessage('error', 'No valid URL paths found to import.');
        setIsImporting(false);
        return;
      }

      const defaultAuditPayload = {
        title: { text: '', status: 'warning' as const, message: 'Not audited yet' },
        description: { text: '', status: 'warning' as const, message: 'Not audited yet' },
        h1: { count: 0, status: 'warning' as const, message: 'N/A' },
        headings: { h2Count: 0, h3Count: 0, status: 'warning' as const, message: 'N/A' },
        images: { total: 0, missingAlt: 0, status: 'warning' as const, message: 'N/A' },
        og: { hasTitle: false, hasDesc: false, hasImage: false, status: 'warning' as const, message: 'N/A' }
      };

      const upsertRows = targetPaths.map((path) => {
        const existingRecord = auditResults[path];
        return {
          path,
          score: existingRecord?.score ?? 0,
          audit_data: existingRecord?.score !== undefined ? {
            title: existingRecord.title,
            description: existingRecord.description,
            h1: existingRecord.h1,
            headings: existingRecord.headings,
            images: existingRecord.images,
            og: existingRecord.og
          } : defaultAuditPayload,
          is_indexed: true
        };
      });

      const { error } = await supabase
        .from('seo_scores')
        .upsert(upsertRows, { onConflict: 'path' });

      if (error) {
        throw error;
      }

      setAuditResults((prev) => {
        const updated = { ...prev };
        targetPaths.forEach((path) => {
          const existing = updated[path] || {
            score: 0,
            ...defaultAuditPayload
          };
          updated[path] = {
            ...existing,
            is_indexed: true
          };
        });

        try {
          localStorage.setItem('seo_audit_results_cache', JSON.stringify(updated));
        } catch (cacheErr) {
          console.error('Failed to save SEO audit cache:', cacheErr);
        }

        return updated;
      });

      showMessage('success', `Successfully marked ${targetPaths.length} URLs as indexed!`);
      setImportUrlsInput('');
      setIsImportModalOpen(false);
    } catch (err: any) {
      console.error('Failed to import indexed URLs:', err);
      showMessage('error', err.message || 'Failed to import indexed URLs.');
    } finally {
      setIsImporting(false);
    }
  };

  const submitToIndexNow = async (pathsToSubmit: string[]) => {
    if (pathsToSubmit.length === 0) return;
    setIsSubmittingIndexNow(true);
    try {
      const response = await fetch('/api/admin/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlList: pathsToSubmit })
      });
      const data = await response.json();
      if (response.ok) {
        showMessage('success', `Successfully submitted ${pathsToSubmit.length} URL(s) to IndexNow.`);
        setSelectedUrls(new Set());
      } else {
        showMessage('error', data.error || 'Failed to submit URLs to IndexNow.');
      }
    } catch (err) {
      console.error('IndexNow submission failed:', err);
      showMessage('error', 'Network error during IndexNow submission.');
    } finally {
      setIsSubmittingIndexNow(false);
    }
  };

  const exportUrlsToCsv = () => {
    const targetType = urlsTypeFilter;
    const filtered = urlsList.filter((item) => {
      const query = urlsSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (urlsTypeFilter === 'all') return true;
      return item.type === urlsTypeFilter;
    });

    if (filtered.length === 0) {
      showMessage('error', 'No URLs to export.');
      return;
    }

    const headers = ['URL Path', 'Page Title', 'Type', 'SEO Score', 'Indexed Status', 'Last Updated'];
    const rows = filtered.map((item) => {
      const score = auditResults[item.path] ? String(auditResults[item.path].score) : 'N/A';
      const isIndexedStr = auditResults[item.path]?.is_indexed ? 'Yes' : 'No';
      const dateStr = item.date ? new Date(item.date).toISOString().split('T')[0] : '—';
      return [
        `https://lurevi.in${item.path}`,
        `"${item.title.replace(/"/g, '""')}"`,
        item.type,
        score,
        isIndexedStr,
        dateStr
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const typeLabel = targetType === 'all' ? 'all' : targetType.toLowerCase();

    link.setAttribute('href', url);
    link.setAttribute('download', `lurevi_urls_${typeLabel}_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showMessage('success', `Exported ${filtered.length} ${typeLabel} URLs to CSV.`);
  };

  return (
    <div className="space-y-3">
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

      {/* Header Card with Refresh button */}
      <div className={cardCls}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
              <Link2 className="h-4 w-4 text-gray-700" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-gray-900">Sitemap URL Manager</h2>
              <p className="text-[11px] text-gray-500">
                Monitor indexation and run dynamic SEO health audits for all site pages.
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              disabled={urlsLoading || isAuditingAll}
              className={btnOutline}
              title="Import list of indexed URLs"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Indexed
            </button>
            <button
              type="button"
              onClick={() => void submitToIndexNow(Array.from(selectedUrls))}
              disabled={selectedUrls.size === 0 || isSubmittingIndexNow || urlsLoading}
              className={btnOutline}
              title="Submit selected URLs to IndexNow"
            >
              <Send className={`h-3.5 w-3.5 ${isSubmittingIndexNow ? 'animate-pulse text-gray-400' : ''}`} />
              Submit Selected{selectedUrls.size > 0 ? ` (${selectedUrls.size})` : ''}
            </button>
            <button
              type="button"
              onClick={exportUrlsToCsv}
              disabled={urlsLoading || isAuditingAll || urlsList.length === 0}
              className={btnOutline}
              title="Export current filtered URLs to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              Export {urlsTypeFilter === 'all' ? 'All' : `${urlsTypeFilter}s`}
            </button>
            <button
              type="button"
              onClick={() => void auditAllUrls()}
              disabled={isAuditingAll || urlsLoading || urlsList.length === 0}
              className={btnOutline}
            >
              <TrendingUp className={`h-3.5 w-3.5 ${isAuditingAll ? 'animate-pulse' : ''}`} />
              {isAuditingAll ? 'Scanning SEO...' : 'Scan All SEO'}
            </button>
            <button
              type="button"
              onClick={fetchUrls}
              disabled={urlsLoading || isAuditingAll}
              className={btnOutline}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${urlsLoading ? 'animate-spin' : ''}`} />
              {urlsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or URL path..."
              value={urlsSearch}
              onChange={(e) => setUrlsSearch(e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {(['all', 'Static', 'Category', 'Product', 'Blog'] as const).map((type) => {
              const count = type === 'all'
                ? urlsList.length
                : urlsList.filter((item) => item.type === type).length;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUrlsTypeFilter(type)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                    urlsTypeFilter === type
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type === 'all' ? `All (${count})` : `${type}s (${count})`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* URLs Table List */}
      <div className={cardCls}>
        {urlsLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
            <span className="text-[11px] text-gray-500">Fetching URLs from database...</span>
          </div>
        ) : (() => {
          const filtered = urlsList.filter((item) => {
            const query = urlsSearch.toLowerCase().trim();
            const matchesSearch =
              !query ||
              item.title.toLowerCase().includes(query) ||
              item.path.toLowerCase().includes(query);

            if (!matchesSearch) return false;
            if (urlsTypeFilter === 'all') return true;
            return item.type === urlsTypeFilter;
          });

          if (filtered.length === 0) {
            return (
              <div className="py-8 text-center text-xs text-gray-500">
                No URLs found matching the current search or filters.
              </div>
            );
          }

          // Pagination calculation
          const totalItems = filtered.length;
          const urlsPerPage = 20;
          const totalPages = Math.ceil(totalItems / urlsPerPage);
          const startIndex = (urlsPage - 1) * urlsPerPage;
          const endIndex = Math.min(startIndex + urlsPerPage, totalItems);
          const paginatedList = filtered.slice(startIndex, endIndex);

          const handlePageChange = (page: number) => {
            setUrlsPage(page);
            setExpandedAuditIndex(null);
            setCopiedUrlIndex(null);
          };

          const handleCopyUrl = (path: string, index: number) => {
            const absoluteUrl = `https://lurevi.in${path}`;
            navigator.clipboard.writeText(absoluteUrl)
              .then(() => {
                setCopiedUrlIndex(index);
                setTimeout(() => setCopiedUrlIndex(null), 2000);
              })
              .catch((err) => {
                console.error('Failed to copy URL:', err);
              });
          };

          const getUrlTypeBadgeCls = (type: string) => {
            switch (type) {
              case 'Static':
                return 'bg-gray-100 text-gray-700 border-gray-200';
              case 'Category':
                return 'bg-sky-50 text-sky-700 border-sky-100';
              case 'Product':
                return 'bg-teal-50 text-teal-700 border-teal-100';
              case 'Blog':
                return 'bg-purple-50 text-purple-700 border-purple-100';
              default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
            }
          };

          return (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-medium">
                      <th className="pb-2 pl-2 w-8">
                        <input
                          type="checkbox"
                          checked={paginatedList.length > 0 && paginatedList.every(item => selectedUrls.has(item.path))}
                          onChange={(e) => {
                            const newSet = new Set(selectedUrls);
                            if (e.target.checked) {
                              paginatedList.forEach(item => newSet.add(item.path));
                            } else {
                              paginatedList.forEach(item => newSet.delete(item.path));
                            }
                            setSelectedUrls(newSet);
                          }}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                        />
                      </th>
                      <th className="pb-2 font-medium">Page Title / Name</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">URL Path</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium text-center">Indexed</th>
                      <th className="pb-2 font-medium">SEO Score</th>
                      <th className="pb-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedList.map((item, idx) => {
                      const audit = auditResults[item.path];
                      const isAuditing = auditingPaths[item.path];
                      const isExpanded = expandedAuditIndex === idx;

                      return (
                        <React.Fragment key={idx}>
                          <tr className="group hover:bg-gray-50/50">
                            <td className="py-2.5 pl-2 w-8">
                              <input
                                type="checkbox"
                                checked={selectedUrls.has(item.path)}
                                onChange={(e) => {
                                  const newSet = new Set(selectedUrls);
                                  if (e.target.checked) {
                                    newSet.add(item.path);
                                  } else {
                                    newSet.delete(item.path);
                                  }
                                  setSelectedUrls(newSet);
                                }}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 font-medium text-gray-800 pr-3 max-w-[200px] truncate" title={item.title}>
                              {item.title}
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium ${getUrlTypeBadgeCls(item.type)}`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="py-2.5 text-gray-500 font-mono text-[11px] pr-3 max-w-[250px] truncate" title={item.path}>
                              {item.path}
                            </td>
                            <td className="py-2.5 text-gray-500 text-[11px] pr-3 whitespace-nowrap">
                              {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={audit?.is_indexed || false}
                                onChange={() => void toggleIndexed(item.path, audit?.is_indexed || false)}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                title="Toggle Google indexing status"
                              />
                            </td>
                            <td className="py-2.5 pr-3">
                              {isAuditing ? (
                                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                  <RefreshCw className="h-3 w-3 animate-spin text-teal-600" />
                                  Scanning...
                                </span>
                              ) : audit ? (
                                <button
                                  type="button"
                                  onClick={() => setExpandedAuditIndex(isExpanded ? null : idx)}
                                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                                    audit.score >= 90
                                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                      : audit.score >= 60
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                  }`}
                                  title="Click to view detailed SEO report"
                                >
                                  {audit.score}/100
                                  <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void auditUrl(item.path)}
                                  disabled={isAuditingAll}
                                  className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-600 hover:text-teal-800 hover:underline cursor-pointer"
                                >
                                  <Search className="h-3 w-3" />
                                  Analyze
                                </button>
                              )}
                            </td>
                            <td className="py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => void submitToIndexNow([item.path])}
                                  disabled={isSubmittingIndexNow}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                  title="Submit to IndexNow"
                                >
                                  <Send className={`h-3 w-3 ${isSubmittingIndexNow ? 'opacity-50' : ''}`} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyUrl(item.path, idx)}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                                  title="Copy URL"
                                >
                                  {copiedUrlIndex === idx ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                                <a
                                  href={item.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                                  title="Open Page"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && audit && (
                            <tr className="bg-gray-50/30">
                              <td colSpan={8} className="p-3 border-t border-b border-gray-100">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Detailed SEO Audit Report</span>
                                  <button
                                    type="button"
                                    onClick={() => void auditUrl(item.path)}
                                    disabled={isAuditing || isAuditingAll}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-700 transition-colors shadow-sm cursor-pointer"
                                  >
                                    <RefreshCw className={`h-3 w-3 ${isAuditing ? 'animate-spin' : ''}`} />
                                    {isAuditing ? 'Analyzing...' : 'Re-analyze SEO Score'}
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-gray-700">
                                  {/* Page Title Audit */}
                                  <div className="p-2 bg-white rounded border border-gray-200/80 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-gray-800">Page Title SEO</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        audit.title.status === 'good' ? 'bg-green-100 text-green-800' :
                                        audit.title.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {audit.title.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-mono bg-gray-50 p-1 rounded border max-h-[36px] overflow-y-auto">
                                      "{audit.title.text || 'None'}"
                                    </p>
                                    <p className="text-[10px] text-gray-600">{audit.title.message}</p>
                                  </div>

                                  {/* Meta Description Audit */}
                                  <div className="p-2 bg-white rounded border border-gray-200/80 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-gray-800">Meta Description SEO</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        audit.description.status === 'good' ? 'bg-green-100 text-green-800' :
                                        audit.description.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {audit.description.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-mono bg-gray-50 p-1 rounded border max-h-[36px] overflow-y-auto">
                                      "{audit.description.text || 'None'}"
                                    </p>
                                    <p className="text-[10px] text-gray-600">{audit.description.message}</p>
                                  </div>

                                  {/* Heading Checklist */}
                                  <div className="p-2 bg-white rounded border border-gray-200/80 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-gray-800">Heading Tag Audit</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        audit.h1.status === 'good' ? 'bg-green-100 text-green-800' :
                                        audit.h1.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        H1: {audit.h1.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-medium">H1 Tags Found: {audit.h1.count}</p>
                                    <p className="text-[10px] text-gray-600">{audit.h1.message}</p>
                                    <p className="text-[10px] text-gray-500">{audit.headings.message}</p>
                                  </div>

                                  {/* Media & Social Tags */}
                                  <div className="p-2 bg-white rounded border border-gray-200/80 shadow-sm space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-gray-800">Media & Social Preview</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        audit.images.status === 'good' && audit.og.status === 'good' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        OG: {audit.og.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-600">{audit.images.message}</p>
                                    <p className="text-[10px] text-gray-600">{audit.og.message}</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-600">
                  <div>
                    Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
                    <span className="font-semibold text-gray-900">{totalItems}</span> URLs
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePageChange(urlsPage - 1)}
                      disabled={urlsPage === 1}
                      className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, pIdx) => {
                      const pageNum = pIdx + 1;
                      const isCurrent = pageNum === urlsPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded border font-medium transition-colors ${
                            isCurrent
                              ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => handlePageChange(urlsPage + 1)}
                      disabled={urlsPage === totalPages}
                      className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Import Indexed URLs Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md border border-gray-200 bg-gray-50 p-1.5">
                  <Upload className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-900">Import Indexed URLs</h3>
                  <p className="text-[10px] text-gray-500">Mark multiple pages as indexed in bulk.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Enter URLs or Paths (one per line):</label>
                <textarea
                  value={importUrlsInput}
                  onChange={(e) => setImportUrlsInput(e.target.value)}
                  placeholder="https://lurevi.in/shop&#10;/categories/coder&#10;https://lurevi.in/blog/how-to-choose-digital-artwork-for-your-home"
                  rows={8}
                  className={`${textareaCls} font-mono text-[10px]`}
                  disabled={isImporting}
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className={btnOutline}
                  disabled={isImporting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleImportIndexedUrls()}
                  className={btnPrimary}
                  disabled={isImporting}
                >
                  {isImporting ? 'Importing...' : 'Mark as Indexed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
