import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react';

export default function Index({ products }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_produk: '',
        kategori: '',
        harga: 0,
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
            kategori: product.kategori || '',
            harga: product.harga,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
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

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            destroy('/products/' + id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Master Data Produk" />
            
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Package className="w-6 h-6" />
                            </div>
                            Master Data Produk
                        </h1>
                        <p className="mt-1 text-slate-500">Kelola daftar menu dan produk jualan Anda beserta harga.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors">
                            Kembali
                        </Link>
                        <button 
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Produk</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga Satuan</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {product.nama_produk}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                    ${product.kategori === 'Menu Utama' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 
                                                    product.kategori === 'Topping' ? 'bg-rose-50 text-rose-700 border-rose-200/50' : 
                                                    product.kategori === 'Packaging' ? 'bg-slate-100 text-slate-700 border-slate-200/50' : 
                                                    'bg-blue-50 text-blue-700 border-blue-200/50'}`}>
                                                    {product.kategori || 'Tanpa Kategori'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                                {formatRp(product.harga)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-sm">Belum ada produk yang ditambahkan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-slate-600">
                            Menampilkan <span className="font-semibold text-slate-900">{products.from || 0}</span> - <span className="font-semibold text-slate-900">{products.to || 0}</span> dari <span className="font-semibold text-slate-900">{products.total}</span>
                        </span>
                        <div className="flex space-x-2">
                            {products.prev_page_url ? (
                                <Link href={products.prev_page_url} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50">Sebelumnya</button>
                            )}
                            
                            {products.next_page_url ? (
                                <Link href={products.next_page_url} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                    Selanjutnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50">Selanjutnya</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">
                                {modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
                                    <input
                                        type="text"
                                        value={data.nama_produk}
                                        onChange={e => setData('nama_produk', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.nama_produk ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Contoh: Baso Sapi Spesial"
                                    />
                                    {errors.nama_produk && <p className="mt-1.5 text-sm text-red-600">{errors.nama_produk}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                                    <select
                                        value={data.kategori}
                                        onChange={e => setData('kategori', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.kategori ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        <option value="Menu Utama">Menu Utama</option>
                                        <option value="Topping">Topping</option>
                                        <option value="Minuman">Minuman</option>
                                        <option value="Packaging">Packaging</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    {errors.kategori && <p className="mt-1.5 text-sm text-red-600">{errors.kategori}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga Satuan (Rp)</label>
                                    <input
                                        type="number"
                                        value={data.harga}
                                        onChange={e => setData('harga', e.target.value)}
                                        min="0"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all ${errors.harga ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Contoh: 15000"
                                    />
                                    {errors.harga && <p className="mt-1.5 text-sm text-red-600">{errors.harga}</p>}
                                </div>
                            </div>
                            
                            <div className="mt-8 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Produk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
