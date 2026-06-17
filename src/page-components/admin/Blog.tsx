'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { FileText, ExternalLink, Pencil, Trash2, Loader2, Save, Upload, AlertTriangle, CheckCircle, Info, Sparkles, Link2, Key, Search, ShoppingBag } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Link } from '@/src/compat/router';
import { BlogPost, BlogService, BlogStatus } from '../../services/blogService';
import { ProductService } from '../../services/supabaseService';
import { Product } from '../../types';
import { generateProductUrl, generateSlug } from '../../utils/slugUtils';
import BlogSecondaryNav, { BlogTabId } from '../../components/admin/BlogSecondaryNav';
import { runSeoAnalysis, SeoCheckResult } from '../../utils/seoAnalysis';

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  status: BlogStatus;
  tags: string;
  seo_title: string;
  seo_description: string;
  focus_keyphrase: string;
};

const EMPTY_FORM: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  status: 'draft',
  tags: '',
  seo_title: '',
  seo_description: '',
  focus_keyphrase: '',
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
        type="button"
      >
        Previous
      </button>
      <div className="flex items-center gap-1.5">
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2.5 py-1.5 text-xs text-gray-400">
                ...
              </span>
            );
          }
          const pageNum = p as number;
          const isActive = pageNum === currentPage;
          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-pink-600 text-white shadow-sm shadow-pink-100'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
              }`}
              type="button"
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
        type="button"
      >
        Next
      </button>
    </div>
  );
};

const BlogAdmin: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<BlogTabId>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM);

  const [searchQuery, setSearchQuery] = useState('');
  const [editPage, setEditPage] = useState(1);
  const [listPage, setListPage] = useState(1);
  const [keyphraseSearchQuery, setKeyphraseSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 10;

  const keyphrasesData = useMemo(() => {
    const mapping: Record<string, { keyphrase: string; posts: BlogPost[] }> = {};
    const noKeyphrase: BlogPost[] = [];

    posts.forEach((post) => {
      const kp = post.tags?.[0]?.trim();
      if (kp) {
        const normalized = kp.toLowerCase();
        if (!mapping[normalized]) {
          mapping[normalized] = { keyphrase: kp, posts: [] };
        }
        mapping[normalized].posts.push(post);
      } else {
        noKeyphrase.push(post);
      }
    });

    return {
      mapping,
      list: Object.values(mapping),
      noKeyphrase,
    };
  }, [posts]);

  const filteredKeyphrases = useMemo(() => {
    if (!keyphraseSearchQuery.trim()) return keyphrasesData.list;
    const q = keyphraseSearchQuery.toLowerCase();
    return keyphrasesData.list.filter((item) =>
      item.keyphrase.toLowerCase().includes(q) ||
      item.posts.some((post) => post.title.toLowerCase().includes(q))
    );
  }, [keyphrasesData.list, keyphraseSearchQuery]);

  const keyphraseMetrics = useMemo(() => {
    const totalUnique = keyphrasesData.list.length;
    const cannibalized = keyphrasesData.list.filter((item) => item.posts.length > 1).length;
    const missing = keyphrasesData.noKeyphrase.length;
    return { totalUnique, cannibalized, missing };
  }, [keyphrasesData]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q))
    );
  }, [posts, searchQuery]);

  const paginatedEditPosts = useMemo(() => {
    const start = (editPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, editPage]);

  const editTotalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  const paginatedListPosts = useMemo(() => {
    const start = (listPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPosts, listPage]);

  const listTotalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setEditPage(1);
    setListPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (editPage > editTotalPages && editTotalPages > 0) {
      setEditPage(editTotalPages);
    }
  }, [filteredPosts.length, editPage, editTotalPages]);

  useEffect(() => {
    if (listPage > listTotalPages && listTotalPages > 0) {
      setListPage(listTotalPages);
    }
  }, [filteredPosts.length, listPage, listTotalPages]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [seedingSeoPack, setSeedingSeoPack] = useState(false);
  const [aiKeyword, setAiKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [fixingSeoName, setFixingSeoName] = useState<string | null>(null);
  const [fixingLinks, setFixingLinks] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [checkingLinks, setCheckingLinks] = useState(false);
  const [brokenLinks, setBrokenLinks] = useState<{url: string, status: string | number}[] | null>(null);

  const [showBlogLinkModal, setShowBlogLinkModal] = useState(false);
  const [blogLinkSearchQuery, setBlogLinkSearchQuery] = useState('');

  const [showProductLinkModal, setShowProductLinkModal] = useState(false);
  const [productLinkSearchQuery, setProductLinkSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const filteredBlogLinks = useMemo(() => {
    const otherPosts = posts.filter(p => p.id !== editingId);
    if (!blogLinkSearchQuery.trim()) return otherPosts;
    const q = blogLinkSearchQuery.toLowerCase();
    return otherPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q)
    );
  }, [posts, editingId, blogLinkSearchQuery]);

  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await BlogService.getAdminPosts();
      setPosts(data);
    } catch (error: any) {
      console.error('Failed to load blog posts:', error);
      setMessage({
        type: 'error',
        text: error?.message || 'Failed to load blog posts. Ensure blog_posts table exists.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (error: any) {
      console.error('Failed to load products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const getProductUrl = (product: Product): string => {
    const isClothing =
      (product as any).gender === 'Men' ||
      (product as any).gender === 'Women' ||
      (product as any).gender === 'Unisex' ||
      product.categories?.some(cat =>
        cat.toLowerCase().includes('men') ||
        cat.toLowerCase().includes('women') ||
        cat.toLowerCase().includes('unisex') ||
        cat.toLowerCase().includes('clothing')
      );
    const categoriesLower = (product.categories || []).map(c => c.toLowerCase()).join(' ');
    const isFB =
      categoriesLower.includes('food & beverage') ||
      categoriesLower.includes('f&b') ||
      categoriesLower.includes('food-beverage') ||
      categoriesLower.includes('dry fruit') ||
      categoriesLower.includes('dried fruit') ||
      categoriesLower.includes('spice');
    const isNormalItem = product.categories && product.categories.includes('Normal');
    const productSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (isClothing) return `/clothes/${productSlug}`;
    if (isFB) return `/${productSlug}`;
    if (isNormalItem) return `/shop/${generateSlug(product.title)}`;
    return generateProductUrl(
      product.categories && product.categories.length > 0
        ? product.categories[0]
        : (product as any).category || 'general',
      product.title
    );
  };

  useEffect(() => {
    void loadPosts();
    void loadProducts();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const onTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: editingId ? prev.slug : toSlug(title),
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image: post.cover_image || '',
      status: post.status,
      tags: (post.tags || []).join(', '),
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      focus_keyphrase: post.tags?.[0] || '',
    });
    setBrokenLinks(null);
    setActiveSubTab('posts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      showMessage('error', 'Title, slug, and content are required.');
      return;
    }

    const isDuplicateTitle = posts.some(
      (post) =>
        post.title.toLowerCase().trim() === form.title.toLowerCase().trim() &&
        post.id !== editingId
    );

    if (isDuplicateTitle) {
      showMessage('error', 'A blog post with this title already exists. Please use a unique title.');
      return;
    }

    const newKeyphrase = form.focus_keyphrase.trim();
    const parsedTags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let finalTags: string[] = [];
    if (newKeyphrase) {
      finalTags.push(newKeyphrase);
      const restTags = parsedTags.filter((t, idx) => {
        if (idx === 0) return false;
        return t.toLowerCase() !== newKeyphrase.toLowerCase();
      });
      finalTags = [...finalTags, ...restTags];
    } else {
      finalTags = parsedTags;
    }

    const payload = {
      title: form.title.trim(),
      slug: toSlug(form.slug),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover_image: form.cover_image.trim() || null,
      status: form.status,
      tags: finalTags,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
    };

    try {
      setSaving(true);
      if (editingId) {
        await BlogService.updatePost(editingId, payload);
        showMessage('success', 'Blog post updated.');
      } else {
        await BlogService.createPost(payload);
        showMessage('success', 'Blog post created.');
      }
      resetForm();
      await loadPosts();
    } catch (error: any) {
      console.error('Failed to save blog post:', error);
      showMessage('error', error?.message || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const removePost = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await BlogService.deletePost(id);
      showMessage('success', 'Blog post deleted.');
      await loadPosts();
    } catch (error: any) {
      console.error('Failed to delete blog post:', error);
      showMessage('error', error?.message || 'Failed to delete blog post.');
    }
  };

  const onLocalImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await BlogService.uploadCoverImage(file, form.slug || form.title || 'blog-post');
      setForm((prev) => ({ ...prev, cover_image: url }));
      showMessage('success', 'Image uploaded and attached to blog post.');
    } catch (error: any) {
      console.error('Failed to upload blog image:', error);
      showMessage('error', error?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const seedSeoBlogPack = async () => {
    try {
      if (!window.confirm('Create/Update the SEO blog pack now? This will upsert ready blog posts.')) return;
      setSeedingSeoPack(true);
      const count = await BlogService.upsertSeoBlogPack();
      await loadPosts();
      showMessage('success', `SEO blog pack applied: ${count} posts created/updated.`);
    } catch (error: any) {
      console.error('Failed to apply SEO blog pack:', error);
      showMessage('error', error?.message || 'Failed to apply SEO blog pack.');
    } finally {
      setSeedingSeoPack(false);
    }
  };

  const generateWithAI = async () => {
    if (!aiKeyword.trim()) {
      showMessage('error', 'Please enter a keyword or topic first.');
      return;
    }

    try {
      setIsGenerating(true);
      showMessage('success', 'AI is generating the blog post... This may take a few seconds.');
      
      const existingTitles = posts.map(p => p.title);
      
      const response = await fetch('/api/admin/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: aiKeyword.trim(), existingTitles })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate blog post.');
      }

      // Auto-fill the form with the AI's response
      setForm((prev) => ({
        ...prev,
        title: data.title || '',
        slug: toSlug(data.title || ''),
        excerpt: data.excerpt || '',
        content: data.content || '',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        tags: data.tags || '',
        focus_keyphrase: aiKeyword.trim()
      }));

      showMessage('success', 'Blog generated successfully! Review the content before saving.');
    } catch (error: any) {
      console.error('Failed to generate with AI:', error);
      showMessage('error', error?.message || 'Failed to generate blog with AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const rewriteWithAI = async () => {
    if (!form.content.trim()) {
      showMessage('error', 'Please add some content to rewrite first.');
      return;
    }

    try {
      setIsGenerating(true);
      showMessage('success', 'AI is rewriting the blog post... This may take a few seconds.');
      
      const existingTitles = posts.filter(p => p.id !== editingId).map(p => p.title);
      
      const response = await fetch('/api/admin/rewrite-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content, existingTitles })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite blog post.');
      }

      // Auto-fill the form with the AI's response
      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        slug: data.title ? toSlug(data.title) : prev.slug,
        excerpt: data.excerpt || prev.excerpt,
        content: data.content || prev.content,
        seo_title: data.seo_title || prev.seo_title,
        seo_description: data.seo_description || prev.seo_description,
        tags: data.tags || prev.tags,
      }));

      showMessage('success', 'Blog rewritten successfully! Review the changes before saving.');
    } catch (error: any) {
      console.error('Failed to rewrite with AI:', error);
      showMessage('error', error?.message || 'Failed to rewrite blog with AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const fixSeoIssue = async (issueName: string, issueMessage: string) => {
    if (!form.content.trim() && !form.title.trim()) return;

    try {
      setFixingSeoName(issueName);
      showMessage('success', `AI is fixing: ${issueName}...`);
      
      const response = await fetch('/api/admin/fix-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          blogData: form,
          issueName,
          issueMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix SEO issue.');
      }

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        slug: data.slug ? toSlug(data.slug) : prev.slug,
        content: data.content || prev.content,
        seo_title: data.seo_title || prev.seo_title,
        seo_description: data.seo_description || prev.seo_description,
        focus_keyphrase: data.focus_keyphrase || prev.focus_keyphrase,
      }));

      showMessage('success', `Fixed: ${issueName}`);
    } catch (error: any) {
      console.error('Failed to fix SEO issue:', error);
      showMessage('error', error?.message || 'Failed to fix SEO issue with AI.');
    } finally {
      setFixingSeoName(null);
    }
  };

  const verifyLinks = async () => {
    try {
      setCheckingLinks(true);
      setBrokenLinks(null);
      showMessage('success', 'Scanning content for links...');
      
      const linksToVerify: string[] = [];
      if (form.cover_image && form.cover_image.startsWith('http')) {
        linksToVerify.push(form.cover_image);
      }
      
      const mdImgRegex = /!\[.*?\]\((.*?)\)/g;
      const mdLinkRegex = /(?<!\!)\[.*?\]\((.*?)\)/g;
      const htmlImgRegex = /<img.*?src=["'](.*?)["']/gi;
      const htmlLinkRegex = /<a.*?href=["'](.*?)["']/gi;
      
      const text = form.content;
      let match;
      while ((match = mdImgRegex.exec(text)) !== null) linksToVerify.push(match[1]);
      while ((match = mdLinkRegex.exec(text)) !== null) linksToVerify.push(match[1]);
      while ((match = htmlImgRegex.exec(text)) !== null) linksToVerify.push(match[1]);
      while ((match = htmlLinkRegex.exec(text)) !== null) linksToVerify.push(match[1]);
      
      const uniqueLinks = Array.from(new Set(linksToVerify)).filter(l => l.startsWith('http'));
      
      if (uniqueLinks.length === 0) {
        showMessage('success', 'No external links found to check.');
        setCheckingLinks(false);
        return;
      }

      showMessage('success', `Verifying ${uniqueLinks.length} link(s)...`);
      
      const response = await fetch('/api/admin/check-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: uniqueLinks })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to verify links.');
      
      const broken = data.results.filter((res: any) => !res.ok);
      setBrokenLinks(broken);
      
      if (broken.length > 0) {
        showMessage('error', `Found ${broken.length} broken link(s)!`);
      } else {
        showMessage('success', `All ${uniqueLinks.length} link(s) are working correctly!`);
      }
      
    } catch (error: any) {
      console.error('Link check error:', error);
      showMessage('error', error?.message || 'Failed to check links.');
    } finally {
      setCheckingLinks(false);
    }
  };

  const fixBrokenLinks = async () => {
    if (!brokenLinks || brokenLinks.length === 0) return;

    try {
      setFixingLinks(true);
      showMessage('success', 'AI is replacing broken links... This may take a few seconds.');
      
      const response = await fetch('/api/admin/fix-broken-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: form.content,
          cover_image: form.cover_image,
          brokenLinks
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix broken links.');
      }

      setForm((prev) => ({
        ...prev,
        content: data.content || prev.content,
        cover_image: data.cover_image || prev.cover_image,
      }));

      setBrokenLinks(null);
      showMessage('success', 'Broken links replaced successfully!');
    } catch (error: any) {
      console.error('Failed to fix broken links:', error);
      showMessage('error', error?.message || 'Failed to fix broken links with AI.');
    } finally {
      setFixingLinks(false);
    }
  };

  const addRandomCategoryLinks = () => {
    const categories = [
      { slug: 'abstract', label: 'Abstract Art' },
      { slug: 'animals', label: 'Animals Art' },
      { slug: 'cars', label: 'Cars Art' },
      { slug: 'chinese-calligraphy', label: 'Chinese Calligraphy' },
      { slug: 'classical', label: 'Classical Art' },
      { slug: 'coder', label: 'Coder Art' },
      { slug: 'contemporary', label: 'Contemporary Art' },
      { slug: 'expressionist', label: 'Expressionist Art' },
      { slug: 'fantasy', label: 'Fantasy Art' },
      { slug: 'floral', label: 'Floral Art' },
      { slug: 'food', label: 'Food Art' },
      { slug: 'football', label: 'Football Art' },
      { slug: 'forest', label: 'Forest Art' },
      { slug: 'funny', label: 'Funny Art' },
      { slug: 'illustration', label: 'Illustration Art' },
      { slug: 'impressionist', label: 'Impressionist Art' },
      { slug: 'japanese-calligraphy', label: 'Japanese Calligraphy' },
      { slug: 'landscapes', label: 'Landscapes Art' },
      { slug: 'maps', label: 'Maps Art' },
      { slug: 'minimalist', label: 'Minimalist Art' },
      { slug: 'monochrome', label: 'Monochrome Art' },
      { slug: 'motivational', label: 'Motivational Art' },
      { slug: 'music', label: 'Music Art' },
      { slug: 'nature', label: 'Nature Art' },
      { slug: 'painting', label: 'Painting Art' },
      { slug: 'photography', label: 'Photography' },
      { slug: 'pop-art', label: 'Pop Art' },
      { slug: 'popular-shows', label: 'Popular Shows Art' },
      { slug: 'shapes', label: 'Shapes Art' },
      { slug: 'sports', label: 'Sports Art' },
      { slug: 'still-life', label: 'Still Life Art' },
      { slug: 'street-art', label: 'Street Art' },
      { slug: 'super-heroes', label: 'Super Heroes Art' },
      { slug: 'vintage', label: 'Vintage Art' },
      { slug: 'vintage-movies', label: 'Vintage Movies Art' },
      { slug: 'woman', label: 'Woman Art' },
      { slug: 'world-cities', label: 'World Cities Art' }
    ];

    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const linksString = selected
      .map(cat => `[${cat.label}](https://lurevi.in/categories/${cat.slug})`)
      .join(', ');

    const textToAppend = `\n\nExplore our related collections: ${linksString}`;

    setForm(prev => ({
      ...prev,
      content: prev.content + textToAppend
    }));

    showMessage('success', 'Added 3 related collection links to content.');
  };

  const insertLink = () => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end) || 'link text';
    
    const url = window.prompt('Enter URL:', 'https://');
    if (!url) return;

    const linkMarkdown = `[${selectedText}](${url})`;
    
    const newContent = form.content.substring(0, start) + linkMarkdown + form.content.substring(end);
    
    setForm(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
    }, 0);
  };

  const insertBlogLink = (post: BlogPost) => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end) || post.title;
    
    const url = `/blog/${post.slug}`;
    const linkMarkdown = `[${selectedText}](${url})`;
    
    const newContent = form.content.substring(0, start) + linkMarkdown + form.content.substring(end);
    
    setForm(prev => ({ ...prev, content: newContent }));
    setShowBlogLinkModal(false);
    setBlogLinkSearchQuery('');
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
    }, 0);
  };

  const insertProductLink = (product: Product) => {
    const textarea = contentTextAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end) || product.title;

    const url = getProductUrl(product);
    const linkMarkdown = `[${selectedText}](${url})`;

    const newContent = form.content.substring(0, start) + linkMarkdown + form.content.substring(end);

    setForm(prev => ({ ...prev, content: newContent }));
    setShowProductLinkModal(false);
    setProductLinkSearchQuery('');

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
    }, 0);
  };

  const filteredProducts = products.filter(p => {
    if (!productLinkSearchQuery.trim()) return true;
    const q = productLinkSearchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.categories || []).some(c => c.toLowerCase().includes(q))
    );
  });

  const publishedCount = useMemo(
    () => posts.filter((post) => post.status === 'published').length,
    [posts]
  );

  const seoResults = useMemo(() => {
    return runSeoAnalysis({
      content: form.content,
      title: form.title,
      slug: form.slug,
      seoTitle: form.seo_title,
      seoDescription: form.seo_description,
      keyphrase: form.focus_keyphrase,
      existingPosts: posts,
      currentPostId: editingId,
      coverImage: form.cover_image,
    });
  }, [form.content, form.title, form.slug, form.seo_title, form.seo_description, form.focus_keyphrase, posts, editingId, form.cover_image]);

  const { scoreText, scoreColor, scoreBg, errorCount, warningCount, goodCount } = useMemo(() => {
    const errors = seoResults.filter(r => r.status === 'error').length;
    const warnings = seoResults.filter(r => r.status === 'warning').length;
    const goods = seoResults.filter(r => r.status === 'good').length;
    
    let text = 'Needs Improvement';
    let color = 'text-amber-600';
    let bg = 'bg-amber-50 border-amber-200';
    
    if (errors === 0 && warnings === 0 && goods > 0) {
      text = 'Good SEO';
      color = 'text-green-600';
      bg = 'bg-green-50 border-green-200';
    } else if (errors > 3) {
      text = 'Poor SEO';
      color = 'text-red-600';
      bg = 'bg-red-50 border-red-200';
    } else if (goods > warnings + errors) {
      text = 'O.K. SEO';
      color = 'text-green-600';
      bg = 'bg-green-50 border-green-200';
    }
    
    return {
      scoreText: text,
      scoreColor: color,
      scoreBg: bg,
      errorCount: errors,
      warningCount: warnings,
      goodCount: goods
    };
  }, [seoResults]);



  const renderEditor = () => {
    return (
      <div className="flex flex-col xl:flex-row gap-6">
      {/* Main Blog Editor Form */}
      <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <h3 className="text-sm font-semibold text-gray-800">
                {editingId ? 'Edit Blog Post' : 'Create Blog Post'}
              </h3>
              
              <div className="flex items-center gap-2 bg-pink-50 p-2 rounded-lg border border-pink-100">
                {!editingId ? (
                  <>
                    <input
                      type="text"
                      value={aiKeyword}
                      onChange={(e) => setAiKeyword(e.target.value)}
                      placeholder="Enter keyword or topic..."
                      className="px-3 py-1.5 border border-pink-200 rounded text-sm w-48 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      disabled={isGenerating}
                    />
                    <button
                      type="button"
                      onClick={generateWithAI}
                      disabled={isGenerating || !aiKeyword.trim()}
                      className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white rounded text-sm font-medium inline-flex items-center gap-1"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '✨ AI Generate'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={rewriteWithAI}
                    disabled={isGenerating || !form.content.trim()}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white rounded text-sm font-medium inline-flex items-center gap-1"
                  >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '✨ AI Rewrite'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={form.title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Title"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: toSlug(e.target.value) }))}
                placeholder="Slug (auto-generated)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <input
                value={form.cover_image}
                onChange={(e) => setForm((prev) => ({ ...prev, cover_image: e.target.value }))}
                placeholder="Cover image URL"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, cover_image: '' }))}
                  className="text-xs text-gray-600 underline hover:text-gray-900"
                >
                  Clear cover URL
                </button>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600 block mb-1">Upload image from local</label>
                <label
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg text-sm ${
                    uploadingImage
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:border-pink-400 cursor-pointer'
                  }`}
                >
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingImage ? 'Uploading image...' : 'Choose image from computer'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    onChange={(e) => void onLocalImageSelect(e)}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-500 mt-1">
                  Allowed: JPG, PNG, WEBP, GIF up to 10MB. Bucket: {BlogService.BLOG_IMAGES_BUCKET}
                </p>
              </div>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Short excerpt"
                rows={2}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-600 font-medium">Main Content</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowProductLinkModal(true); }}
                      disabled={previewMode}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Link Product
                    </button>
                    <button
                      type="button"
                      onClick={insertLink}
                      disabled={previewMode}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <Link2 className="w-3.5 h-3.5" /> Add Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBlogLinkModal(true)}
                      disabled={previewMode || posts.length === 0}
                      className="text-xs text-pink-600 hover:text-pink-700 font-medium bg-pink-50 px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <Link2 className="w-3.5 h-3.5" /> Link Blog
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="text-xs text-pink-600 hover:text-pink-700 font-medium bg-pink-50 px-2.5 py-1 rounded transition-colors"
                    >
                      {previewMode ? 'Edit Content' : 'Preview Content'}
                    </button>
                  </div>
                </div>
                {previewMode ? (
                  <div
                    className="px-3 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 min-h-[250px] max-h-[500px] overflow-y-auto leading-7 text-gray-800 space-y-4 font-normal [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_strong]:font-semibold [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:mx-auto [&_a]:text-pink-600 [&_a]:hover:underline"
                    dangerouslySetInnerHTML={{ __html: (form.content || '<p class="text-gray-400 italic">No content yet.</p>')
                      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
                      .replace(/(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    }}
                  />
                ) : (
                  <textarea
                    ref={contentTextAreaRef}
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Full blog content (HTML)"
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono"
                  />
                )}
              </div>
              <input
                value={form.tags}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => {
                    const parsedTags = val.split(',').map((t) => t.trim()).filter(Boolean);
                    const firstTag = parsedTags[0] || '';
                    return {
                      ...prev,
                      tags: val,
                      focus_keyphrase: firstTag,
                    };
                  });
                }}
                placeholder="Tags (comma separated)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as BlogStatus }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <input
                value={form.seo_title}
                onChange={(e) => setForm((prev) => ({ ...prev, seo_title: e.target.value }))}
                placeholder="SEO title (optional)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <input
                value={form.seo_description}
                onChange={(e) => setForm((prev) => ({ ...prev, seo_description: e.target.value }))}
                placeholder="SEO description (optional)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            {form.cover_image && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Cover preview</p>
                <img
                  key={form.cover_image}
                  src={form.cover_image}
                  alt="Blog cover preview"
                  className="w-full max-w-md h-44 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => void submit()}
                className="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
                type="button"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update Post' : 'Create Post'}
              </button>
              <button
                onClick={verifyLinks}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60"
                type="button"
                disabled={checkingLinks}
              >
                {checkingLinks ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Verify Links
              </button>
              <button
                onClick={addRandomCategoryLinks}
                className="px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-sm font-medium inline-flex items-center gap-1"
                type="button"
              >
                Add 3 Category Links
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                  type="button"
                >
                  Cancel Edit
                </button>
              )}
              <Link
                to="/blog"
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm inline-flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Public Blog
              </Link>
            </div>
            
            {brokenLinks && brokenLinks.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> 
                    Broken Links Detected ({brokenLinks.length})
                  </h4>
                  <button
                    onClick={fixBrokenLinks}
                    disabled={fixingLinks}
                    className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-medium inline-flex items-center gap-1 disabled:opacity-60"
                    type="button"
                  >
                    {fixingLinks ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Auto-Fix with AI
                  </button>
                </div>
                <ul className="text-xs text-red-700 space-y-1">
                  {brokenLinks.map((bl, i) => (
                    <li key={i} className="break-all">
                      <span className="font-semibold">{bl.status}</span>: <a href={bl.url} target="_blank" rel="noreferrer" className="underline">{bl.url}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {brokenLinks && brokenLinks.length === 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> 
                  All links in your content appear to be working!
                </p>
              </div>
            )}
          </div>

          {/* Yoast SEO Analysis Sidebar */}
          <div className="w-full xl:w-96 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm sticky top-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  SEO Analysis
                </h3>
                {form.focus_keyphrase ? (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${scoreBg} ${scoreColor}`}>
                    {scoreText}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                    No Keyphrase
                  </span>
                )}
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 block mb-1">Focus Keyphrase</label>
                <input
                  value={form.focus_keyphrase}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => {
                      const parsedTags = prev.tags.split(',').map((t) => t.trim()).filter(Boolean);
                      const restTags = parsedTags.slice(1);
                      const newTags = val.trim() ? [val.trim(), ...restTags].join(', ') : restTags.join(', ');
                      return {
                        ...prev,
                        focus_keyphrase: val,
                        tags: newTags,
                      };
                    });
                  }}
                  placeholder="e.g. luxury wall art"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Enter the primary search term you want this post to rank for.
                </p>
              </div>

              <div className="space-y-4">
                {/* Score indicators */}
                <div className="flex items-center justify-between text-xs font-medium border-b border-gray-100 pb-2">
                  <span className="flex items-center gap-1.5 text-red-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                    {errorCount} Problems
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    {warningCount} Warnings
                  </span>
                  <span className="flex items-center gap-1.5 text-green-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                    {goodCount} Good
                  </span>
                </div>

                {/* Scrollable list of analysis points */}
                <div className="max-h-[480px] overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                  {seoResults.map((result, idx) => {
                    const isWarningOrError = result.status === 'warning' || result.status === 'error';
                    const isFixing = fixingSeoName === result.name;

                    return (
                      <div 
                        key={`seo-check-${idx}`} 
                        className={`flex items-start gap-2.5 text-xs p-2 rounded-lg transition-colors ${
                          isWarningOrError ? 'cursor-pointer hover:bg-pink-50 border border-transparent hover:border-pink-100 group' : ''
                        }`}
                        onClick={() => {
                          if (isWarningOrError && !isFixing) {
                            fixSeoIssue(result.name, result.message);
                          }
                        }}
                        title={isWarningOrError ? "Click to fix with AI" : ""}
                      >
                        <span className="mt-0.5 flex-shrink-0">
                          {isFixing ? (
                            <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
                          ) : (
                            <>
                              {result.status === 'good' && <CheckCircle className="w-4 h-4 text-green-500 fill-green-50" />}
                              {result.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-50" />}
                              {result.status === 'error' && <Info className="w-4 h-4 text-red-500 fill-red-50" />}
                            </>
                          )}
                        </span>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800 flex items-center justify-between">
                            {result.name}
                            {isWarningOrError && !isFixing && (
                              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-pink-600 flex items-center gap-1 font-medium transition-opacity">
                                <Sparkles className="w-3 h-3" />
                                Fix with AI
                              </span>
                            )}
                            {isFixing && (
                              <span className="text-[10px] text-pink-600 flex items-center gap-1 font-medium">
                                Fixing...
                              </span>
                            )}
                          </span>
                          <span className="text-gray-600 leading-normal block mt-0.5">{result.message}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {showBlogLinkModal && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-pink-600" /> Link Another Blog Post
                  </h3>
                  <button 
                    onClick={() => { setShowBlogLinkModal(false); setBlogLinkSearchQuery(''); }}
                    className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Select a blog post to insert its link at your current cursor position. If you selected text, it will be wrapped by the link.
                </p>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={blogLinkSearchQuery}
                    onChange={(e) => setBlogLinkSearchQuery(e.target.value)}
                    placeholder="Search posts by title or slug..."
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-pink-300 font-sans"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg pr-1">
                  {filteredBlogLinks.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => insertBlogLink(post)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-pink-50/55 hover:text-pink-750 transition-colors flex flex-col gap-0.5 text-xs text-gray-700 font-medium"
                      type="button"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-gray-800">{post.title}</span>
                        {post.status === 'draft' && (
                          <span className="px-1.5 py-0.5 text-[9px] bg-amber-50 border border-amber-200 text-amber-600 rounded">Draft</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">/blog/{post.slug}</span>
                    </button>
                  ))}
                  {filteredBlogLinks.length === 0 && (
                    <p className="text-center py-6 text-xs text-gray-400 italic">No matching blog posts found.</p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { setShowBlogLinkModal(false); setBlogLinkSearchQuery(''); }}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-750 rounded-lg text-xs font-semibold"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showProductLinkModal && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" /> Link a Product
                  </h3>
                  <button
                    onClick={() => { setShowProductLinkModal(false); setProductLinkSearchQuery(''); }}
                    className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Select a product to insert its link at your current cursor position. If you have text selected, it will be used as the link label.
                </p>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={productLinkSearchQuery}
                    onChange={(e) => setProductLinkSearchQuery(e.target.value)}
                    placeholder="Search products by title or category..."
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-300 font-sans"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-xs text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading products...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-center py-6 text-xs text-gray-400 italic">No matching products found.</p>
                  ) : (
                    filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => insertProductLink(product)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/60 transition-colors flex items-center gap-3 text-xs text-gray-700"
                        type="button"
                      >
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-9 h-9 rounded-md object-cover flex-shrink-0 border border-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">{product.title}</p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {(product.categories || []).join(', ') || 'Uncategorised'}
                            <span className="mx-1">·</span>
                            <span className="font-mono text-emerald-600">{getProductUrl(product)}</span>
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { setShowProductLinkModal(false); setProductLinkSearchQuery(''); }}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    );
  };

  return (
    <AdminLayout title="Blog Management" noHeader={true}>
      <BlogSecondaryNav activeTab={activeSubTab} onTabChange={setActiveSubTab} />
      <div className="flex-1 flex flex-col overflow-hidden ml-24">
        <div className="p-5 space-y-4">
        {message && (
          <div
            className={`p-3 rounded-lg border text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <FileText className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Blog Admin</h2>
            <p className="text-sm font-medium text-gray-600 mt-1">
              Total posts: {posts.length} | Published: {publishedCount} | Drafts: {posts.length - publishedCount}
            </p>
          </div>
        </div>

        <div className={activeSubTab === 'posts' ? 'flex flex-col gap-6' : 'hidden'}>
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <span>{editingId ? 'Edit Blog Post' : 'Create New Blog Post'}</span>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
                  type="button"
                >
                  Cancel Edit & Create New
                </button>
              )}
            </h3>
            {renderEditor()}
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Edit Existing Blog Post</h3>
            
            {posts.length > 0 && (
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blog posts..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            )}

            {loading ? (
              <div className="text-sm text-gray-500">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-sm text-gray-500">No posts found yet.</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-sm text-gray-500 italic">No posts match your search query.</div>
            ) : (
              <>
                <div className="space-y-2">
                  {paginatedEditPosts.map((post) => (
                    <div key={`edit-row-${post.id}`} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                            {post.cover_image ? (
                              <img
                                src={post.cover_image}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-pink-50 text-pink-400">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                            <p className="text-xs text-gray-500 truncate">/{post.slug}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => startEdit(post)}
                          type="button"
                          className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination currentPage={editPage} totalPages={editTotalPages} onPageChange={setEditPage} />
              </>
            )}
          </div>
        </div>

        <div className={activeSubTab === 'list' ? 'bg-white p-4 rounded-lg border border-gray-200 shadow-sm' : 'hidden'}>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">All Blog Posts</h3>
          
          {posts.length > 0 && (
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blog posts..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          )}

          {loading ? (
            <div className="text-sm text-gray-500">Loading blog posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-sm text-gray-500">No posts yet. Create your first blog post above.</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No posts match your search query.</div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedListPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex gap-4 min-w-0 flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0">
                        {post.cover_image ? (
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-pink-50 text-pink-400">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 truncate">{post.title}</p>
                        <p className="text-xs text-gray-500 truncate">/{post.slug}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{post.excerpt || 'No excerpt provided.'}</p>
                        <span
                          className={`inline-flex mt-2 px-2 py-0.5 rounded text-xs ${
                            post.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/blog/${post.slug}`}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </Link>
                      <button
                        onClick={() => startEdit(post)}
                        className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs inline-flex items-center gap-1"
                        type="button"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => void removePost(post.id)}
                        className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs inline-flex items-center gap-1"
                        type="button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination currentPage={listPage} totalPages={listTotalPages} onPageChange={setListPage} />
            </>
          )}
        </div>

        <div className={activeSubTab === 'keyphrases' ? 'bg-white p-6 rounded-lg border border-gray-200 shadow-sm font-sans' : 'hidden'}>
          <div className="space-y-6">
            {/* Header & Description */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-4 gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-pink-600" />
                  Focus Keyphrases Directory
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage focus keyphrases across all blogs to prevent keyword cannibalization and improve SEO ranking structure.
                </p>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Unique Keyphrases</p>
                  <p className="text-xl font-bold text-gray-800 mt-0.5">{keyphraseMetrics.totalUnique}</p>
                </div>
              </div>

              <div className={`p-4 border rounded-xl flex items-center gap-3 ${
                keyphraseMetrics.cannibalized > 0 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}>
                <div className={`p-2 rounded-lg ${
                  keyphraseMetrics.cannibalized > 0 ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Cannibalized Terms</p>
                  <p className="text-xl font-bold mt-0.5">{keyphraseMetrics.cannibalized}</p>
                </div>
              </div>

              <div className={`p-4 border rounded-xl flex items-center gap-3 ${
                keyphraseMetrics.missing > 0 
                  ? 'bg-amber-50 border-amber-200 text-amber-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-800'
              }`}>
                <div className={`p-2 rounded-lg ${
                  keyphraseMetrics.missing > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-50 text-green-600'
                }`}>
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Missing Keyphrase</p>
                  <p className="text-xl font-bold mt-0.5">{keyphraseMetrics.missing}</p>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={keyphraseSearchQuery}
                onChange={(e) => setKeyphraseSearchQuery(e.target.value)}
                placeholder="Search by keyphrase or blog title..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 font-sans"
              />
            </div>

            {/* Keyphrases Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">Focus Keyphrase</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider w-32">SEO Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider">Used In Blog Posts</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredKeyphrases.map((item, idx) => {
                    const isCannibalized = item.posts.length > 1;
                    return (
                      <tr key={`kp-row-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800 align-top">
                          <span className="inline-flex items-center gap-1.5 font-sans">
                            <Key className="w-3.5 h-3.5 text-gray-400" />
                            {item.keyphrase}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {isCannibalized ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 border border-red-200 text-red-600">
                              <AlertTriangle className="w-3 h-3" /> Duplicate
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 border border-green-200 text-green-600">
                              <CheckCircle className="w-3 h-3" /> Unique
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 space-y-2.5">
                          {item.posts.map((post) => (
                            <div key={post.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-md p-2 bg-gray-50/35 hover:bg-gray-50 transition-all">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate font-sans text-xs">{post.title}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                                  <span className="font-mono">/{post.slug}</span>
                                  <span>•</span>
                                  <span className={`px-1 rounded ${
                                    post.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {post.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => startEdit(post)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Post"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <Link
                                  to={`/blog/${post.slug}`}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title="View Public Post"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredKeyphrases.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
                        No focus keyphrases match your search or exist in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Section: Missing Keyphrases */}
            {keyphrasesData.noKeyphrase.length > 0 && (
              <div className="border border-amber-200 rounded-xl bg-amber-50/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider">Posts Missing Focus Keyphrases ({keyphrasesData.noKeyphrase.length})</h4>
                </div>
                <p className="text-[11px] text-amber-700/80 leading-normal">
                  These posts do not have a focus keyphrase set (no tags). Set a keyphrase on each post to perform Yoast SEO analysis and optimize search discoverability.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {keyphrasesData.noKeyphrase.map((post) => (
                    <div key={`missing-kp-${post.id}`} className="bg-white border border-amber-100 rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-sm hover:border-amber-200 transition-colors">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{post.title}</p>
                        <p className="text-[10px] text-gray-400 truncate">/{post.slug}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEdit(post)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogAdmin;
