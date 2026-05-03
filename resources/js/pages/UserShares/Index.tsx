import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, PieChart } from 'lucide-react';

interface UserShare {
    id: number;
    share_count: number;
    status: string;
    created_at: string;
    somiti: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
    financial_year: {
        title: string;
    };
}

interface IndexProps {
    userShares: {
        data: UserShare[];
        links: any;
    };
}

export default function UserSharesIndex({ userShares }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Member Shares', url: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Shares" />
            
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-emerald-600 flex items-center gap-2">
                            <PieChart className="h-8 w-8" />
                            Member Shares
                        </h1>
                        <p className="text-gray-500 mt-2">Ownership distribution across your Somitis.</p>
                    </div>
                    <Link href="/user-shares/create">
                        <Button>Assign Shares</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Share Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Member</th>
                                        <th className="px-4 py-3 font-semibold">Somiti</th>
                                        <th className="px-4 py-3 font-semibold text-center">Share Count</th>
                                        <th className="px-4 py-3 font-semibold">Financial Year</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {userShares.data.length > 0 ? (
                                        userShares.data.map((us) => (
                                            <tr key={us.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 font-medium text-gray-900">
                                                    {us.user.name}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {us.somiti.name}
                                                </td>
                                                <td className="px-4 py-4 text-center font-bold text-emerald-700 text-lg">
                                                    {us.share_count}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {us.financial_year.title}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline" className="capitalize bg-emerald-50 text-emerald-700 border-emerald-100">
                                                        {us.status || 'Active'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link href={`/user-shares/${us.id}`}>
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
                                                No share records found.
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
