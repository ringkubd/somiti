import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Advertisement {
    id: number;
    title: string;
    position: string;
    is_active: boolean;
    created_at: string;
}

interface Props {
    advertisements: {
        data: Advertisement[];
        links: any[];
    };
}

export default function AdsIndex({ advertisements }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Advertisements', href: '#' }
    ];

    const { delete: destroy } = useForm();

    const deleteAd = (id: number) => {
        if (confirm('Are you sure you want to delete this ad?')) {
            destroy(`/admin/advertisements/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Advertisements" />
            
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
                        <p className="text-gray-500 mt-2">Manage monetization and banners across the platform</p>
                    </div>
                    <Link href="/admin/advertisements/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Create New Ad
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="p-4 font-semibold text-sm">Title</th>
                                    <th className="p-4 font-semibold text-sm">Position</th>
                                    <th className="p-4 font-semibold text-sm">Status</th>
                                    <th className="p-4 font-semibold text-sm">Created</th>
                                    <th className="p-4 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {advertisements.data.map((ad) => (
                                    <tr key={ad.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-sm font-medium">{ad.title}</td>
                                        <td className="p-4 text-sm text-gray-500 uppercase">{ad.position.replace('_', ' ')}</td>
                                        <td className="p-4">
                                            {ad.is_active ? (
                                                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                    <ToggleRight className="h-4 w-4" /> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                                                    <ToggleLeft className="h-4 w-4" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(ad.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
                                            <Link href={`/admin/advertisements/${ad.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-500"
                                                onClick={() => deleteAd(ad.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
