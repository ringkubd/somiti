import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Building, Landmark, Percent, CalendarClock, HandCoins } from 'lucide-react';

interface Approval {
    id: number;
    status: string;
    comment: string | null;
    decided_at: string;
    user: {
        name: string;
    };
}

interface Loan {
    id: number;
    amount: string;
    interest_rate: string;
    interest_type: string;
    term_months: number;
    outstanding_balance: string;
    purpose: string;
    status: 'pending' | 'approved' | 'disbursed' | 'rejected' | 'closed';
    created_at: string;
    approved_at: string | null;
    due_date: string | null;
    somiti: {
        name: string;
    };
    user: {
        name: string;
    };
    financial_year: {
        title: string;
    };
    approver: {
        name: string;
    } | null;
    approvals: Approval[];
}

interface ShowProps {
    loan: Loan;
}

export default function LoanShow({ loan }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Loans', url: '/loans' },
        { label: `Loan #${loan.id}`, url: '#' }
    ];

    const getStatusBadgeClass = (status: string) => {
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
            <Head title={`Loan #${loan.id}`} />
            
            <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/loans">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-red-600">Loan Details</h1>
                    <Badge className={`ml-auto px-3 py-1 capitalize text-sm ${getStatusBadgeClass(loan.status)}`}>
                        {loan.status}
                    </Badge>
                    <Link href={`/loans/${loan.id}/repayments`}>
                        <Button variant="outline" size="sm" className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50">
                            <HandCoins className="h-4 w-4" />
                            Repayments
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Loan Application Summary</CardTitle>
                            <CardDescription>Comprehensive view of the credit facility</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Principal Amount</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ${parseFloat(loan.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Outstanding Balance</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        ${parseFloat(loan.outstanding_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Percent className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Interest Rate</p>
                                        <p className="font-medium">{loan.interest_rate}% ({loan.interest_type})</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <CalendarClock className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Term Length</p>
                                        <p className="font-medium">{loan.term_months} Months</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Member / Borrower</p>
                                        <p className="font-medium">{loan.user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Building className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Somiti</p>
                                        <p className="font-medium">{loan.somiti.name}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Loan Purpose</p>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border italic">
                                    {loan.purpose || "No purpose specified."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status/Approval Sidebar Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Administrative Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">Applied: {new Date(loan.created_at).toLocaleDateString()}</span>
                                </div>
                                {loan.approved_at && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm">Approved: {new Date(loan.approved_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {loan.due_date && (
                                    <div className="flex items-center gap-2 text-red-600 font-medium">
                                        <Landmark className="h-4 w-4" />
                                        <span className="text-sm">Due Date: {new Date(loan.due_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase text-gray-500">Decision History</p>
                                {loan.approvals.length > 0 ? (
                                    <div className="space-y-4">
                                        {loan.approvals.map((approval) => (
                                            <div key={approval.id} className="text-sm border-l-2 border-gray-200 pl-3">
                                                <p className="font-medium">{approval.user.name}</p>
                                                <p className="text-xs text-gray-500">{approval.status} • {new Date(approval.decided_at).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Pending review.</p>
                                )}
                            </div>

                            {loan.status === 'pending' && (
                                <div className="pt-4 flex flex-col gap-2">
                                    <Button className="w-full bg-green-600 hover:bg-green-700">Approve Loan</Button>
                                    <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">Reject</Button>
                                </div>
                            )}

                            {loan.status === 'approved' && (
                                <div className="pt-4">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Disburse Funds</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
