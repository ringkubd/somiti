import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Eye, Plus, Landmark } from 'lucide-react';

interface Account {
    id: number; bank_name: string; branch_name: string | null;
    account_number: string; account_type: string; current_balance: string;
    is_active: boolean;
    somiti: { id: number; name: string };
}

interface Props { accounts: { data: Account[]; links: any } }

export default function BankAccountsIndex({ accounts }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Bank Accounts', url: '#' }];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Accounts" />
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Landmark className="h-8 w-8" />Bank Accounts</h1>
                        <p className="text-gray-500 mt-2">Manage bank accounts for your somitis</p>
                    </div>
                    <Link href="/bank-accounts/create"><Button>Add Account</Button></Link>
                </div>
                <Card>
                    <CardHeader className="pb-3"><CardTitle>All Accounts</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3">Somiti</th>
                                        <th className="px-4 py-3">Bank</th>
                                        <th className="px-4 py-3">Branch</th>
                                        <th className="px-4 py-3">Account #</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">Balance</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {accounts.data.map(a => (
                                        <tr key={a.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 font-medium">{a.somiti.name}</td>
                                            <td className="px-4 py-4">{a.bank_name}</td>
                                            <td className="px-4 py-4 text-gray-500">{a.branch_name || '-'}</td>
                                            <td className="px-4 py-4 font-mono">{a.account_number}</td>
                                            <td className="px-4 py-4 capitalize">{a.account_type}</td>
                                            <td className="px-4 py-4 text-right font-mono">${parseFloat(a.current_balance).toLocaleString()}</td>
                                            <td className="px-4 py-4"><Badge variant={a.is_active ? 'default' : 'secondary'}>{a.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                            <td className="px-4 py-4 text-right">
                                                <Link href={`/bank-accounts/${a.id}`}><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button></Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
