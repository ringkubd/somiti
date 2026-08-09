import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { Eye, HandCoins, ArrowLeft, TrendingUp } from 'lucide-react';

interface Declaration {
    id: number;
    total_profit: string | number;
    profit_period: string;
    dividend_rate: string | number;
    total_dividend: string | number;
    status: 'pending' | 'paid' | 'rejected';
    declared_at: string;
    financial_year: { title: string } | null;
}

interface Props {
    somiti: { id: number; name: string; unique_code: string };
    declarations: { data: Declaration[] };
    financial_years: { id: number; title: string }[];
    can_declare: boolean;
}

export default function DividendsIndex({ somiti, declarations, financial_years, can_declare }: Props) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [totalAmount, setTotalAmount] = useState('');
    const [financialYearId, setFinancialYearId] = useState<string>(financial_years[0] ? String(financial_years[0].id) : '');
    const [dividendRate, setDividendRate] = useState('100');
    const [profitPeriod, setProfitPeriod] = useState('');
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Dividends', url: '#' },
    ];

    const declare = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(`/somitis/${somiti.id}/dividends`, {
            total_amount: totalAmount,
            financial_year_id: Number(financialYearId),
            dividend_rate: dividendRate,
            profit_period: profitPeriod,
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dividends - ${somiti.name}`} />
            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/somitis/${somiti.id}`}>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                            <HandCoins className="h-8 w-8" />
                            Dividends
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">{somiti.name} · {somiti.unique_code}</p>
                    </div>
                </div>

                {can_declare && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Declare a Dividend</CardTitle>
                            <CardDescription>Allocations are computed per member share count. Approval pays each allocation through the ledger.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={declare} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="total_amount">Total Profit *</Label>
                                    <Input id="total_amount" type="number" step="0.01" min="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required />
                                    {errors.total_amount && <p className="text-xs text-red-600">{errors.total_amount}</p>}
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="financial_year_id">Financial Year *</Label>
                                    <Select value={financialYearId} onValueChange={setFinancialYearId}>
                                        <SelectTrigger id="financial_year_id" className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {financial_years.map((fy) => <SelectItem key={fy.id} value={String(fy.id)}>{fy.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="dividend_rate">Dividend Rate (%)</Label>
                                    <Input id="dividend_rate" type="number" step="0.01" min="0" max="100" value={dividendRate} onChange={(e) => setDividendRate(e.target.value)} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="profit_period">Profit Period</Label>
                                    <Input id="profit_period" placeholder={`FY ${new Date().getFullYear()}`} value={profitPeriod} onChange={(e) => setProfitPeriod(e.target.value)} />
                                </div>
                                <div className="md:col-span-4">
                                    <Button type="submit" disabled={processing || !financialYearId} className="gap-2">
                                        <HandCoins className="h-4 w-4" /> Create Declaration
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Declarations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-teal-50/50 border-y">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Period</th>
                                        <th className="px-4 py-3 font-semibold">FY</th>
                                        <th className="px-4 py-3 font-semibold">Total Profit</th>
                                        <th className="px-4 py-3 font-semibold">Rate</th>
                                        <th className="px-4 py-3 font-semibold">Total Dividend</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {declarations.data.length > 0 ? declarations.data.map((d) => (
                                        <tr key={d.id} className="hover:bg-teal-50/20 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900">{d.profit_period}</td>
                                            <td className="px-4 py-4 text-gray-600">{d.financial_year?.title || '—'}</td>
                                            <td className="px-4 py-4 font-mono">{Number(d.total_profit).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-gray-600">{d.dividend_rate}%</td>
                                            <td className="px-4 py-4 font-mono font-semibold">{Number(d.total_dividend).toLocaleString()}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`capitalize font-medium ${
                                                    d.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200'
                                                    : d.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>{d.status}</Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link href={`/dividends/${d.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View</span>
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">No dividend declarations yet.</td></tr>
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
