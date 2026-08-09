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
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface Member {
    id: number;
    user_id: number;
    user: { id: number; name: string; email: string | null; phone: string | null };
}

interface Props {
    somitis: { id: number; name: string }[];
    selectedSomitiId: number | null;
    members: Member[];
}

export default function PenaltyCreate({ somitis, selectedSomitiId, members }: Props) {
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [somitiId, setSomitiId] = useState<string>(selectedSomitiId ? String(selectedSomitiId) : '');
    const [userId, setUserId] = useState<string>('');
    const [type, setType] = useState<string>('late_deposit');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Penalties', url: '/penalties' },
        { label: 'New Penalty', url: '#' },
    ];

    const changeSomiti = (value: string) => {
        setSomitiId(value);
        setUserId('');
        router.get('/penalties/create', { somiti_id: value }, { preserveState: true, only: ['members', 'selectedSomitiId'] });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/penalties', { somiti_id: Number(somitiId), user_id: Number(userId), type, amount, notes }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Penalty" />
            <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/penalties">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-teal-700 flex items-center gap-2">
                        <AlertTriangle className="h-8 w-8" />
                        New Penalty
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Penalty Charge</CardTitle>
                        <CardDescription>Create a penalty for a member. It will be queued for approval and booked as Penalty Income.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="somiti_id">Society *</Label>
                                <Select value={somitiId} onValueChange={changeSomiti}>
                                    <SelectTrigger id="somiti_id" className="w-full"><SelectValue placeholder="Select a society" /></SelectTrigger>
                                    <SelectContent>
                                        {somitis.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="user_id">Member *</Label>
                                <Select value={userId} onValueChange={setUserId}>
                                    <SelectTrigger id="user_id" className="w-full"><SelectValue placeholder="Select a member" /></SelectTrigger>
                                    <SelectContent>
                                        {members.map((m) => <SelectItem key={m.id} value={String(m.user_id)}>{m.user.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.user_id && <p className="text-xs text-red-600">{errors.user_id}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger id="type" className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="late_deposit">Late Deposit</SelectItem>
                                            <SelectItem value="loan_default">Loan Default</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                                    {errors.amount && <p className="text-xs text-red-600">{errors.amount}</p>}
                                </div>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                            </div>
                            <Button type="submit" disabled={processing || !somitiId || !userId} className="w-full gap-2">
                                <AlertTriangle className="h-4 w-4" /> Create Penalty
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
