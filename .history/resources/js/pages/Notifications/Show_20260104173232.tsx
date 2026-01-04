import React from 'react';
import { router } from '@inertiajs/react';

export default function NotificationShow({ notification }: { notification: any }) {
    function markRead() {
        router.post(`/api/notifications/${notification.id}/mark-read`);
        // reload page
        location.reload();
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{notification.title}</h1>
            <p className="mb-4">{notification.message}</p>
            <button onClick={markRead} className="px-3 py-1 rounded bg-blue-600 text-white">Mark read</button>
        </div>
    );
}
