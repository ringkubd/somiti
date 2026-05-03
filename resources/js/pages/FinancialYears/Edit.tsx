import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';

interface FinancialYear {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    share_value: string;
    somiti_id: number;
    somiti: {
        name: string;
    };
}

interface Props {
    financialYear: FinancialYear;
}

export default function FinancialYearEdit({ financialYear }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Financial Years', url: '/financial-years' },
        { label: `Edit ${financialYear.title}`, url: '#' }
    ];

    const { data, setData, put, processing, errors } = useForm({
        somiti_id: financialYear.somiti_id.toString(),
        title: financialYear.title,
        start_date: financialYear.start_date,
        end_date: financialYear.end_date,
        share_value: financialYear.share_value,
        is_active: financialYear.is_active
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/financial-years/${financialYear.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${financialYear.title}`} />
            
            <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Update Financial Year</CardTitle>
                        <CardDescription>Adjust the accounting period and share valuation for {financialYear.somiti.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Financial Year Title</Label>
                                    <Input 
                                        id="title" 
                                        value={data.title} 
                                        onChange={(e) => setData('title', e.target.value)} 
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
                                    <p className="text-xs text-gray-500">Only one active year allowed per society</p>
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
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
