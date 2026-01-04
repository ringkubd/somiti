import React from 'react';
import { InertiaLink } from '@inertiajs/react';

export default function NotificationsIndex({ notifications }: { notifications: any }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <ul className="space-y-3">
                {notifications.data.map((n: any) => (
                    <li key={n.id} className="border p-3 rounded">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-semibold">{n.title}</div>
                                <div className="text-sm text-gray-500">{n.message}</div>
                            </div>
                            <div>
                                <InertiaLink href={`/notifications/${n.id}`} className="text-blue-600">View</InertiaLink>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
