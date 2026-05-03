import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, CheckCircle, Clock, Building, Calendar, Wallet, BarChart3, Layers } from 'lucide-react';

interface Fdr {
    id: number;
    fdr_number: string;
    amount: string;
    status: string;
}

interface Investment {
    id: number;
    type: string;
    amount: string;
    start_date: string;
    maturity_date: string | null;
    expected_return: string;
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    created_at: string;
    approved_at: string | null;
    somiti: {
        name: string;
    };
    financial_year: {
        title: string;
    };
    approver: {
        name: string;
    } | null;
    approvals: any[];
    fdrs: Fdr[];
}

interface ShowProps {
    investment: Investment;
}

export default function InvestmentShow({ investment }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Investments', url: '/investments' },
        { label: `Investment #${investment.id}`, url: '#' }
    ];

    const getStatusBadgeClass = (status: string) => {
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
            <Head title={`Investment #${investment.id}`} />
            
            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/investments">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-indigo-600">Investment Details</h1>
                    <Badge className={`ml-auto px-3 py-1 capitalize text-sm ${getStatusBadgeClass(investment.status)}`}>
                        {investment.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Portfolio Overview</CardTitle>
                            <CardDescription>Details of the capital investment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Invested Amount</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ${parseFloat(investment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Expected Return</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        ${parseFloat(investment.expected_return).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Wallet className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Investment Type</p>
                                        <p className="font-medium capitalize">{investment.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Building className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Somiti</p>
                                        <p className="font-medium">{investment.somiti.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Start Date</p>
                                        <p className="font-medium">{new Date(investment.start_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <BarChart3 className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Maturity Date</p>
                                        <p className="font-medium">{investment.maturity_date ? new Date(investment.maturity_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {investment.fdrs.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Layers className="h-5 w-5 text-gray-400" />
                                            <h3 className="font-semibold">Linked FDRs</h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {investment.fdrs.map(fdr => (
                                                <div key={fdr.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center text-sm">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{fdr.fdr_number}</p>
                                                        <p className="text-gray-500">Amount: ${parseFloat(fdr.amount).toLocaleString()}</p>
                                                    </div>
                                                    <Badge variant="outline" className="capitalize">{fdr.status}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sidebar Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Trail</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>Created: {new Date(investment.created_at).toLocaleDateString()}</span>
                                </div>
                                {investment.approved_at && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Approved: {new Date(investment.approved_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="pt-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Financial Year</p>
                                    <p className="font-medium">{investment.financial_year.title}</p>
                                </div>
                            </div>

                            {investment.status === 'pending' && (
                                <div className="pt-4 flex flex-col gap-2 border-t">
                                    <Button className="w-full bg-green-600 hover:bg-green-700">Approve Investment</Button>
                                    <Button variant="outline" className="w-full text-red-600">Reject</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
