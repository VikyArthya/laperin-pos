import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Banknote, ChevronDown, ChevronUp, Calendar, Users, TrendingUp, Calculator } from 'lucide-react';

const MONTHS = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

function formatRp(num) {
    return 'Rp ' + (num || 0).toLocaleString('id-ID');
}

function formatTanggal(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Index({ payrollData, weeklyPeriods, filters }) {
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const [month, setMonth] = useState(filters.month);
    const [year, setYear] = useState(filters.year);
    const [weekPeriod, setWeekPeriod] = useState(filters.week_period || 'all');

    const toggleExpand = (employeeId) => {
        setExpandedEmployee(prev => prev === employeeId ? null : employeeId);
    };

    const handleFilter = () => {
        router.get('/payroll', { month, year, week_period: weekPeriod }, { preserveState: true, preserveScroll: true });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const grandTotalGaji = payrollData.reduce((sum, p) => sum + p.total_gaji, 0);
    const grandTotalOmset = payrollData.reduce((sum, p) => sum + p.total_omset, 0);

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Penggajian Karyawan" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                                <Banknote className="w-6 h-6" />
                            </div>
                            Penggajian Karyawan
                        </h1>
                        <p className="mt-1 text-slate-500">Rekap gaji otomatis berdasarkan omset penjualan harian.</p>
                    </div>
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors">
                        Kembali
                    </Link>
                </div>

                {/* Formula Info Card */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <Calculator className="w-8 h-8 shrink-0 opacity-80" />
                        <div>
                            <p className="font-semibold text-lg">Rumus Gaji Otomatis</p>
                            <p className="text-emerald-100 text-sm mt-0.5">
                                <span className="font-mono bg-white/15 px-2 py-0.5 rounded">Gaji Harian = (Omset × 20%) + (⌊Omset ÷ 100rb⌋ × 5rb)</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Bulan</label>
                                <select
                                    value={month}
                                    onChange={e => setMonth(Number(e.target.value))}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                                >
                                    {MONTHS.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tahun</label>
                                <select
                                    value={year}
                                    onChange={e => setYear(Number(e.target.value))}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Periode Mingguan</label>
                                <select
                                    value={weekPeriod}
                                    onChange={e => setWeekPeriod(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none"
                                >
                                    <option value="all">Semua Periode</option>
                                    {weeklyPeriods && weeklyPeriods.map((period) => (
                                        <option key={period.payment_date} value={period.payment_date}>
                                            {period.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleFilter}
                            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                        >
                            Tampilkan
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-4 h-4 text-blue-600" /></div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan Aktif</span>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900">{payrollData.length} <span className="text-sm font-medium text-slate-400">orang</span></p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-violet-100 rounded-lg"><TrendingUp className="w-4 h-4 text-violet-600" /></div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Omset</span>
                        </div>
                        <p className="text-2xl font-extrabold text-slate-900">{formatRp(grandTotalOmset)}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg"><Banknote className="w-4 h-4 text-emerald-600" /></div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Gaji</span>
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-600">{formatRp(grandTotalGaji)}</p>
                    </div>
                </div>

                {/* Payroll List */}
                <div className="space-y-4">
                    {payrollData.length > 0 ? (
                        payrollData.map((p) => (
                            <div key={p.employee_id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
                                {/* Employee Summary Row */}
                                <button
                                    onClick={() => toggleExpand(p.employee_id)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/70 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/20">
                                            {p.employee_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-base">{p.employee_name}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {p.total_hari} hari kerja &bull; Omset: {formatRp(p.total_omset)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 font-medium">Total Gaji</p>
                                            <p className="text-xl font-extrabold text-emerald-600">{formatRp(p.total_gaji)}</p>
                                        </div>
                                        {expandedEmployee === p.employee_id ? (
                                            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                                        )}
                                    </div>
                                </button>

                                {/* Details Table */}
                                {expandedEmployee === p.employee_id && (
                                    <div className="border-t border-slate-100 bg-slate-50/50">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-slate-200">
                                                <thead className="bg-slate-100/80">
                                                    <tr>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tanggal</th>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Shift</th>
                                                        <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Omset</th>
                                                        <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Base (20%)</th>
                                                        <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Bonus</th>
                                                        <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Gaji Harian</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                    {p.details.map((d, idx) => (
                                                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                                                            <td className="px-5 py-3 text-sm text-slate-700 font-medium whitespace-nowrap">{formatTanggal(d.tanggal)}</td>
                                                            <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">{d.shift}</td>
                                                            <td className="px-5 py-3 text-sm text-slate-800 font-semibold text-right whitespace-nowrap">{formatRp(d.omset)}</td>
                                                            <td className="px-5 py-3 text-sm text-blue-600 text-right whitespace-nowrap">{formatRp(d.gaji_base)}</td>
                                                            <td className="px-5 py-3 text-sm text-violet-600 text-right whitespace-nowrap">+{formatRp(d.bonus)}</td>
                                                            <td className="px-5 py-3 text-sm text-emerald-700 font-bold text-right whitespace-nowrap">{formatRp(d.gaji_harian)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                                                    <tr>
                                                        <td colSpan={2} className="px-5 py-3.5 text-sm font-bold uppercase tracking-wider">Total {p.total_hari} Hari</td>
                                                        <td className="px-5 py-3.5 text-sm font-bold text-right">{formatRp(p.total_omset)}</td>
                                                        <td className="px-5 py-3.5"></td>
                                                        <td className="px-5 py-3.5"></td>
                                                        <td className="px-5 py-3.5 text-sm font-extrabold text-right text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]">{formatRp(p.total_gaji)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                            <Banknote className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                            <p className="text-lg font-semibold text-slate-700">Tidak ada data gaji</p>
                            <p className="text-sm text-slate-400 mt-1">
                                Belum ada transaksi penjualan di periode yang dipilih.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
