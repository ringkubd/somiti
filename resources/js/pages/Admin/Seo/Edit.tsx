import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft, Globe } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface SeoSetting {
    id: number;
    page_name: string;
    title: string;
    meta_description: string | null;
    meta_keywords: string | null;
    og_image_url: string | null;
}

interface Props {
    setting: SeoSetting;
}

export default function SeoEdit({ setting }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'SEO Settings', href: '/admin/seo' },
        { title: 'Edit SEO', href: '#' }
    ];

    const { data, setData, patch, processing, errors } = useForm({
        page_name: setting.page_name,
        title: setting.title,
        meta_description: setting.meta_description || '',
        meta_keywords: setting.meta_keywords || '',
        og_image_url: setting.og_image_url || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/seo/${setting.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit SEO: ${setting.page_name}`} />
            
            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/seo">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Edit SEO Settings</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe className="h-5 w-5 text-indigo-500" />
                                Update Meta Info
                            </CardTitle>
                            <CardDescription>Adjusting SEO for "{setting.page_name}"</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="page_name">Internal Page Name</Label>
                                <Input 
                                    id="page_name" 
                                    value={data.page_name} 
                                    onChange={e => setData('page_name', e.target.value)}
                                />
                                {errors.page_name && <p className="text-xs text-red-500">{errors.page_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Browser/SEO Title</Label>
                                <Input 
                                    id="title" 
                                    value={data.title} 
                                    onChange={e => setData('title', e.target.value)}
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea 
                                    id="meta_description" 
                                    value={data.meta_description} 
                                    onChange={e => setData('meta_description', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                                <Input 
                                    id="meta_keywords" 
                                    value={data.meta_keywords} 
                                    onChange={e => setData('meta_keywords', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button 
                            type="submit" 
                            size="lg" 
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 px-8 font-bold gap-2"
                        >
                            <Save className="h-5 w-5" />
                            Update Settings
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
