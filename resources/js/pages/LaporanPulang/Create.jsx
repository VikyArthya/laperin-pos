import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, FileText, Package, Users } from 'lucide-react';

export default function Create({ shifts, products, materials, employees }) {
    // Format tanggal as YYYY-MM-DD for local date
    const getLocalDateString = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal: getLocalDateString(),
        shift_id: '',
        employee_id: '',
        is_karyawan_hadir: true,
        is_admin_mode: false,
        dana_keluar: '',
        catatan_dana_keluar: '',
        items: products.map(p => ({
            product_id: p.id,
            qty_bawa: '',
        })),
    });

    const handleItemChange = (productId, field, value) => {
        const newItems = data.items.map(item =>
            item.product_id === productId ? { ...item, [field]: value === '' ? '' : Number(value) } : item
        );
        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/laporan-pulang');
    };

    const formatRp = (num) => {
        if (num === null || num === undefined || num === '') return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : Number(num);
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    const inputClasses = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all";

    // Group products by category
    const productsByCategory = products.reduce((acc, product) => {
        const category = product.kategori || 'Lainnya';
        if (!acc[category]) acc[category] = [];
        acc[category].push(product);
        return acc;
    }, {});

    const categoryOrder = ['Menu Utama', 'Topping', 'Packaging'];
    const sortedCategories = [...categoryOrder, ...Object.keys(productsByCategory).filter(c => !categoryOrder.includes(c))];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Buat Laporan Penjualan" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            Buat Laporan Penjualan
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Input stok bawa untuk laporan penjualan.</p>
                    </div>
                    <Link href="/laporan-pulang" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Informasi Umum</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Laporan</label>
                                <input
                                    type="date"
                                    name="tanggal"
                                    value={data.tanggal}
                                    onChange={e => setData('tanggal', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cabang / Shift</label>
                                <select
                                    name="shift_id"
                                    value={data.shift_id}
                                    onChange={e => setData('shift_id', e.target.value)}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Pilih Cabang</option>
                                    {shifts.map(s => <option key={s.id} value={s.id}>{s.nama_shift}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Users className="w-4 h-4 inline mr-1" />
                                Assign ke Karyawan
                            </label>
                            <select
                                name="employee_id"
                                value={data.employee_id}
                                onChange={e => setData('employee_id', e.target.value)}
                                className={`${inputClasses} ${data.is_admin_mode ? 'bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed' : ''}`}
                                disabled={data.is_admin_mode}
                            >
                                <option value="">Pilih Karyawan</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
                            </select>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {data.is_admin_mode ? 'Tidak perlu memilih karyawan saat Admin Mode' : 'Pilih karyawan yang akan mengisi laporan ini'}
                            </p>
                        </div>

                        {/* Mode Penjualan */}
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Mode Penjualan</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Opsi 1: Tanpa Karyawan */}
                                <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                    !data.is_karyawan_hadir && !data.is_admin_mode
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}>
                                    <input type="radio" name="mode_penjualan" value="tanpa_karyawan" checked={!data.is_karyawan_hadir && !data.is_admin_mode} onChange={() => { setData('is_karyawan_hadir', false); setData('is_admin_mode', false); }} className="sr-only" />
                                    <div className="flex-1">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">Tanpa Karyawan</span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Tidak ada karyawan bekerja</span>
                                    </div>
                                </label>

                                {/* Opsi 2: Dengan Karyawan */}
                                <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                    data.is_karyawan_hadir && !data.is_admin_mode
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}>
                                    <input type="radio" name="mode_penjualan" value="dengan_karyawan" checked={data.is_karyawan_hadir && !data.is_admin_mode} onChange={() => { setData('is_karyawan_hadir', true); setData('is_admin_mode', false); }} className="sr-only" />
                                    <div className="flex-1">
                                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">Dengan Karyawan</span>
                                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Karyawan bekerja & digaji</span>
                                    </div>
                                </label>

                                {/* Opsi 3: Admin Mode */}
                                <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all ${
                                    data.is_admin_mode
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}>
                                    <input type="radio" name="mode_penjualan" value="admin_mode" checked={data.is_admin_mode} onChange={() => { setData('is_karyawan_hadir', true); setData('is_admin_mode', true); }} className="sr-only" />
                                    <div className="flex-1">
                                        <span className="block text-sm font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                                            👑 Admin Mode
                                        </span>
                                        <span className="block text-xs text-purple-700 dark:text-purple-400 mt-1">Admin jual sendiri (tanpa gaji)</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Admin Mode Badge */}
                        {data.is_admin_mode && (
                            <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <span className="text-2xl">👑</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">Mode Admin Aktif</p>
                                        <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">Untung bersih tidak dikurangi gaji karyawan</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stok Bawa */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2">Input Stok Bawa</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Masukkan jumlah stok bawa untuk setiap produk. Karyawan akan menginput sisa stok nanti.</p>

                        <div className="space-y-8">
                            {sortedCategories.map((category) => {
                                const categoryProducts = productsByCategory[category] || [];
                                if (categoryProducts.length === 0) return null;

                                return (
                                    <div key={category}>
                                        <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                                            <span className={`inline-block w-2 h-2 rounded-full ${category === 'Menu Utama' ? 'bg-amber-500' :
                                                    category === 'Topping' ? 'bg-rose-500' :
                                                        category === 'Packaging' ? 'bg-slate-500' :
                                                            'bg-blue-500'
                                                }`} />
                                            {category === 'Menu Utama' ? 'ISIAN' :
                                                category === 'Topping' ? 'TOPPING' :
                                                    category === 'Packaging' ? 'PACKAGING' :
                                                        `${category.toUpperCase()}`}
                                        </h3>
                                        <div className="space-y-3">
                                            {categoryProducts.map((product) => {
                                                const item = data.items.find(i => i.product_id === product.id) || {};


                                                return (
                                                    <div key={product.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                        {/* Mobile Layout - Vertical */}
                                                        <div className="sm:hidden">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{product.nama_produk}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Harga: {formatRp(product.harga)} | Stok: {product.stok}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Stok Bawa</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="any"
                                                                    value={item.qty_bawa}
                                                                    onChange={(e) => handleItemChange(product.id, 'qty_bawa', e.target.value)}
                                                                    className={`w-full rounded-lg border px-3 py-2 text-center text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[`items.${data.items.findIndex(i => i.product_id === product.id)}.qty_bawa`] ? 'border-red-500 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800`}
                                                                />
                                                                {errors[`items.${data.items.findIndex(i => i.product_id === product.id)}.qty_bawa`] && (
                                                                    <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium text-center">Wajib isi</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Desktop Layout - Horizontal */}
                                                        <div className="hidden sm:flex items-center gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 dark:text-white truncate">{product.nama_produk}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Harga: {formatRp(product.harga)} | Stok: {product.stok}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Stok Bawa</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="any"
                                                                    value={item.qty_bawa}
                                                                    onChange={(e) => handleItemChange(product.id, 'qty_bawa', e.target.value)}
                                                                    className={`w-20 rounded-lg border px-2 py-1 text-center text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[`items.${data.items.findIndex(i => i.product_id === product.id)}.qty_bawa`] ? 'border-red-500 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800`}
                                                                />
                                                                {errors[`items.${data.items.findIndex(i => i.product_id === product.id)}.qty_bawa`] && (
                                                                    <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium leading-tight text-center">Wajib isi</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dana Keluar */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2">Dana Keluar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">💸 Dana Keluar</label>
                                <input
                                    type="number"
                                    name="dana_keluar"
                                    value={data.dana_keluar}
                                    onChange={e => setData('dana_keluar', e.target.value)}
                                    className={inputClasses}
                                    placeholder="0"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatRp(data.dana_keluar)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Dana Keluar</label>
                                <input
                                    type="text"
                                    name="catatan_dana_keluar"
                                    value={data.catatan_dana_keluar || ''}
                                    onChange={e => setData('catatan_dana_keluar', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Opsional: Jelaskan pengeluaran"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                        <Link href="/laporan-pulang" className="w-full sm:w-auto text-center px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 sm:border-transparent">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="w-full sm:w-auto justify-center inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-purple-600 dark:bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-600 rounded-xl shadow-md shadow-purple-600/20 dark:shadow-purple-600/30 disabled:opacity-70 transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan & Publish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
