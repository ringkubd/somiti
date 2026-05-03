import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Somiti {
    id: number;
    name: string;
}

interface Props {
    somiti: Somiti;
    availableUsers: User[];
}

export default function MemberCreate({ somiti, availableUsers }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Somitis', href: '/somitis' },
        { title: somiti.name, href: `/somitis/${somiti.id}` },
        { title: 'Add Member', href: '#' }
    ];

    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        role: 'member'
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/somitis/${somiti.id}/members`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Member" />
            
            <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Member</CardTitle>
                        <CardDescription>Add a user to {somiti.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="user">Select User</Label>
                                <Select onValueChange={(value) => setData('user_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a user..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.user_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select onValueChange={(value) => setData('role', value)} defaultValue="member">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link href={`/somitis/${somiti.id}`}>
                                    <Button variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Add Member
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
