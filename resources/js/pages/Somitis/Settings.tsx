import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Building, DollarSign, MapPin, Phone, Save, Percent } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Somiti {
    id: number;
    name: string;
    currency: string;
    currency_symbol: string;
    logo_url: string | null;
    receipt_header: string | null;
    receipt_footer: string | null;
    phone: string | null;
    address: string | null;
    default_interest_rate: string | null;
    total_shares: number | null;
    min_share_per_member: number | null;
    max_share_per_member: number | null;
    loan_penalty_rate: string | null;
    loan_grace_days: number | null;
}

interface FinancialYear {
    id: number;
    title: string;
    share_value: string;
    is_active: boolean;
}

interface Props {
    somiti: Somiti;
    activeFinancialYear: FinancialYear | null;
}

export default function SomitiSettings({ somiti, activeFinancialYear }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Settings', url: '#' }
    ];

    const { data, setData, patch, processing, errors } = useForm({
        currency: somiti.currency || 'USD',
        currency_symbol: somiti.currency_symbol || '$',
        logo_url: somiti.logo_url || '',
        receipt_header: somiti.receipt_header || '',
        receipt_footer: somiti.receipt_footer || '',
        phone: somiti.phone || '',
        address: somiti.address || '',
        default_interest_rate: somiti.default_interest_rate || '',
        total_shares: somiti.total_shares?.toString() || '',
        min_share_per_member: somiti.min_share_per_member?.toString() || '1',
        max_share_per_member: somiti.max_share_per_member?.toString() || '',
        loan_penalty_rate: somiti.loan_penalty_rate || '0',
        loan_grace_days: somiti.loan_grace_days?.toString() || '0',
        share_value: activeFinancialYear?.share_value || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/somitis/${somiti.id}/settings`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${somiti.name} Settings`} />
            
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Society Configuration</h1>
                        <p className="text-slate-500">Customize branding, receipts, and financial defaults for {somiti.name}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building className="h-5 w-5 text-indigo-500" />
                                Branding & Receipt Setup
                            </CardTitle>
                            <CardDescription>This information will appear on your generated money receipts.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="logo_url">Receipt Logo URL</Label>
                                    <Input 
                                        id="logo_url" 
                                        value={data.logo_url} 
                                        onChange={e => setData('logo_url', e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                    />
                                    {errors.logo_url && <p className="text-xs text-red-500">{errors.logo_url}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="receipt_header">Receipt Header Text</Label>
                                    <Input 
                                        id="receipt_header" 
                                        value={data.receipt_header} 
                                        onChange={e => setData('receipt_header', e.target.value)}
                                        placeholder="Official Money Receipt"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="receipt_footer">Receipt Footer (Terms/Notes)</Label>
                                <Input 
                                    id="receipt_footer" 
                                    value={data.receipt_footer} 
                                    onChange={e => setData('receipt_footer', e.target.value)}
                                    placeholder="Thank you for your contribution."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-emerald-500" />
                                Financial Defaults
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency Code</Label>
                                    <Input 
                                        id="currency" 
                                        value={data.currency} 
                                        onChange={e => setData('currency', e.target.value)}
                                        placeholder="USD, BDT, EUR"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency_symbol">Currency Symbol</Label>
                                    <Input 
                                        id="currency_symbol" 
                                        value={data.currency_symbol} 
                                        onChange={e => setData('currency_symbol', e.target.value)}
                                        placeholder="$, ৳, €"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="share_value">Share Value (active FY)</Label>
                                    <Input 
                                        id="share_value" 
                                        type="number" step="0.01"
                                        value={data.share_value} 
                                        onChange={e => setData('share_value', e.target.value)}
                                        placeholder="1000.00"
                                    />
                                    {activeFinancialYear && (
                                        <p className="text-xs text-gray-400">Applies to: {activeFinancialYear.title}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="default_interest_rate">Default Loan Interest Rate (%)</Label>
                                    <Input 
                                        id="default_interest_rate" 
                                        type="number" step="0.01"
                                        value={data.default_interest_rate} 
                                        onChange={e => setData('default_interest_rate', e.target.value)}
                                        placeholder="5.00"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-purple-500" />
                                Share Configuration
                            </CardTitle>
                            <CardDescription>Total available shares and per-member limits</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="total_shares">Total Shares (Pool)</Label>
                                    <Input id="total_shares" type="number" min="0" value={data.total_shares}
                                        onChange={e => setData('total_shares', e.target.value)}
                                        placeholder="e.g. 1000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min_share_per_member">Min Per Member</Label>
                                    <Input id="min_share_per_member" type="number" min="1" value={data.min_share_per_member}
                                        onChange={e => setData('min_share_per_member', e.target.value)}
                                        placeholder="1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_share_per_member">Max Per Member</Label>
                                    <Input id="max_share_per_member" type="number" min="1" value={data.max_share_per_member}
                                        onChange={e => setData('max_share_per_member', e.target.value)}
                                        placeholder="Same as total" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Percent className="h-5 w-5 text-rose-500" />
                                Loan & Penalty Settings
                            </CardTitle>
                            <CardDescription>Late payment penalties and grace period</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="loan_penalty_rate">Late Penalty Rate (%)</Label>
                                    <Input id="loan_penalty_rate" type="number" step="0.01" value={data.loan_penalty_rate}
                                        onChange={e => setData('loan_penalty_rate', e.target.value)}
                                        placeholder="0" />
                                    <p className="text-xs text-gray-400">Penalty charged per overdue day</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loan_grace_days">Grace Period (days)</Label>
                                    <Input id="loan_grace_days" type="number" min="0" value={data.loan_grace_days}
                                        onChange={e => setData('loan_grace_days', e.target.value)}
                                        placeholder="0" />
                                    <p className="text-xs text-gray-400">Days after due date before penalty applies</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-rose-500" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Official Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input 
                                            id="phone" 
                                            className="pl-10"
                                            value={data.phone} 
                                            onChange={e => setData('phone', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Office Address</Label>
                                    <Input 
                                        id="address" 
                                        value={data.address} 
                                        onChange={e => setData('address', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button 
                            type="submit" 
                            size="lg" 
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 px-8 font-bold gap-2 shadow-lg shadow-indigo-200"
                        >
                            <Save className="h-5 w-5" />
                            Save All Settings
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
