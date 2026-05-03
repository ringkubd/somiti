import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, Briefcase } from 'lucide-react';

interface Investment {
    id: number;
    amount: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    start_date: string;
    maturity_date: string | null;
    created_at: string;
    somiti: {
        id: number;
        name: string;
    };
}

interface IndexProps {
    investments: {
        data: Investment[];
        links: any;
    };
}

export default function InvestmentsIndex({ investments }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Investments', url: '#' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Investments" />
            
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-indigo-600 flex items-center gap-2">
                            <Briefcase className="h-8 w-8" />
                            Investments
                        </h1>
                        <p className="text-gray-500 mt-2">Track society-level investments and maturity dates.</p>
                    </div>
                    <Link href="/investments/create">
                        <Button>New Investment</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Recent Investments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Start Date</th>
                                        <th className="px-4 py-3 font-semibold">Type</th>
                                        <th className="px-4 py-3 font-semibold">Somiti</th>
                                        <th className="px-4 py-3 font-semibold text-right">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Maturity</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {investments.data.length > 0 ? (
                                        investments.data.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {new Date(inv.start_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-900 capitalize">
                                                    {inv.type}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {inv.somiti.name}
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-gray-900 text-right">
                                                    ${parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {inv.maturity_date ? new Date(inv.maturity_date).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline" className={`${getStatusColor(inv.status)} capitalize`}>
                                                        {inv.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link href={`/investments/${inv.id}`}>
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
                                                No investment records found.
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
