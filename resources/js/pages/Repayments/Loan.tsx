import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, HandCoins, CheckCircle2, XCircle, Plus } from 'lucide-react';

interface Repayment {
    id: number;
    amount: string | number;
    payment_date: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user: { name: string };
}

interface Props {
    loan: {
        id: number;
        amount: string | number;
        outstanding_balance: string | number;
        interest_rate: string | number;
        interest_type: string;
        term_months: number;
        status: string;
        somiti: { id: number; name: string };
        user: { name: string };
    };
    repayments: { data: Repayment[] };
    can_decide: boolean;
    can_create: boolean;
}

export default function LoanRepayments({ loan, repayments, can_decide, can_create }: Props) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [method, setMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Loans', url: '/loans' },
        { label: `Loan #${loan.id}`, url: `/loans/${loan.id}` },
        { label: 'Repayments', url: '#' },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(`/loans/${loan.id}/repayments`, { amount, payment_date: paymentDate, method, notes }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const decide = (repayment: Repayment, status: 'approved' | 'rejected') => {
        router.post(`/repayments/${repayment.id}/${status}`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Loan #${loan.id} Repayments`} />
            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/loans/${loan.id}`}>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                            <HandCoins className="h-8 w-8" />
                            Loan Repayments
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Loan #{loan.id} · {loan.somiti.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6">
                        <p className="text-xs font-medium text-gray-500 uppercase">Loan Amount</p>
                        <p className="text-2xl font-bold mt-1">{Number(loan.amount).toLocaleString()}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-xs font-medium text-gray-500 uppercase">Outstanding Balance</p>
                        <p className="text-2xl font-bold mt-1 text-amber-600">{Number(loan.outstanding_balance).toLocaleString()}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <p className="text-xs font-medium text-gray-500 uppercase">Terms</p>
                        <p className="text-2xl font-bold mt-1">{loan.interest_rate}% · {loan.term_months} mo</p>
                    </CardContent></Card>
                </div>

                {can_create && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Submit a Repayment</CardTitle>
                            <CardDescription>Your request will be queued for approval before it hits the ledger.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                                    {errors.amount && <p className="text-xs text-red-600">{errors.amount}</p>}
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="payment_date">Payment Date</Label>
                                    <Input id="payment_date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="method">Method</Label>
                                    <Input id="method" value={method} onChange={(e) => setMethod(e.target.value)} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                                </div>
                                <div className="md:col-span-4">
                                    <Button type="submit" disabled={processing} className="gap-2">
                                        <HandCoins className="h-4 w-4" /> Submit Repayment
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Repayment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-teal-50/50 border-y">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Member</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Payment Date</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        {can_decide && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {repayments.data.length > 0 ? repayments.data.map((r) => (
                                        <tr key={r.id} className="hover:bg-teal-50/20 transition-colors">
                                            <td className="px-4 py-4 font-medium">{r.user.name}</td>
                                            <td className="px-4 py-4 font-mono font-semibold">{Number(r.amount).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-gray-500">{new Date(r.payment_date).toLocaleDateString()}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`capitalize font-medium ${
                                                    r.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200'
                                                    : r.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>{r.status}</Badge>
                                            </td>
                                            {can_decide && (
                                                <td className="px-4 py-4 text-right">
                                                    {r.status === 'pending' ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => decide(r, 'approved')}>
                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="h-8 border-red-300 text-red-600 hover:bg-red-50" onClick={() => decide(r, 'rejected')}>
                                                                <XCircle className="h-3.5 w-3.5" /> Reject
                                                            </Button>
                                                        </div>
                                                    ) : <span className="text-xs text-gray-400">—</span>}
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">No repayments yet.</td></tr>
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
