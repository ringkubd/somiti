import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, Plus, Wallet } from 'lucide-react';

interface Withdrawal {
    id: number;
    amount: string | number;
    reason: string | null;
    method: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user: { name: string };
    somiti: { id: number; name: string };
}

interface Props {
    withdrawals: { data: Withdrawal[] };
}

export default function WithdrawalsIndex({ withdrawals }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Withdrawals', url: '#' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Withdrawals" />
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                            <Wallet className="h-8 w-8" />
                            Withdrawals
                        </h1>
                        <p className="text-gray-500 mt-2">Savings withdrawal requests across your societies.</p>
                    </div>
                    <Link href="/withdrawals/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Withdrawal
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Withdrawal Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-teal-50/50 border-y">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Member</th>
                                        <th className="px-4 py-3 font-semibold">Society</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Method</th>
                                        <th className="px-4 py-3 font-semibold">Requested</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {withdrawals.data.length > 0 ? withdrawals.data.map((w) => (
                                        <tr key={w.id} className="hover:bg-teal-50/20 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900">{w.user.name}</td>
                                            <td className="px-4 py-4 text-gray-600">{w.somiti.name}</td>
                                            <td className="px-4 py-4 font-mono font-semibold">{Number(w.amount).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-gray-600">{w.method || '—'}</td>
                                            <td className="px-4 py-4 text-gray-500">{new Date(w.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`capitalize font-medium ${
                                                    w.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200'
                                                    : w.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>{w.status}</Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link href={`/withdrawals/${w.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View</span>
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">No withdrawal requests found.</td></tr>
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
