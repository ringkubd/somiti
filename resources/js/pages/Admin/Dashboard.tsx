import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, Wallet, TrendingDown, ShieldAlert, Activity } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Stats {
    total_users: number;
    total_somitis: number;
    total_savings: number;
    total_loans: number;
    active_somitis: number;
    pending_approvals: number;
}

interface Props {
    stats: Stats;
    recentSomitis: any[];
    recentUsers: any[];
}

export default function AdminDashboard({ stats, recentSomitis, recentUsers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Super Admin', href: '#' },
        { title: 'Monitoring Dashboard', href: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Monitoring" />
            
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-red-600">Global System Monitor</h1>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">
                        <Activity className="h-3 w-3 animate-pulse" />
                        Live System Pulse
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-500 uppercase">Total Users</p>
                                <Users className="h-4 w-4 text-blue-500" />
                            </div>
                            <p className="text-2xl font-bold mt-2">{stats.total_users}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-500 uppercase">Total Somitis</p>
                                <Building className="h-4 w-4 text-purple-500" />
                            </div>
                            <p className="text-2xl font-bold mt-2">{stats.total_somitis}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-500 uppercase">Global Savings</p>
                                <Wallet className="h-4 w-4 text-green-500" />
                            </div>
                            <p className="text-2xl font-bold mt-2">${Number(stats.total_savings).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-500 uppercase">Active Loans</p>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </div>
                            <p className="text-2xl font-bold mt-2">${Number(stats.total_loans).toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-500 uppercase">Active Somitis</p>
                                <Activity className="h-4 w-4 text-emerald-500" />
                            </div>
                            <p className="text-2xl font-bold mt-2">{stats.active_somitis}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-500 uppercase">Pending Approvals</p>
                                <ShieldAlert className="h-4 w-4 text-orange-500" />
                            </div>
                            <p className="text-2xl font-bold mt-2">{stats.pending_approvals}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recently Created Somitis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentSomitis.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">{s.name}</p>
                                            <p className="text-xs text-gray-500">By {s.created_by?.name || 'Unknown'}</p>
                                        </div>
                                        <Badge>{s.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Newest Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentUsers.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                        <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {children}
        </span>
    );
}
