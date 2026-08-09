import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, Plus, AlertTriangle } from 'lucide-react';

interface Penalty {
    id: number;
    amount: string | number;
    type: 'late_deposit' | 'loan_default' | 'other' | null;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user: { name: string };
    somiti: { id: number; name: string };
}

interface Props {
    penalties: { data: Penalty[] };
}

const typeLabels: Record<string, string> = {
    late_deposit: 'Late Deposit',
    loan_default: 'Loan Default',
    other: 'Other',
};

export default function PenaltiesIndex({ penalties }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Penalties', url: '#' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penalties" />
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                            <AlertTriangle className="h-8 w-8" />
                            Penalties
                        </h1>
                        <p className="text-gray-500 mt-2">Late deposit, loan default, and other penalty charges.</p>
                    </div>
                    <Link href="/penalties/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> New Penalty
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Penalty Charges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-teal-50/50 border-y">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Member</th>
                                        <th className="px-4 py-3 font-semibold">Society</th>
                                        <th className="px-4 py-3 font-semibold">Type</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Created</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {penalties.data.length > 0 ? penalties.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-teal-50/20 transition-colors">
                                            <td className="px-4 py-4 font-medium text-gray-900">{p.user.name}</td>
                                            <td className="px-4 py-4 text-gray-600">{p.somiti.name}</td>
                                            <td className="px-4 py-4 text-gray-600">{typeLabels[p.type ?? 'other']}</td>
                                            <td className="px-4 py-4 font-mono font-semibold text-red-600">{Number(p.amount).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className={`capitalize font-medium ${
                                                    p.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200'
                                                    : p.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>{p.status}</Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Link href={`/penalties/${p.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <Eye className="h-4 w-4" />
                                                        <span className="sr-only">View</span>
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">No penalties recorded.</td></tr>
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
