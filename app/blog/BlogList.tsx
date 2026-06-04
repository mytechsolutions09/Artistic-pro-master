'use client';

import React, { useState, useMemo } from 'react';
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

  return (
    <div className="space-y-6">
      {/* Search and Filters Controls */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, tags..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
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
                ? 'border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100'
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filter Tags</span>
            {selectedTag !== 'All' && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-pink-600 text-white rounded-full">
                1
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-4 w-4 text-gray-500 ml-1" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
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
          <span className="text-gray-500">Active tag:</span>
          <span className="px-2.5 py-1 bg-pink-50 text-pink-700 font-medium rounded-full inline-flex items-center gap-1.5 border border-pink-200">
            <Tag className="h-3 w-3" />
            #{selectedTag}
            <button
              onClick={() => setSelectedTag('All')}
              className="hover:text-pink-900 rounded-full focus:outline-none"
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
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[80vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="h-4 w-4 text-pink-600" />
                Filter by Tags
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tags Grid / Scroll Area */}
            <div className="overflow-y-auto pr-1 flex-1 py-1 max-h-[40vh] scrollbar-thin">
              {allTags.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No tags found on published articles.</p>
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
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
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
                          ? 'bg-pink-600 border-pink-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTag('All');
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Clear Filter
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Rendering */}
      {filteredAndSortedPosts.length === 0 ? (
        <section className="rounded-lg border border-dashed border-gray-300 p-8 text-center bg-white">
          <p className="text-sm text-gray-500">
            No published blog posts match your search or filters.
          </p>
          {(searchQuery || selectedTag !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
              }}
              className="mt-3 px-4 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-medium hover:bg-pink-700"
            >
              Reset filters
            </button>
          )}
        </section>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2" aria-label="Published blog posts">
          {filteredAndSortedPosts.map((post) => (
            <article key={post.id} className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="overflow-hidden rounded-lg">
                  <img
                    key={`${post.id}-${post.updated_at}`}
                    src={blogCoverSrcWithBust(post.cover_image, post.updated_at)}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-lg border border-gray-100 group-hover:scale-102 transition-transform duration-200"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900 leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-pink-700">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {post.excerpt || 'Read the latest article from Lurevi blog.'}
                </p>
                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-pink-50 rounded-full text-[10px] font-semibold text-pink-700">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-IN')}
                </span>
                <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-pink-600 hover:text-pink-700">
                  Read article →
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
