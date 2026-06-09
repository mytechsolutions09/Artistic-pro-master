'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, ArrowUpDown, Filter, X, SlidersHorizontal, Tag } from 'lucide-react';
import { blogCoverSrcWithBust } from '@/lib/blogCover';

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
  tags: string[] | null;
};

interface BlogListProps {
  posts: BlogListItem[];
}

export default function BlogList({ posts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const POSTS_PER_PAGE = 6;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag, sortBy]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          if (tag) tagsSet.add(tag.trim());
        });
      }
    });
    return Array.from(tagsSet);
  }, [posts]);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Apply tag filter
    if (selectedTag !== 'All') {
      result = result.filter(
        (post) =>
          Array.isArray(post.tags) &&
          post.tags.some((t) => t && t.trim().toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
          (Array.isArray(post.tags) && post.tags.some((t) => t && t.toLowerCase().includes(query)))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [posts, selectedTag, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredAndSortedPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const popularPosts = useMemo(() => {
    // Simple heuristic for popular posts: pick oldest classic posts or top 4
    return [...posts].sort((a, b) => new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime()).slice(0, 4);
  }, [posts]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content (Left) */}
      <div className="flex-1 space-y-6 lg:max-w-[68%]">
      {/* Search and Filters Controls */}
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, tags..."
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-300"
          />
        </div>

        {/* Action Buttons: Filter Modal Trigger & Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tags Filter Trigger */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all ${
              selectedTag !== 'All'
                ? 'border-stone-300 bg-stone-100 text-stone-900'
                : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-700'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter Tags</span>
            {selectedTag !== 'All' && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-stone-900 text-white rounded-full">
                1
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 h-4 w-4 text-stone-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-stone-300 cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {selectedTag !== 'All' && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500">Active tag:</span>
          <span className="px-2.5 py-1 bg-stone-100 text-stone-800 font-medium rounded-full inline-flex items-center gap-1.5 border border-stone-200">
            <Tag className="h-3 w-3" />
            #{selectedTag}
            <button
              onClick={() => setSelectedTag('All')}
              className="hover:text-stone-900 rounded-full focus:outline-none"
              title="Remove filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* Tags Filter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs" 
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[80vh] border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                <Filter className="h-4 w-4 text-stone-900" />
                Filter by Tags
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-stone-100 rounded-full text-stone-500 hover:text-stone-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tags Grid / Scroll Area */}
            <div className="overflow-y-auto pr-1 flex-1 py-1 max-h-[40vh] scrollbar-thin">
              {allTags.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-4">No tags found on published articles.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTag('All');
                      setIsModalOpen(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selectedTag === 'All'
                        ? 'bg-pink-600 border-pink-600 text-white'
                        : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    All Tags
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsModalOpen(false);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedTag === tag
                          ? 'bg-stone-900 border-stone-900 text-white'
                          : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-stone-100 pt-4 mt-4 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTag('All');
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-medium text-stone-500 hover:text-stone-700"
              >
                Clear Filter
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Rendering */}
      {paginatedPosts.length === 0 ? (
        <section className="rounded-lg border border-dashed border-stone-300 p-8 text-center bg-white">
          <p className="text-sm text-stone-500">
            No published blog posts match your search or filters.
          </p>
          {(searchQuery || selectedTag !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
              }}
              className="mt-3 px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800"
            >
              Reset filters
            </button>
          )}
        </section>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2" aria-label="Published blog posts">
          {paginatedPosts.map((post) => (
            <article key={post.id} className="group rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="overflow-hidden rounded-lg">
                  <img
                    key={`${post.id}-${post.updated_at}`}
                    src={blogCoverSrcWithBust(post.cover_image, post.updated_at)}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg border border-stone-100 group-hover:scale-102 transition-transform duration-200"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-stone-900 leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-stone-700">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-stone-600 line-clamp-3">
                  {post.excerpt || 'Read the latest article from Lurevi blog.'}
                </p>
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-stone-100 rounded-full text-[10px] font-semibold text-stone-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-IN')}
                </span>
                <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-stone-900 hover:underline">
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-stone-100">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-semibold border border-stone-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 text-stone-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-stone-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-semibold border border-stone-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50 text-stone-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
      </div>

      {/* Sidebar (Right) */}
      <div className="w-full lg:w-[32%] space-y-8">
        {/* Popular Posts */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-5 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-stone-900 rounded-full"></span>
            Popular Articles
          </h3>
          <div className="space-y-5">
            {popularPosts.map(post => (
              <div key={post.id} className="flex gap-4 group">
                <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl border border-stone-100">
                  <img 
                    src={blogCoverSrcWithBust(post.cover_image, post.updated_at)} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <Link href={`/blog/${post.slug}`} className="text-sm font-bold text-stone-800 leading-snug group-hover:text-stone-600 line-clamp-2 transition-colors">
                    {post.title}
                  </Link>
                  <span className="text-xs font-medium text-stone-400 mt-1.5 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Discover Topics Widget */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6">
           <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
             <Tag className="h-4 w-4 text-stone-500" />
             Discover Topics
           </h3>
           <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 10).map(tag => (
                <button 
                  key={tag} 
                  onClick={() => {
                    setSelectedTag(tag);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="px-3.5 py-1.5 bg-white text-stone-700 text-xs font-bold rounded-full border border-stone-200 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors shadow-sm"
                >
                  #{tag}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
