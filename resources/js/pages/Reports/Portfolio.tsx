import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PieChart } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Props {
    somiti: { id: number; name: string; currency_symbol: string };
    report: {
        total_fund: number; cash: number; bank: number; loans_outstanding: number; invested: number;
        member_savings: number; share_capital: number; deployment_rate: number;
        investments: { id: number; type: string; amount: number; maturity_date: string | null; status: string }[];
        fdrs: { id: number; bank_name: string; interest_rate: number; tenure_months: number; maturity_amount: number }[];
    };
}

export default function Portfolio({ somiti, report }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Portfolio', url: '#' },
    ];
    const cs = somiti.currency_symbol || '$';
    const total = report.total_fund || 0;
    const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;
    const alloc = [
        { label: 'Cash', value: report.cash, color: 'bg-emerald-500' },
        { label: 'Bank', value: report.bank, color: 'bg-blue-500' },
        { label: 'Invested', value: report.invested, color: 'bg-amber-500' },
        { label: 'Loans', value: report.loans_outstanding, color: 'bg-red-500' },
    ];

    const Stat = ({ label, value, color }: { label: string; value: number; color: string }) => (
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">{label}</p><p className={`text-xl font-bold ${color}`}>{cs}{Number(value).toLocaleString()}</p></CardContent></Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Portfolio - ${somiti.name}`} />
            <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PieChart className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold">Fund Portfolio</h1>
                            <p className="text-sm text-gray-500">{somiti.name} • {report.deployment_rate}% deployed</p>
                        </div>
                    </div>
                    <Link href={`/somitis/${somiti.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                    </Link>
                </div>

                <Card className="text-center py-8">
                    <p className="text-sm text-gray-500">Total Fund</p>
                    <p className="text-4xl font-extrabold">{cs}{Number(total).toLocaleString()}</p>
                    <div className="flex h-4 rounded-full overflow-hidden max-w-md mx-auto mt-4">
                        {alloc.filter(a => a.value > 0).map(a => (
                            <div key={a.label} className={a.color} style={{ flex: Math.max(pct(a.value), 1) }} />
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-gray-600">
                        {alloc.map(a => (
                            <span key={a.label} className="inline-flex items-center gap-1">
                                <span className={`w-2.5 h-2.5 rounded-full ${a.color}`} /> {a.label} {pct(a.value)}%
                            </span>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Stat label="Cash" value={report.cash} color="text-emerald-600" />
                    <Stat label="Bank" value={report.bank} color="text-blue-600" />
                    <Stat label="Invested" value={report.invested} color="text-amber-600" />
                    <Stat label="Loans Outstanding" value={report.loans_outstanding} color="text-red-600" />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-lg">Investments</CardTitle><CardDescription>Where the fund is deployed</CardDescription></CardHeader>
                        <CardContent>
                            {report.investments.length === 0 && <p className="text-sm text-gray-400">No investments</p>}
                            {report.investments.map((i) => (
                                <div key={i.id} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                                    <span className="text-gray-600 capitalize">{i.type}{i.maturity_date ? ` • ${i.maturity_date}` : ''}</span>
                                    <span className="font-semibold">{cs}{Number(i.amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-lg">FDRs</CardTitle><CardDescription>Fixed deposits by bank</CardDescription></CardHeader>
                        <CardContent>
                            {report.fdrs.length === 0 && <p className="text-sm text-gray-400">No FDRs</p>}
                            {report.fdrs.map((f) => (
                                <div key={f.id} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                                    <span className="text-gray-600">{f.bank_name} • {f.interest_rate}% • {f.tenure_months}mo</span>
                                    <span className="font-semibold">{cs}{Number(f.maturity_amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
