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
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';

export default function AdCreate() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Advertisements', href: '/admin/advertisements' },
        { title: 'New Ad', href: '#' }
    ];

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        image_url: '',
        link_url: '',
        position: 'dashboard_top',
        is_active: true,
        starts_at: '',
        ends_at: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/advertisements');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Advertisement" />
            
            <div className="max-w-3xl mx-auto py-12 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Advertisement</CardTitle>
                        <CardDescription>Setup a new banner or promotion for the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Ad Title</Label>
                                <Input 
                                    id="title" 
                                    value={data.title} 
                                    onChange={(e) => setData('title', e.target.value)} 
                                    placeholder="e.g. Upgrade to Pro Plan"
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Content / Description</Label>
                                <Textarea 
                                    id="content" 
                                    value={data.content} 
                                    onChange={(e) => setData('content', e.target.value)} 
                                    placeholder="Brief message for the advertisement..."
                                />
                                <InputError message={errors.content} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image_url">Image URL</Label>
                                    <Input 
                                        id="image_url" 
                                        value={data.image_url} 
                                        onChange={(e) => setData('image_url', e.target.value)} 
                                        placeholder="https://example.com/banner.png"
                                    />
                                    <InputError message={errors.image_url} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link_url">Target Link URL</Label>
                                    <Input 
                                        id="link_url" 
                                        value={data.link_url} 
                                        onChange={(e) => setData('link_url', e.target.value)} 
                                        placeholder="https://example.com/pricing"
                                    />
                                    <InputError message={errors.link_url} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="position">Display Position</Label>
                                    <Select 
                                        onValueChange={(value) => setData('position', value)} 
                                        defaultValue={data.position}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dashboard_top">Dashboard Top (Banner)</SelectItem>
                                            <SelectItem value="sidebar_bottom">Sidebar Bottom</SelectItem>
                                            <SelectItem value="transaction_success">After Transaction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.position} />
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 self-end">
                                    <Label>Active Status</Label>
                                    <Switch 
                                        checked={data.is_active} 
                                        onCheckedChange={(checked) => setData('is_active', checked)} 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link href="/admin/advertisements">
                                    <Button variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Save Advertisement
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
