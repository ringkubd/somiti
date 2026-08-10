import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Scale, CheckCircle2, XCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Line { code: string; name: string; amount: number }
interface Props {
    somiti: { id: number; name: string; currency_symbol: string };
    report: {
        assets: Line[]; liabilities: Line[]; equity: Line[];
        total_assets: number; total_liabilities: number; total_equity: number;
        balanced: boolean; as_of: string;
    };
}

function Section({ title, lines, total, color }: { title: string; lines: Line[]; total: number; color: string }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {lines.map((l) => (
                    <div key={l.code} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                        <span className="text-gray-600">{l.name}</span>
                        <span className="font-semibold">{Number(l.amount).toLocaleString()}</span>
                    </div>
                ))}
                <div className={`flex justify-between pt-3 text-sm font-bold ${color}`}>
                    <span>Total {title}</span>
                    <span>{Number(total).toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export default function BalanceSheet({ somiti, report }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Balance Sheet', url: '#' },
    ];
    const cs = somiti.currency_symbol || '$';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Balance Sheet - ${somiti.name}`} />
            <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Scale className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold">Balance Sheet</h1>
                            <p className="text-sm text-gray-500">{somiti.name} • as of {report.as_of}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={report.balanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {report.balanced ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {report.balanced ? 'Balanced' : 'Unbalanced'}
                        </Badge>
                        <Link href={`/somitis/${somiti.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <Section title="Assets" lines={report.assets} total={report.total_assets} color="text-blue-600" />
                    <Section title="Liabilities" lines={report.liabilities} total={report.total_liabilities} color="text-amber-600" />
                    <Section title="Equity" lines={report.equity} total={report.total_equity} color="text-emerald-600" />
                </div>

                <Card>
                    <CardContent className="p-6 flex flex-wrap gap-8 justify-center">
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Total Assets</p>
                            <p className="text-2xl font-bold text-blue-600">{cs}{Number(report.total_assets).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Total Liabilities</p>
                            <p className="text-2xl font-bold text-amber-600">{cs}{Number(report.total_liabilities).toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500">Total Equity</p>
                            <p className="text-2xl font-bold text-emerald-600">{cs}{Number(report.total_equity).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
