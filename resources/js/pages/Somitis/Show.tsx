import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type BreadcrumbItem } from '@/types';
import { Users, UserCog, Settings, ArrowLeft, Plus, Wallet, TrendingUp, TrendingDown, PieChart, Scale, ReceiptText, CalendarDays, ShieldCheck, Banknote, MessageCircle } from 'lucide-react';

interface SomitiMember {
    id: number;
    role: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface SomitiManager {
    id: number;
    user: {
        id: number;
        name: string;
    };
}

interface Somiti {
    id: number;
    name: string;
    unique_code: string;
    status: string;
    created_at: string;
    members: SomitiMember[];
    managers: SomitiManager[];
}

interface ShowProps {
    somiti: Somiti;
}

export default function SomitiShow({ somiti }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: '#' }
    ];

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={somiti.name} />
            
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/somitis">
                            <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight">{somiti.name}</h1>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {somiti.status}
                                </Badge>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-mono tracking-wide">
                                    {somiti.unique_code}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">ID: {somiti.unique_code} • Since {new Date(somiti.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Invite code: <span className="font-mono font-bold text-purple-700">{somiti.unique_code}</span>
                                <button className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                                    onClick={() => { navigator.clipboard?.writeText(somiti.unique_code); alert('Code copied!'); }}>
                                    Copy
                                </button>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/somitis/${somiti.id}/chat`}>
                            <Button variant="outline" size="sm" className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50">
                                <MessageCircle className="h-4 w-4" />
                                Chat
                            </Button>
                        </Link>
                        <Link href={`/somitis/${somiti.id}/edit`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Settings
                            </Button>
                        </Link>
                        <Link href={`/deposits/create?somiti_id=${somiti.id}`}>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Transaction
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500">Total Members</p>
                                <Users className="h-4 w-4 text-blue-500" />
                            </div>
                            <p className="text-2xl font-bold mt-1">{somiti.members.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500">Active Savings</p>
                                <Wallet className="h-4 w-4 text-green-500" />
                            </div>
                            <p className="text-2xl font-bold mt-1">$0.00</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500">Active Loans</p>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </div>
                            <p className="text-2xl font-bold mt-1">$0.00</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-500">Total Shares</p>
                                <PieChart className="h-4 w-4 text-emerald-500" />
                            </div>
                            <p className="text-2xl font-bold mt-1">0</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Team/Members Section */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Users className="h-5 w-5 text-gray-500" />
                                    Society Members
                                </CardTitle>
                                <CardDescription>Manage members and their roles</CardDescription>
                            </div>
                            <Link href={`/somitis/${somiti.id}/members/create`}>
                                <Button variant="ghost" size="sm" className="text-blue-600 h-8 gap-1">
                                    <Plus className="h-4 w-4" /> Add Member
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {somiti.members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold">{member.user.name}</p>
                                                <p className="text-xs text-gray-500">{member.user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary" className="capitalize text-[10px]">
                                                {member.role}
                                            </Badge>
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500">Remove</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Management Section */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UserCog className="h-5 w-5 text-gray-500" />
                                    Active Managers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {somiti.managers.map((manager) => (
                                    <div key={manager.id} className="flex items-center gap-3 p-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium">{manager.user.name}</span>
                                    </div>
                                ))}
                                <Separator />
                                <Button variant="outline" size="sm" className="w-full">Manage Roles</Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 text-white">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Access</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Link href={`/somitis/${somiti.id}/settings`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <Settings className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Settings</p>
                                </Link>
                                <Link href={`/somitis/${somiti.id}/reports/summary`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <Scale className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Reports</p>
                                </Link>
                                <Link href={`/somitis/${somiti.id}/workflows`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <ShieldCheck className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Workflows</p>
                                </Link>
                                <Link href={`/somitis/${somiti.id}/chat`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <MessageCircle className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Chat</p>
                                </Link>
                                <Link href={`/somitis/${somiti.id}/reports/trial-balance`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <ReceiptText className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Trial Balance</p>
                                </Link>
                                <Link href="/user-shares" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <PieChart className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Shares</p>
                                </Link>
                                <Link href="/deposits" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <Wallet className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Deposits</p>
                                </Link>
                                <Link href="/loans" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <TrendingDown className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Loans</p>
                                </Link>
                                <Link href="/investments" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <TrendingUp className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">Investments</p>
                                </Link>
                                <Link href="/financial-years" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <CalendarDays className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs font-semibold">FY</p>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
