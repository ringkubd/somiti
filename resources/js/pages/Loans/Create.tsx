import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { TrendingDown } from 'lucide-react';

interface SomitiOption { id: number; name: string }

interface Props {
    somitis: SomitiOption[];
    selectedSomitiId: number | null;
}

export default function LoansCreate({ somitis, selectedSomitiId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Loans', url: '/loans' },
        { label: 'New', url: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        somiti_id: selectedSomitiId ? selectedSomitiId.toString() : '',
        amount: '', interest_rate: '5', duration_months: '12',
        purpose: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/loans');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Loan" />
            <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
                <div className="flex items-center gap-3">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                    <div>
                        <h1 className="text-2xl font-bold">New Loan Application</h1>
                        <p className="text-gray-500 text-sm">Apply for a loan from your somiti</p>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-6">
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

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input type="number" step="0.01" min="1" value={data.amount}
                                        onChange={e => setData('amount', e.target.value)} />
                                    <InputError message={errors.amount} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Interest Rate (%)</Label>
                                    <Input type="number" step="0.01" value={data.interest_rate}
                                        onChange={e => setData('interest_rate', e.target.value)} />
                                    <InputError message={errors.interest_rate} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration (months)</Label>
                                    <Input type="number" value={data.duration_months}
                                        onChange={e => setData('duration_months', e.target.value)} />
                                    <InputError message={errors.duration_months} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Purpose</Label>
                                <Textarea value={data.purpose} onChange={e => setData('purpose', e.target.value)}
                                    placeholder="Why are you taking this loan?" />
                                <InputError message={errors.purpose} />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Link href="/loans"><Button variant="outline" type="button">Cancel</Button></Link>
                                <Button type="submit" disabled={processing}>Submit Application</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
