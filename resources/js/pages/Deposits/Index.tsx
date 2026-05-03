import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye } from 'lucide-react';

interface Deposit {
    id: number;
    amount: string;
    month: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
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
    deposits: {
        data: Deposit[];
        links: any;
    };
}

export default function DepositsIndex({ deposits }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Deposits', url: '#' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Deposits" />
            
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Deposits</h1>
                        <p className="text-gray-500 mt-2">View and manage member savings deposits across your Somitis.</p>
                    </div>
                    <Link href="/deposits/create">
                        <Button>New Deposit</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Recent Deposits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Date</th>
                                        <th className="px-4 py-3 font-semibold">Member</th>
                                        <th className="px-4 py-3 font-semibold">Somiti</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {deposits.data.length > 0 ? (
                                        deposits.data.map((deposit) => (
                                            <tr key={deposit.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {new Date(deposit.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-900">
                                                    {deposit.user.name}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {deposit.somiti.name}
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-gray-900">
                                                    ${parseFloat(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline" className={`${getStatusColor(deposit.status)} capitalize`}>
                                                        {deposit.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link href={`/deposits/${deposit.id}`}>
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
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                                                No deposits found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Simple Pagination Placeholder */}
                        {deposits.data.length > 0 && (
                            <div className="mt-6 flex items-center justify-between border-t pt-4">
                                <p className="text-xs text-gray-500">Showing {deposits.data.length} records</p>
                                <div className="flex gap-2">
                                    {/* Link-based pagination would go here */}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
