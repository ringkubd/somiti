import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';

interface Somiti {
    id: number;
    name: string;
}

interface Props {
    somitis: Somiti[];
    selectedSomitiId: number | null;
}

export default function DepositCreate({ somitis, selectedSomitiId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Deposits', href: '/deposits' },
        { title: 'New Deposit', href: '#' }
    ];

    const { data, setData, post, processing, errors } = useForm({
        somiti_id: selectedSomitiId ? selectedSomitiId.toString() : '',
        amount: '',
        type: 'savings',
        month: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/deposits');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Deposit" />
            
            <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>New Deposit Request</CardTitle>
                        <CardDescription>Submit a new deposit for approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="somiti">Society</Label>
                                <Select 
                                    onValueChange={(value) => setData('somiti_id', value)} 
                                    defaultValue={data.somiti_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a society..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {somitis.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.somiti_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <Input 
                                    id="amount" 
                                    type="number" 
                                    value={data.amount} 
                                    onChange={(e) => setData('amount', e.target.value)} 
                                    placeholder="0.00"
                                />
                                <InputError message={errors.amount} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Deposit Type</Label>
                                <Select onValueChange={(value) => setData('type', value)} defaultValue="savings">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="savings">Monthly Savings</SelectItem>
                                        <SelectItem value="share">Share Purchase</SelectItem>
                                        <SelectItem value="fdr">FDR Investment</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="month">Month (Optional)</Label>
                                <Input 
                                    id="month" 
                                    value={data.month} 
                                    onChange={(e) => setData('month', e.target.value)} 
                                    placeholder="e.g. May 2026"
                                />
                                <InputError message={errors.month} />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link href="/deposits">
                                    <Button variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
