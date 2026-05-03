import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Scale, CheckCircle2, XCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface AccountRow {
    code: string; name: string; type: string;
    debit: number; credit: number; balance: number;
}

interface Props {
    somiti: { id: number; name: string; unique_code: string; currency_symbol: string };
    accounts: AccountRow[];
    total_debit: number;
    total_credit: number;
    is_balanced: boolean;
    unbalanced: { id: number; debit: number; credit: number }[];
}

export default function TrialBalance({ somiti, accounts, total_debit, total_credit, is_balanced, unbalanced }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Trial Balance', url: '#' },
    ];

    const typeColors: Record<string, string> = {
        asset: 'text-blue-600', liability: 'text-amber-600',
        equity: 'text-emerald-600', income: 'text-green-600', expense: 'text-red-600',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Trial Balance - ${somiti.name}`} />
            <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Scale className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold">Trial Balance</h1>
                            <p className="text-sm text-gray-500">{somiti.name} ({somiti.unique_code})</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {is_balanced ? (
                            <Badge className="bg-green-100 text-green-800 text-xs gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Balanced
                            </Badge>
                        ) : (
                            <Badge className="bg-red-100 text-red-800 text-xs gap-1">
                                <XCircle className="h-3 w-3" /> Unbalanced
                            </Badge>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Account Summary</CardTitle>
                        <CardDescription>Double-entry verification: total debits should equal total credits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Code</th>
                                        <th className="px-4 py-3">Account</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">Debit</th>
                                        <th className="px-4 py-3 text-right">Credit</th>
                                        <th className="px-4 py-3 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {accounts.map((acc, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs">{acc.code}</td>
                                            <td className="px-4 py-3 font-medium">{acc.name}</td>
                                            <td className={`px-4 py-3 capitalize ${typeColors[acc.type] || ''}`}>{acc.type}</td>
                                            <td className="px-4 py-3 text-right font-mono">${acc.debit.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-mono">${acc.credit.toLocaleString()}</td>
                                            <td className={`px-4 py-3 text-right font-mono font-bold ${acc.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                ${acc.balance.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 font-bold text-sm border-t-2">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3">Total</td>
                                        <td className="px-4 py-3 text-right">${total_debit.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">${total_credit.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">${(total_debit - total_credit).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
