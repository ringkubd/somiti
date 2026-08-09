import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Scale, TrendingUp, ArrowRight, FileText } from 'lucide-react';

interface SomitiSummary { id: number; name: string; unique_code: string; currency_symbol: string; members_count: number; }
interface Props { somitis: SomitiSummary[] }

export default function ReportsIndex({ somitis }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Reports', url: '#' }];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="space-y-6 py-6 px-4 sm:px-6 lg:px-8">
                <div><h1 className="text-3xl font-bold flex items-center gap-2"><Scale className="h-8 w-8" /> Reports</h1><p className="text-gray-500">Financial reports for all somitis</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {somitis.map(s => (
                        <Card key={s.id}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">{s.name}</CardTitle>
                                <CardDescription>{s.unique_code} · {s.members_count} members</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={`/somitis/${s.id}/reports/summary`}><Button variant="outline" size="sm" className="w-full justify-between">Summary <ArrowRight className="h-4 w-4" /></Button></Link>
                                <Link href={`/somitis/${s.id}/reports/trial-balance`}><Button variant="outline" size="sm" className="w-full justify-between">Trial Balance <ArrowRight className="h-4 w-4" /></Button></Link>
                                <Link href={`/somitis/${s.id}/reports/member-statement`}><Button variant="outline" size="sm" className="w-full justify-between">Member Statement <FileText className="h-4 w-4" /></Button></Link>
                                <Link href={`/somitis/${s.id}`}><Button variant="ghost" size="sm" className="w-full text-xs">View Somiti</Button></Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
