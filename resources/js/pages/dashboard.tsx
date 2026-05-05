import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Wallet, TrendingUp, ShoppingBag, Activity, ArrowUpRight, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ChartDataItem {
    name: string;
    omset: number;
    untung: number;
}

interface TopProductItem {
    name: string;
    value: number;
}

interface DashboardProps {
    chartData: {
        monthly: ChartDataItem[];
        yearly: ChartDataItem[];
        topProducts: TopProductItem[];
    };
    stats: {
        totalOmset: number;
        totalUntung: number;
        currentMonthSales: number;
        totalData: number;
    };
}

export default function Dashboard({ chartData, stats }: DashboardProps) {
    const formatRp = (num: number | string | undefined | null) => {
        if (num === null || num === undefined) return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 10) return { text: 'Selamat Pagi', emoji: '🌅' };
        if (hour < 15) return { text: 'Selamat Siang', emoji: '☀️' };
        if (hour < 18) return { text: 'Selamat Sore', emoji: '🌇' };
        return { text: 'Selamat Malam', emoji: '🌙' };
    };

    const greeting = getGreeting();
    const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

    return (
        <>
            <Head title="Dashboard Analytics" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/50 p-6 md:p-8 rounded-xl dark:bg-slate-900/50">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                            {greeting.emoji} {greeting.text}, Bos!
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overview Bisnis</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Pantau performa penjualan dan produk terlaris cabang Laper.in Anda.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Card 1: Total Omset */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/80 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(59,130,246,0.15)] dark:bg-slate-800 dark:from-slate-800 dark:to-slate-800/80 dark:ring-slate-700">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-600/20 blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Total Omset Keseluruhan</p>
                                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                                    {formatRp(stats?.totalOmset)}
                                </p>
                            </div>
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                                <Wallet className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Keuntungan Bersih */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/80 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] dark:bg-slate-800 dark:from-slate-800 dark:to-slate-800/80 dark:ring-slate-700">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Total Untung Bersih</p>
                                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                                    {formatRp(stats?.totalUntung)}
                                </p>
                            </div>
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Omset Bulan Ini */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white bg-gradient-to-br from-white to-violet-50/30 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/80 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(139,92,246,0.15)] dark:bg-slate-800 dark:from-slate-800 dark:to-slate-800/80 dark:ring-slate-700">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-violet-400/20 to-violet-600/20 blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Omset Bulan Ini</p>
                                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                                    {formatRp(stats?.currentMonthSales)}
                                </p>
                            </div>
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                                <Activity className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Total Transaksi */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white bg-gradient-to-br from-white to-amber-50/30 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/80 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(245,158,11,0.15)] dark:bg-slate-800 dark:from-slate-800 dark:to-slate-800/80 dark:ring-slate-700">
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Shift Tersimpan</p>
                                <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
                                    {stats?.totalData || 0} <span className="text-lg font-medium text-slate-400 lowercase">hari</span>
                                </p>
                            </div>
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                    {/* Monthly Chart */}
                    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700 lg:col-span-2">
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
                                    <RechartsTooltip
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

                    {/* Top Products Pie Chart */}
                    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700 lg:col-span-1">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top 5 Menu Terlaris</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Porsi terbanyak terjual.</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            {chartData?.topProducts?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData.topProducts}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.topProducts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: number) => [`${value} Porsi`, 'Terjual']}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-sm text-slate-400 flex flex-col items-center gap-2">
                                    <ShoppingBag className="w-8 h-8 opacity-20" />
                                    Belum ada data penjualan
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Yearly Chart */}
                    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700 lg:col-span-3">
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
                                    <RechartsTooltip
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
