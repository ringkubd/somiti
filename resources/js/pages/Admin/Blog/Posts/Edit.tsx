import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, ArrowLeft, BookText, Image as ImageIcon } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Post {
    id: number;
    title: string;
    category_id: number;
    content: string;
    featured_image_url: string | null;
    is_published: boolean;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    post: Post;
    categories: Category[];
}

export default function PostEdit({ post, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Blog', href: '/admin/blog-posts' },
        { title: 'Edit Post', href: '#' }
    ];

    const { data, setData, patch, processing, errors } = useForm({
        title: post.title,
        category_id: post.category_id.toString(),
        content: post.content,
        featured_image_url: post.featured_image_url || '',
        is_published: post.is_published,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/blog-posts/${post.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Post: ${post.title}`} />
            
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/blog-posts">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-xl shadow-slate-200/50">
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Post Title</Label>
                                        <Input 
                                            id="title"
                                            value={data.title} 
                                            onChange={e => setData('title', e.target.value)}
                                            className="text-lg font-bold"
                                        />
                                        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="content">Post Content</Label>
                                        <Textarea 
                                            id="content"
                                            value={data.content} 
                                            onChange={e => setData('content', e.target.value)}
                                            rows={15}
                                        />
                                        {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-none shadow-xl shadow-slate-200/50">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Publishing</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select 
                                            value={data.category_id} 
                                            onValueChange={v => setData('category_id', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Published</Label>
                                        <Switch 
                                            checked={data.is_published} 
                                            onCheckedChange={v => setData('is_published', v)} 
                                        />
                                    </div>

                                    <Button className="w-full bg-rose-600 hover:bg-rose-700 font-bold" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" /> Update Post
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl shadow-slate-200/50">
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Featured Image</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Image URL</Label>
                                        <Input 
                                            value={data.featured_image_url} 
                                            onChange={e => setData('featured_image_url', e.target.value)}
                                        />
                                    </div>
                                    <div className="aspect-video bg-slate-50 rounded-lg border border-dashed flex items-center justify-center overflow-hidden">
                                        {data.featured_image_url ? (
                                            <img src={data.featured_image_url} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-slate-300" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
