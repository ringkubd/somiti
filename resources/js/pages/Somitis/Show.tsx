import React from 'react';
import { InertiaLink } from '@inertiajs/react';

export default function SomitiShow({ somiti }: { somiti: any }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{somiti.name}</h1>
            <p className="mb-4">Status: {somiti.status}</p>

            <h3 className="text-lg font-semibold">Managers</h3>
            <ul className="mb-4">
                {somiti.managers.map((m: any) => (
                    <li key={m.id}>{m.user_id}</li>
                ))}
            </ul>

            <h3 className="text-lg font-semibold">Members</h3>
            <ul>
                {somiti.members.map((m: any) => (
                    <li key={m.id}>{m.user_id}</li>
                ))}
            </ul>

            <div className="mt-6">
                <InertiaLink href="/notifications" className="text-blue-600">Notifications</InertiaLink>
            </div>
        </div>
    );
}
