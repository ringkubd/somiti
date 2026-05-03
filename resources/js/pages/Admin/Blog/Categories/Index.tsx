import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Tag } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    categories: Category[];
}

export default function CategoryIndex({ categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Blog', href: '/admin/blog-posts' },
        { title: 'Categories', href: '#' }
    ];

    const { data, setData, post, delete: destroy, processing } = useForm({
        name: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/blog-categories', {
            onSuccess: () => setData('name', '')
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Blog Categories" />
            
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-600 rounded-2xl shadow-lg shadow-rose-100 text-white">
                        <Tag className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Blog Categories</h1>
                        <p className="text-slate-500 mt-1">Organize your blog posts into topics</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="md:col-span-1 border-none shadow-xl shadow-slate-200/50">
                        <CardHeader>
                            <CardTitle>Add Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input 
                                        id="name"
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="e.g. System Updates"
                                    />
                                </div>
                                <Button className="w-full bg-rose-600 hover:bg-rose-700" disabled={processing}>
                                    <Plus className="h-4 w-4 mr-2" /> Create
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2 border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardContent className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Category Name</th>
                                        <th className="px-6 py-4">Slug</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{cat.slug}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-red-500"
                                                    onClick={() => { if(confirm('Delete category?')) destroy(`/admin/blog-categories/${cat.id}`) }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
