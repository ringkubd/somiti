import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { type BreadcrumbItem } from '@/types';

interface CreateProps {
    isFirstTime?: boolean;
}

export default function CreateSomiti({ isFirstTime = false }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: 'Create', url: '#' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/somitis');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Somiti" />
            
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {isFirstTime ? 'Create Your First Somiti' : 'Create New Somiti'}
                        </CardTitle>
                        <CardDescription>
                            {isFirstTime 
                                ? 'As a Somiti owner, you\'ll manage members, finances, and all operations. You can add more Somitis later.'
                                : 'Create a new Somiti to manage with your team members.'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Somiti Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.currentTarget.value)}
                                    placeholder="e.g., Community Savings Group, Family Fund"
                                    required
                                    disabled={processing}
                                />
                                {errors.name && <InputError message={errors.name} />}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">What's a Somiti?</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• A cooperative savings and lending group</li>
                                    <li>• Managed by you as the owner</li>
                                    <li>• Members can be added by managers/owners</li>
                                    <li>• Track deposits, loans, investments, and shares</li>
                                </ul>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {processing ? <Spinner /> : null}
                                    {processing ? 'Creating...' : 'Create Somiti'}
                                </Button>
                                {!isFirstTime && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
