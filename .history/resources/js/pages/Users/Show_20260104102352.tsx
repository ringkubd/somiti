import React from 'react';
import { InertiaLink } from '@inertiajs/react';

export default function UserShow({ user }: { user: any }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{user.name}</h1>
            <div className="mb-2">Phone: {user.phone}</div>
            <div className="mb-2">Email: {user.email}</div>
            <InertiaLink href={`/users/${user.id}/edit`} className="text-blue-600">Edit</InertiaLink>
        </div>
    );
}
