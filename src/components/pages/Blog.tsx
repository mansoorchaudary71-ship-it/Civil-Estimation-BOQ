import { Button } from '../ui/Button';
import React, { useState, useEffect, useMemo } from 'react';
import { Clock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SEO } from '../SEO';
import { getBasename, getEffectivePathname } from '../../lib/toolRoutes';


interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  category: string;
  image: string;
  content?: string;
}

// Blog posts are built from the local markdown files in content/blog/ at
// build time. There is no blog backend on this static site: the old
// GET /api/blog/posts fetch 404d on GitHub Pages (and the dev stub
// returned []), so the page was permanently empty even though the
// markdown files already existed.
const rawPosts = import.meta.glob('../../../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Minimal frontmatter parser (--- delimited `key: "value"` lines).
 * Returns null when the file has no parseable frontmatter at all.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) data[key] = value;
  }
  return { data, body: match[2] };
}

/** First real paragraph of the body, used only when no excerpt is given. Heading-only paragraphs are skipped so the excerpt is not just the title repeated. */
function excerptFromBody(body: string): string {
  const paragraph = body
    .split(/\r?\n\r?\n/)
    .map(p => p.replace(/[*_`>\[\]()]/g, '').trim())
    .find(p => p.length > 0 && !/^#{1,6}\s/.test(p));
  if (!paragraph) return '';
  return paragraph.length > 160 ? `${paragraph.slice(0, 157).trimEnd()}…` : paragraph;
}

function loadPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  for (const [path, raw] of Object.entries(rawPosts)) {
    const slug = path.split('/').pop()?.replace(/\.md$/, '') ?? '';
    const parsed = parseFrontmatter(raw);
    // Never invent metadata: a post without a parseable title or a valid
    // date is skipped instead of being listed with made-up values.
    if (!parsed || !parsed.data.title || !parsed.data.date || Number.isNaN(Date.parse(parsed.data.date))) {
      console.warn(`Blog: skipping ${slug || path} — missing or unparseable title/date in frontmatter.`);
      continue;
    }
    posts.push({
      slug,
      title: parsed.data.title,
      date: parsed.data.date,
      excerpt: parsed.data.excerpt || excerptFromBody(parsed.body),
      author: parsed.data.author || 'Civil Estimation Pro',
      category: parsed.data.category || 'Engineering',
      image: parsed.data.image || '',
      content: parsed.body,
    });
  }
  // Newest first.
  posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return posts;
}

export default function Blog() {
  const posts = useMemo(loadPosts, []);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Clean-URL routing (Step 4): a single post lives at /blog/<slug> and
  // the prerender serves the full post at that URL. The slug is read from
  // the pathname first (getEffectivePathname strips the project-page
  // basename); a legacy #/blog/<slug> hash deep link still resolves via
  // the same helper's hash fallback. Post links below are real <a> hrefs
  // to the clean URL, intercepted for SPA navigation on plain clicks.
  const openPost = (slug: string) => {
    navigate(`/blog/${slug}`);
  };
  const openListing = () => {
    navigate('/blog');
  };

  useEffect(() => {
    const resolve = () => {
      const path = getEffectivePathname();
      const match = path.match(/^\/blog\/([^/]+)\/?$/);
      const slug = match ? decodeURIComponent(match[1]) : null;
      if (slug) {
        const post = posts.find((p) => p.slug === slug);
        setSelectedPost(post ?? null);
      } else {
        setSelectedPost(null);
      }
      setLoading(false);
    };

    window.addEventListener('hashchange', resolve);
    resolve(); // Initial check

    return () => window.removeEventListener('hashchange', resolve);
  }, [posts, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-accent-800 animate-spin" />
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SEO
          title={`${selectedPost.title} | Civil Estimation Pro Blog`}
          description={selectedPost.excerpt}
        />

        <Button
          onClick={openListing}
          className="flex items-center gap-2 text-base font-medium hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all posts
        </Button>

        <article className="bg-bg-card rounded-2xl border border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm overflow-hidden">
          {selectedPost.image && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                title={selectedPost.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-400 px-3 py-1 rounded-full text-base font-medium tracking-wide uppercase">
                {selectedPost.category}
              </span>
              <div className="flex items-center gap-2 text-sm text-txt-tertiary font-medium">
                <Clock className="w-4 h-4" />
                {new Date(selectedPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <h1 className="text-xl md:text-xl font-semibold text-txt-primary dark:text-white mb-6 leading-tight">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-3 mb-10 pb-10 border-b border-ui-borderSubtle dark:border-ink-600">
              <div className="w-10 h-10 rounded-full bg-surface-active dark:bg-ink flex items-center justify-center">
                <User className="w-5 h-5 text-txt-tertiary" />
              </div>
              <span className="font-semibold text-txt-secondary dark:text-txt-tertiary">
                {selectedPost.author}
              </span>
            </div>

            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-accent-800 dark:prose-a:text-accent-400 prose-img:rounded-2xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedPost.content || ''}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO
        title="Blog | Civil Estimation Pro"
        description="Insights, updates, and engineering tutorials from our experts."
      />
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-xl font-semibold text-txt-primary dark:text-white tracking-tight">
          Civil Estimation Pro Blog
        </h1>
        <p className="text-lg text-txt-tertiary dark:text-txt-tertiary max-w-2xl mx-auto">
          Insights, updates, and tutorials from the team building the future of construction software.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-txt-tertiary">
            No posts published yet. Check back soon.
          </div>
        ) : (
          posts.map(post => (
            <a
              key={post.slug}
              href={`${getBasename()}/blog/${post.slug}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                openPost(post.slug);
              }}
              className="bg-bg-card rounded-2xl border border-ui-borderSubtle dark:border-ink-600 shadow-brand-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-brand-lg transition-all duration-300 hover:-translate-y-1"
            >
              {post.image && (
                <div className="h-48 overflow-hidden relative">
                   <img src={post.image} alt={post.title} title={post.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   <div className="absolute top-4 left-4">
                     <span className="bg-surface-default/90 dark:bg-ink/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-base font-medium text-txt-primary dark:text-white shadow-brand-sm">
                       {post.category}
                     </span>
                   </div>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-txt-primary dark:text-white mb-3 leading-tight group-hover:text-accent-800 dark:group-hover:text-accent-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-txt-tertiary text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-ui-borderSubtle dark:border-ink-600/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-txt-secondary dark:text-txt-tertiary">
                    <div className="w-6 h-6 rounded-full bg-surface-active dark:bg-ink flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-txt-tertiary font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
