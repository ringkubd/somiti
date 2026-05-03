import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { PieChart, Info } from 'lucide-react';

interface SomitiOption { id: number; name: string; total_shares: number; min_share_per_member: number; max_share_per_member: number; currency_symbol: string; }
interface MemberOption { id: number; name: string; }
interface FYOption { id: number; title: string; }
interface ShareSummary { total_available: number; total_assigned: number; remaining: number; min_per_member: number; max_per_member: number; }

interface Props {
    somitis: SomitiOption[];
    members: MemberOption[];
    financialYears: FYOption[];
    shareSummary: ShareSummary | null;
    selectedSomitiId: number | null;
}

export default function UserSharesCreate({ somitis, members: initialMembers, financialYears: initialFy, shareSummary: initialSummary, selectedSomitiId }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Member Shares', url: '/user-shares' },
        { label: 'Assign', url: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        somiti_id: selectedSomitiId ? selectedSomitiId.toString() : '',
        user_id: '',
        share_count: '1',
        financial_year_id: '',
    });

    const [members, setMembers] = useState<MemberOption[]>(initialMembers);
    const [financialYears, setFinancialYears] = useState<FYOption[]>(initialFy);
    const [shareSummary, setShareSummary] = useState<ShareSummary | null>(initialSummary);

    // When selectedSomitiId changes (from URL param), update the form
    useEffect(() => {
        if (selectedSomitiId) {
            setData('somiti_id', selectedSomitiId.toString());
        }
    }, [selectedSomitiId]);

    const handleSomitiChange = (value: string) => {
        router.get('/user-shares/create', { somiti_id: value }, {
            preserveState: false,
            replace: true,
        });
    };

    const maxShare = shareSummary ? shareSummary.remaining : 999;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/user-shares');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Shares" />
            <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
                <div className="flex items-center gap-3">
                    <PieChart className="h-8 w-8 text-emerald-600" />
                    <div>
                        <h1 className="text-2xl font-bold">Assign Shares</h1>
                        <p className="text-gray-500 text-sm">Allocate shares to a member with proper limits</p>
                    </div>
                </div>

                {shareSummary && (
                    <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Share Pool: <strong>{shareSummary.total_available}</strong> total |
                            Assigned: <strong>{shareSummary.total_assigned}</strong> |
                            Available: <strong className="text-lg">{shareSummary.remaining}</strong>
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-6">

                            <div className="space-y-2">
                                <Label>Somiti</Label>
                                <Select
                                    onValueChange={handleSomitiChange}
                                    value={data.somiti_id}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select a somiti" /></SelectTrigger>
                                    <SelectContent>
                                        {somitis.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.somiti_id} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Member</Label>
                                    <Select onValueChange={(v) => setData('user_id', v)} value={data.user_id}>
                                        <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                                        <SelectContent>
                                            {members.map(m => (
                                                <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.user_id} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Financial Year</Label>
                                    <Select onValueChange={(v) => setData('financial_year_id', v)} value={data.financial_year_id}>
                                        <SelectTrigger><SelectValue placeholder="Select FY" /></SelectTrigger>
                                        <SelectContent>
                                            {financialYears.map(fy => (
                                                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.financial_year_id} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Share Count</Label>
                                <Input
                                    type="number" min="1" max={maxShare}
                                    value={data.share_count}
                                    onChange={e => setData('share_count', e.target.value)}
                                />
                                {shareSummary && (
                                    <p className="text-xs text-gray-400">
                                        Available: {shareSummary.remaining} shares
                                        {shareSummary.min_per_member > 0 && ` | Min: ${shareSummary.min_per_member}`}
                                        {shareSummary.max_per_member > 0 && ` | Max: ${shareSummary.max_per_member}`}
                                    </p>
                                )}
                                <InputError message={errors.share_count} />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Link href="/user-shares"><Button variant="outline" type="button">Cancel</Button></Link>
                                <Button type="submit" disabled={processing}>Assign Shares</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
