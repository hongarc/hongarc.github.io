import { Calendar, Clock, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { blogRegistry, formatReadingTime } from '@/blog';
import type { BlogPost } from '@/blog/types';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface PostCardProps {
  post: BlogPost;
}

function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900 dark:hover:border-slate-600">
      <Link
        to={`/blog/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`Read ${post.title}`}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              to={`/blog/tag/${tag}`}
              className="relative z-20 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Tag className="h-3 w-3" />
              {tag}
            </Link>
          ))}
          {post.tags.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h2 className="mb-2 text-xl font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        {post.title}
      </h2>

      {/* Description */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {post.description}
      </p>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="mb-4 line-clamp-3 text-sm text-slate-500 dark:text-slate-500">
          {post.excerpt}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(post.publishedAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatReadingTime(post.readingTime)}
        </span>
      </div>
    </article>
  );
}

export function BlogListPage() {
  const { tagName } = useParams<{ tagName?: string }>();
  const [searchQuery, setSearchQuery] = useState('');

  const posts = useMemo(() => {
    let filteredPosts: BlogPost[];

    filteredPosts = tagName ? blogRegistry.getPublishedByTag(tagName) : blogRegistry.getPublished();

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filteredPosts;
  }, [tagName, searchQuery]);

  const allTags = useMemo(() => blogRegistry.getAllTags(), []);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {tagName ? (
            <>
              Posts tagged <span className="text-blue-600 dark:text-blue-400">#{tagName}</span>
            </>
          ) : (
            'Blog'
          )}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {tagName
            ? `${String(posts.length)} post${posts.length === 1 ? '' : 's'} with this tag`
            : 'Technical articles, tutorials, and updates'}
        </p>

        {tagName && (
          <Link
            to="/blog"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← View all posts
          </Link>
        )}
      </header>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:outline-none sm:max-w-xs dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500"
        />

        {/* Tag filter chips */}
        {!tagName && allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                to={`/blog/tag/${tag}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-slate-600 dark:text-slate-400">
            {searchQuery
              ? 'No posts match your search'
              : tagName
                ? 'No posts found with this tag'
                : 'No blog posts yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
