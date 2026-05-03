import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Briefcase } from 'lucide-react';

interface SomitiOption { id: number; name: string }
interface FYOption { id: number; title: string }

interface Props {
    somitis: SomitiOption[];
    financialYears: FYOption[];
}

export default function InvestmentsCreate({ somitis, financialYears }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Investments', url: '/investments' },
        { label: 'New', url: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        somiti_id: '', financial_year_id: '', type: 'business',
        amount: '', start_date: '', maturity_date: '',
    });

    const [activeSomiti, setActiveSomiti] = useState<SomitiOption | null>(null);

    const handleSomitiChange = (value: string) => {
        setData('somiti_id', value);
        setActiveSomiti(somitis.find(s => s.id.toString() === value) || null);
    };

    const filteredFy = financialYears.filter(fy => !activeSomiti || true);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/investments');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Investment" />
            <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
                <div className="flex items-center gap-3">
                    <Briefcase className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold">New Investment</h1>
                        <p className="text-gray-500 text-sm">Record a society-level investment</p>
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
                                    <Label>Type</Label>
                                    <Select onValueChange={v => setData('type', v)} value={data.type}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="fdr">FDR</SelectItem>
                                            <SelectItem value="stock">Stock</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Financial Year</Label>
                                    <Select onValueChange={v => setData('financial_year_id', v)} value={data.financial_year_id}>
                                        <SelectTrigger><SelectValue placeholder="Select FY" /></SelectTrigger>
                                        <SelectContent>
                                            {financialYears.map(fy => <SelectItem key={fy.id} value={fy.id.toString()}>{fy.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.financial_year_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount</Label>
                                    <Input type="number" step="0.01" min="1" value={data.amount}
                                        onChange={e => setData('amount', e.target.value)} />
                                    <InputError message={errors.amount} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Maturity Date</Label>
                                    <Input type="date" value={data.maturity_date}
                                        onChange={e => setData('maturity_date', e.target.value)} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Link href="/investments"><Button variant="outline" type="button">Cancel</Button></Link>
                                <Button type="submit" disabled={processing}>Create Investment</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
