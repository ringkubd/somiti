import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, BookOpen, ExternalLink } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Page {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
}

interface Props {
    pages: {
        data: Page[];
    };
}

export default function PageIndex({ pages }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Custom Pages', href: '#' }
    ];

    const { delete: destroy } = useForm();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Custom Pages" />
            
            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Custom Pages</h1>
                            <p className="text-slate-500 mt-1">Manage legal, info, and custom landing pages</p>
                        </div>
                    </div>
                    <Link href="/admin/pages/create">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" /> Create Page
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {pages.data.map((page) => (
                        <Card key={page.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-slate-900">{page.title}</h3>
                                        <Badge variant={page.is_published ? 'default' : 'secondary'}>
                                            {page.is_published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400">/{page.slug}</span>
                                        <ExternalLink className="h-3 w-3 text-slate-300" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/admin/pages/${page.id}/edit`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-red-500"
                                        onClick={() => { if(confirm('Delete page?')) destroy(`/admin/pages/${page.id}`) }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {pages.data.length === 0 && (
                        <div className="py-20 text-center text-slate-400 italic">
                            No custom pages yet.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
