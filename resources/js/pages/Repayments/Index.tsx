import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, HandCoins } from 'lucide-react';

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
    user: { name: string };
    loan: { id: number; amount: string | number; interest_rate: string | number };
    somiti: { id: number; name: string };
}

interface Props {
    repayments: { data: Repayment[] };
}

export default function RepaymentsIndex({ repayments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Loan Repayments', url: '#' }];

    const badgeClass = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loan Repayments" />
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                        <HandCoins className="h-8 w-8" />
                        Loan Repayments
                    </h1>
                    <p className="text-gray-500 mt-2">Track loan repayment requests across your societies.</p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Repayment Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-teal-50/50 border-y">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Member</th>
                                        <th className="px-4 py-3 font-semibold">Society</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Principal</th>
                                        <th className="px-4 py-3 font-semibold">Interest</th>
                                        <th className="px-4 py-3 font-semibold">Payment Date</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {repayments.data.length > 0 ? repayments.data.map((r) => (
                                        <tr key={r.id} className="hover:bg-teal-50/20 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900">{r.user.name}</td>
                                            <td className="px-4 py-4 text-gray-600">{r.somiti.name}</td>
                                            <td className="px-4 py-4 font-mono font-semibold">{Number(r.amount).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-gray-600">{Number(r.principal_portion).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-gray-600">{Number(r.interest_portion).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-gray-500">{new Date(r.payment_date).toLocaleDateString()}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`capitalize font-medium ${badgeClass(r.status)}`}>{r.status}</Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link href={`/repayments/${r.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View</span>
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500 italic">No repayment requests found.</td>
                                        </tr>
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
