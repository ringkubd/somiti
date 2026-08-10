import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { Wallet, PieChart, TrendingDown, Download, FileText, Scale } from 'lucide-react';

interface MemberOption {
    id: number;
    user_id: number;
    user: { id: number; name: string; email: string | null; phone: string | null };
}

interface Deposit {
    id: number;
    amount: string | number;
    type: string;
    status: string;
    created_at: string;
}

interface Loan {
    id: number;
    amount: string | number;
    interest_rate: string | number;
    interest_type: string;
    term_months: number;
    outstanding_balance: string | number;
    status: string;
    created_at: string;
}

interface Transaction {
    id: number;
    debit: string | number;
    credit: string | number;
    description: string | null;
    created_at: string;
    journal_entry: { id: number; entry_date: string | null };
    chart_of_account: { name: string; code: string };
}

interface Props {
    somiti: { id: number; name: string; unique_code: string; currency_symbol: string | null };
    member: { id: number; name: string; email: string | null; phone: string | null };
    members: MemberOption[];
    can_view_all: boolean;
    summary: {
        savings_balance: number;
        share_capital: number;
        outstanding_loans: number;
    };
    deposits: Deposit[];
    loans: Loan[];
    transactions: Transaction[];
}

export default function MemberStatement({ somiti, member, members, can_view_all, summary, deposits, loans, transactions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Reports', url: '/reports' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Member Statement', url: '#' },
    ];

    const cs = somiti.currency_symbol || '$';
    const money = (v: string | number) => `${cs}${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    const changeMember = (userId: string) => {
        router.get(`/somitis/${somiti.id}/reports/member-statement`, { user_id: userId }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Member Statement - ${somiti.name}`} />
            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Scale className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold">Member Statement</h1>
                            <p className="text-sm text-gray-500">{somiti.name} ({somiti.unique_code}) · {member.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {can_view_all && (
                            <Select value={String(member.id)} onValueChange={changeMember}>
                                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {members.map((m) => (
                                        <SelectItem key={m.id} value={String(m.user_id)}>{m.user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Link href={`/somitis/${somiti.id}/reports/member-statement.csv?user_id=${member.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="h-4 w-4" /> CSV
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card><CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">Savings Balance</p>
                            <Wallet className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold mt-1 text-green-600">{money(summary.savings_balance)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">Share Capital</p>
                            <PieChart className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold mt-1 text-emerald-600">{money(summary.share_capital)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">Outstanding Loans</p>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold mt-1 text-red-600">{money(summary.outstanding_loans)}</p>
                    </CardContent></Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Approved Deposits</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y">
                                        <tr>
                                            <th className="px-4 py-2.5 font-semibold">Date</th>
                                            <th className="px-4 py-2.5 font-semibold">Type</th>
                                            <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {deposits.length > 0 ? deposits.map((d) => (
                                            <tr key={d.id}>
                                                <td className="px-4 py-3 text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 capitalize">{d.type.replace('_', ' ')}</td>
                                                <td className="px-4 py-3 text-right font-mono font-semibold">{money(d.amount)}</td>
                                            </tr>
                                        )) : <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">No approved deposits.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Loans</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y">
                                        <tr>
                                            <th className="px-4 py-2.5 font-semibold">Date</th>
                                            <th className="px-4 py-2.5 font-semibold">Amount</th>
                                            <th className="px-4 py-2.5 font-semibold">Outstanding</th>
                                            <th className="px-4 py-2.5 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {loans.length > 0 ? loans.map((l) => (
                                            <tr key={l.id}>
                                                <td className="px-4 py-3 text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-mono">{money(l.amount)}</td>
                                                <td className="px-4 py-3 font-mono font-semibold">{money(l.outstanding_balance)}</td>
                                                <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{l.status}</Badge></td>
                                            </tr>
                                        )) : <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-500 italic">No loans.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Ledger Transactions</CardTitle>
                        <CardDescription>Journal lines recorded against this member</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y">
                                    <tr>
                                        <th className="px-4 py-2.5 font-semibold">Date</th>
                                        <th className="px-4 py-2.5 font-semibold">Account</th>
                                        <th className="px-4 py-2.5 font-semibold">Description</th>
                                        <th className="px-4 py-2.5 font-semibold text-right">Debit</th>
                                        <th className="px-4 py-2.5 font-semibold text-right">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {transactions.length > 0 ? transactions.map((t) => (
                                        <tr key={t.id}>
                                            <td className="px-4 py-3 text-gray-500">
                                                {t.journal_entry.entry_date ? new Date(t.journal_entry.entry_date).toLocaleDateString() : new Date(t.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 font-medium">{t.chart_of_account.name}</td>
                                            <td className="px-4 py-3 text-gray-600">{t.description || '—'}</td>
                                            <td className="px-4 py-3 text-right font-mono text-red-600">{Number(t.debit) > 0 ? money(t.debit) : ''}</td>
                                            <td className="px-4 py-3 text-right font-mono text-green-600">{Number(t.credit) > 0 ? money(t.credit) : ''}</td>
                                        </tr>
                                    )) : <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500 italic">No ledger entries for this member.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
