import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    User,
    Building, 
    Wallet, 
    TrendingDown, 
    Briefcase, 
    Landmark, 
    PieChart, 
    CalendarDays, 
    BookText, 
    ShieldCheck,
    Folder,
    BookOpen,
    Users,
    Globe,
    ArrowRightLeft,
    Settings,
    Coins,
    Scale,
    Banknote,
    MessageCircle,
    CircleDollarSign,
    HandCoins,
    PiggyBank,
    AlertTriangle
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My Portfolio',
        href: '/profile',
        icon: User,
    },
    {
        title: 'Deposits',
        href: '/deposits',
        icon: Wallet,
    },
    {
        title: 'Withdrawals',
        href: '/withdrawals',
        icon: CircleDollarSign,
    },
    {
        title: 'Loans',
        href: '/loans',
        icon: TrendingDown,
    },
    {
        title: 'Loan Repayments',
        href: '/repayments',
        icon: HandCoins,
    },
    {
        title: 'Investments',
        href: '/investments',
        icon: Briefcase,
    },
    {
        title: 'FDRs',
        href: '/fdrs',
        icon: Landmark,
    },
    {
        title: 'Bank Accounts',
        href: '/bank-accounts',
        icon: Banknote,
    },
    {
        title: 'Member Shares',
        href: '/user-shares',
        icon: PieChart,
    },
    {
        title: 'Financial Years',
        href: '/financial-years',
        icon: CalendarDays,
    },
    {
        title: 'Share Transfers',
        href: '/share-transfers',
        icon: ArrowRightLeft,
    },
    {
        title: 'Penalties',
        href: '/penalties',
        icon: AlertTriangle,
    },
    {
        title: 'Chat',
        href: '/chat',
        icon: MessageCircle,
    },
    {
        title: 'General Ledger',
        href: '/ledgers',
        icon: BookText,
    },
    {
        title: 'My Approvals',
        href: '/approvals',
        icon: ShieldCheck,
    },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Somitis',
        href: '/somitis',
        icon: Building,
    },
    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'SEO Settings',
        href: '/admin/seo',
        icon: Globe,
    },
    {
        title: 'Website CMS',
        href: '/admin/cms',
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth, selected_somiti_id, is_somiti_admin, pending_approvals_count } = usePage().props as any;
    const isSuperAdmin = auth.user?.role === 'super_admin';

    const dividendsNavItem = selected_somiti_id
        ? [{ title: 'Dividends', href: `/somitis/${selected_somiti_id}/dividends`, icon: PiggyBank }]
        : [];

    const mainNavItemsWithBadges = [...mainNavItems, ...dividendsNavItem].map((item) =>
        item.href === '/approvals' && pending_approvals_count > 0
            ? { ...item, badge: pending_approvals_count }
            : item,
    );

    const managementNavItems: NavItem[] = selected_somiti_id && is_somiti_admin ? [
        {
            title: 'Society Settings',
            href: `/somitis/${selected_somiti_id}/settings`,
            icon: Settings,
        },
        {
            title: 'Policy Rules',
            href: `/somitis/${selected_somiti_id}/workflows`,
            icon: ShieldCheck,
        },
    ] : [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Somiti Manager
                </div>
                <NavMain items={mainNavItemsWithBadges} />

                {managementNavItems.length > 0 && (
                    <>
                        <div className="px-4 py-2 mt-4 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                            Management
                        </div>
                        <NavMain items={managementNavItems} />
                    </>
                )}

                {isSuperAdmin && (
                    <>
                        <div className="px-4 py-2 mt-4 text-xs font-bold text-red-500 uppercase tracking-wider">
                            Super Admin
                        </div>
                        <NavMain items={adminNavItems} />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
