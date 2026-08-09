import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    featured_image_url: string | null;
    published_at: string | null;
    category?: { name: string } | null;
    user?: { name: string } | null;
}

interface Props {
    posts: {
        data: Post[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}

function excerpt(content: string, length = 160): string {
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > length ? `${text.slice(0, length)}…` : text;
}

export default function BlogIndex({ posts }: Props) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Head title="Blog">
                <meta name="description" content="News and updates from Somiti Manager" />
            </Head>

            <nav className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg" />
                            <span className="font-bold text-xl tracking-tight">Somiti Manager</span>
                        </div>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Blog</h1>
                <p className="text-slate-500 text-lg mb-12">News, updates, and guides from Somiti Manager.</p>

                {posts.data.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-12 text-center text-slate-400">
                        No posts published yet.
                    </div>
                )}

                <div className="space-y-6">
                    {posts.data.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="block">
                            <article className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden hover:shadow-2xl transition-shadow">
                                {post.featured_image_url && (
                                    <img src={post.featured_image_url} alt={post.title} className="w-full h-56 object-cover" />
                                )}
                                <div className="p-8">
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                        {post.category && (
                                            <span className="bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full">
                                                {post.category.name}
                                            </span>
                                        )}
                                        {post.user && (
                                            <span className="inline-flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" /> {post.user.name}
                                            </span>
                                        )}
                                        {post.published_at && (
                                            <span className="inline-flex items-center gap-1">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {new Date(post.published_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-slate-500 leading-relaxed">{excerpt(post.content)}</p>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {posts.last_page > 1 && (
                    <div className="flex items-center justify-between mt-10">
                        {posts.prev_page_url ? (
                            <Link href={posts.prev_page_url}>
                                <Button variant="outline" size="sm">← Newer</Button>
                            </Link>
                        ) : <span />}
                        <span className="text-sm text-slate-400">Page {posts.current_page} of {posts.last_page}</span>
                        {posts.next_page_url ? (
                            <Link href={posts.next_page_url}>
                                <Button variant="outline" size="sm">Older →</Button>
                            </Link>
                        ) : <span />}
                    </div>
                )}
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800">
                <p>&copy; {new Date().getFullYear()} Somiti Manager. All rights reserved.</p>
            </footer>
        </div>
    );
}
