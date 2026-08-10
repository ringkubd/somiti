import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, BriefcaseBusiness } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Manager {
    id: number;
    from_date: string;
    to_date: string | null;
    note: string | null;
    user: { id: number; name: string; phone: string | null } | null;
}

interface Member {
    id: number;
    user: { id: number; name: string } | null;
}

interface Props {
    somiti: { id: number; name: string };
    managers: Manager[];
    members: Member[];
}

export default function SomitiManagers({ somiti, managers, members }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Managers', url: '#' },
    ];
    const { data, setData, post, processing } = useForm({
        user_id: '',
        from_date: new Date().toISOString().slice(0, 10),
        to_date: '',
        note: '',
    });
    const [showForm, setShowForm] = useState(false);

    const isCurrent = (m: Manager) => !m.to_date || new Date(m.to_date) >= new Date(new Date().toDateString());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Managers" />
            <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Manager Tenures</h2>
                        <p className="text-sm text-muted-foreground">Appoint managers with time-based tenures — the previous manager's role reverts automatically.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/somitis/${somiti.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                        </Link>
                        <Button size="sm" className="gap-2" onClick={() => setShowForm(!showForm)}>
                            <UserPlus className="h-4 w-4" /> Appoint
                        </Button>
                    </div>
                </div>

                {showForm && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Appoint Manager</CardTitle><CardDescription>The current manager's tenure ends when the new one starts.</CardDescription></CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => { e.preventDefault(); post(`/somitis/${somiti.id}/managers`); }} className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="user_id">Member</Label>
                                    <select id="user_id" value={data.user_id} onChange={(e) => setData('user_id', e.target.value)} className="mt-1 flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                                        <option value="">Select member…</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.user?.id}>{m.user?.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="from_date">From Date</Label>
                                    <Input id="from_date" type="date" value={data.from_date} onChange={(e) => setData('from_date', e.target.value)} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="to_date">To Date (optional)</Label>
                                    <Input id="to_date" type="date" value={data.to_date} onChange={(e) => setData('to_date', e.target.value)} className="mt-1" />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="note">Note (optional)</Label>
                                    <Input id="note" value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Reason / audit info" className="mt-1" />
                                </div>
                                <div className="sm:col-span-2 flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                    <Button type="submit" disabled={processing || !data.user_id}>Appoint Manager</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-3">
                    {managers.length === 0 && (
                        <Card><CardContent className="p-8 text-center text-muted-foreground">No managers yet — appoint your first manager.</CardContent></Card>
                    )}
                    {managers.map((m) => (
                        <Card key={m.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{m.user?.name}</p>
                                        <p className="text-xs text-muted-foreground">{m.from_date} → {m.to_date || 'present'}{m.note ? ` • ${m.note}` : ''}</p>
                                    </div>
                                </div>
                                {isCurrent(m) ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600"
                                        onClick={() => {
                                            if (confirm(`End ${m.user?.name}'s tenure?`)) {
                                                router.delete(`/somitis/${somiti.id}/managers/${m.id}`);
                                            }
                                        }}
                                    >
                                        End Tenure
                                    </Button>
                                ) : (
                                    <Badge className="bg-slate-100 text-slate-500">Past</Badge>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
