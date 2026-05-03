import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Page {
    title: string;
    content: string;
    seo_title: string | null;
    seo_meta_description: string | null;
    seo_keywords: string | null;
}

interface Props {
    page: Page;
}

export default function PublicPage({ page }: Props) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Head title={page.seo_title || page.title}>
                {page.seo_meta_description && <meta name="description" content={page.seo_meta_description} />}
                {page.seo_keywords && <meta name="keywords" content={page.seo_keywords} />}
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
                <article className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 leading-tight">
                        {page.title}
                    </h1>
                    
                    <div 
                        className="prose prose-slate prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </article>
            </main>

            <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800">
                <p>&copy; {new Date().getFullYear()} Somiti Manager. All rights reserved.</p>
            </footer>

            <style>{`
                .prose h1, .prose h2, .prose h3 { color: #0f172a; font-weight: 800; margin-top: 2em; margin-bottom: 1em; }
                .prose p { margin-bottom: 1.5em; line-height: 1.8; color: #334155; }
                .prose ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.5em; }
                .prose blockquote { border-left: 4px solid #3b82f6; padding-left: 1.5em; font-style: italic; color: #475569; margin: 2em 0; }
            `}</style>
        </div>
    );
}
