import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, HandCoins, CheckCircle2, XCircle, Users } from 'lucide-react';

interface Allocation {
    id: number;
    share_count: number;
    dividend_per_share: string | number;
    total_dividend: string | number;
    status: 'pending' | 'paid';
    user: { name: string };
}

interface Declaration {
    id: number;
    total_profit: string | number;
    profit_period: string;
    dividend_rate: string | number;
    total_dividend: string | number;
    status: 'pending' | 'paid' | 'rejected';
    declared_at: string;
    financial_year: { title: string } | null;
    somiti: { id: number; name: string };
    allocations: Allocation[];
}

interface Props {
    declaration: Declaration;
    can_decide: boolean;
}

export default function DividendShow({ declaration, can_decide }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: declaration.somiti.name, url: `/somitis/${declaration.somiti.id}` },
        { label: 'Dividends', url: `/somitis/${declaration.somiti.id}/dividends` },
        { label: `Declaration #${declaration.id}`, url: '#' },
    ];

    const decide = (status: 'approved' | 'rejected') => {
        router.post(`/dividends/${declaration.id}/${status}`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dividend #${declaration.id}`} />
            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/somitis/${declaration.somiti.id}/dividends`}>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                        <HandCoins className="h-8 w-8" />
                        Dividend #{declaration.id}
                    </h1>
                    <Badge variant="outline" className={`ml-auto capitalize font-medium ${
                        declaration.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200'
                        : declaration.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>{declaration.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardContent className="pt-6">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Profit</p>
                        <p className="text-xl font-bold mt-1">{Number(declaration.total_profit).toLocaleString()}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-xs font-medium text-gray-500 uppercase">Dividend Rate</p>
                        <p className="text-xl font-bold mt-1">{declaration.dividend_rate}%</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Dividend</p>
                        <p className="text-xl font-bold mt-1 text-emerald-600">{Number(declaration.total_dividend).toLocaleString()}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-xs font-medium text-gray-500 uppercase">Allocations</p>
                        <p className="text-xl font-bold mt-1">{declaration.allocations.length}</p>
                    </CardContent></Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Member Allocations</CardTitle>
                        <CardDescription>{declaration.profit_period} · FY {declaration.financial_year?.title || '—'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-teal-50/50 border-y">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Member</th>
                                        <th className="px-4 py-3 font-semibold">Shares</th>
                                        <th className="px-4 py-3 font-semibold">Per Share</th>
                                        <th className="px-4 py-3 font-semibold">Total</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {declaration.allocations.length > 0 ? declaration.allocations.map((a) => (
                                        <tr key={a.id}>
                                            <td className="px-4 py-4 font-medium">{a.user.name}</td>
                                            <td className="px-4 py-4">{a.share_count}</td>
                                            <td className="px-4 py-4 font-mono">{Number(a.dividend_per_share).toLocaleString()}</td>
                                            <td className="px-4 py-4 font-mono font-semibold">{Number(a.total_dividend).toLocaleString()}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`capitalize font-medium ${a.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{a.status}</Badge>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">No allocations.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Separator className="my-4" />
                        {can_decide && declaration.status === 'pending' && (
                            <div className="flex gap-3">
                                <Button onClick={() => decide('approved')} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Approve & Pay
                                </Button>
                                <Button onClick={() => decide('rejected')} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 gap-2">
                                    <XCircle className="h-4 w-4" /> Reject
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
