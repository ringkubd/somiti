import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, CalendarDays } from 'lucide-react';

interface FinancialYear {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    share_value: string;
    somiti: {
        id: number;
        name: string;
    };
}

interface IndexProps {
    financialYears: {
        data: FinancialYear[];
        links: any;
    };
}

export default function FinancialYearsIndex({ financialYears }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Financial Years', url: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Years" />
            
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-amber-700 flex items-center gap-2">
                            <CalendarDays className="h-8 w-8" />
                            Financial Years
                        </h1>
                        <p className="text-gray-500 mt-2">Accounting periods for your Somitis.</p>
                    </div>
                    <Link href="/financial-years/create">
                        <Button>New Financial Year</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Accounting Periods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Title</th>
                                        <th className="px-4 py-3 font-semibold">Somiti</th>
                                        <th className="px-4 py-3 font-semibold">Share Price</th>
                                        <th className="px-4 py-3 font-semibold">Period</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {financialYears.data.length > 0 ? (
                                        financialYears.data.map((fy) => (
                                            <tr key={fy.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 font-bold text-gray-900">
                                                    {fy.title}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {fy.somiti.name}
                                                </td>
                                                <td className="px-4 py-4 font-mono font-bold text-amber-600">
                                                    ${parseFloat(fy.share_value).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-gray-600">
                                                    {new Date(fy.start_date).toLocaleDateString()} - {new Date(fy.end_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant={fy.is_active ? "default" : "outline"} className={fy.is_active ? "bg-green-600" : ""}>
                                                        {fy.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/financial-years/${fy.id}`}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <Eye className="h-4 w-4" />
                                                                <span className="sr-only">View</span>
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/financial-years/${fy.id}/edit`}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                                                No financial years found.
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
