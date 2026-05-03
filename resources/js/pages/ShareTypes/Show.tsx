import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Coins, ArrowLeft } from 'lucide-react';

interface ShareItem {
    id: number;
    share_price: string;
    total_shares: number;
    somiti: { id: number; name: string };
    financial_year: { id: number; title: string; share_value: string };
}

interface ShowProps {
    share: ShareItem;
}

export default function ShareTypesShow({ share }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Share Types', url: '/share-types' },
        { label: `#${share.id}`, url: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Share Type #${share.id}`} />
            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <Link href="/share-types">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Share Types
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Coins className="h-6 w-6 text-amber-700" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Share Type #{share.id}</CardTitle>
                                <CardDescription>Configuration for {share.somiti.name}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Somiti</p>
                                <p className="font-semibold">{share.somiti.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Financial Year</p>
                                <p className="font-semibold">{share.financial_year?.title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Share Price</p>
                                <p className="font-semibold text-lg">${parseFloat(share.share_price).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Shares</p>
                                <p className="font-semibold text-lg">{share.total_shares}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Share Value (FY)</p>
                                <p className="font-semibold">${parseFloat(share.financial_year?.share_value || '0').toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
