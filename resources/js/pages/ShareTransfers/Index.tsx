import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Plus } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Somiti {
    id: number;
    name: string;
}

interface Transfer {
    id: number;
    somiti: Somiti;
    from_user: User | null;
    to_user: User;
    quantity: number;
    price_per_share: string;
    transfer_date: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface Props {
    transfers: {
        data: Transfer[];
        links: any[];
    };
}

export default function ShareTransfersIndex({ transfers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Share Transfers', href: '/share-transfers' }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Share Transfers" />
            
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Share Transfers Market</h1>
                        <p className="text-sm text-gray-500">Manage peer-to-peer share exchanges within your societies.</p>
                    </div>
                    <Link href="/share-transfers/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Request Transfer
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transfer History</CardTitle>
                        <CardDescription>A complete log of all share movement requests and executions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transfers.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3">Society</th>
                                            <th className="px-6 py-3">Exchange</th>
                                            <th className="px-6 py-3">Quantity</th>
                                            <th className="px-6 py-3">Price / Share</th>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {transfers.data.map((transfer) => (
                                            <tr key={transfer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{transfer.somiti.name}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{transfer.from_user ? transfer.from_user.name : 'Treasury'}</span>
                                                        <ArrowRightLeft className="h-3 w-3 text-gray-400" />
                                                        <span className="font-semibold">{transfer.to_user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold">{transfer.quantity}</td>
                                                <td className="px-6 py-4 font-mono">${parseFloat(transfer.price_per_share).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(transfer.transfer_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(transfer.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ArrowRightLeft className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No transfers found</h3>
                                <p className="text-gray-500 mb-4">There are no share transfer records in your societies.</p>
                                <Link href="/share-transfers/create">
                                    <Button variant="outline">Initiate the first transfer</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
