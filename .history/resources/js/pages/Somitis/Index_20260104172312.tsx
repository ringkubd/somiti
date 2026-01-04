import React from 'react';
import { InertiaLink } from '@inertiajs/react';

export default function SomitisIndex({ somitis }: { somitis: any }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Somitis</h1>
            <ul className="space-y-3">
                {somitis.data.map((s: any) => (
                    <li key={s.id} className="border rounded p-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-semibold">{s.name}</h2>
                                <div className="text-sm text-gray-500">Status: {s.status}</div>
                            </div>
                            <div>
                                <InertiaLink href={`/somitis/${s.id}`} className="text-blue-600">View</InertiaLink>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
