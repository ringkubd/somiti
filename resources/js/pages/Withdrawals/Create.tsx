import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Wallet } from 'lucide-react';

interface Props {
    somitis: { id: number; name: string }[];
    selectedSomitiId: number | null;
}

export default function WithdrawalCreate({ somitis, selectedSomitiId }: Props) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [somitiId, setSomitiId] = useState<string>(selectedSomitiId ? String(selectedSomitiId) : (somitis[0]?.id ? String(somitis[0].id) : ''));
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [method, setMethod] = useState('cash');
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Withdrawals', url: '/withdrawals' },
        { label: 'New Withdrawal', url: '#' },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/withdrawals', { somiti_id: Number(somitiId), amount, reason, method }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Withdrawal" />
            <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/withdrawals">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                        <Wallet className="h-8 w-8" />
                        New Withdrawal
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Withdrawal Request</CardTitle>
                        <CardDescription>The amount must not exceed your savings balance. Requests require approval.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="somiti_id">Society *</Label>
                                <Select value={somitiId} onValueChange={setSomitiId}>
                                    <SelectTrigger id="somiti_id" className="w-full"><SelectValue placeholder="Select a society" /></SelectTrigger>
                                    <SelectContent>
                                        {somitis.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                                {errors.amount && <p className="text-xs text-red-600">{errors.amount}</p>}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="method">Payment Method</Label>
                                <Input id="method" value={method} onChange={(e) => setMethod(e.target.value)} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
                            </div>
                            <Button type="submit" disabled={processing || !somitiId} className="w-full gap-2">
                                <Wallet className="h-4 w-4" /> Submit Withdrawal Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
