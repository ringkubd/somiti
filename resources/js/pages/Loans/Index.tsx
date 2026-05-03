import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, TrendingDown } from 'lucide-react';

interface Loan {
    id: number;
    amount: string;
    interest_rate: string;
    term_months: number;
    status: 'pending' | 'approved' | 'disbursed' | 'rejected' | 'closed';
    created_at: string;
    somiti: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
}

interface IndexProps {
    loans: {
        data: Loan[];
        links: any;
    };
}

export default function LoansIndex({ loans }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Loans', url: '#' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'disbursed': return 'bg-green-100 text-green-800 border-green-200';
            case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Loans" />
            
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                            <TrendingDown className="h-8 w-8" />
                            Loans
                        </h1>
                        <p className="text-gray-500 mt-2">Track and manage member loan applications.</p>
                    </div>
                    <Link href="/loans/create">
                        <Button>New Loan</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Recent Loan Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                        <th className="px-4 py-3 font-semibold">Member</th>
                                        <th className="px-4 py-3 font-semibold">Somiti</th>
                                        <th className="px-4 py-3 font-semibold text-right">Amount</th>
                                        <th className="px-4 py-3 font-semibold text-center">Term</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {loans.data.length > 0 ? (
                                        loans.data.map((loan) => (
                                            <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {new Date(loan.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-900">
                                                    {loan.user.name}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {loan.somiti.name}
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-gray-900 text-right">
                                                    ${parseFloat(loan.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4 text-center text-gray-600">
                                                    {loan.term_months}m @ {loan.interest_rate}%
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline" className={`${getStatusColor(loan.status)} capitalize`}>
                                                        {loan.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link href={`/loans/${loan.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">View</span>
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">
                                                No loan records found.
                                            </td>
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
