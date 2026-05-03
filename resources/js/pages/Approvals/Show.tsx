import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, ShieldCheck, CheckCircle2, XCircle, Clock, Hash, MessageSquare, ExternalLink } from 'lucide-react';

interface Approval {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    comment: string | null;
    decided_at: string | null;
    approvable_type: string;
    approvable_id: number;
    created_at: string;
    user: {
        name: string;
    };
}

interface ShowProps {
    approval: Approval;
}

export default function ApprovalShow({ approval }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'My Approvals', url: '/approvals' },
        { label: `Decision #${approval.id}`, url: '#' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="h-6 w-6 text-green-600" />;
            case 'rejected': return <XCircle className="h-6 w-6 text-red-600" />;
            case 'pending': return <Clock className="h-6 w-6 text-yellow-600" />;
            default: return null;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRefLabel = (type: string) => {
        const parts = type.split('\\');
        return parts[parts.length - 1];
    };

    const getRefUrl = () => {
        const label = getRefLabel(approval.approvable_type).toLowerCase();
        if (label.includes('deposit')) return `/deposits/${approval.approvable_id}`;
        if (label.includes('loan')) return `/loans/${approval.approvable_id}`;
        if (label.includes('investment')) return `/investments/${approval.approvable_id}`;
        if (label.includes('share')) return `/user-shares/${approval.approvable_id}`;
        return '#';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Decision #${approval.id}`} />
            
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/approvals">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-700">Approval Audit</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Decision Details</CardTitle>
                            <CardDescription>Formal record of the administrative action</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-teal-50 rounded-xl border-2 border-teal-100">
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(approval.status)}
                                    <div className="space-y-1">
                                        <p className="text-xs text-teal-600 font-bold uppercase">Final Decision</p>
                                        <p className="text-3xl font-black text-gray-900 capitalize">{approval.status}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Decided By</p>
                                    <p className="font-medium">{approval.user.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{approval.decided_at ? new Date(approval.decided_at).toLocaleString() : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Commentary</p>
                                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border italic">
                                            {approval.comment || "No comment provided for this decision."}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                            <Hash className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Related Transaction</p>
                                            <p className="font-medium text-lg">{getRefLabel(approval.approvable_type)} #{approval.approvable_id}</p>
                                        </div>
                                    </div>
                                    <Link href={getRefUrl()}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            View Source <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Log</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Internal Reference</p>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Record ID:</span>
                                    <span className="font-mono">APP-{approval.id.toString().padStart(6, '0')}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2 pt-1">
                                    <span className="text-gray-500">Created At:</span>
                                    <span>{new Date(approval.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-xs">
                                Decisions are permanent once finalized to maintain financial integrity.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
