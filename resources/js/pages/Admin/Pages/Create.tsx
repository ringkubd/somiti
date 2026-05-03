import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft, BookOpen, Globe, Layout, Search } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import Editor from '@/components/editor';

export default function PageCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Pages', href: '/admin/pages' },
        { title: 'New Page', href: '#' }
    ];

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        is_published: true,
        seo_title: '',
        seo_meta_description: '',
        seo_keywords: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/pages');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Custom Page" />
            
            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/pages">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Create Custom Page</h1>
                    </div>
                    <Button 
                        onClick={submit} 
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8" 
                        disabled={processing}
                    >
                        <Save className="h-4 w-4 mr-2" /> Save Page
                    </Button>
                </div>

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
                        <TabsTrigger value="content" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Layout className="h-4 w-4" /> Page Content
                        </TabsTrigger>
                        <TabsTrigger value="seo" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Search className="h-4 w-4" /> SEO Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/50">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-slate-500">Page Title</Label>
                                    <Input 
                                        id="title"
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="e.g. Terms of Service"
                                        className="text-lg font-bold h-12"
                                    />
                                    {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Main Content</Label>
                                    <Editor 
                                        value={data.content}
                                        onChange={v => setData('content', v)}
                                        placeholder="Design your page content here..."
                                    />
                                    {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                                </div>

                                <div className="flex items-center justify-between border-t pt-6 bg-slate-50 -mx-6 px-6 -mb-6 rounded-b-xl py-4">
                                    <div className="space-y-0.5">
                                        <Label className="font-bold">Publish State</Label>
                                        <p className="text-xs text-slate-500">Make this page live on the website.</p>
                                    </div>
                                    <Switch 
                                        checked={data.is_published} 
                                        onCheckedChange={v => setData('is_published', v)} 
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="seo">
                        <Card className="border-none shadow-xl shadow-slate-200/50">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-indigo-500" />
                                    Search Engine Optimization
                                </CardTitle>
                                <CardDescription>Customize how this specific page appears in Google search results.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label>SEO Title</Label>
                                    <Input 
                                        value={data.seo_title} 
                                        onChange={e => setData('seo_title', e.target.value)}
                                        placeholder="Somiti Manager - Terms of Service"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Meta Description</Label>
                                    <Textarea 
                                        value={data.seo_meta_description} 
                                        onChange={e => setData('seo_meta_description', e.target.value)}
                                        placeholder="Brief summary for search engines..."
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Keywords</Label>
                                    <Input 
                                        value={data.seo_keywords} 
                                        onChange={e => setData('seo_keywords', e.target.value)}
                                        placeholder="legal, terms, policy"
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
