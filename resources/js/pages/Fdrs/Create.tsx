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
import { Landmark } from 'lucide-react';

interface SomitiOption { id: number; name: string }
interface InvestmentOption { id: number; type: string; amount: string }

interface Props {
    somitis: SomitiOption[];
    investments: InvestmentOption[];
}

export default function FdrsCreate({ somitis, investments }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'FDRs', url: '/fdrs' },
        { label: 'New', url: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        somiti_id: '', investment_id: '', bank_name: '',
        interest_rate: '', tenure_months: '12', maturity_amount: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/fdrs');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New FDR" />
            <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
                <div className="flex items-center gap-3">
                    <Landmark className="h-8 w-8 text-blue-700" />
                    <div>
                        <h1 className="text-2xl font-bold">New FDR</h1>
                        <p className="text-gray-500 text-sm">Create a Fixed Deposit Receipt</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Somiti</Label>
                                    <Select onValueChange={v => setData('somiti_id', v)} value={data.somiti_id}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {somitis.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.somiti_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Investment</Label>
                                    <Select onValueChange={v => setData('investment_id', v)} value={data.investment_id}>
                                        <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                                        <SelectContent>
                                            {investments.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.type} - ${i.amount}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input placeholder="e.g. Sonali Bank" value={data.bank_name}
                                    onChange={e => setData('bank_name', e.target.value)} />
                                <InputError message={errors.bank_name} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Interest Rate (%)</Label>
                                    <Input type="number" step="0.01" value={data.interest_rate}
                                        onChange={e => setData('interest_rate', e.target.value)} />
                                    <InputError message={errors.interest_rate} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tenure (months)</Label>
                                    <Input type="number" value={data.tenure_months}
                                        onChange={e => setData('tenure_months', e.target.value)} />
                                    <InputError message={errors.tenure_months} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Maturity Amount</Label>
                                    <Input type="number" step="0.01" value={data.maturity_amount}
                                        onChange={e => setData('maturity_amount', e.target.value)} />
                                    <InputError message={errors.maturity_amount} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Link href="/fdrs"><Button variant="outline" type="button">Cancel</Button></Link>
                                <Button type="submit" disabled={processing}>Create FDR</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
