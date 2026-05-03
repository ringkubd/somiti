import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Bell, BellRing, MailOpen, Trash2 } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    somiti?: {
        name: string;
    };
}

interface IndexProps {
    notifications: {
        data: Notification[];
        links: any;
    };
}

export default function NotificationsIndex({ notifications }: IndexProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Notifications', url: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <BellRing className="h-6 w-6 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    </div>
                    <Button variant="outline" size="sm" className="text-gray-500">
                        Mark all as read
                    </Button>
                </div>

                <div className="space-y-4">
                    {notifications.data.length > 0 ? (
                        notifications.data.map((n) => (
                            <Card key={n.id} className={`transition-all hover:shadow-md ${n.is_read ? 'opacity-75' : 'border-l-4 border-l-orange-500'}`}>
                                <CardContent className="p-4 flex gap-4 items-start">
                                    <div className={`p-2 rounded-full ${n.is_read ? 'bg-gray-100' : 'bg-orange-100'}`}>
                                        {n.is_read ? <MailOpen className="h-4 w-4 text-gray-500" /> : <Bell className="h-4 w-4 text-orange-600" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-semibold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h3>
                                            <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">{n.message}</p>
                                        {n.somiti && (
                                            <Badge variant="secondary" className="mt-2 text-[10px] h-5 px-1.5 font-normal">
                                                {n.somiti.name}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Link href={`/notifications/${n.id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MailOpen className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-dashed py-12">
                            <CardContent className="text-center space-y-3">
                                <Bell className="h-12 w-12 text-gray-300 mx-auto" />
                                <p className="text-gray-500">All caught up!</p>
                                <p className="text-sm text-gray-400">You don't have any notifications at the moment.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
