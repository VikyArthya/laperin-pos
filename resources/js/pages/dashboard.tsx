import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Wallet, TrendingUp, ShoppingBag, Activity, ArrowUpRight, ArrowRight } from 'lucide-react';

interface SaleData {
    id: number;
    tanggal: string;
    omset_penjualan: number;
    untung_bersih: number;
    shift: { nama_shift: string };
}

interface DashboardProps {
    recentSales: SaleData[];
    stats: {
        totalOmset: number;
        totalUntung: number;
        currentMonthSales: number;
        totalData: number;
    };
}

export default function Dashboard({ recentSales = [], stats }: DashboardProps) {
    const formatRp = (num: number) => {
        if (!num) return 'Rp 0';
        return 'Rp ' + num.toLocaleString('id-ID');
    };

    return (
        <>
            <Head title="Dashboard Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/50 p-6 md:p-8 rounded-xl dark:bg-slate-900/50">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview Bisnis</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Pantau performa penjualan dan keuangan cabang Laper.in Anda.</p>
                    </div>
                    <Link 
                        href="/sales" 
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-all shadow-sm ring-1 ring-slate-900/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 dark:ring-white/10"
                    >
                        Lihat Semua Data
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Card 1: Total Omset */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-slate-100 transition-all hover:shadow-lg dark:bg-slate-800 dark:ring-slate-700">
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50/50 transition-transform group-hover:scale-150 dark:bg-blue-900/20"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Omset Keseluruhan</p>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {formatRp(stats?.totalOmset)}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                <Wallet className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Keuntungan Bersih */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-slate-100 transition-all hover:shadow-lg dark:bg-slate-800 dark:ring-slate-700">
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-50/50 transition-transform group-hover:scale-150 dark:bg-emerald-900/20"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Untung Bersih</p>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {formatRp(stats?.totalUntung)}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Omset Bulan Ini */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-slate-100 transition-all hover:shadow-lg dark:bg-slate-800 dark:ring-slate-700">
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-50/50 transition-transform group-hover:scale-150 dark:bg-violet-900/20"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Omset Bulan Ini</p>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {formatRp(stats?.currentMonthSales)}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                                <Activity className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Total Transaksi */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-slate-100 transition-all hover:shadow-lg dark:bg-slate-800 dark:ring-slate-700">
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-50/50 transition-transform group-hover:scale-150 dark:bg-amber-900/20"></div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Shift Tersimpan</p>
                                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {stats?.totalData || 0} <span className="text-lg font-normal text-slate-400">hari</span>
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Sales Section */}
                <div className="mt-4 rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-700">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Penjualan 5 Hari Terakhir</h2>
                        <Link href="/sales" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            Lihat Semua
                        </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Tanggal</th>
                                    <th className="px-6 py-4 font-medium">Shift Cabang</th>
                                    <th className="px-6 py-4 font-medium">Omset</th>
                                    <th className="px-6 py-4 font-medium">Untung Bersih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {recentSales.length > 0 ? recentSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-300">
                                            {sale.tanggal}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                                                {sale.shift?.nama_shift || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">
                                            {formatRp(sale.omset_penjualan)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                            {formatRp(sale.untung_bersih)}
                                            <ArrowUpRight className="h-3 w-3" />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                            Belum ada data penjualan tersedia.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
