import React, { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Somiti {
    id: number; name: string; unique_code: string;
    currency: string; currency_symbol: string;
    logo_url: string | null; receipt_header: string | null;
    receipt_footer: string | null; phone: string | null; address: string | null;
}

interface Deposit {
    id: number; amount: string; month: string; type: string;
    status: string; created_at: string;
    user: { id: number; name: string; phone?: string };
    financial_year?: { title: string };
    approver?: { id: number; name: string } | null;
}

interface Props { somiti: Somiti; deposit: Deposit }

export default function DepositReceipt({ somiti, deposit }: Props) {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Receipt - ${somiti.name}`} />
            <div className="max-w-2xl mx-auto py-4 px-4 print:py-0 print:px-0">
                <div className="hidden-print flex items-center justify-between mb-4 no-print">
                    <Link href={`/deposits/${deposit.id}`}>
                        <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
                    </Link>
                    <Button onClick={handlePrint} size="sm"><Printer className="h-4 w-4 mr-2" />Print</Button>
                </div>

                <Card ref={printRef} className="border-2 print:shadow-none print:border-0">
                    <CardContent className="p-8 print:p-4">
                        {/* Header */}
                        <div className="text-center border-b pb-6 mb-6">
                            {somiti.logo_url && (
                                <img src={somiti.logo_url} alt={somiti.name} className="h-16 mx-auto mb-3" />
                            )}
                            <h1 className="text-2xl font-bold">{somiti.receipt_header || 'OFFICIAL MONEY RECEIPT'}</h1>
                            <h2 className="text-xl font-semibold mt-1">{somiti.name}</h2>
                            <p className="text-sm text-gray-500">{somiti.unique_code}</p>
                            {somiti.address && <p className="text-sm text-gray-500">{somiti.address}</p>}
                            {somiti.phone && <p className="text-sm text-gray-500">Phone: {somiti.phone}</p>}
                        </div>

                        {/* Receipt Info */}
                        <div className="flex justify-between mb-6 text-sm">
                            <div>
                                <p><span className="font-semibold">Receipt #:</span> {somiti.unique_code}-DEP-{String(deposit.id).padStart(5, '0')}</p>
                                <p><span className="font-semibold">Date:</span> {new Date(deposit.created_at).toLocaleDateString()}</p>
                                <p><span className="font-semibold">Member:</span> {deposit.user.name}</p>
                            </div>
                            <div className="text-right">
                                <p><span className="font-semibold">Type:</span> {deposit.type?.toUpperCase() || 'SAVINGS'}</p>
                                <p><span className="font-semibold">Period:</span> {deposit.month || deposit.financial_year?.title}</p>
                                <p><span className="font-semibold">Status:</span> {deposit.status.toUpperCase()}</p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Amount */}
                        <div className="flex justify-between items-center py-6">
                            <span className="text-lg font-semibold">Amount Received</span>
                            <span className="text-3xl font-black">{somiti.currency_symbol}{parseFloat(deposit.amount).toLocaleString()}</span>
                        </div>

                        {/* Amount in words placeholder */}
                        <p className="text-sm text-gray-500 mb-6">
                            Taka In Words: <span className="font-semibold italic">{Number(deposit.amount).toLocaleString()} {somiti.currency}</span>
                        </p>

                        <Separator className="my-4" />

                        {/* Footer */}
                        <div className="flex justify-between text-sm pt-4">
                            <div className="text-center">
                                <p className="font-semibold">{deposit.approver?.name || '_______________'}</p>
                                <p className="text-xs text-gray-500">Authorized Signature</p>
                            </div>
                            <div className="text-center">
                                <p className="font-semibold">{deposit.user.name}</p>
                                <p className="text-xs text-gray-500">Member Signature</p>
                            </div>
                        </div>

                        {somiti.receipt_footer && (
                            <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
                                {somiti.receipt_footer}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>
        </>
    );
}
