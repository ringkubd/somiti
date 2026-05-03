import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Globe } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface SeoSetting {
    id: number;
    page_name: string;
    title: string;
    meta_description: string;
}

interface Props {
    settings: SeoSetting[];
}

export default function SeoIndex({ settings }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'SEO Settings', href: '#' }
    ];

    const { delete: destroy } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SEO Management" />
            
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">SEO Management</h1>
                        <p className="text-gray-500 mt-2">Control meta tags and titles for all public pages</p>
                    </div>
                    <Link href="/admin/seo/create">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4" /> Add Page SEO
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {settings.map((s) => (
                        <Card key={s.id} className="overflow-hidden border-t-4 border-t-indigo-500">
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 bg-indigo-50 rounded-lg">
                                        <Globe className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Link href={`/admin/seo/${s.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-red-500"
                                            onClick={() => { if(confirm('Delete SEO settings?')) destroy(`/admin/seo/${s.id}`) }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg uppercase tracking-tight">{s.page_name}</h3>
                                    <p className="text-sm font-medium text-slate-900 mt-1">{s.title}</p>
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.meta_description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {settings.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400 italic">
                            No SEO settings defined yet.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
