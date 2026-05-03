import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, BookText, Image as ImageIcon, Globe, Layout, Search } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import Editor from '@/components/editor';

interface Category {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
}

export default function PostCreate({ categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Blog', href: '/admin/blog-posts' },
        { title: 'New Post', href: '#' }
    ];

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: '',
        content: '',
        featured_image_url: '',
        is_published: true,
        seo_title: '',
        seo_meta_description: '',
        seo_keywords: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/blog-posts');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Blog Post" />
            
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/blog-posts">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Create Blog Post</h1>
                    </div>
                    <Button 
                        onClick={submit} 
                        className="bg-rose-600 hover:bg-rose-700 font-bold px-8 shadow-lg shadow-rose-100" 
                        disabled={processing}
                    >
                        <Save className="h-4 w-4 mr-2" /> Publish Post
                    </Button>
                </div>

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
                        <TabsTrigger value="content" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Layout className="h-4 w-4" /> Article Content
                        </TabsTrigger>
                        <TabsTrigger value="seo" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Search className="h-4 w-4" /> SEO Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border-none shadow-xl shadow-slate-200/50">
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Post Title</Label>
                                            <Input 
                                                id="title"
                                                value={data.title} 
                                                onChange={e => setData('title', e.target.value)}
                                                placeholder="The Future of Somiti Management"
                                                className="text-xl font-bold h-14"
                                            />
                                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Body Content</Label>
                                            <Editor 
                                                value={data.content} 
                                                onChange={v => setData('content', v)}
                                                placeholder="Write your article here..."
                                            />
                                            {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="border-none shadow-xl shadow-slate-200/50">
                                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Publishing Options</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select 
                                                value={data.category_id} 
                                                onValueChange={v => setData('category_id', v)}
                                            >
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="Select Topic" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(c => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="space-y-0.5">
                                                <Label className="text-xs font-bold">Visibility</Label>
                                                <p className="text-[10px] text-slate-500">Make post public</p>
                                            </div>
                                            <Switch 
                                                checked={data.is_published} 
                                                onCheckedChange={v => setData('is_published', v)} 
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                                    <CardHeader className="pb-3 border-b bg-slate-50/50">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Featured Image</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <Input 
                                            value={data.featured_image_url} 
                                            onChange={e => setData('featured_image_url', e.target.value)}
                                            placeholder="https://..."
                                        />
                                        <div className="aspect-video bg-slate-50 rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                            {data.featured_image_url ? (
                                                <img src={data.featured_image_url} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-slate-200" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="seo">
                        <Card className="border-none shadow-xl shadow-slate-200/50">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-rose-500" />
                                    Post SEO Settings
                                </CardTitle>
                                <CardDescription>Improve your article's visibility in search engines.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label>SEO Title</Label>
                                    <Input 
                                        value={data.seo_title} 
                                        onChange={e => setData('seo_title', e.target.value)}
                                        placeholder="Catchy title for search engines..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Meta Description</Label>
                                    <Textarea 
                                        value={data.seo_meta_description} 
                                        onChange={e => setData('seo_meta_description', e.target.value)}
                                        placeholder="Snippet shown in Google results..."
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SEO Keywords</Label>
                                    <Input 
                                        value={data.seo_keywords} 
                                        onChange={e => setData('seo_keywords', e.target.value)}
                                        placeholder="blog, news, somiti"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
