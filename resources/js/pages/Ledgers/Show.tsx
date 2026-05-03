import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, BookText, Hash, Info, Landmark, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Ledger {
    id: number;
    debit: string;
    credit: string;
    description: string;
    reference_type: string;
    reference_id: number;
    created_at: string;
    somiti: {
        name: string;
    };
    reference: any;
}

interface ShowProps {
    ledger: Ledger;
}

export default function LedgerShow({ ledger }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'General Ledger', url: '/ledgers' },
        { label: `Entry #${ledger.id}`, url: '#' }
    ];

    const getRefLabel = (type: string) => {
        const parts = type.split('\\');
        return parts[parts.length - 1];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ledger Entry #${ledger.id}`} />
            
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/ledgers">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Ledger Entry</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Transaction Details</CardTitle>
                            <CardDescription>Full double-entry accounting record</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-100 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Transaction Value</p>
                                    <p className={`text-4xl font-black ${parseFloat(ledger.credit) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${parseFloat(ledger.credit) > 0 
                                            ? parseFloat(ledger.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                            : parseFloat(ledger.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })
                                        }
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <Badge variant="outline" className={parseFloat(ledger.credit) > 0 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                        {parseFloat(ledger.credit) > 0 ? 'Credit (Inflow)' : 'Debit (Outflow)'}
                                    </Badge>
                                    <p className="text-xs text-slate-400 mt-2">{new Date(ledger.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Info className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Description</p>
                                        <p className="font-medium text-lg leading-tight">{ledger.description}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Hash className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Reference Object</p>
                                            <p className="font-medium">{getRefLabel(ledger.reference_type)} #{ledger.reference_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Landmark className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Somiti</p>
                                            <p className="font-medium">{ledger.somiti.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Source Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 text-sm">
                            <p className="text-gray-500 italic">
                                This entry was automatically generated by the system when the referenced transaction was approved.
                            </p>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-gray-400">Entry Metadata</p>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Log ID:</span>
                                    <span className="font-mono">LED-{ledger.id.toString().padStart(6, '0')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
