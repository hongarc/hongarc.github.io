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
        <div className="bg-ctp-surface0 h-4 w-3/4 rounded" />
        <div className="bg-ctp-surface0 h-4 w-full rounded" />
        <div className="bg-ctp-surface0 h-4 w-5/6 rounded" />
      </div>
    );
  }

  return (
    <div
      className="prose text-ctp-text prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:text-ctp-text prose-h1:text-2xl prose-h2:text-xl prose-h2:text-ctp-mauve prose-h3:text-lg prose-h3:text-ctp-sapphire prose-p:text-ctp-subtext0 prose-strong:text-ctp-text prose-a:text-ctp-blue prose-a:no-underline hover:prose-a:underline hover:prose-a:text-ctp-sapphire prose-code:text-ctp-pink prose-code:bg-ctp-surface0 prose-code:rounded prose-code:px-1 prose-pre:bg-ctp-mantle prose-pre:text-ctp-text prose-pre:text-sm prose-li:text-ctp-subtext0 prose-li:marker:text-ctp-overlay0 prose-blockquote:text-ctp-subtext1 prose-blockquote:border-ctp-lavender prose-hr:border-ctp-surface0 max-w-none"
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
      <h1 className="text-ctp-text mb-4 text-3xl font-bold">Post Not Found</h1>
      <p className="text-ctp-subtext0 mb-6">
        The post &ldquo;{slug}&rdquo; doesn&apos;t exist or may have been removed.
      </p>
      <Link
        to="/blog"
        className="bg-ctp-blue/20 text-ctp-blue hover:bg-ctp-blue\/30 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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
    <div className="text-ctp-subtext0 flex flex-wrap items-center gap-4 text-sm">
      <span className="flex items-center gap-1.5">
        <Calendar className="text-ctp-sapphire h-4 w-4" />
        {formatDate(post.publishedAt)}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="text-ctp-teal h-4 w-4" />
        {formatReadingTime(post.readingTime)}
      </span>
      {post.author && (
        <span className="flex items-center gap-1.5">
          <User className="text-ctp-lavender h-4 w-4" />
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
        className="text-ctp-subtext0 hover:text-ctp-blue mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      {/* Header */}
      <header className="border-ctp-surface1 mb-8 border-b pb-8">
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog/tag/${tag}`}
                className="bg-ctp-pink\/10 text-ctp-pink hover:bg-ctp-pink\/20 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-ctp-text mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          {post.title}
        </h1>

        {/* Description */}
        <p className="text-ctp-subtext0 mb-4 text-lg">{post.description}</p>

        {/* Meta */}
        <PostMeta post={post} />
      </header>

      {/* Content */}
      <PostContent content={post.content} />

      {/* Footer */}
      <footer className="border-ctp-surface1 mt-12 border-t pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/blog"
            className="bg-ctp-surface0 hover:bg-ctp-surface1 border-ctp-surface1 text-ctp-text inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Posts
          </Link>

          {post.updatedAt && (
            <span className="text-ctp-subtext0 text-sm">
              Last updated: {formatDate(post.updatedAt)}
            </span>
          )}
        </div>
      </footer>
    </article>
  );
}
