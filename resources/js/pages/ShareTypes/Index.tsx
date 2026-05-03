import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, Coins } from 'lucide-react';

interface ShareItem {
    id: number;
    share_price: string;
    total_shares: number;
    somiti: { id: number; name: string };
    financial_year: { id: number; title: string };
}

interface IndexProps {
    shares: { data: ShareItem[]; links: any };
}

export default function ShareTypesIndex({ shares }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Share Types', url: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Share Types" />
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-amber-700 flex items-center gap-2">
                            <Coins className="h-8 w-8" />
                            Share Types
                        </h1>
                        <p className="text-gray-500 mt-2">Share pricing and availability per financial year.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>All Share Configurations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Somiti</th>
                                        <th className="px-4 py-3 font-semibold">Financial Year</th>
                                        <th className="px-4 py-3 font-semibold">Price</th>
                                        <th className="px-4 py-3 font-semibold">Total Shares</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {shares.data.length > 0 ? (
                                        shares.data.map((share) => (
                                            <tr key={share.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 font-medium">{share.somiti.name}</td>
                                                <td className="px-4 py-4">{share.financial_year?.title}</td>
                                                <td className="px-4 py-4 font-semibold">${parseFloat(share.share_price).toLocaleString()}</td>
                                                <td className="px-4 py-4">{share.total_shares}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link href={`/share-types/${share.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                                                No share types configured yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
