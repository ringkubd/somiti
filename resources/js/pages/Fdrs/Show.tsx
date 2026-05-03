import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Landmark, Percent, Calendar, Briefcase, ExternalLink } from 'lucide-react';

interface Fdr {
    id: number;
    bank_name: string;
    interest_rate: string;
    tenure_months: number;
    maturity_amount: string;
    status: string;
    created_at: string;
    somiti: {
        name: string;
    };
    investment: {
        id: number;
        type: string;
        amount: string;
    } | null;
}

interface ShowProps {
    fdr: Fdr;
}

export default function FdrShow({ fdr }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'FDRs', url: '/fdrs' },
        { label: `FDR #${fdr.id}`, url: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`FDR #${fdr.id}`} />
            
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/fdrs">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-700">FDR Receipt</h1>
                    <Badge className="ml-auto px-3 py-1 capitalize text-sm bg-blue-100 text-blue-800 border-blue-200">
                        {fdr.status || 'Active'}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Certificate Information</CardTitle>
                            <CardDescription>Fixed Deposit details at {fdr.bank_name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Maturity Value</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ${parseFloat(fdr.maturity_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Interest Rate</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {fdr.interest_rate}%
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Landmark className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Bank Name</p>
                                        <p className="font-medium">{fdr.bank_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Tenure</p>
                                        <p className="font-medium">{fdr.tenure_months} Months</p>
                                    </div>
                                </div>
                            </div>

                            {fdr.investment && (
                                <>
                                    <Separator />
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-xs text-blue-700 uppercase font-bold">Linked Investment</p>
                                                <p className="text-sm font-medium text-blue-900 capitalize">{fdr.investment.type} (${parseFloat(fdr.investment.amount).toLocaleString()})</p>
                                            </div>
                                        </div>
                                        <Link href={`/investments/${fdr.investment.id}`}>
                                            <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 hover:bg-blue-100 gap-1">
                                                View Investment <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Society Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Somiti</p>
                                    <p className="font-medium">{fdr.somiti.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Issued Date</p>
                                    <p className="font-medium">{new Date(fdr.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
