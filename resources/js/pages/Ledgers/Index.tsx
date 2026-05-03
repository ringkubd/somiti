import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, BookText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Ledger {
    id: number;
    debit: string;
    credit: string;
    description: string;
    reference_type: string;
    reference_id: number;
    created_at: string;
    somiti: {
        id: number;
        name: string;
    };
}

interface IndexProps {
    ledgers: {
        data: Ledger[];
        links: any;
    };
}

export default function LedgersIndex({ ledgers }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'General Ledger', url: '#' }
    ];

    const getRefLabel = (type: string) => {
        const parts = type.split('\\');
        return parts[parts.length - 1];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Ledger" />
            
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                            <BookText className="h-8 w-8" />
                            General Ledger
                        </h1>
                        <p className="text-gray-500 mt-2">Audit trail of all financial transactions.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-slate-50 border-y">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                        <th className="px-4 py-3 font-semibold">Description</th>
                                        <th className="px-4 py-3 font-semibold">Somiti</th>
                                        <th className="px-4 py-3 font-semibold">Reference</th>
                                        <th className="px-4 py-3 font-semibold text-right text-red-600">Debit (-)</th>
                                        <th className="px-4 py-3 font-semibold text-right text-green-600">Credit (+)</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {ledgers.data.length > 0 ? (
                                        ledgers.data.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                                                    {new Date(entry.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-900 max-w-xs truncate">
                                                    {entry.description}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {entry.somiti.name}
                                                </td>
                                                <td className="px-4 py-4 text-gray-500 text-xs font-mono">
                                                    {getRefLabel(entry.reference_type)}#{entry.reference_id}
                                                </td>
                                                <td className="px-4 py-4 text-right text-red-600 font-medium">
                                                    {parseFloat(entry.debit) > 0 ? (
                                                        <span className="flex items-center justify-end gap-1">
                                                            <ArrowUpRight className="h-3 w-3" />
                                                            {parseFloat(entry.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-right text-green-600 font-medium">
                                                    {parseFloat(entry.credit) > 0 ? (
                                                        <span className="flex items-center justify-end gap-1">
                                                            <ArrowDownLeft className="h-3 w-3" />
                                                            {parseFloat(entry.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link href={`/ledgers/${entry.id}`}>
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
                                                No ledger entries found.
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
