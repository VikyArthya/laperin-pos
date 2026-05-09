import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Package, Minus, PlusCircle } from 'lucide-react';

export default function Index({ products, categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);
    const [stockItem, setStockItem] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_produk: '',
        category_id: '',
        kategori: '', // Untuk backward compatibility
        harga_beli: '',
        harga: '',
        stok: '',
    });

    const { data: stockData, setData: setStockDataData, post: stockPost, processing: stockProcessing, reset: stockReset, clearErrors: stockClearErrors } = useForm({
        jumlah: '',
    });

    const formatRp = (num) => {
        return 'Rp ' + (num || 0).toLocaleString('id-ID');
    };

    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setModalMode('edit');
        setEditingId(product.id);
        setData({
            nama_produk: product.nama_produk,
            category_id: product.category_id || '',
            kategori: product.kategori || '', // Untuk backward compatibility
            harga_beli: product.harga_beli || '',
            harga: product.harga || '',
            stok: product.stok || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const openStockModal = (product, type) => {
        setStockItem({ ...product, type });
        setStockDataData({ jumlah: '' });
        stockClearErrors();
        setIsStockModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const closeStockModal = () => {
        setIsStockModalOpen(false);
        setStockItem(null);
        stockReset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post('/products', {
                onSuccess: () => closeModal(),
            });
        } else {
            put('/products/' + editingId, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleStockSubmit = (e) => {
        e.preventDefault();
        if (!stockItem) return;
        const action = stockItem.type === 'add' ? '/products/' + stockItem.id + '/add-stock' : '/products/' + stockItem.id + '/reduce-stock';
        stockPost(action, {
            onSuccess: () => closeStockModal(),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            destroy('/products/' + id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Master Data Produk" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Package className="w-6 h-6" />
                            </div>
                            Master Data Produk
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Kelola daftar menu dan produk jualan Anda beserta harga dan stok.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                            Kembali
                        </Link>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-sm shadow-blue-600/20 dark:shadow-blue-600/30"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nama Produk</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Harga Beli</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Harga Jual</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Stok</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {product.nama_produk}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                    ${product.kategori === 'Menu Utama' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50' :
                                                    product.kategori === 'Topping' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50' :
                                                    product.kategori === 'Packaging' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50' :
                                                    'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50'}`}>
                                                    {product.kategori || 'Tanpa Kategori'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                {formatRp(product.harga_beli)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                {formatRp(product.harga)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                                    ${(product.stok || 0) > 10 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                                                    (product.stok || 0) > 0 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                                    'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                    {(product.stok || 0)} unit
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => openStockModal(product, 'add')}
                                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                        title="Tambah Stok"
                                                    >
                                                        <PlusCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openStockModal(product, 'reduce')}
                                                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                                                        title="Kurangi Stok"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-600 dark:text-gray-400">
                                            <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="text-sm">Belum ada produk yang ditambahkan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{products.from || 0}</span> - <span className="font-semibold text-gray-900 dark:text-white">{products.to || 0}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{products.total}</span>
                        </span>
                        <div className="flex space-x-2">
                            {products.prev_page_url ? (
                                <Link href={products.prev_page_url} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 bg-slate-50 dark:bg-slate-800/50">Sebelumnya</button>
                            )}

                            {products.next_page_url ? (
                                <Link href={products.next_page_url} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Selanjutnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 bg-slate-50 dark:bg-slate-800/50">Selanjutnya</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dialog - Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Produk</label>
                                    <input
                                        type="text"
                                        value={data.nama_produk}
                                        onChange={e => setData('nama_produk', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.nama_produk ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="Contoh: Baso Sapi Spesial"
                                    />
                                    {errors.nama_produk && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.nama_produk}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                                    <select
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.category_id ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories && categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.nama_kategori}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Beli (Rp)</label>
                                    <input
                                        type="number"
                                        value={data.harga_beli}
                                        onChange={e => setData('harga_beli', e.target.value)}
                                        min="0"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.harga_beli ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="Contoh: 8000"
                                    />
                                    {errors.harga_beli && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.harga_beli}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Jual (Rp)</label>
                                    <input
                                        type="number"
                                        value={data.harga}
                                        onChange={e => setData('harga', e.target.value)}
                                        min="0"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.harga ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="Contoh: 15000"
                                    />
                                    {errors.harga && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.harga}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stok Awal</label>
                                    <input
                                        type="number"
                                        value={data.stok}
                                        onChange={e => setData('stok', e.target.value)}
                                        min="0"
                                        step="any"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.stok ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="Contoh: 10 atau 10.5"
                                    />
                                    {errors.stok && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.stok}</p>}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-600 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Produk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Dialog - Stock Adjustment */}
            {isStockModalOpen && stockItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={closeStockModal}></div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {stockItem?.type === 'add' ? 'Tambah Stok' : 'Kurangi Stok'}
                            </h3>
                            <button onClick={closeStockModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {stockItem?.type === 'add' ? 'Masukkan jumlah stok yang ingin ditambahkan.' : 'Masukkan jumlah stok yang ingin dikurangi.'}
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                                {stockItem?.nama_produk} <span className="text-gray-500 dark:text-gray-400">(Stok saat ini: {stockItem?.stok || 0})</span>
                            </p>

                            <form onSubmit={handleStockSubmit}>
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah</label>
                                    <input
                                        type="number"
                                        value={stockData.jumlah}
                                        onChange={e => setStockDataData('jumlah', e.target.value)}
                                        min="0"
                                        step="any"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.jumlah ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="Masukkan jumlah"
                                    />
                                    {errors.jumlah && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.jumlah}</p>}
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={closeStockModal}
                                        className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={stockProcessing}
                                        className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors ${stockItem?.type === 'add' ? 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-600' : 'bg-orange-600 hover:bg-orange-700 dark:hover:bg-orange-600'}`}
                                    >
                                        {stockProcessing ? 'Memproses...' : stockItem?.type === 'add' ? 'Tambah' : 'Kurangi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
