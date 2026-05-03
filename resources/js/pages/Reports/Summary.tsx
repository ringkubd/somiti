import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Scale, ArrowLeft, Wallet, TrendingDown, PieChart, Landmark } from 'lucide-react';

interface AccountSummary {
    code: string; name: string; type: string; balance: number;
}

interface Props {
    somiti: { id: number; name: string; unique_code: string; currency_symbol: string };
    accounts: AccountSummary[];
}

const typeLabels: Record<string, string> = {
    asset: 'Assets', liability: 'Liabilities', equity: 'Equity', income: 'Income', expense: 'Expenses',
};

const typeIcons: Record<string, any> = {
    asset: Wallet, liability: TrendingDown, equity: PieChart, income: Landmark, expense: TrendingDown,
};

const typeColors: Record<string, string> = {
    asset: 'text-blue-600', liability: 'text-amber-600', equity: 'text-emerald-600', income: 'text-green-600', expense: 'text-red-600',
};

export default function Summary({ somiti, accounts }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Summary', url: '#' },
    ];

    const byType = accounts.reduce<Record<string, AccountSummary[]>>((acc, a) => {
        (acc[a.type] = acc[a.type] || []).push(a);
        return acc;
    }, {});

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Financial Summary - ${somiti.name}`} />
            <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Scale className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold">Financial Summary</h1>
                            <p className="text-sm text-gray-500">{somiti.name} ({somiti.unique_code})</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/somitis/${somiti.id}/reports/trial-balance`}>
                            <Button variant="outline" size="sm">Trial Balance</Button>
                        </Link>
                        <Link href={`/somitis/${somiti.id}/settings`}>
                            <Button variant="outline" size="sm">Settings</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(byType).map(([type, items]) => {
                        const Icon = typeIcons[type] || Scale;
                        const total = items.reduce((s, a) => s + a.balance, 0);
                        return (
                            <Card key={type}>
                                <CardHeader className="pb-3">
                                    <CardTitle className={`flex items-center gap-2 text-base ${typeColors[type]}`}>
                                        <Icon className="h-5 w-5" />
                                        {typeLabels[type] || type}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {items.map((a, i) => (
                                            <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                                                <span className="text-sm font-medium">{a.name}</span>
                                                <span className={`font-mono font-bold text-sm ${a.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {somiti.currency_symbol || '$'}{a.balance.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center pt-2 border-t-2 font-bold">
                                            <span>Total {typeLabels[type]}</span>
                                            <span className={total >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                {somiti.currency_symbol || '$'}{total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
