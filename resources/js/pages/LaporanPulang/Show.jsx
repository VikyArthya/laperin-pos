import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Package, Wallet, CheckSquare, CheckCircle, Clock } from 'lucide-react';

export default function Show({ laporan, itemsByCategory, stockRefillMaterials }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const isKaryawan = authUser?.role === 'karyawan';

    const formatRp = (num) => {
        if (num === null || num === undefined) return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
        const ribuan = (number / 1000).toFixed(1);
        return number > 0 ? `${ribuan}k` : '0';
    };

    const formatDateFull = (dateStr) => {
        if (!dateStr) return '-';
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const date = new Date(dateStr);
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatItem = (qty_sisa, qty_bawa) => {
        const sisa = Number(qty_sisa);
        const bawa = Number(qty_bawa);
        const terjual = Math.max(0, bawa - sisa);
        return `${sisa} (${bawa})`;
    };

    const getInitial = (nama) => {
        return nama.split(' ')[0].toUpperCase();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'submitted_by_admin':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-600 border border-amber-200">
                        <Clock className="w-4 h-4" />
                        Menunggu Karyawan
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        Selesai
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-slate-50 text-slate-600 border border-slate-200">
                        Draft
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title={`Laporan Pulang - ${laporan.tanggal}`} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            Laporan Pulang (Peleburan)
                        </h1>
                        <p className="mt-1 text-slate-600 font-medium">{formatDateFull(laporan.tanggal)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(laporan.status)}
                        <Link
                            href="/laporan-pulang"
                            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Link>
                    </div>
                </div>

                {/* Laporan Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 space-y-8">

                        {/* ISIAN Section */}
                        {itemsByCategory['Menu Utama'] && itemsByCategory['Menu Utama'].length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200">
                                    ———— ISIAN ——---
                                </h2>
                                <div className="space-y-2">
                                    {itemsByCategory['Menu Utama'].map((item) => {
                                        const qtyBawa = Number(item.qty_bawa);
                                        const qtySisa = Number(item.qty_sisa);
                                        const qtyTerjual = Math.max(0, qtyBawa - qtySisa);
                                        const product = item.product;

                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-slate-400 w-6 text-center">
                                                        {getInitial(product?.nama_produk || '')}
                                                    </span>
                                                    <div>
                                                        <span className="text-slate-700">{product?.nama_produk || '-'}</span>
                                                        {laporan.status === 'completed' && (
                                                            <span className="ml-2 text-xs text-emerald-600 font-medium">
                                                                Terjual: {qtyTerjual}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold text-purple-600">
                                                        {formatItem(item.qty_sisa, item.qty_bawa)}
                                                    </span>
                                                    {laporan.status === 'completed' && qtyTerjual > 0 && product && (
                                                        <div className="text-xs text-emerald-600 font-medium">
                                                            {formatRp(product.harga * qtyTerjual)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* TOPPING Section */}
                        {itemsByCategory['Topping'] && itemsByCategory['Topping'].length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200">
                                    ------ TOPPING ------
                                </h2>
                                <div className="space-y-2">
                                    {itemsByCategory['Topping'].map((item) => {
                                        const qtyBawa = Number(item.qty_bawa);
                                        const qtySisa = Number(item.qty_sisa);
                                        const qtyTerjual = Math.max(0, qtyBawa - qtySisa);

                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-slate-400 w-6 text-center">
                                                        {getInitial(item.product?.nama_produk || '')}
                                                    </span>
                                                    <span className="text-slate-700">{item.product?.nama_produk || '-'}</span>
                                                </div>
                                                <span className="font-semibold text-purple-600">
                                                    {qtySisa} ({qtyBawa})
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* PACKAGING Section */}
                        {itemsByCategory['Packaging'] && itemsByCategory['Packaging'].length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200">
                                    ------ PACKAGING -----
                                </h2>
                                <div className="space-y-2">
                                    {itemsByCategory['Packaging'].map((item) => {
                                        const qtyBawa = Number(item.qty_bawa);
                                        const qtySisa = Number(item.qty_sisa);
                                        const qtyTerjual = Math.max(0, qtyBawa - qtySisa);

                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-slate-400 w-6 text-center">
                                                        {getInitial(item.product?.nama_produk || '')}
                                                    </span>
                                                    <span className="text-slate-700">{item.product?.nama_produk || '-'}</span>
                                                </div>
                                                <span className="font-semibold text-purple-600">
                                                    {formatItem(item.qty_sisa, item.qty_bawa)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* CASH Section */}
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200">
                                -------- CASH ---------
                            </h2>
                            <div className="space-y-3">
                                {laporan.ma_50 && (
                                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                                        <span className="font-medium text-slate-700">Ma 50</span>
                                        <span className="font-bold text-slate-900">{laporan.ma_50}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Cash :</span>
                                    <span className="font-bold text-slate-900">{formatRp(laporan.cash)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Qr&nbsp;&nbsp;&nbsp;&nbsp;:</span>
                                    <span className="font-bold text-slate-900">{formatRp(laporan.qris)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="font-medium text-slate-700">Sf&nbsp;&nbsp;&nbsp;&nbsp;:</span>
                                    <span className="font-bold text-slate-900">{formatRp(laporan.sf)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white">
                                    <span className="font-bold">Total :</span>
                                    <span className="font-black text-xl">{formatRp(laporan.total_pembayaran)}</span>
                                </div>
                            </div>
                        </div>

                        {/* STOK Section */}
                        {laporan.status === 'completed' && (
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200">
                                    ------- STOK -------
                                </h2>
                                {stockRefillMaterials && stockRefillMaterials.length > 0 ? (
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                                            {stockRefillMaterials.map((material) => (
                                                <div key={material.id} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                                                    <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center">
                                                        <span className="text-white text-xs">!</span>
                                                    </div>
                                                    <span className="text-xs text-slate-700 font-medium">{material.nama_bahan}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm font-semibold text-blue-900 mb-1">CATATAN STOK</p>
                                            <p className="text-xs text-blue-700">( ! ) perlu direfill &nbsp; (   ) kosongi jika masih banyak</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="text-sm text-slate-700 whitespace-pre-line font-mono">
                                            {laporan.catatan_stok || 'Tidak ada item yang perlu direfill.'}
                                        </div>
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="text-sm font-semibold text-blue-900 mb-2">CATATAN STOK</p>
                                            <p className="text-xs text-blue-700">( ! ) perlu direfill</p>
                                            <p className="text-xs text-blue-700">(   ) kosongi jika masih banyak</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info Footer */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-sm text-slate-500">
                            <div className="flex items-center gap-4">
                                <span>Shift: <strong className="text-slate-700">{laporan.shift?.nama_shift || '-'}</strong></span>
                                <span>Karyawan: <strong className="text-slate-700">{laporan.employee?.nama || laporan.user?.name || '-'}</strong></span>
                            </div>
                            <span className="text-xs">ID: #{laporan.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
