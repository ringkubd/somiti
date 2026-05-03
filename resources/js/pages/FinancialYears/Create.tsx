import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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

export default function FinancialYearCreate({ somitis, selectedSomitiId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Financial Years', href: '/financial-years' },
        { title: 'New Financial Year', href: '#' }
    ];

    const { data, setData, post, processing, errors } = useForm({
        somiti_id: selectedSomitiId ? selectedSomitiId.toString() : '',
        title: '',
        start_date: '',
        end_date: '',
        share_value: '1000',
        is_active: true
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/financial-years');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Financial Year" />
            
            <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Financial Year</CardTitle>
                        <CardDescription>Define a new accounting period for your society</CardDescription>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Financial Year Title</Label>
                                    <Input 
                                        id="title" 
                                        value={data.title} 
                                        onChange={(e) => setData('title', e.target.value)} 
                                        placeholder="e.g. FY 2026-27"
                                    />
                                    <InputError message={errors.title} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="share_value">Share Price (Valuation)</Label>
                                    <Input 
                                        id="share_value" 
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.share_value} 
                                        onChange={(e) => setData('share_value', e.target.value)} 
                                        placeholder="e.g. 1250.00"
                                    />
                                    <InputError message={errors.share_value} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input 
                                        id="start_date" 
                                        type="date"
                                        value={data.start_date} 
                                        onChange={(e) => setData('start_date', e.target.value)} 
                                    />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input 
                                        id="end_date" 
                                        type="date"
                                        value={data.end_date} 
                                        onChange={(e) => setData('end_date', e.target.value)} 
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                                <div className="space-y-0.5">
                                    <Label>Set as Active</Label>
                                    <p className="text-xs text-gray-500">Deactivates other years for this society</p>
                                </div>
                                <Switch 
                                    checked={data.is_active} 
                                    onCheckedChange={(checked) => setData('is_active', checked)} 
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link href="/financial-years">
                                    <Button variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Create Year
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
