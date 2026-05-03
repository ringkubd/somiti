import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Landmark } from 'lucide-react';

interface SomitiOption { id: number; name: string }
interface Props { somitis: SomitiOption[] }

export default function BankAccountsCreate({ somitis }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Bank Accounts', url: '/bank-accounts' },
        { label: 'Add', url: '#' },
    ];
    const { data, setData, post, processing, errors } = useForm({
        somiti_id: '', bank_name: '', branch_name: '', account_number: '',
        account_name: '', account_type: 'savings', opening_balance: '0',
    });
    const submit = (e: React.FormEvent) => { e.preventDefault(); post('/bank-accounts'); };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Bank Account" />
            <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
                <div className="flex items-center gap-3"><Landmark className="h-8 w-8" /><div><h1 className="text-2xl font-bold">Add Bank Account</h1></div></div>
                <Card><CardContent className="pt-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Somiti</Label>
                            <Select onValueChange={v => setData('somiti_id', v)} value={data.somiti_id}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{somitis.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <InputError message={errors.somiti_id} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Bank Name</Label><Input value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} /><InputError message={errors.bank_name} /></div>
                            <div className="space-y-2"><Label>Branch</Label><Input value={data.branch_name} onChange={e => setData('branch_name', e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Account Number</Label><Input value={data.account_number} onChange={e => setData('account_number', e.target.value)} /><InputError message={errors.account_number} /></div>
                            <div className="space-y-2"><Label>Account Name</Label><Input value={data.account_name} onChange={e => setData('account_name', e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Type</Label>
                                <Select onValueChange={v => setData('account_type', v)} value={data.account_type}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="savings">Savings</SelectItem>
                                        <SelectItem value="current">Current</SelectItem>
                                        <SelectItem value="fd">Fixed Deposit</SelectItem>
                                        <SelectItem value="loan">Loan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Opening Balance</Label><Input type="number" step="0.01" value={data.opening_balance} onChange={e => setData('opening_balance', e.target.value)} /></div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4 border-t">
                            <Link href="/bank-accounts"><Button variant="outline" type="button">Cancel</Button></Link>
                            <Button type="submit" disabled={processing}>Add Account</Button>
                        </div>
                    </form>
                </CardContent></Card>
            </div>
        </AppLayout>
    );
}
