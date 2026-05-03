import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Building, Calendar, MessageSquare, Printer } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Approval {
    id: number;
    status: string;
    comment: string | null;
    decided_at: string;
    user: {
        name: string;
    };
}

interface Deposit {
    id: number;
    amount: string;
    month: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    approved_at: string | null;
    somiti: {
        id: number;
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
    deposit: Deposit;
}

export default function DepositShow({ deposit }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Deposits', href: '/deposits' },
        { title: `Deposit #${deposit.id}`, href: '#' }
    ];

    const { data, setData, processing } = useForm({
        status: '',
        comment: ''
    });

    const handleApproval = (status: 'approved' | 'rejected') => {
        const pendingApproval = deposit.approvals.find(a => a.status === 'pending');
        
        if (!pendingApproval) {
            alert('No pending approval found for this deposit.');
            return;
        }

        router.patch(`/approvals/${pendingApproval.id}`, {
            status: status,
            comment: data.comment 
        }, {
            onSuccess: () => {
                setData('comment', '');
            }
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
            default: return null;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Deposit #${deposit.id}`} />
            
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/deposits">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Deposit Details</h1>
                    <Badge className={`ml-auto px-3 py-1 capitalize text-sm ${getStatusBadgeClass(deposit.status)}`}>
                        {deposit.status}
                    </Badge>
                    {deposit.status === 'approved' && (
                        <Link href={`/somitis/${deposit.somiti.id}/receipts/deposit/${deposit.id}`}>
                            <Button variant="outline" size="sm" className="gap-2"><Printer className="h-4 w-4" />Receipt</Button>
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Transaction Summary</CardTitle>
                            <CardDescription>Details of the savings deposit</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${parseFloat(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Transaction Date</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {new Date(deposit.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Member</p>
                                        <p className="font-medium">{deposit.user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Building className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Somiti</p>
                                        <p className="font-medium">{deposit.somiti.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Financial Year / Month</p>
                                        <p className="font-medium">{deposit.financial_year.title} - {deposit.month}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Badge className="h-5 w-5 bg-transparent border-none text-gray-600 flex items-center justify-center p-0">#</Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                                        <p className="font-medium capitalize">{deposit.type}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status/Approval Sidebar Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Control</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {deposit.status === 'pending' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-gray-500">Decision Comment</Label>
                                        <Textarea 
                                            placeholder="Reason for approval/rejection..." 
                                            value={data.comment}
                                            onChange={(e) => setData('comment', e.target.value)}
                                            className="text-sm font-sans"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 border-t pt-4 font-sans">
                                        <Button 
                                            className="w-full bg-green-600 hover:bg-green-700 font-bold"
                                            onClick={() => handleApproval('approved')}
                                            disabled={processing}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve Deposit
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="w-full text-red-600 hover:bg-red-50 border-red-200 font-bold"
                                            onClick={() => handleApproval('rejected')}
                                            disabled={processing}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Reject Transaction
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-4 font-sans">
                                <p className="text-xs font-bold uppercase text-gray-500">History</p>
                                {deposit.approvals.length > 0 ? (
                                    <div className="relative space-y-4">
                                        {deposit.approvals.map((approval, idx) => (
                                            <div key={approval.id} className="flex gap-3 relative pb-4 border-b last:border-0 border-dashed">
                                                <div className="z-10 bg-white p-0.5">
                                                    {getStatusIcon(approval.status)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold">{approval.user.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {approval.decided_at ? new Date(approval.decided_at).toLocaleString() : 'Pending'}
                                                    </p>
                                                    {approval.comment && (
                                                        <p className="text-xs mt-1 text-gray-600 bg-gray-50 p-2 rounded italic">"{approval.comment}"</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No approval records yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
