'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, ExternalLink, Pencil, Trash2, Loader2, Save, Upload, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Link } from '@/src/compat/router';
import { BlogPost, BlogService, BlogStatus } from '../../services/blogService';
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

const BlogAdmin: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<BlogTabId>('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [seedingSeoPack, setSeedingSeoPack] = useState(false);
  const [aiKeyword, setAiKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  useEffect(() => {
    void loadPosts();
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
  };

  const submit = async () => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      showMessage('error', 'Title, slug, and content are required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: toSlug(form.slug),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      cover_image: form.cover_image.trim() || null,
      status: form.status,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
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
      
      const response = await fetch('/api/admin/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: aiKeyword.trim() })
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
    });
  }, [form.content, form.title, form.slug, form.seo_title, form.seo_description, form.focus_keyphrase, posts, editingId]);

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

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-100 rounded-lg">
              <FileText className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Blog Admin</h2>
              <p className="text-sm text-gray-500">
                Manage blog strategy and publishing workflow from this tab.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700">Create, edit, publish, and delete blog posts from one place.</p>
          <p className="text-xs text-gray-500 mt-2">
            Total posts: {posts.length} | Published: {publishedCount} | Drafts: {posts.length - publishedCount}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => void seedSeoBlogPack()}
              disabled={seedingSeoPack}
              type="button"
              className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {seedingSeoPack ? 'Applying SEO Blog Pack...' : 'Apply SEO Blog Pack (10 Posts)'}
            </button>
            <span className="text-xs text-gray-500 self-center">
              One click creates/updates keyword-targeted published blogs.
            </span>
          </div>
        </div>

        <div className={activeSubTab === 'posts' ? 'flex flex-col xl:flex-row gap-6' : 'hidden'}>
          {/* Main Blog Editor Form */}
          <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <h3 className="text-sm font-semibold text-gray-800">
                {editingId ? 'Edit Blog Post' : 'Create Blog Post'}
              </h3>
              
              {!editingId && (
                <div className="flex items-center gap-2 bg-pink-50 p-2 rounded-lg border border-pink-100">
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
                </div>
              )}
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
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Full blog content"
                rows={12}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono"
              />
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
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
                  onChange={(e) => setForm((prev) => ({ ...prev, focus_keyphrase: e.target.value }))}
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
                  {seoResults.map((result, idx) => (
                    <div key={`seo-check-${idx}`} className="flex items-start gap-2.5 text-xs">
                      <span className="mt-0.5 flex-shrink-0">
                        {result.status === 'good' && <CheckCircle className="w-4 h-4 text-green-500 fill-green-50" />}
                        {result.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-50" />}
                        {result.status === 'error' && <Info className="w-4 h-4 text-red-500 fill-red-50" />}
                      </span>
                      <div>
                        <span className="font-semibold text-gray-800 block">{result.name}</span>
                        <span className="text-gray-600 leading-normal">{result.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={activeSubTab === 'posts' ? 'bg-white p-4 rounded-lg border border-gray-200 shadow-sm' : 'hidden'}>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Edit Existing Blog Post</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-sm text-gray-500">No posts found yet.</div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div
                  key={`edit-row-${post.id}`}
                  className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg p-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500 truncate">/{post.slug}</p>
                  </div>
                  <button
                    onClick={() => startEdit(post)}
                    type="button"
                    className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs inline-flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={activeSubTab === 'list' ? 'bg-white p-4 rounded-lg border border-gray-200 shadow-sm' : 'hidden'}>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">All Blog Posts</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading blog posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-sm text-gray-500">No posts yet. Create your first blog post above.</div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-200 rounded-lg p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{post.title}</p>
                    <p className="text-xs text-gray-500">/{post.slug}</p>
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
          )}
        </div>

        <div className={activeSubTab === 'media' ? 'bg-white p-4 rounded-lg border border-gray-200 shadow-sm' : 'hidden'}>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Blog Media Library</h3>
          <label
            className={`w-full max-w-md flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg text-sm ${
              uploadingImage
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:border-pink-400 cursor-pointer'
            }`}
          >
            {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploadingImage ? 'Uploading image...' : 'Upload blog image from local'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={(e) => void onLocalImageSelect(e)}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Uploaded image will be saved in bucket `{BlogService.BLOG_IMAGES_BUCKET}` and auto-filled in cover URL.
          </p>
          {form.cover_image && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 break-all">{form.cover_image}</p>
              <img
                key={form.cover_image}
                src={form.cover_image}
                alt="Uploaded blog media"
                className="mt-2 w-full max-w-md h-44 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        <div className={activeSubTab === 'guide' ? 'bg-white p-4 rounded-lg border border-gray-200 shadow-sm' : 'hidden'}>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Blog Workflow Guide</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Open Posts tab and create a draft with title, slug, excerpt, and content.</li>
            <li>Use Media tab to upload a local image and reuse the generated cover URL.</li>
            <li>Set status to Published only when content is final.</li>
            <li>Add SEO title and description for better search visibility.</li>
            <li>Open public `/blog` to verify card, article page, and metadata.</li>
          </ul>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BlogAdmin;
