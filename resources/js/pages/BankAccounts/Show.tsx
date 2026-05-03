import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Landmark, Building, Hash, Banknote, Percent } from 'lucide-react';

interface Account {
    id: number; bank_name: string; branch_name: string | null;
    account_number: string; account_name: string | null;
    account_type: string; opening_balance: string; current_balance: string;
    is_active: boolean;
    somiti: { id: number; name: string };
}
interface Props { account: Account }

export default function BankAccountsShow({ account }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Bank Accounts', url: '/bank-accounts' },
        { label: account.bank_name, url: '#' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={account.bank_name} />
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
                <Link href="/bank-accounts"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg"><Landmark className="h-6 w-6 text-blue-700" /></div>
                            <div><CardTitle className="text-2xl">{account.bank_name}</CardTitle>
                            <CardDescription>{account.somiti.name} - {account.account_number}</CardDescription></div>
                            <Badge className="ml-auto" variant={account.is_active ? 'default' : 'secondary'}>{account.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><Building className="h-3 w-3" /> Bank</p><p className="font-semibold">{account.bank_name}</p></div>
                            <div className="space-y-1"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><Hash className="h-3 w-3" /> Branch</p><p className="font-semibold">{account.branch_name || '-'}</p></div>
                            <div className="space-y-1"><p className="text-xs text-gray-500 uppercase">Account Number</p><p className="font-mono font-semibold">{account.account_number}</p></div>
                            <div className="space-y-1"><p className="text-xs text-gray-500 uppercase">Account Name</p><p className="font-semibold">{account.account_name || '-'}</p></div>
                            <div className="space-y-1"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><Percent className="h-3 w-3" /> Type</p><p className="font-semibold capitalize">{account.account_type}</p></div>
                            <div className="space-y-1"><p className="text-xs text-gray-500 uppercase flex items-center gap-1"><Banknote className="h-3 w-3" /> Current Balance</p><p className="text-2xl font-bold">${parseFloat(account.current_balance).toLocaleString()}</p></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
