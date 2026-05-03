import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
    User, 
    PieChart, 
    Wallet, 
    TrendingDown, 
    ArrowRightLeft, 
    History, 
    Calendar,
    Briefcase,
    ShieldCheck
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Member {
    id: number;
    name: string;
    email: string;
}

interface Share {
    id: number;
    somiti: { name: string };
    quantity: number;
}

interface Deposit {
    id: number;
    amount: string;
    month: string;
    type: string;
    somiti: { name: string };
    financial_year: { title: string };
    created_at: string;
}

interface Loan {
    id: number;
    amount: string;
    status: string;
    somiti: { name: string };
}

interface Transfer {
    id: number;
    somiti: { name: string };
    from_user: { name: string } | null;
    to_user: { name: string };
    quantity: number;
    price_per_share: string;
    transfer_date: string;
    status: string;
}

interface FYHistory {
    id: number;
    title: string;
    share_value: string;
    start_date: string;
    somiti: { name: string };
}

interface Props {
    member: Member;
    shares: Share[];
    deposits: Deposit[];
    loans: Loan[];
    transfers: Transfer[];
    financialYears: FYHistory[];
}

export default function ProfileShow({ member, shares, deposits, loans, transfers, financialYears }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Member Profile', url: '#' }
    ];

    // Calculate totals
    const totalShares = shares.reduce((acc, s) => acc + s.quantity, 0);
    const totalDeposits = deposits.reduce((acc, d) => acc + parseFloat(d.amount), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${member.name}'s Profile`} />
            
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {member.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">{member.name}</h1>
                            <p className="text-slate-500 font-medium">{member.email}</p>
                            <div className="flex gap-2 mt-2">
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active Member</Badge>
                                <Badge variant="outline" className="text-slate-500 border-slate-300">ID: #{member.id.toString().padStart(5, '0')}</Badge>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
                        <div className="p-4 bg-white rounded-xl border shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Total Shares</p>
                            <p className="text-xl font-black text-slate-900">{totalShares}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border shadow-sm">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Total Savings</p>
                            <p className="text-xl font-black text-emerald-600">${totalDeposits.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-white rounded-xl border shadow-sm hidden sm:block">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Societies</p>
                            <p className="text-xl font-black text-slate-900">{shares.length}</p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="bg-slate-100 p-1 mb-8">
                        <TabsTrigger value="overview" className="gap-2"><PieChart className="h-4 w-4" /> Overview</TabsTrigger>
                        <TabsTrigger value="deposits" className="gap-2"><Wallet className="h-4 w-4" /> Deposits</TabsTrigger>
                        <TabsTrigger value="shares" className="gap-2"><ArrowRightLeft className="h-4 w-4" /> Share Market</TabsTrigger>
                        <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" /> Financial Timeline</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Current Share Positions</CardTitle>
                                    <CardDescription>Your holdings across different societies</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {shares.map(s => (
                                            <div key={s.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                                                <span className="font-bold text-slate-700">{s.somiti.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black">{s.quantity}</span>
                                                    <span className="text-xs text-slate-400">Shares</span>
                                                </div>
                                            </div>
                                        ))}
                                        {shares.length === 0 && <p className="text-center text-slate-400 py-4 italic">No shares found</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Active Loans</CardTitle>
                                    <CardDescription>Current credit status and repayments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {loans.map(l => (
                                            <div key={l.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{l.somiti.name}</span>
                                                    <span className="text-xs text-slate-400">Loan #{l.id}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-lg font-black text-rose-600">${parseFloat(l.amount).toLocaleString()}</span>
                                                    <Badge variant="outline" className="text-[10px] uppercase h-4">{l.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                        {loans.length === 0 && <p className="text-center text-slate-400 py-4 italic">No active loans</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="deposits">
                        <Card>
                            <CardHeader>
                                <CardTitle>Approved Deposits History</CardTitle>
                                <CardDescription>Complete log of your contributions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Society</th>
                                            <th className="px-4 py-3">FY / Month</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {deposits.map(d => (
                                            <tr key={d.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-4 font-bold">{d.somiti.name}</td>
                                                <td className="px-4 py-4">{d.financial_year.title} - {d.month}</td>
                                                <td className="px-4 py-4 capitalize text-slate-500">{d.type}</td>
                                                <td className="px-4 py-4 text-slate-500">{new Date(d.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 text-right font-black text-emerald-600">${parseFloat(d.amount).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="shares">
                        <Card>
                            <CardHeader>
                                <CardTitle>Share Transfer Ledger</CardTitle>
                                <CardDescription>Historical record of shares bought and sold</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3">Society</th>
                                            <th className="px-4 py-3">Transaction</th>
                                            <th className="px-4 py-3">Qty</th>
                                            <th className="px-4 py-3">Price</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {transfers.map(t => {
                                            const isSender = t.from_user?.name === member.name;
                                            return (
                                                <tr key={t.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-4 font-bold">{t.somiti.name}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={isSender ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}>
                                                                {isSender ? 'SENT' : 'RECEIVED'}
                                                            </Badge>
                                                            <span className="text-xs text-slate-500">
                                                                {isSender ? `to ${t.to_user.name}` : `from ${t.from_user?.name || 'Treasury'}`}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 font-black">{t.quantity}</td>
                                                    <td className="px-4 py-4 font-mono">${parseFloat(t.price_per_share).toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-slate-500">{new Date(t.transfer_date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-4">
                                                        <Badge variant="outline" className="capitalize text-[10px]">{t.status}</Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history">
                        <Card className="border-amber-200 bg-amber-50/10">
                            <CardHeader>
                                <CardTitle className="text-amber-800">Financial Year & Pricing Timeline</CardTitle>
                                <CardDescription className="text-amber-600/80">Historical log of share valuations for societies you are part of</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-amber-800/60 uppercase bg-amber-100/50 border-b border-amber-200">
                                        <tr>
                                            <th className="px-4 py-3">Society</th>
                                            <th className="px-4 py-3">Financial Year</th>
                                            <th className="px-4 py-3">Share Price</th>
                                            <th className="px-4 py-3">Started</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-amber-100">
                                        {financialYears.map(fy => (
                                            <tr key={fy.id} className="hover:bg-amber-50/50 transition-colors">
                                                <td className="px-4 py-4 font-bold text-slate-700">{fy.somiti.name}</td>
                                                <td className="px-4 py-4 font-medium">{fy.title}</td>
                                                <td className="px-4 py-4">
                                                    <span className="text-lg font-black text-amber-700">${parseFloat(fy.share_value).toLocaleString()}</span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-500">{new Date(fy.start_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
