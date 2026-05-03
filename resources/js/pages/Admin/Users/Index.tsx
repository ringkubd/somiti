import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, UserX, UserCheck, ShieldCheck } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        links: any[];
    };
}

export default function UsersIndex({ users }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'User Management', href: '#' }
    ];

    const { patch, processing } = useForm();

    const updateStatus = (id: number, status: string, role: string) => {
        patch(`/admin/users/${id}`, {
            data: { status, role },
            preserveScroll: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-gray-500 mt-2">Manage user roles, block access, or ban accounts</p>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="p-4 font-semibold text-sm">User</th>
                                    <th className="p-4 font-semibold text-sm">Role</th>
                                    <th className="p-4 font-semibold text-sm">Status</th>
                                    <th className="p-4 font-semibold text-sm">Joined</th>
                                    <th className="p-4 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{user.name}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Select 
                                                defaultValue={user.role} 
                                                onValueChange={(val) => updateStatus(user.id, user.status, val)}
                                            >
                                                <SelectTrigger className="w-32 h-8 text-xs font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.status === 'active' ? (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="text-orange-600 border-orange-200 hover:bg-orange-50 h-8 gap-1"
                                                        onClick={() => updateStatus(user.id, 'blocked', user.role)}
                                                        disabled={processing}
                                                    >
                                                        <ShieldAlert className="h-3 w-3" /> Block
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="text-green-600 border-green-200 hover:bg-green-50 h-8 gap-1"
                                                        onClick={() => updateStatus(user.id, 'active', user.role)}
                                                        disabled={processing}
                                                    >
                                                        <UserCheck className="h-3 w-3" /> Unblock
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    className="h-8 gap-1"
                                                    onClick={() => {
                                                        if(confirm('Permanently BAN this user?')) {
                                                            updateStatus(user.id, 'banned', user.role);
                                                        }
                                                    }}
                                                    disabled={processing || user.status === 'banned'}
                                                >
                                                    <UserX className="h-3 w-3" /> Ban
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
