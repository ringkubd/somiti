import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {(flash?.success || flash?.error) && (
                    <div className="px-4 pt-4">
                        {flash.success && (
                            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                                <XCircle className="h-4 w-4 shrink-0" />
                                {flash.error}
                            </div>
                        )}
                    </div>
                )}
                {children}
            </AppContent>
        </AppShell>
    );
}
