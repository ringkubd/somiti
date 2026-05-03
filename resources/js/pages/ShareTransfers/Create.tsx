import React, { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface Somiti {
    id: number;
    name: string;
    users: User[];
}

interface Props {
    somitis: Somiti[];
    selectedSomitiId: number | null;
}

export default function ShareTransferCreate({ somitis, selectedSomitiId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Share Transfers', href: '/share-transfers' },
        { title: 'Request Transfer', href: '#' }
    ];

    const [activeSomiti, setActiveSomiti] = useState<Somiti | null>(
        selectedSomitiId ? somitis.find(s => s.id === selectedSomitiId) || null : null
    );

    const { data, setData, post, processing, errors } = useForm({
        somiti_id: selectedSomitiId ? selectedSomitiId.toString() : '',
        to_user_id: '',
        quantity: '1',
        price_per_share: '',
        transfer_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const handleSomitiChange = (value: string) => {
        setData('somiti_id', value);
        setActiveSomiti(somitis.find(s => s.id.toString() === value) || null);
        setData('to_user_id', ''); // reset user when society changes
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/share-transfers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Request Share Transfer" />
            
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Initiate Share Transfer</CardTitle>
                        <CardDescription>Transfer your shares to another member within the society.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                This transfer request will be sent to the Society Administrator for final approval. Once approved, the shares will be formally deducted from your ledger and assigned to the recipient.
                            </AlertDescription>
                        </Alert>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="somiti">Society</Label>
                                    <Select 
                                        onValueChange={handleSomitiChange} 
                                        value={data.somiti_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a society" />
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

                                <div className="space-y-2">
                                    <Label htmlFor="to_user">Recipient (Buyer)</Label>
                                    <Select 
                                        onValueChange={(value) => setData('to_user_id', value)} 
                                        value={data.to_user_id}
                                        disabled={!activeSomiti}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activeSomiti?.users.map((u) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.to_user_id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input 
                                        id="quantity" 
                                        type="number"
                                        min="1"
                                        value={data.quantity} 
                                        onChange={(e) => setData('quantity', e.target.value)} 
                                    />
                                    <InputError message={errors.quantity} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price_per_share">Agreed Price / Share</Label>
                                    <Input 
                                        id="price_per_share" 
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g. 1250"
                                        value={data.price_per_share} 
                                        onChange={(e) => setData('price_per_share', e.target.value)} 
                                    />
                                    <InputError message={errors.price_per_share} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transfer_date">Transfer Date</Label>
                                    <Input 
                                        id="transfer_date" 
                                        type="date"
                                        value={data.transfer_date} 
                                        onChange={(e) => setData('transfer_date', e.target.value)} 
                                    />
                                    <InputError message={errors.transfer_date} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Transfer Notes (Optional)</Label>
                                <Textarea 
                                    id="notes" 
                                    placeholder="Any special conditions or reference regarding this transfer..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="h-24"
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                                <Link href="/share-transfers">
                                    <Button variant="outline" type="button">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="bg-slate-900">
                                    Submit Transfer Request
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
