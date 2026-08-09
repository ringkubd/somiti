import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Wallet, CheckCircle2, XCircle, User, Building, Banknote, CalendarDays, Hash } from 'lucide-react';

interface Withdrawal {
    id: number;
    amount: string | number;
    reason: string | null;
    method: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    approved_at: string | null;
    user: { name: string };
    approver: { name: string } | null;
    somiti: { id: number; name: string };
}

interface Props {
    withdrawal: Withdrawal;
    can_decide: boolean;
}

export default function WithdrawalShow({ withdrawal, can_decide }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Withdrawals', url: '/withdrawals' },
        { label: `Withdrawal #${withdrawal.id}`, url: '#' },
    ];

    const decide = (status: 'approved' | 'rejected') => {
        router.post(`/withdrawals/${withdrawal.id}/${status}`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Withdrawal #${withdrawal.id}`} />
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/withdrawals">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                        <Wallet className="h-8 w-8" />
                        Withdrawal #{withdrawal.id}
                    </h1>
                    <Badge variant="outline" className={`ml-auto capitalize font-medium ${
                        withdrawal.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200'
                        : withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>{withdrawal.status}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Withdrawal Details</CardTitle>
                            <CardDescription>Savings payout record</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-6 bg-teal-50 rounded-xl border-2 border-teal-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-teal-600 font-bold uppercase">Requested Amount</p>
                                    <p className="text-3xl font-black text-gray-900">{Number(withdrawal.amount).toLocaleString()}</p>
                                </div>
                                <Wallet className="h-10 w-10 text-teal-500" />
                            </div>

                            <Separator />

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-700"><User className="h-4 w-4 text-gray-400" /> {withdrawal.user.name}</div>
                                <div className="flex items-center gap-2 text-gray-700"><Building className="h-4 w-4 text-gray-400" /> {withdrawal.somiti.name}</div>
                                <div className="flex items-center gap-2 text-gray-700"><Banknote className="h-4 w-4 text-gray-400" /> {withdrawal.method || 'Cash'}</div>
                                <div className="flex items-center gap-2 text-gray-700"><CalendarDays className="h-4 w-4 text-gray-400" /> Requested {new Date(withdrawal.created_at).toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-gray-700"><Hash className="h-4 w-4 text-gray-400" /> Reference #WD-{String(withdrawal.id).padStart(6, '0')}</div>
                            </div>

                            {withdrawal.reason && (
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reason</p>
                                    <p className="text-gray-700 italic">{withdrawal.reason}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Decision</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Decided By</p>
                                <p className="font-medium">{withdrawal.approver?.name || '—'}</p>
                                {withdrawal.approved_at && <p className="text-xs text-gray-400 mt-1">{new Date(withdrawal.approved_at).toLocaleString()}</p>}
                            </div>
                            {can_decide && withdrawal.status === 'pending' && (
                                <div className="flex flex-col gap-2">
                                    <Button onClick={() => decide('approved')} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> Approve
                                    </Button>
                                    <Button onClick={() => decide('rejected')} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 gap-2">
                                        <XCircle className="h-4 w-4" /> Reject
                                    </Button>
                                </div>
                            )}
                            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-xs">
                                Approving debits Member Savings and credits Cash once the balance check passes.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
