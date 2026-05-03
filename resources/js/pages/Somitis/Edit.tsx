import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';

interface Somiti {
    id: number;
    name: string;
    unique_code: string;
    start_date: string;
    financial_year_start: string;
    status: 'active' | 'closed';
}

interface EditProps {
    somiti: Somiti;
}

export default function EditSomiti({ somiti }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: somiti.name,
        unique_code: somiti.unique_code,
        start_date: somiti.start_date ? new Date(somiti.start_date).toISOString().split('T')[0] : '',
        financial_year_start: somiti.financial_year_start ? new Date(somiti.financial_year_start).toISOString().split('T')[0] : '',
        status: somiti.status,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Edit', url: '#' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/somitis/${somiti.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${somiti.name}`} />
            
            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Edit Somiti Settings</CardTitle>
                        <CardDescription>
                            Update the core configuration for {somiti.name}. Changes here may affect financial calculations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Somiti Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <InputError message={errors.name} />}
                                </div>

                                {/* Unique Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="unique_code">Unique Code (Public ID)</Label>
                                    <Input
                                        id="unique_code"
                                        value={data.unique_code}
                                        onChange={(e) => setData('unique_code', e.target.value)}
                                        placeholder="e.g. SOM-2026-001"
                                        required
                                    />
                                    {errors.unique_code && <InputError message={errors.unique_code} />}
                                </div>

                                {/* Start Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">Operation Start Date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    {errors.start_date && <InputError message={errors.start_date} />}
                                </div>

                                {/* Financial Year Start */}
                                <div className="space-y-2">
                                    <Label htmlFor="financial_year_start">Financial Year Start</Label>
                                    <Input
                                        id="financial_year_start"
                                        type="date"
                                        value={data.financial_year_start}
                                        onChange={(e) => setData('financial_year_start', e.target.value)}
                                        required
                                    />
                                    {errors.financial_year_start && <InputError message={errors.financial_year_start} />}
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(value: 'active' | 'closed') => setData('status', value)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <InputError message={errors.status} />}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? <Spinner className="mr-2" /> : null}
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
