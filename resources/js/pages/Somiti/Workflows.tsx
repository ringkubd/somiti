import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, ShieldCheck, Save } from 'lucide-react';

interface Workflow {
    transaction_type: string;
    requires_approval: boolean;
    manager_can_approve_alone: boolean;
    min_approvals_required: number;
    quorum_type: string;
}

interface Props {
    somiti: { id: number; name: string };
    workflows: Record<string, Workflow>;
}

const typeLabels: Record<string, string> = {
    deposit: 'Deposits', loan: 'Loans', investment: 'Investments',
    fdr: 'FDRs', share: 'Share Purchases', share_transfer: 'Share Transfers',
};

const typeDescriptions: Record<string, string> = {
    deposit: 'Member savings deposits', loan: 'Loan applications',
    investment: 'Society investments', fdr: 'Fixed deposit receipts',
    share: 'New share allocations', share_transfer: 'Share transfers between members',
};

export default function SomitiWorkflows({ somiti, workflows }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Somitis', url: '/somitis' },
        { label: somiti.name, url: `/somitis/${somiti.id}` },
        { label: 'Workflows', url: '#' },
    ];

    const workflowArray = Object.values(workflows);
    const { data, setData, put, processing } = useForm({
        workflows: workflowArray,
    });

    const toggleWorkflow = (index: number, field: string, value: any) => {
        const updated = [...data.workflows] as any[];
        updated[index] = { ...updated[index], [field]: value };
        setData('workflows', updated);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/somitis/${somiti.id}/workflows`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Workflows - ${somiti.name}`} />
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/somitis/${somiti.id}`}><Button variant="outline" size="icon" className="rounded-full"><ArrowLeft className="h-4 w-4" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Approval Workflows</h1>
                        <p className="text-sm text-gray-500">Configure approval requirements for each transaction type in {somiti.name}</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Approval Rules</CardTitle>
                            <CardDescription>Set whether each transaction needs approval, and who can approve</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.workflows.map((wf: Workflow, idx: number) => (
                                <div key={wf.transaction_type}>
                                    <div className="flex items-start justify-between gap-6 py-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-base">{typeLabels[wf.transaction_type] || wf.transaction_type}</h3>
                                            <p className="text-sm text-gray-500">{typeDescriptions[wf.transaction_type]}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Label className="text-xs">Requires Approval</Label>
                                            <Switch checked={wf.requires_approval} onCheckedChange={(v) => toggleWorkflow(idx, 'requires_approval', v)} />
                                        </div>
                                    </div>

                                    {wf.requires_approval && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-4 pb-4">
                                            <div className="flex items-center gap-3">
                                                <Switch checked={wf.manager_can_approve_alone} onCheckedChange={(v) => toggleWorkflow(idx, 'manager_can_approve_alone', v)} />
                                                <Label className="text-sm">Manager can approve alone</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm whitespace-nowrap">Min approvals:</Label>
                                                <Input type="number" min="1" className="w-20 h-8" value={wf.min_approvals_required}
                                                    onChange={(e) => toggleWorkflow(idx, 'min_approvals_required', parseInt(e.target.value) || 1)} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm whitespace-nowrap">Quorum:</Label>
                                                <select
                                                    value={wf.quorum_type || 'count'}
                                                    onChange={(e) => toggleWorkflow(idx, 'quorum_type', e.target.value)}
                                                    className="flex h-8 rounded-md border bg-background px-2 py-1 text-sm"
                                                >
                                                    <option value="count">Fixed count</option>
                                                    <option value="all_members">All members</option>
                                                    <option value="majority">Majority (most votes win)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {idx < data.workflows.length - 1 && <Separator />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-6">
                        <Button type="submit" disabled={processing} size="lg" className="gap-2">
                            <Save className="h-5 w-5" /> Save Workflow Settings
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
