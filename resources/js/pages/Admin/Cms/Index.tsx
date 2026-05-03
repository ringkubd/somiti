import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Layout, Type, Image as ImageIcon, Code } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface PageContent {
    id: number;
    section_key: string;
    content: string | null;
    type: string;
}

interface Props {
    contents: PageContent[];
}

export default function CmsIndex({ contents }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Website CMS', href: '#' }
    ];

    // Initialize form with existing contents or defaults
    const { data, setData, post, processing } = useForm({
        contents: [
            { section_key: 'hero_title', content: contents.find(c => c.section_key === 'hero_title')?.content || 'Empower Your Cooperative Society' },
            { section_key: 'hero_subtitle', content: contents.find(c => c.section_key === 'hero_subtitle')?.content || 'The ultimate SaaS platform to manage members, deposits, loans, and investments.' },
            { section_key: 'cta_primary', content: contents.find(c => c.section_key === 'cta_primary')?.content || 'Start Your Society Free' },
            { section_key: 'feature_1_title', content: contents.find(c => c.section_key === 'feature_1_title')?.content || 'Member Management' },
            { section_key: 'feature_1_desc', content: contents.find(c => c.section_key === 'feature_1_desc')?.content || 'Easily onboard members and assign roles with transparent profile tracking.' },
        ]
    });

    const updateContent = (key: string, value: string) => {
        const newContents = [...data.contents];
        const index = newContents.findIndex(c => c.section_key === key);
        if (index > -1) {
            newContents[index].content = value;
            setData('contents', newContents);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/cms');
    };

    const getField = (key: string) => data.contents.find(c => c.section_key === key)?.content || '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website CMS" />
            
            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                            <Layout className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Website CMS</h1>
                            <p className="text-slate-500 mt-1">Update landing page content in real-time</p>
                        </div>
                    </div>
                    <Button 
                        onClick={submit} 
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 px-6"
                    >
                        <Save className="h-4 w-4" /> Publish Changes
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Hero Section CMS */}
                    <Card className="border-none shadow-xl shadow-slate-200/50">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Type className="h-5 w-5 text-indigo-500" />
                                Hero Section
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Hero Title (H1)</Label>
                                <Input 
                                    value={getField('hero_title')} 
                                    onChange={e => updateContent('hero_title', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hero Subtitle</Label>
                                <Textarea 
                                    value={getField('hero_subtitle')} 
                                    onChange={e => updateContent('hero_subtitle', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Primary CTA Button</Label>
                                <Input 
                                    value={getField('cta_primary')} 
                                    onChange={e => updateContent('cta_primary', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features CMS */}
                    <Card className="border-none shadow-xl shadow-slate-200/50">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Code className="h-5 w-5 text-emerald-500" />
                                Feature Highlights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Feature 1</h3>
                                    <div className="space-y-2">
                                        <Label>Title</Label>
                                        <Input 
                                            value={getField('feature_1_title')} 
                                            onChange={e => updateContent('feature_1_title', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea 
                                            value={getField('feature_1_desc')} 
                                            onChange={e => updateContent('feature_1_desc', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-center border rounded-xl bg-white text-slate-300 italic text-sm">
                                    Feature Preview Placeholder
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
