import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, ShieldCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Approval {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    comment: string | null;
    decided_at: string | null;
    approvable_type: string;
    approvable_id: number;
    created_at: string;
}

interface IndexProps {
    approvals: {
        data: Approval[];
        links: any;
    };
}

export default function ApprovalsIndex({ approvals }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'My Approvals', url: '#' }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
            case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
            default: return null;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getRefLabel = (type: string) => {
        const parts = type.split('\\');
        return parts[parts.length - 1];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Approvals" />
            
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                            <ShieldCheck className="h-8 w-8" />
                            My Approvals
                        </h1>
                        <p className="text-gray-500 mt-2">Track decisions you've made on transactions.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>Decision History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs text-gray-700 uppercase bg-teal-50/50 border-y">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Decision Date</th>
                                        <th className="px-4 py-3 font-semibold">Transaction</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Comment</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {approvals.data.length > 0 ? (
                                        approvals.data.map((app) => (
                                            <tr key={app.id} className="hover:bg-teal-50/20 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap text-gray-500">
                                                    {app.decided_at ? new Date(app.decided_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-gray-900">
                                                    {getRefLabel(app.approvable_type)} #{app.approvable_id}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant="outline" className={`flex items-center w-fit gap-1 capitalize font-medium ${getStatusBadgeClass(app.status)}`}>
                                                        {getStatusIcon(app.status)}
                                                        {app.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-gray-600 max-w-xs truncate italic">
                                                    {app.comment || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Link href={`/approvals/${app.id}`}>
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
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                                                No approval records found.
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
