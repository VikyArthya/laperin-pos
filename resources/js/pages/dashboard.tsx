import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Wallet, TrendingUp, ShoppingBag, Activity, ArrowUpRight, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ChartDataItem {
    name: string;
    omset: number;
    untung: number;
}

interface DashboardProps {
    chartData: {
        monthly: ChartDataItem[];
        yearly: ChartDataItem[];
    };
    stats: {
        totalOmset: number;
        totalUntung: number;
        currentMonthSales: number;
        totalData: number;
    };
}

export default function Dashboard({ chartData, stats }: DashboardProps) {
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

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
                    {/* Monthly Chart */}
                    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Trend Bulanan ({new Date().getFullYear()})</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Grafik omset dan untung setiap bulan.</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData?.monthly || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => ['Rp ' + value.toLocaleString('id-ID'), '']}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="omset" name="Omset" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="untung" name="Untung Bersih" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Yearly Chart */}
                    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Trend Tahunan</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Perkembangan bisnis dari tahun ke tahun.</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData?.yearly || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => ['Rp ' + value.toLocaleString('id-ID'), '']}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Line type="monotone" dataKey="omset" name="Omset" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="untung" name="Untung Bersih" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
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
