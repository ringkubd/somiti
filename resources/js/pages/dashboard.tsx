import { Head, router, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { type BreadcrumbItem } from '@/types';
import {
    Wallet,
    TrendingDown,
    Users,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    Activity,
    Building,
    Landmark,
    PieChart,
    Settings,
    ShieldCheck,
    HandCoins,
    CircleDollarSign,
    PiggyBank,
    AlertTriangle,
    FileText,
    TrendingUp,
    ReceiptText,
    CalendarDays,
    UserCog,
    Plus
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface SomitiOption {
    id: number; 
    name: string; 
    unique_code: string;
    currency_symbol: string; 
    currency: string;
    members?: any[];
    managers?: any[];
}

interface DashboardProps {
    somitis: SomitiOption[];
    selected_somiti: SomitiOption | null;
    is_admin: boolean;
    stats: {
        total_members: number;
        total_savings: number;
        total_loans: number;
        total_shares: number;
        net_fund: number;
        savings_trend: { month: string; amount: number }[];
    };
    recent_activity: {
        type: string;
        description: string;
        amount: string;
        time: string;
        status: string;
    }[];
    advertisements: { id: number; title: string; content: string; image_url: string; link_url: string }[];
}

export default function Dashboard({ somitis, selected_somiti, is_admin, stats, recent_activity, advertisements }: DashboardProps) {
    const { pending_approvals_count } = usePage<{ pending_approvals_count?: number }>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '#' },
    ];

    const handleSomitiChange = (value: string) => {
        router.get('/dashboard', { somiti_id: value }, { preserveState: true });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    if (!selected_somiti) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Building className="h-16 w-16 text-slate-300" />
                    <h2 className="text-xl font-bold text-slate-600">No Somiti Found</h2>
                    <p className="text-slate-400">Create or join a somiti to see your dashboard.</p>
                    {is_admin && <Button onClick={() => window.location.href = '/somitis/create'}>Create Somiti</Button>}
                </div>
            </AppLayout>
        );
    }

    const cs = selected_somiti.currency_symbol || '$';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${selected_somiti.name} Dashboard`} />

            <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{selected_somiti.name}</h1>
                    <p className="text-slate-500 text-sm mt-1">{selected_somiti.unique_code} • {selected_somiti.currency || 'USD'}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100 flex items-center justify-between">
                                Members
                                <Users className="h-4 w-4 opacity-70" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_members}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100 flex items-center justify-between">
                                Total Savings
                                <Wallet className="h-4 w-4 opacity-70" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{cs}{stats.total_savings.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-rose-500 to-rose-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-rose-100 flex items-center justify-between">
                                Outstanding Loans
                                <TrendingDown className="h-4 w-4 opacity-70" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{cs}{stats.total_loans.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-violet-100 flex items-center justify-between">
                                Net Fund
                                <Landmark className="h-4 w-4 opacity-70" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{cs}{stats.net_fund.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Growth Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Savings Growth
                                </CardTitle>
                                <CardDescription>Monthly trend of approved deposits</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.savings_trend}>
                                        <defs>
                                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `${cs}${value}`} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Members Section (Merged from Somiti Show) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Users className="h-5 w-5 text-slate-500" />
                                        Society Members
                                    </CardTitle>
                                    <CardDescription>Members currently enrolled in this society</CardDescription>
                                </div>
                                {is_admin && (
                                    <Link href={`/somitis/${selected_somiti.id}/members/create`}>
                                        <Button variant="ghost" size="sm" className="text-blue-600 h-8 gap-1">
                                            <Plus className="h-4 w-4" /> Add Member
                                        </Button>
                                    </Link>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {selected_somiti.members?.map((member: any) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-slate-100 text-slate-600">{getInitials(member.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{member.user.name}</p>
                                                    <p className="text-xs text-slate-500">{member.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="capitalize text-[10px] bg-slate-100 text-slate-700">
                                                    {member.role}
                                                </Badge>
                                                {is_admin && <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500">Remove</Button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Pending Approvals */}
                        {(pending_approvals_count ?? 0) > 0 && (
                            <Link href="/approvals">
                                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-md transition-shadow">
                                    <CardContent className="flex items-center justify-between py-5">
                                        <div>
                                            <p className="text-sm font-semibold text-orange-800">Pending Approvals</p>
                                            <p className="text-xs text-orange-600 mt-0.5">Requests waiting for your decision</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-black text-orange-600">{pending_approvals_count ?? 0}</span>
                                            <ShieldCheck className="h-6 w-6 text-orange-500" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )}

                        {/* Managers Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UserCog className="h-5 w-5 text-slate-500" />
                                    Active Managers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selected_somiti.managers?.map((manager: any) => (
                                    <div key={manager.id} className="flex items-center gap-3 p-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-sm font-medium text-slate-700">{manager.user.name}</span>
                                    </div>
                                ))}
                                {is_admin && (
                                    <>
                                        <Separator />
                                        <Button variant="outline" size="sm" className="w-full">Manage Roles</Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Access (Merged from Somiti Show) */}
                        <Card className="bg-slate-900 text-white border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Link href={`/somitis/${selected_somiti.id}/settings`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <Settings className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Settings</p>
                                </Link>
                                <Link href={`/somitis/${selected_somiti.id}/reports/summary`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <PieChart className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Reports</p>
                                </Link>
                                <Link href={`/somitis/${selected_somiti.id}/workflows`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <ShieldCheck className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Workflows</p>
                                </Link>
                                <Link href={`/somitis/${selected_somiti.id}/reports/trial-balance`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <ReceiptText className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Trial Balance</p>
                                </Link>
                                <Link href={`/somitis/${selected_somiti.id}/reports/member-statement`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <FileText className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Statement</p>
                                </Link>
                                <Link href="/user-shares" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <PieChart className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Shares</p>
                                </Link>
                                <Link href="/deposits" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <Wallet className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Deposits</p>
                                </Link>
                                <Link href="/withdrawals" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <CircleDollarSign className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Withdrawals</p>
                                </Link>
                                <Link href="/loans" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <TrendingDown className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Loans</p>
                                </Link>
                                <Link href="/repayments" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <HandCoins className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Repayments</p>
                                </Link>
                                <Link href="/investments" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <TrendingUp className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Investments</p>
                                </Link>
                                <Link href={`/somitis/${selected_somiti.id}/dividends`} className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <PiggyBank className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Dividends</p>
                                </Link>
                                <Link href="/penalties" className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center">
                                    <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-[10px] font-semibold">Penalties</p>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Clock className="h-5 w-5 text-indigo-500" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="space-y-1">
                                    {recent_activity.length > 0 ? (
                                        recent_activity.map((activity, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors">
                                                <div className={`p-2 rounded-full ${activity.type === 'deposit' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                                    {activity.type === 'deposit' ? <ArrowDownLeft className="h-4 w-4 text-emerald-600" /> : <ArrowUpRight className="h-4 w-4 text-rose-600" />}
                                                </div>
                                                <div className="flex-1 space-y-0.5">
                                                    <p className="text-sm font-semibold text-slate-900">{activity.description}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500">{activity.time}</span>
                                                        {activity.status && (
                                                            <Badge variant={activity.status === 'approved' ? 'default' : 'secondary'} className={`text-[9px] h-4 px-1 uppercase ${activity.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}`}>
                                                                {activity.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-bold ${activity.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {activity.type === 'deposit' ? '+' : '-'}{cs}{activity.amount}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-slate-400 italic text-sm">No recent activity</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
