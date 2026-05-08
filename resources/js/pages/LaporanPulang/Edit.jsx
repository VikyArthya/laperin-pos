import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, FileText, Package, Wallet } from 'lucide-react';

export default function Edit({ laporan, materials }) {
    const { props } = usePage();
    const authUser = props.auth?.user;

    const [activeTab, setActiveTab] = useState('isian');

    const isAdmin = authUser?.role === 'admin';
    const isSubmittedByAdmin = laporan.status === 'submitted_by_admin';
    const canEditQtyBawa = isAdmin && isSubmittedByAdmin;

    // Format tanggal untuk input date HTML
    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        // Jika sudah string YYYY-MM-DD, langsung return
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }
        // Jika Date object, convert ke string
        const date = new Date(dateValue);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Initialize form data with existing laporan data
    const { data, setData, put, processing, errors, reset } = useForm({
        tanggal: formatDateForInput(laporan.tanggal),
        shift_id: laporan.shift_id,
        cash: laporan.cash || '',
        qris: laporan.qris || '',
        sf: laporan.sf || '',
        dana_keluar: laporan.dana_keluar || '',
        catatan_dana_keluar: laporan.catatan_dana_keluar || '',
        ma_50: laporan.ma_50 || '50000',
        stock_refill_items: laporan.stock_refill_items || [],
        items: laporan.items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            qty_bawa: item.qty_bawa,
            qty_sisa: item.qty_sisa || '',
        })),
    });

    const totalPembayaran = Number(data.cash) + Number(data.qris) + Number(data.sf);

    // Hitung total harga terjual secara reaktif
    const totalTerjual = useMemo(() => {
        return data.items.reduce((total, item) => {
            const qtyBawa = Number(item.qty_bawa);
            const qtySisa = Number(item.qty_sisa);
            const qtyTerjual = Math.max(0, qtyBawa - qtySisa);
            const product = laporan.items.find(i => i.id === item.id)?.product;
            const harga = product?.harga || 0;
            return total + (qtyTerjual * harga);
        }, 0);
    }, [data.items, laporan.items]);

    const handleItemChange = (itemId, field, value) => {
        const newItems = data.items.map(item =>
            item.id === itemId ? { ...item, [field]: value === '' ? '' : Number(value) } : item
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
        return laporan.items.find(i => i.product_id === productId)?.product;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/laporan-pulang/${laporan.id}`);
    };

    const formatRp = (num) => {
        if (num === null || num === undefined || num === '') return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : Number(num);
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    const inputClasses = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all";
    const inputClassesSmall = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all";

    // Group items by category
    const itemsByCategory = laporan.items.reduce((acc, item) => {
        const category = item.product?.kategori || 'Lainnya';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    const categoryOrder = ['Menu Utama', 'Topping', 'Packaging'];
    const sortedCategories = [...categoryOrder, ...Object.keys(itemsByCategory).filter(c => !categoryOrder.includes(c))];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Isi Laporan Penjualan" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            Isi Laporan Penjualan
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Lapor stok sisa dan pembayaran.</p>
                    </div>
                    <Link href="/laporan-pulang" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info Laporan */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Informasi Laporan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                                <input type="date" value={data.tanggal} disabled className={inputClasses + ' bg-slate-100 dark:bg-slate-800/50'} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift</label>
                                <input type="text" value={laporan.shift?.nama_shift || ''} disabled className={inputClasses + ' bg-slate-100 dark:bg-slate-800/50'} />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2">
                        {/* Mobile - Scrollable Tabs */}
                        <div className="sm:hidden flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {[
                                { id: 'isian', label: 'Sisa Stok', icon: Package },
                                { id: 'pembayaran', label: 'Bayar', icon: Wallet },
                                { id: 'stok', label: 'Stok', icon: Package },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-purple-600 dark:bg-purple-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        {/* Desktop - Full Width Tabs */}
                        <div className="hidden sm:flex gap-2">
                            {[
                                { id: 'isian', label: 'Sisa Stok', icon: Package },
                                { id: 'pembayaran', label: 'Pembayaran', icon: Wallet },
                                { id: 'dana_keluar', label: 'Dana Keluar', icon: Wallet },
                                { id: 'stok', label: 'Stok', icon: Package },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-purple-600 dark:bg-purple-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'isian' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2">Input Sisa Stok</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Format: Sisa (Bawa). Contoh: Bakso sapi: 14 (41)</p>

                            <div className="space-y-8">
                                {sortedCategories.map((category) => {
                                    const categoryItems = itemsByCategory[category] || [];
                                    if (categoryItems.length === 0) return null;

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
                                                {categoryItems.map((item) => {
                                                    const product = item.product;
                                                    if (!product) return null;


                                                    const qtyBawa = data.items.find(i => i.id === item.id)?.qty_bawa || item.qty_bawa;
                                                    const qtySisa = data.items.find(i => i.id === item.id)?.qty_sisa === '' ? '' : (data.items.find(i => i.id === item.id)?.qty_sisa ?? item.qty_sisa);
                                                    const qtyTerjual = Math.max(0, qtyBawa - qtySisa);
                                                    const totalHarga = product.harga * qtyTerjual;

                                                    return (
                                                        <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                            {/* Mobile Layout - Vertical */}
                                                            <div className="sm:hidden">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{product.nama_produk}</p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Harga: {formatRp(product.harga)}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sisa</label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max={qtyBawa}
                                                                            value={qtySisa}
                                                                            onChange={(e) => handleItemChange(item.id, 'qty_sisa', e.target.value)}
                                                                            className={`w-full rounded-lg border px-3 py-2 text-center text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[`items.${data.items.findIndex(i => i.id === item.id)}.qty_sisa`] ? 'border-red-500 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800`}
                                                                        />
                                                                        {errors[`items.${data.items.findIndex(i => i.id === item.id)}.qty_sisa`] && (
                                                                            <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium">Wajib isi</p>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bawa</label>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            value={qtyBawa}
                                                                            onChange={(e) => handleItemChange(item.id, 'qty_bawa', e.target.value)}
                                                                            disabled={!canEditQtyBawa}
                                                                            className={`w-full rounded-lg border px-3 py-2 text-center text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[`items.${data.items.findIndex(i => i.id === item.id)}.qty_bawa`] ? 'border-red-500 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'} ${!canEditQtyBawa ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-500' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'}`}
                                                                        />
                                                                        {errors[`items.${data.items.findIndex(i => i.id === item.id)}.qty_bawa`] && (
                                                                            <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium">Wajib isi</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                                                    <div className="flex justify-between items-center">
                                                                        <div>
                                                                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                                                                {qtySisa} ({qtyBawa})
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Terjual: {qtyTerjual}</p>
                                                                        </div>
                                                                        {qtyTerjual > 0 && (
                                                                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                                                {formatRp(totalHarga)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Desktop Layout - Horizontal */}
                                                            <div className="hidden sm:flex items-center gap-4">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-gray-900 dark:text-white truncate">{product.nama_produk}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Harga: {formatRp(product.harga)}</p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-center">
                                                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Sisa</label>
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max={qtyBawa}
                                                                            value={qtySisa}
                                                                            onChange={(e) => handleItemChange(item.id, 'qty_sisa', e.target.value)}
                                                                            className={`w-20 rounded-lg border px-2 py-1 text-center text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[`items.${data.items.findIndex(i => i.id === item.id)}.qty_sisa`] ? 'border-red-500 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800`}
                                                                        />
                                                                        {errors[`items.${data.items.findIndex(i => i.id === item.id)}.qty_sisa`] && (
                                                                            <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium leading-tight">Wajib isi</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bawa</label>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            value={qtyBawa}
                                                                            onChange={(e) => handleItemChange(item.id, 'qty_bawa', e.target.value)}
                                                                            disabled={!canEditQtyBawa}
                                                                            className={`w-20 rounded-lg border px-2 py-1 text-center text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors[`items.${data.items.findIndex(i => i.id === item.id)}.qty_bawa`] ? 'border-red-500 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'} ${!canEditQtyBawa ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-500' : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white'}`}
                                                                        />
                                                                        {errors[`items.${data.items.findIndex(i => i.id === item.id)}.qty_bawa`] && (
                                                                            <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium leading-tight">Wajib isi</p>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-center min-w-[120px]">
                                                                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                                                            {qtySisa} ({qtyBawa})
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Terjual: {qtyTerjual}</p>
                                                                        {qtyTerjual > 0 && (
                                                                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                                                {formatRp(totalHarga)}
                                                                            </p>
                                                                        )}
                                                                    </div>
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
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2">CASH</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modal Awal (50)</label>
                                    <input type="text" value={data.ma_50} onChange={e => setData('ma_50', e.target.value)} className={inputClasses} placeholder="Kosongkan jika tidak ada" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Khusus untuk Modal Awal 50rb</p>
                                </div>
                                <div></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">💵 Cash</label>
                                    <input type="number" value={data.cash} onChange={e => setData('cash', e.target.value)} className={inputClasses} placeholder="0" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatRp(data.cash)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">📱 QRIS</label>
                                    <input type="number" value={data.qris} onChange={e => setData('qris', e.target.value)} className={inputClasses} placeholder="0" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatRp(data.qris)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🍔 ShopeeFood (SF)</label>
                                    <input type="number" value={data.sf} onChange={e => setData('sf', e.target.value)} className={inputClasses} placeholder="0" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatRp(data.sf)}</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-4">
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

                            {/* Total Terjual - Informasi untuk karyawan */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white mb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium opacity-90">💰 Total Harga Terjual</p>
                                        <p className="text-3xl font-black mt-1">{formatRp(totalTerjual)}</p>
                                        <p className="text-xs opacity-75 mt-1">Total dari semua produk yang terjual</p>
                                    </div>
                                    <div className="text-right text-sm opacity-75">
                                        <p>📊 Dasar Omset</p>
                                        <p className="font-medium">Penjualan Produk</p>
                                    </div>
                                </div>
                            </div>

                            {/* Selisih Info - Jika ada lebih - HANYA UNTUK ADMIN */}
                            {isAdmin && totalPembayaran > 0 && totalTerjual > 0 && totalPembayaran > totalTerjual && (
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white mb-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium opacity-90">🎉 Kelebihan Pembayaran (Bonus)</p>
                                            <p className="text-3xl font-black mt-1">{formatRp(totalPembayaran - totalTerjual)}</p>
                                            <p className="text-xs opacity-75 mt-1">ShopeeFood memberikan lebih dari harga produk</p>
                                        </div>
                                        <div className="text-right text-sm opacity-75">
                                            <p>💵 Masuk ke</p>
                                            <p className="font-medium">Untung Bersih</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Selisih Info - Jika ada kurang */}
                            {totalPembayaran > 0 && totalTerjual > 0 && totalPembayaran < totalTerjual && (
                                <div className={`rounded-xl p-4 text-center bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-4`}>
                                    <p className="text-sm font-medium">
                                        ⚠️ Pembayaran Rp {formatRp(totalTerjual - totalPembayaran)} lebih kecil dari terjual
                                    </p>
                                </div>
                            )}

                            {/* Info Perhitungan Omset dan Untung */}
                            {totalPembayaran > 0 && totalTerjual > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">📊 Perhitungan Penjualan</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Omset Penjualan:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{formatRp(totalTerjual)}</span>
                                        </div>
                                        {isAdmin && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">Kelebihan (Bonus SF):</span>
                                                <span className="font-semibold text-green-600 dark:text-green-400">{totalPembayaran > totalTerjual ? '+' : ''}{formatRp(totalPembayaran - totalTerjual)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
                                            <div className="flex justify-between">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Dana Masuk:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{formatRp(totalPembayaran)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ringkasan Stok Sisa */}
                            {data.items.some(item => Number(item.qty_sisa) > 0) && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">📦 Ringkasan Sisa Produk (Tidak Terjual)</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {data.items.filter(item => Number(item.qty_sisa) > 0).map(item => {
                                            const product = laporan.items.find(i => i.id === item.id)?.product;
                                            return (
                                                <div key={item.id} className="flex flex-col p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold truncate">{product?.nama_produk}</span>
                                                    <span className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">{item.qty_sisa} <span className="text-[10px] font-medium text-slate-400">unit</span></span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'dana_keluar' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2">DANA KELUAR</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                                        value={data.catatan_dana_keluar}
                                        onChange={e => setData('catatan_dana_keluar', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Opsional: Jelaskan pengeluaran"
                                    />
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium opacity-90">Total Dana Keluar</p>
                                        <p className="text-3xl font-black mt-1">{formatRp(data.dana_keluar)}</p>
                                    </div>
                                    <div className="text-right text-sm opacity-75">
                                        <p>Akan otomatis masuk ke menu Kasir</p>
                                        <p className="font-medium">Sebagai pengurang dana</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'stok' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2">STOK</h2>

                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tandai item yang perlu direfill:</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-1">
                                    <span>⚠️</span> Stok akan berkurang 1 setiap item yang dicentang
                                </p>
                                {materials && materials.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {materials.map((material) => (
                                            <div key={material.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${isMaterialChecked(material.id)
                                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
                                                }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isMaterialChecked(material.id)}
                                                    onChange={() => handleStockRefillToggle(material.id)}
                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-xs text-gray-700 dark:text-gray-300 block truncate">{material.nama_bahan}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">Belum ada data bahan pokok.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                        <Link href="/laporan-pulang" className="w-full sm:w-auto text-center px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 sm:border-transparent">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="w-full sm:w-auto justify-center inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-purple-600 dark:bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-600 rounded-xl shadow-md shadow-purple-600/20 dark:shadow-purple-600/30 disabled:opacity-70 transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Laporan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
