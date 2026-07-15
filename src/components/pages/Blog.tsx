import React, { useState, useEffect } from 'react';
import { Clock, User, ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SEO } from '../SEO';

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

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple routing for SPA based on Hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/blog/')) {
        const slug = hash.replace('#/blog/', '');
        fetchPost(slug);
      } else {
        setSelectedPost(null);
        fetchPosts();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blog/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPost = async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/posts/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data.post);
      } else {
        setSelectedPost(null);
        window.location.hash = '#/blog';
      }
    } catch (e) {
      console.error(e);
      window.location.hash = '#/blog';
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
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
        
        <button 
          onClick={() => window.location.hash = '#/blog'}
          className="flex items-center gap-2 text-base font-medium hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all posts
        </button>

        <article className="bg-bg-card rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img 
              src={selectedPost.image} 
              alt={selectedPost.title} 
              title={selectedPost.title}
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>
          
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-base font-medium tracking-wide uppercase">
                {selectedPost.category}
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Clock className="w-4 h-4" />
                {new Date(selectedPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            <h1 className="text-xl md:text-xl font-semibold text-slate-900 dark:text-white mb-6 leading-tight">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-3 mb-10 pb-10 border-b border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {selectedPost.author}
              </span>
            </div>

            <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-blue-400 prose-img:rounded-2xl">
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
        <h1 className="text-2xl md:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
          Civil Estimation Pro Blog
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Insights, updates, and tutorials from the team building the future of construction software.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            No posts found. Add some markdown files to the content/blog directory.
          </div>
        ) : (
          posts.map(post => (
            <article 
              key={post.slug} 
              onClick={() => window.location.hash = `#/blog/${post.slug}`}
              className="bg-bg-card rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-48 overflow-hidden relative">
                 <img src={post.image} alt={post.title} title={post.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                 <div className="absolute top-4 left-4">
                   <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-base font-medium text-slate-900 dark:text-white shadow-sm">
                     {post.category}
                   </span>
                 </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
