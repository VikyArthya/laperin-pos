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
        dana_keluar: '',
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

    const inputClasses = "w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all";

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
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-50 via-slate-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Buat Laporan Penjualan" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            Buat Laporan Penjualan
                        </h1>
                        <p className="mt-1 text-slate-500">Input stok bawa untuk laporan penjualan.</p>
                    </div>
                    <Link href="/laporan-pulang" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Informasi Umum</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Laporan</label>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cabang / Shift</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <Users className="w-4 h-4 inline mr-1" />
                                Assign ke Karyawan
                            </label>
                            <select
                                name="employee_id"
                                value={data.employee_id}
                                onChange={e => setData('employee_id', e.target.value)}
                                className={inputClasses}
                                required
                            >
                                <option value="">Pilih Karyawan</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Pilih karyawan yang akan mengisi laporan ini</p>
                        </div>
                    </div>

                    {/* Stok Bawa */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2">Input Stok Bawa</h2>
                        <p className="text-sm text-slate-500 mb-6">Masukkan jumlah stok bawa untuk setiap produk. Karyawan akan menginput sisa stok nanti.</p>

                        <div className="space-y-8">
                            {sortedCategories.map((category) => {
                                const categoryProducts = productsByCategory[category] || [];
                                if (categoryProducts.length === 0) return null;

                                return (
                                    <div key={category}>
                                        <h3 className="text-md font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
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
                                                    <div key={product.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        {/* Mobile Layout - Vertical */}
                                                        <div className="sm:hidden">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-slate-900 text-sm">{product.nama_produk}</p>
                                                                    <p className="text-xs text-slate-500 mt-0.5">Harga: {formatRp(product.harga)} | Stok: {product.stok}</p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-slate-500 mb-1">Stok Bawa</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={item.qty_bawa}
                                                                    onChange={(e) => handleItemChange(product.id, 'qty_bawa', e.target.value)}
                                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Desktop Layout - Horizontal */}
                                                        <div className="hidden sm:flex items-center gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-slate-900 truncate">{product.nama_produk}</p>
                                                                <p className="text-xs text-slate-500">Harga: {formatRp(product.harga)} | Stok: {product.stok}</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <label className="block text-xs text-slate-500 mb-1">Stok Bawa</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={item.qty_bawa}
                                                                    onChange={(e) => handleItemChange(product.id, 'qty_bawa', e.target.value)}
                                                                    className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                />
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
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2">Dana Keluar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">💸 Dana Keluar</label>
                                <input
                                    type="number"
                                    name="dana_keluar"
                                    value={data.dana_keluar}
                                    onChange={e => setData('dana_keluar', e.target.value)}
                                    className={inputClasses}
                                    placeholder="0"
                                    min="0"
                                />
                                <p className="text-xs text-slate-400 mt-1">{formatRp(data.dana_keluar)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Dana Keluar</label>
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
                        <Link href="/laporan-pulang" className="w-full sm:w-auto text-center px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 sm:border-transparent">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="w-full sm:w-auto justify-center inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-70 transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan & Publish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
