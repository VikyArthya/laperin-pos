import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, FileText, Package, Wallet, CheckSquare } from 'lucide-react';

export default function Create({ shifts, products, materials, employees, authEmployee }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const isKaryawan = authUser?.role === 'karyawan';

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        shift_id: '',
        cash: 0,
        qris: 0,
        sf: 0,
        ma_50: '',
        catatan_stok: '',
        stock_refill_items: [],
        is_karyawan_hadir: isKaryawan ? true : false,
        employee_id: isKaryawan && authEmployee ? authEmployee.id : '',
        items: products.map(p => ({
            product_id: p.id,
            qty_terjual: 0,
            qty_bawa: 0,
        })),
    });

    const [activeTab, setActiveTab] = useState('isian');

    const totalPembayaran = Number(data.cash) + Number(data.qris) + Number(data.sf);

    const handleItemChange = (productId, field, value) => {
        const newItems = data.items.map(item =>
            item.product_id === productId ? { ...item, [field]: Number(value) } : item
        );
        setData('items', newItems);
    };

    const handleStockRefillToggle = (materialId) => {
        const currentItems = data.stock_refill_items || [];
        if (currentItems.includes(materialId)) {
            // Remove if already exists
            setData('stock_refill_items', currentItems.filter(id => id !== materialId));
        } else {
            // Add if not exists
            setData('stock_refill_items', [...currentItems, materialId]);
        }
    };

    const isMaterialChecked = (materialId) => {
        return (data.stock_refill_items || []).includes(materialId);
    };

    const getProduct = (productId) => {
        return products.find(p => p.id === productId);
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
    const inputClassesSmall = "w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all";

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
            <Head title="Input Laporan Pulang" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            Input Laporan Pulang
                        </h1>
                        <p className="mt-1 text-slate-500">Catat laporan peleburan stok harian.</p>
                    </div>
                    <Link href="/laporan-pulang" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex gap-2">
                        {[
                            { id: 'isian', label: '📦 Isian Produk', icon: Package },
                            { id: 'pembayaran', label: '💰 Pembayaran', icon: Wallet },
                            { id: 'stok', label: '✓ Catatan Stok', icon: CheckSquare },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* General Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Informasi Umum & Shift</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Laporan</label>
                                <input type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} className={inputClasses} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cabang / Shift</label>
                                <select value={data.shift_id} onChange={e => setData('shift_id', e.target.value)} className={inputClasses} required>
                                    <option value="">Pilih Cabang</option>
                                    {shifts.map(s => <option key={s.id} value={s.id}>{s.nama_shift}</option>)}
                                </select>
                            </div>
                        </div>

                        {!isKaryawan && (
                            <div className="mt-6 pt-4 border-t">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Karyawan</label>
                                <select value={data.employee_id} onChange={e => setData('employee_id', e.target.value)} className={inputClasses}>
                                    <option value="">Pilih Karyawan</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'isian' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2">Isian Produk (Terjual / Bawa)</h2>
                            <p className="text-sm text-slate-500 mb-6">Format: Terjual (Bawa). Contoh: Bakso sapi: 27 (41)</p>

                            <div className="space-y-8">
                                {sortedCategories.map((category) => {
                                    const categoryProducts = productsByCategory[category] || [];
                                    if (categoryProducts.length === 0) return null;

                                    return (
                                        <div key={category}>
                                            <h3 className="text-md font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                <span className={`inline-block w-2 h-2 rounded-full ${
                                                    category === 'Menu Utama' ? 'bg-amber-500' :
                                                    category === 'Topping' ? 'bg-rose-500' :
                                                    category === 'Packaging' ? 'bg-slate-500' :
                                                    'bg-blue-500'
                                                }`} />
                                                {category === 'Menu Utama' ? '------ ISIAN -----' :
                                                 category === 'Topping' ? '------ TOPPING -----' :
                                                 category === 'Packaging' ? '------ PACKAGING -----' :
                                                 `------ ${category.toUpperCase()} ------`}
                                            </h3>
                                            <div className="space-y-3">
                                                {categoryProducts.map((product) => {
                                                    const item = data.items.find(i => i.product_id === product.id) || {};
                                                    const productInitial = product.nama_produk.split(' ')[0].toUpperCase();

                                                    return (
                                                        <div key={product.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                            <div className="flex-shrink-0 w-8 text-center font-bold text-slate-400">
                                                                {productInitial}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-slate-900 truncate">{product.nama_produk}</p>
                                                                <p className="text-xs text-slate-500">Stok saat ini: {product.stok}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-center">
                                                                    <label className="block text-xs text-slate-500 mb-1">Terjual</label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={item.qty_terjual || 0}
                                                                        onChange={(e) => handleItemChange(product.id, 'qty_terjual', e.target.value)}
                                                                        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                    />
                                                                </div>
                                                                <div className="text-center">
                                                                    <label className="block text-xs text-slate-500 mb-1">Bawa</label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={item.qty_bawa || 0}
                                                                        onChange={(e) => handleItemChange(product.id, 'qty_bawa', e.target.value)}
                                                                        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                                    />
                                                                </div>
                                                                <div className="text-center min-w-[80px]">
                                                                    <p className="text-lg font-bold text-purple-600">
                                                                        {item.qty_terjual || 0} ({item.qty_bawa || 0})
                                                                    </p>
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
                    )}

                    {activeTab === 'pembayaran' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2">-------- CASH ---------</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ma 50</label>
                                    <input type="text" value={data.ma_50} onChange={e => setData('ma_50', e.target.value)} className={inputClasses} placeholder="Kosongkan jika tidak ada" />
                                    <p className="text-xs text-slate-400 mt-1">Khusus untuk Ma 50</p>
                                </div>
                                <div></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">💵 Cash</label>
                                    <input type="number" value={data.cash} onChange={e => setData('cash', e.target.value)} className={inputClasses} placeholder="0" />
                                    <p className="text-xs text-slate-400 mt-1">{formatRp(data.cash)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">📱 QRIS</label>
                                    <input type="number" value={data.qris} onChange={e => setData('qris', e.target.value)} className={inputClasses} placeholder="0" />
                                    <p className="text-xs text-slate-400 mt-1">{formatRp(data.qris)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">🍔 ShopeeFood (SF)</label>
                                    <input type="number" value={data.sf} onChange={e => setData('sf', e.target.value)} className={inputClasses} placeholder="0" />
                                    <p className="text-xs text-slate-400 mt-1">{formatRp(data.sf)}</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium opacity-90">Total Pembayaran</p>
                                        <p className="text-3xl font-black mt-1">{formatRp(totalPembayaran)}</p>
                                    </div>
                                    <div className="text-right text-sm opacity-75">
                                        <p>Cash + Qris + SF</p>
                                        <p className="font-medium">{formatRp(totalPembayaran)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'stok' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2">------- STOK -------</h2>

                            <div className="mb-6">
                                <p className="text-sm text-slate-600 mb-2">Tandai item yang perlu direfill:</p>
                                <p className="text-xs text-amber-600 mb-4 flex items-center gap-1">
                                    <span>⚠️</span> Stok akan berkurang 1 setiap item yang dicentang
                                </p>
                                {materials && materials.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {materials.map((material) => {
                                            const stockColor = material.stok > 10 ? 'text-emerald-600 bg-emerald-50' : material.stok > 0 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
                                            return (
                                                <div key={material.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                                    isMaterialChecked(material.id)
                                                        ? 'bg-amber-50 border-amber-300'
                                                        : 'bg-slate-50 border-slate-100'
                                                }`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isMaterialChecked(material.id)}
                                                        onChange={() => handleStockRefillToggle(material.id)}
                                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-xs text-slate-700 block truncate">{material.nama_bahan}</span>
                                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stockColor}`}>
                                                            Stok: {material.stok}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Belum ada data bahan pokok. Silakan tambahkan di menu Master Bahan Pokok.</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">CATATAN STOK</label>
                                <p className="text-xs text-slate-500 mb-2">( ! ) perlu direfill &nbsp; (   ) kosongi jika masih banyak</p>
                                <textarea
                                    value={data.catatan_stok}
                                    onChange={e => setData('catatan_stok', e.target.value)}
                                    rows="6"
                                    className={inputClasses}
                                    placeholder="Tulis catatan stok di sini...&#10;Contoh:&#10;! Bawang Goreng&#10;! Saus&#10;  Kecap&#10;  Sambal"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                        <Link href="/laporan-pulang" className="w-full sm:w-auto text-center px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 sm:border-transparent">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="w-full sm:w-auto justify-center inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-70 transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Laporan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
