import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, Calendar, MapPin, User, Wallet, Receipt, DollarSign, Package } from 'lucide-react';

export default function Show({ sale }) {
    const formatRp = (num) => {
        if (num === null || num === undefined) return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:8">
            <Head title={`Detail Laporan - ${sale.tanggal}`} />

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Receipt className="w-6 h-6" />
                            </div>
                            Detail Laporan Penjualan
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Lihat rincian lengkap transaksi harian.</p>
                    </div>
                    <Link
                        href="/sales"
                        className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Link>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Tanggal</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(sale.tanggal)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Shift / Cabang</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{sale.shift?.nama_shift || '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Petugas</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{sale.user?.name || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Details */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Rincian Keuangan
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Modal Produk</p>
                                <p className="font-bold text-gray-900 dark:text-white">{formatRp(sale.modal_awal)}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 font-medium">Dana Masuk</p>
                                <p className="font-bold text-emerald-700 dark:text-emerald-300">+{formatRp(sale.dana_masuk)}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800">
                                <p className="text-xs text-red-600 dark:text-red-400 mb-1 font-medium">Dana Keluar</p>
                                <p className="font-bold text-red-700 dark:text-red-300">-{formatRp(sale.dana_keluar)}</p>
                            </div>
                        </div>

                        {/* Payment Methods Section */}
                        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">Metode Pembayaran</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">💵 Cash</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{formatRp(sale.cash)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">📱 QRIS</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{formatRp(sale.qris)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">🍔 ShopeeFood</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{formatRp(sale.sf)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Total Pembayaran</p>
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">{formatRp(Number(sale.cash) + Number(sale.qris) + Number(sale.sf))}</p>
                                </div>
                            </div>
                        </div>

                        {/* Summary Section - Dark */}
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <p className="text-xs font-bold tracking-wider text-slate-400 mb-2">TOTAL OMSET PENJUALAN</p>
                                    <p className="text-3xl font-black text-blue-400">{formatRp(sale.omset_penjualan)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-wider text-slate-400 mb-2">SELISIH DANA</p>
                                    <p className="text-3xl font-black text-emerald-400">{formatRp(sale.selisih_dana)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee Info */}
                {sale.is_karyawan_hadir && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Info Karyawan
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-medium">Gaji Dibayarkan</p>
                                <p className="font-bold text-amber-700 dark:text-amber-300">{formatRp(sale.gaji_karyawan)}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sale Items */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" /> Detail Produk Terjual
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nama Produk</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Harga Satuan</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                                {sale.sale_items && sale.sale_items.length > 0 ? (
                                    sale.sale_items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {item.product?.nama_produk || 'Produk Dihapus'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                                    ${item.product?.kategori === 'Menu Utama' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                                    item.product?.kategori === 'Topping' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
                                                    item.product?.kategori === 'Packaging' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                                                    'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                                                    {item.product?.kategori || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">
                                                    {item.qty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatRp(item.harga_satuan)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                                {formatRp(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-600 dark:text-gray-400">
                                            <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="text-sm">Tidak ada produk terjual.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sisa Produk */}
                {sale.laporan_pulang?.items?.some(i => i.qty_sisa > 0) && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Sisa Produk (Tidak Terjual)
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {sale.laporan_pulang.items.filter(i => i.qty_sisa > 0).map(item => (
                                    <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold truncate">{item.product?.nama_produk}</p>
                                        <p className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">{item.qty_sisa} <span className="text-[10px] font-medium text-slate-400">unit</span></p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes */}
                {sale.catatan && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Catatan Tambahan</h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{sale.catatan}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
