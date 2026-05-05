import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Package, Receipt, Store, Box, Users, ShieldAlert, Banknote, FileText } from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
import type { NavItem } from '@/types';

const allNavItems = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        role: 'all'
    },
    {
        title: 'Kasir / Penjualan',
        href: '/sales',
        icon: Receipt,
        role: 'all'
    },
    {
        title: 'Laporan Pulang',
        href: '/laporan-pulang',
        icon: FileText,
        role: 'all'
    },
    {
        title: 'Master Cabang / Shift',
        href: '/shifts',
        icon: Store,
        role: 'admin'
    },
    {
        title: 'Master Produk',
        href: '/products',
        icon: Package,
        role: 'admin'
    },
    {
        title: 'Master Bahan Pokok',
        href: '/materials',
        icon: Box,
        role: 'admin'
    },
    {
        title: 'Master Karyawan',
        href: '/employees',
        icon: Users,
        role: 'admin'
    },
    {
        title: 'Penggajian Karyawan',
        href: '/payroll',
        icon: Banknote,
        role: 'admin'
    },
    {
        title: 'Manajemen User',
        href: '/users',
        icon: ShieldAlert,
        role: 'admin'
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: FolderGit2,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    // Get logged in user role from Inertia props
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role || 'karyawan';

    // Filter items based on role
    const filteredNavItems = allNavItems.filter(item => item.role === 'all' || item.role === userRole) as NavItem[];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
