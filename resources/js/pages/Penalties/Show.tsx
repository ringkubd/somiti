import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, User, Building, CalendarDays, Hash } from 'lucide-react';

interface Penalty {
    id: number;
    amount: string | number;
    type: 'late_deposit' | 'loan_default' | 'other' | null;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    approved_at: string | null;
    user: { name: string };
    approver: { name: string } | null;
    somiti: { id: number; name: string };
}

interface Props {
    penalty: Penalty;
    can_decide: boolean;
}

const typeLabels: Record<string, string> = {
    late_deposit: 'Late Deposit',
    loan_default: 'Loan Default',
    other: 'Other',
};

export default function PenaltyShow({ penalty, can_decide }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Penalties', url: '/penalties' },
        { label: `Penalty #${penalty.id}`, url: '#' },
    ];

    const decide = (status: 'approved' | 'rejected') => {
        router.post(`/penalties/${penalty.id}/${status}`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Penalty #${penalty.id}`} />
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/penalties">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                        <AlertTriangle className="h-8 w-8" />
                        Penalty #{penalty.id}
                    </h1>
                    <Badge variant="outline" className={`ml-auto capitalize font-medium ${
                        penalty.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200'
                        : penalty.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>{penalty.status}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Penalty Details</CardTitle>
                            <CardDescription>{typeLabels[penalty.type ?? 'other']}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-6 bg-red-50 rounded-xl border-2 border-red-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-red-600 font-bold uppercase">Penalty Amount</p>
                                    <p className="text-3xl font-black text-gray-900">{Number(penalty.amount).toLocaleString()}</p>
                                </div>
                                <AlertTriangle className="h-10 w-10 text-red-500" />
                            </div>

                            <Separator />

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-700"><User className="h-4 w-4 text-gray-400" /> {penalty.user.name}</div>
                                <div className="flex items-center gap-2 text-gray-700"><Building className="h-4 w-4 text-gray-400" /> {penalty.somiti.name}</div>
                                <div className="flex items-center gap-2 text-gray-700"><CalendarDays className="h-4 w-4 text-gray-400" /> Created {new Date(penalty.created_at).toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-gray-700"><Hash className="h-4 w-4 text-gray-400" /> Reference #PN-{String(penalty.id).padStart(6, '0')}</div>
                            </div>

                            {penalty.notes && (
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Notes</p>
                                    <p className="text-gray-700 italic">{penalty.notes}</p>
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
                                <p className="font-medium">{penalty.approver?.name || '—'}</p>
                                {penalty.approved_at && <p className="text-xs text-gray-400 mt-1">{new Date(penalty.approved_at).toLocaleString()}</p>}
                            </div>
                            {can_decide && penalty.status === 'pending' && (
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
                                Approving books the penalty as Penalty Income (Debit Cash / Credit Penalty Income).
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
