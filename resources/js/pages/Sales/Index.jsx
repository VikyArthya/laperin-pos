import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Wallet, TrendingUp, Search, CalendarDays, Eye, Download } from 'lucide-react';

export default function Index({ sales, shifts, filters, summary, auth }) {
    const initialMonth = filters?.month ? filters.month.split('-')[1] : '';
    const initialYear = filters?.month ? filters.month.split('-')[0] : new Date().getFullYear().toString();

    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const [shiftId, setShiftId] = useState(filters?.shift_id || '');

    const formatRp = (num) => {
        if (num === null || num === undefined) return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    // Apply filters when they change
    useEffect(() => {
        let monthParam = '';
        if (selectedMonth) {
            monthParam = `${selectedYear}-${selectedMonth}`;
        }

        // Skip first render if no filters are applied and local state is empty
        if (monthParam === (filters?.month || '') && shiftId === (filters?.shift_id || '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get('/sales', { month: monthParam, shift_id: shiftId }, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(timeout);
    }, [selectedMonth, selectedYear, shiftId]);

    const resetFilters = () => {
        setSelectedMonth('');
        // We can keep the selectedYear or reset to current year
        setSelectedYear(new Date().getFullYear().toString());
        setShiftId('');
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (selectedMonth) {
            params.append('month', `${selectedYear}-${selectedMonth}`);
        }
        if (shiftId) {
            params.append('shift_id', shiftId);
        }
        window.location.href = `/sales/export?${params.toString()}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Summary" />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Summary</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Analisis data omset berdasarkan bulan dan cabang operasional.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export Excel
                        </button>
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Analytics Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Omset Filter</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatRp(summary.totalOmset)}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Untung Bersih Filter</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatRp(summary.totalUntung)}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jumlah Transaksi Filter</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.count} Hari Shift</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Filters Bar */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pilih Bulan</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full sm:w-40 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-white py-2"
                                >
                                    <option value="">Semua Bulan</option>
                                    <option value="01">Januari</option>
                                    <option value="02">Februari</option>
                                    <option value="03">Maret</option>
                                    <option value="04">April</option>
                                    <option value="05">Mei</option>
                                    <option value="06">Juni</option>
                                    <option value="07">Juli</option>
                                    <option value="08">Agustus</option>
                                    <option value="09">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Desember</option>
                                </select>
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pilih Tahun</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full sm:w-32 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-white py-2"
                                >
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                    <option value="2028">2028</option>
                                    <option value="2029">2029</option>
                                    <option value="2030">2030</option>
                                </select>
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Filter Cabang</label>
                                <select
                                    value={shiftId}
                                    onChange={(e) => setShiftId(e.target.value)}
                                    className="w-full sm:w-48 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-white py-2"
                                >
                                    <option value="">Semua Cabang</option>
                                    {shifts.map(shift => (
                                        <option key={shift.id} value={shift.id}>{shift.nama_shift}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {(selectedMonth || shiftId) && (
                            <button
                                onClick={resetFilters}
                                className="text-sm text-red-500 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300 mt-4 sm:mt-0"
                            >
                                Hapus Filter
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Tanggal</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Shift</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Modal Produk</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Omset Penjualan</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Untung Bersih</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Dana (Masuk/Keluar)</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                                {sales.data.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {sale.tanggal}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                {sale.shift?.nama_shift || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                            {formatRp(sale.modal_awal)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatRp(sale.omset_penjualan)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatRp((sale.untung_bersih || 0) + (sale.selisih_pembayaran || 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                                            <span className="text-emerald-600 dark:text-emerald-400">+{formatRp(sale.dana_masuk || 0)}</span>
                                            <span className="mx-1 text-gray-300 dark:text-slate-600">|</span>
                                            <span className="text-red-600 dark:text-red-400">-{formatRp(sale.dana_keluar || 0)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/sales/${sale.id}`}
                                                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4 mr-1" /> Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {sales.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            <Search className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                            <p>Tidak ada data penjualan untuk filter tersebut.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{sales.from || 0}</span> - <span className="font-semibold text-slate-900 dark:text-white">{sales.to || 0}</span> dari <span className="font-semibold text-slate-900 dark:text-white">{sales.total}</span>
                        </span>
                        <div className="flex space-x-2">
                            {sales.prev_page_url ? (
                                <Link href={sales.prev_page_url} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm">
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800">Sebelumnya</button>
                            )}

                            {sales.next_page_url ? (
                                <Link href={sales.next_page_url} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm">
                                    Selanjutnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800">Selanjutnya</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
