import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, BookText, Eye } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Post {
    id: number;
    title: string;
    slug: string;
    category: { name: string };
    user: { name: string };
    is_published: boolean;
    created_at: string;
}

interface Props {
    posts: {
        data: Post[];
    };
}

export default function BlogIndex({ posts }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Blog Management', href: '#' }
    ];

    const { delete: destroy } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blog Management" />
            
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-100 text-white">
                            <BookText className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
                            <p className="text-slate-500 mt-1">Publish articles, updates, and news</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/blog-categories">
                            <Button variant="outline">Manage Categories</Button>
                        </Link>
                        <Link href="/admin/blog-posts/create">
                            <Button className="bg-rose-600 hover:bg-rose-700">
                                <Plus className="h-4 w-4 mr-2" /> New Post
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {posts.data.map((post) => (
                        <Card key={post.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <CardContent className="p-0 flex items-center">
                                <div className="flex-1 p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100">
                                            {post.category.name}
                                        </Badge>
                                        <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                                    <p className="text-xs text-slate-400 mt-1">By {post.user.name}</p>
                                </div>
                                <div className="px-6 flex gap-2">
                                    <Badge variant={post.is_published ? 'default' : 'secondary'}>
                                        {post.is_published ? 'Published' : 'Draft'}
                                    </Badge>
                                    <Link href={`/admin/blog-posts/${post.id}/edit`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-500"
                                        onClick={() => { if(confirm('Delete post?')) destroy(`/admin/blog-posts/${post.id}`) }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {posts.data.length === 0 && (
                        <div className="py-20 text-center text-slate-400 italic">
                            No blog posts yet. Start by creating one!
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
