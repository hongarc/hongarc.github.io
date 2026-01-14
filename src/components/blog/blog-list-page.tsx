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
    <article className="bg-ctp-base group border-ctp-surface1 hover:border-ctp-surface2 relative cursor-pointer overflow-hidden rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md">
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
              className="bg-ctp-pink\/10 text-ctp-pink hover:bg-ctp-pink\/20 relative z-20 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Tag className="h-3 w-3" />
              {tag}
            </Link>
          ))}
          {post.tags.length > 3 && (
            <span className="bg-ctp-surface1 text-ctp-subtext0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h2 className="text-ctp-text group-hover:text-ctp-blue mb-2 text-xl font-semibold transition-colors">
        {post.title}
      </h2>

      {/* Description */}
      <p className="text-ctp-subtext1 mb-4 line-clamp-2 text-sm leading-relaxed">
        {post.description}
      </p>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-ctp-subtext0 mb-4 line-clamp-3 text-sm">{post.excerpt}</p>
      )}

      {/* Meta */}
      <div className="text-ctp-overlay1 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <Calendar className="text-ctp-sapphire h-3.5 w-3.5" />
          {formatDate(post.publishedAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="text-ctp-teal h-3.5 w-3.5" />
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
        <h1 className="text-ctp-text mb-2 text-3xl font-bold tracking-tight">
          {tagName ? (
            <>
              Posts tagged <span className="text-ctp-pink">#{tagName}</span>
            </>
          ) : (
            'Blog'
          )}
        </h1>
        <p className="text-ctp-subtext0">
          {tagName
            ? `${String(posts.length)} post${posts.length === 1 ? '' : 's'} with this tag`
            : 'Technical articles, tutorials, and updates'}
        </p>

        {tagName && (
          <Link
            to="/blog"
            className="text-ctp-blue hover:text-ctp-sapphire mt-3 inline-flex items-center gap-1 text-sm font-medium"
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
          className="bg-ctp-base text-ctp-text placeholder-ctp-overlay0 border-ctp-surface1 focus:border-ctp-blue focus:ring-ctp-blue\/10 w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all focus:ring-4 focus:outline-none sm:max-w-xs"
        />

        {/* Tag filter chips */}
        {!tagName && allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 5).map((tag) => (
              <Link
                key={tag}
                to={`/blog/tag/${tag}`}
                className="bg-ctp-surface0 text-ctp-subtext0 border-ctp-surface1 hover:border-ctp-pink hover:bg-ctp-pink\/10 hover:text-ctp-pink rounded-full border px-3 py-1 text-xs font-medium transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="bg-ctp-mantle border-ctp-surface1 rounded-2xl border border-dashed p-12 text-center">
          <p className="text-ctp-subtext0">
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
