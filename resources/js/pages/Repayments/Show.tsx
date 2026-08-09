import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, HandCoins, CheckCircle2, XCircle, User, Building, Banknote, CalendarDays, Hash } from 'lucide-react';

interface Repayment {
    id: number;
    amount: string | number;
    principal_portion: string | number;
    interest_portion: string | number;
    payment_date: string;
    method: string | null;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    approved_at: string | null;
    user: { name: string };
    approver: { name: string } | null;
    loan: { id: number; amount: string | number; interest_rate: string | number; interest_type: string };
    somiti: { id: number; name: string };
}

interface Props {
    repayment: Repayment;
    can_decide: boolean;
}

export default function RepaymentShow({ repayment, can_decide }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Loan Repayments', url: '/repayments' },
        { label: `Repayment #${repayment.id}`, url: '#' },
    ];

    const badgeClass = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const decide = (status: 'approved' | 'rejected') => {
        router.post(`/repayments/${repayment.id}/${status}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Repayment #${repayment.id}`} />
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/repayments">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                        <HandCoins className="h-8 w-8" />
                        Repayment #{repayment.id}
                    </h1>
                    <Badge variant="outline" className={`ml-auto capitalize font-medium ${badgeClass(repayment.status)}`}>
                        {repayment.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Repayment Details</CardTitle>
                            <CardDescription>Loan installment record</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                                    <p className="text-xs text-teal-600 font-bold uppercase">Amount</p>
                                    <p className="text-2xl font-black">{Number(repayment.amount).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-600 font-bold uppercase">Principal</p>
                                    <p className="text-2xl font-black">{Number(repayment.principal_portion).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-xs text-amber-600 font-bold uppercase">Interest</p>
                                    <p className="text-2xl font-black">{Number(repayment.interest_portion).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                                    <p className="text-sm font-bold mt-2">{new Date(repayment.payment_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <User className="h-4 w-4 text-gray-400" /> {repayment.user.name}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Building className="h-4 w-4 text-gray-400" /> {repayment.somiti.name}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Hash className="h-4 w-4 text-gray-400" />
                                    Loan #{repayment.loan.id} · {Number(repayment.loan.amount).toLocaleString()} · {repayment.loan.interest_rate}% ({repayment.loan.interest_type})
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Banknote className="h-4 w-4 text-gray-400" /> {repayment.method || 'Cash'}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CalendarDays className="h-4 w-4 text-gray-400" /> Requested {new Date(repayment.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {repayment.notes && (
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Notes</p>
                                    <p className="text-gray-700 italic">{repayment.notes}</p>
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
                                <p className="font-medium">{repayment.approver?.name || '—'}</p>
                                {repayment.approved_at && (
                                    <p className="text-xs text-gray-400 mt-1">{new Date(repayment.approved_at).toLocaleString()}</p>
                                )}
                            </div>
                            {can_decide && repayment.status === 'pending' && (
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
                                Approving books the payment to the ledger and reduces the loan's outstanding balance.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
