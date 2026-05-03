import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Globe, MoveVertical, ExternalLink } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Navigation {
    id: number;
    label: string;
    url: string;
    order: number;
    position: string;
    is_active: boolean;
}

interface Props {
    navigations: Navigation[];
}

export default function NavigationIndex({ navigations }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Navigation Management', href: '#' }
    ];

    const { data, setData, post, patch, delete: destroy, processing } = useForm({
        label: '',
        url: '',
        order: 0,
        position: 'header'
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/navigation', {
            onSuccess: () => setData({ label: '', url: '', order: 0, position: 'header' })
        });
    };

    const toggleStatus = (id: number, active: boolean) => {
        patch(`/admin/navigation/${id}`, { data: { is_active: !active } });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Navigation Management" />
            
            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                        <Globe className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Navigation Management</h1>
                        <p className="text-slate-500 mt-1">Manage header and footer links for your website</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add New Link Form */}
                    <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200/50">
                        <CardHeader>
                            <CardTitle>Add New Link</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Label</Label>
                                    <Input 
                                        value={data.label} 
                                        onChange={e => setData('label', e.target.value)}
                                        placeholder="e.g. Pricing"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL</Label>
                                    <Input 
                                        value={data.url} 
                                        onChange={e => setData('url', e.target.value)}
                                        placeholder="/pricing or https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Select 
                                        value={data.position} 
                                        onValueChange={v => setData('position', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="header">Header</SelectItem>
                                            <SelectItem value="footer">Footer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full bg-indigo-600" disabled={processing}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Link
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Links List */}
                    <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Link</th>
                                        <th className="px-6 py-4">Position</th>
                                        <th className="px-6 py-4">Order</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {navigations.map((nav) => (
                                        <tr key={nav.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{nav.label}</span>
                                                    <span className="text-xs text-slate-400 truncate max-w-[200px]">{nav.url}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="capitalize px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">{nav.position}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MoveVertical className="h-3 w-3 text-slate-300" />
                                                    {nav.order}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => { if(confirm('Delete link?')) destroy(`/admin/navigation/${nav.id}`) }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {navigations.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                                No navigation links defined yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
