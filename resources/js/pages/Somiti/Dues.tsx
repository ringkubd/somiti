import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface MonthRow {
    month_key: string;
    month_label: string;
    expected: number;
    paid: number;
    pending: number;
    status: string;
}

interface MemberDues {
    user: { id: number; name: string } | null;
    months: MonthRow[];
    total_expected: number;
    total_paid: number;
    pending: number;
    due_count: number;
    overdue_count: number;
}

interface Props {
    somiti: { id: number; name: string; currency_symbol: string };
    dues: {
        settings: { monthly_deposit_amount: string | null; due_day: number | null };
        members: MemberDues[];
        totals?: { expected: number; paid: number; pending: number; due_months: number; overdue_months: number };
        is_own?: boolean;
    };
    isManager: boolean;
}

const statusStyle: Record<string, { label: string; cls: string }> = {
    paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700' },
    partial: { label: 'Partial', cls: 'bg-amber-100 text-amber-700' },
    due: { label: 'Due', cls: 'bg-blue-100 text-blue-700' },
    overdue: { label: 'Overdue', cls: 'bg-red-100 text-red-700' },
    future: { label: 'Future', cls: 'bg-slate-100 text-slate-500' },
};

export default function SomitiDues({ somiti, dues, isManager }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Dues', url: '#' },
    ];
    const symbol = somiti.currency_symbol || '$';
    const totals = dues.totals;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monthly Dues" />
            <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Monthly Dues</h2>
                        <p className="text-sm text-muted-foreground">
                            {isManager ? 'All members' : 'Your deposit schedule'} • monthly {symbol}{dues.settings.monthly_deposit_amount || 0} • due day {dues.settings.due_day || 10}
                        </p>
                    </div>
                    <Link href={`/somitis/${somiti.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </Link>
                </div>

                {isManager && totals && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Expected</p><p className="text-xl font-bold">{symbol}{Number(totals.expected).toLocaleString()}</p></CardContent></Card>
                        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Paid</p><p className="text-xl font-bold text-emerald-600">{symbol}{Number(totals.paid).toLocaleString()}</p></CardContent></Card>
                        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-xl font-bold text-amber-600">{symbol}{Number(totals.pending).toLocaleString()}</p></CardContent></Card>
                        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Due Months</p><p className="text-xl font-bold text-blue-600">{totals.due_months}</p></CardContent></Card>
                        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Overdue Months</p><p className="text-xl font-bold text-red-600">{totals.overdue_months}</p></CardContent></Card>
                    </div>
                )}

                <div className="space-y-4">
                    {dues.members.map((member) => (
                        <Card key={member.user?.id || 'own'}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{member.user?.name || 'Your Dues'}</CardTitle>
                                        <CardDescription className="mt-1">
                                            Paid {symbol}{Number(member.total_paid).toLocaleString()} / {symbol}{Number(member.total_expected).toLocaleString()}
                                            {member.overdue_count > 0 && <span className="text-red-600"> • {member.overdue_count} overdue</span>}
                                        </CardDescription>
                                    </div>
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {member.months.map((m) => {
                                        const st = statusStyle[m.status] || statusStyle.future;
                                        return (
                                            <div key={m.month_key} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <p className="text-sm font-medium">{m.month_label}</p>
                                                    <p className="text-xs text-muted-foreground">{symbol}{Number(m.paid).toLocaleString()} / {symbol}{Number(m.expected).toLocaleString()}{m.pending > 0 ? ` +${symbol}${Number(m.pending).toLocaleString()} pending` : ''}</p>
                                                </div>
                                                <Badge className={st.cls}>{st.label}</Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
