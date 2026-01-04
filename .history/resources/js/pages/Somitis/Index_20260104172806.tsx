import React from 'react';
import { Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';


export default function SomitisIndex({ somitis }: { somitis: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Somitis</h1>
                        <p className="text-gray-500 mt-2">Manage and view all your Somitis</p>
                    </div>
                    <Link href="/somitis/create">
                        <Button>Create New Somiti</Button>
                    </Link>
                </div>

                {somitis.data && somitis.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {somitis.data.map((s: any) => (
                            <Card key={s.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle>{s.name}</CardTitle>
                                    <CardDescription>Created {new Date(s.created_at).toLocaleDateString()}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="text-sm">
                                            <span className="font-medium">Status:</span>
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {s.status || 'Active'}
                                            </span>
                                        </div>
                                        <Link href={`/somitis/${s.id}`}>
                                            <Button variant="outline" className="w-full">View Details</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">No Somitis yet</p>
                                <p className="text-sm text-gray-400 mb-6">Create your first Somiti to get started</p>
                                <Link href="/somitis/create">
                                    <Button>Create Your First Somiti</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
