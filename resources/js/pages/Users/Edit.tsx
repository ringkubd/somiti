import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function UserEdit({ user }: { user: any }) {
    const [name, setName] = useState(user.name || '');

    function submit(e: any) {
        e.preventDefault();
        Inertia.put(`/users/${user.id}`, { name });
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit {user.name}</h1>
            <form onSubmit={submit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded p-2 w-full" />
                </div>
                <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                </div>
            </form>
        </div>
    );
}
