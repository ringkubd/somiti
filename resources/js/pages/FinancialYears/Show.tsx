import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, CalendarDays, Building, Info } from 'lucide-react';

interface FinancialYear {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    somiti: {
        name: string;
    };
}

interface ShowProps {
    financialYear: FinancialYear;
}

export default function FinancialYearShow({ financialYear }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Financial Years', url: '/financial-years' },
        { label: financialYear.title, url: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Financial Year ${financialYear.title}`} />
            
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/financial-years">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-amber-700">Financial Year Details</h1>
                    <Badge className={`ml-auto px-3 py-1 text-sm ${financialYear.is_active ? 'bg-green-600' : ''}`} variant={financialYear.is_active ? "default" : "outline"}>
                        {financialYear.is_active ? 'Currently Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Period Configuration</CardTitle>
                            <CardDescription>Fiscal dates for the {financialYear.title} period</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1 p-4 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-xs text-amber-600 uppercase font-bold tracking-wider">Start Date</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Date(financialYear.start_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                                <div className="space-y-1 p-4 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-xs text-amber-600 uppercase font-bold tracking-wider">End Date</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {new Date(financialYear.end_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Building className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Associated Somiti</p>
                                        <p className="font-medium text-lg">{financialYear.somiti.name}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-gray-50 rounded-lg border text-sm flex gap-3">
                                <Info className="h-5 w-5 text-blue-500 shrink-0" />
                                <p className="text-xs text-gray-500">
                                    Only one financial year can be active at a time per Somiti. Activating this year will deactivate any other active year.
                                </p>
                            </div>
                            
                            {!financialYear.is_active && (
                                <Button className="w-full bg-amber-600 hover:bg-amber-700">Set as Active Year</Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
