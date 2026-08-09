import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, User, Building, Calendar, PieChart, ShieldCheck } from 'lucide-react';

interface UserShare {
    id: number;
    share_count: number;
    status: string;
    created_at: string;
    somiti: {
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

interface ShowProps {
    userShare: UserShare;
}

export default function UserShareShow({ userShare }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Member Shares', url: '/user-shares' },
        { label: `Share Record #${userShare.id}`, url: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Share Record #${userShare.id}`} />
            
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/user-shares">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-emerald-600">Share Certificate</h1>
                    <Badge className="ml-auto px-3 py-1 capitalize text-sm bg-emerald-100 text-emerald-800 border-emerald-200">
                        {userShare.status || 'Active'}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Holding Details</CardTitle>
                            <CardDescription>Official record of member equity</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex items-center justify-center py-8 bg-emerald-50 rounded-xl border-2 border-dashed border-emerald-200 relative overflow-hidden">
                                <PieChart className="absolute -right-8 -bottom-8 h-48 w-48 text-emerald-100/50" />
                                <div className="text-center z-10">
                                    <p className="text-sm text-emerald-600 uppercase font-bold tracking-widest mb-1">Total Shares Held</p>
                                    <p className="text-7xl font-black text-emerald-700">{userShare.share_count}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <User className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Shareholder</p>
                                        <p className="font-medium text-lg">{userShare.user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Building className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Somiti</p>
                                        <p className="font-medium text-lg">{userShare.somiti.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Financial Year</p>
                                        <p className="font-medium text-lg">{userShare.financial_year.title}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <ShieldCheck className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Record Date</p>
                                        <p className="font-medium text-lg">{new Date(userShare.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Member Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-gray-50 rounded-lg border text-sm space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Membership ID</p>
                                    <p className="font-medium">MBR-{userShare.user.id.toString().padStart(4, '0')}</p>
                                </div>
                                <Separator />
                                <p className="text-xs text-gray-500 italic">
                                    This record represents the member's legal shareholding in the cooperative society for the specified financial year.
                                </p>
                            </div>
                            
                            <Button className="w-full" variant="outline">Print Certificate</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
