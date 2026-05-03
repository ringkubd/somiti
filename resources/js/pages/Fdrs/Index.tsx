import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, Landmark } from 'lucide-react';

interface Fdr {
    id: number;
    bank_name: string;
    interest_rate: string;
    tenure_months: number;
    maturity_amount: string;
    status: string;
    somiti: {
        id: number;
        name: string;
    };
    investment: {
        id: number;
        type: string;
    };
}

interface IndexProps {
    fdrs: {
        data: Fdr[];
        links: any;
    };
}

export default function FdrsIndex({ fdrs }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'FDRs', url: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="FDRs" />
            
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-blue-700 flex items-center gap-2">
                            <Landmark className="h-8 w-8" />
                            Fixed Deposit Receipts (FDR)
                        </h1>
                        <p className="text-gray-500 mt-2">Manage bank FDRs linked to society investments.</p>
                    </div>
                    <Link href="/fdrs/create">
                        <Button>New FDR</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Active FDRs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Bank Name</th>
                                        <th className="px-4 py-3 font-semibold text-center">Interest</th>
                                        <th className="px-4 py-3 font-semibold text-center">Tenure</th>
                                        <th className="px-4 py-3 font-semibold">Somiti</th>
                                        <th className="px-4 py-3 font-semibold text-right">Maturity Amount</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {fdrs.data.length > 0 ? (
                                        fdrs.data.map((fdr) => (
                                            <tr key={fdr.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 font-medium text-gray-900">
                                                    {fdr.bank_name}
                                                </td>
                                                <td className="px-4 py-4 text-center text-gray-600">
                                                    {fdr.interest_rate}%
                                                </td>
                                                <td className="px-4 py-4 text-center text-gray-600">
                                                    {fdr.tenure_months}m
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {fdr.somiti.name}
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-gray-900 text-right">
                                                    ${parseFloat(fdr.maturity_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline" className="capitalize">
                                                        {fdr.status || 'Active'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link href={`/fdrs/${fdr.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">View</span>
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">
                                                No FDR records found.
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
