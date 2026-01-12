import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { blogRegistry, formatReadingTime, markdownProcessor } from '@/blog';
import type { BlogPost } from '@/blog/types';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface PostContentProps {
  content: string;
}

function PostContent({ content }: PostContentProps) {
  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderContent = async () => {
      try {
        const rendered = await markdownProcessor.renderToHtml(content);
        setHtml(rendered);
      } catch (error) {
        console.error('Failed to render markdown:', error);
        setHtml('<p>Failed to render content</p>');
      } finally {
        setIsLoading(false);
      }
    };

    void renderContent();
  }, [content]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  return (
    <div
      className="prose prose-slate dark:prose-invert prose-headings:scroll-mt-20 prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-slate-900 prose-pre:text-sm dark:prose-a:text-blue-400 max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface PostNotFoundProps {
  slug: string;
}

function PostNotFound({ slug }: PostNotFoundProps) {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Post Not Found</h1>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        The post &ldquo;{slug}&rdquo; doesn&apos;t exist or may have been removed.
      </p>
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>
    </div>
  );
}

interface PostMetaProps {
  post: BlogPost;
}

function PostMeta({ post }: PostMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
      <span className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4" />
        {formatDate(post.publishedAt)}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        {formatReadingTime(post.readingTime)}
      </span>
      {post.author && (
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {post.author}
        </span>
      )}
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const post = useMemo(() => {
    if (!slug) return null;
    return blogRegistry.get(slug);
  }, [slug]);

  // If post is a draft, redirect to blog list
  useEffect(() => {
    if (post?.isDraft) {
      void navigate('/blog', { replace: true });
    }
  }, [post, navigate]);

  if (!slug) {
    return <PostNotFound slug="unknown" />;
  }

  if (!post) {
    return <PostNotFound slug={slug} />;
  }

  if (post.isDraft) {
    return null;
  }

  return (
    <article className="mx-auto max-w-3xl">
      {/* Back navigation */}
      <Link
        to="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      {/* Header */}
      <header className="mb-8 border-b border-slate-200/80 pb-8 dark:border-slate-700/50">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog/tag/${tag}`}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
          {post.title}
        </h1>

        {/* Description */}
        <p className="mb-4 text-lg text-slate-600 dark:text-slate-400">{post.description}</p>

        {/* Meta */}
        <PostMeta post={post} />
      </header>

      {/* Content */}
      <PostContent content={post.content} />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200/80 pt-8 dark:border-slate-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            All Posts
          </Link>

          {post.updatedAt && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Last updated: {formatDate(post.updatedAt)}
            </span>
          )}
        </div>
      </footer>
    </article>
  );
}
