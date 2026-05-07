import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Box, Minus, PlusCircle } from 'lucide-react';

export default function Index({ materials }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);
    const [stockItem, setStockItem] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_bahan: '',
        nominal: '',
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

    const openEditModal = (material) => {
        setModalMode('edit');
        setEditingId(material.id);
        setData({
            nama_bahan: material.nama_bahan,
            nominal: material.nominal || '',
            stok: material.stok || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const openStockModal = (material, type) => {
        setStockItem({ ...material, type });
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
            post('/materials', {
                onSuccess: () => closeModal(),
            });
        } else {
            put('/materials/' + editingId, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleStockSubmit = (e) => {
        e.preventDefault();
        if (!stockItem) return;
        const action = stockItem.type === 'add' ? '/materials/' + stockItem.id + '/add-stock' : '/materials/' + stockItem.id + '/reduce-stock';
        stockPost(action, {
            onSuccess: () => closeStockModal(),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus bahan ini?')) {
            destroy('/materials/' + id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Master Bahan Pokok" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                <Box className="w-6 h-6" />
                            </div>
                            Master Bahan Pokok
                        </h1>
                        <p className="mt-1 text-slate-500">Kelola rincian biaya bahan baku harian operasional Anda beserta stok.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors">
                            Kembali
                        </Link>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Bahan
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Bahan Pokok</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimasi Harga (Nominal)</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {materials.data.length > 0 ? (
                                    materials.data.map((material) => (
                                        <tr key={material.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {material.nama_bahan}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                                {formatRp(material.nominal)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                                    ${(material.stok || 0) > 10 ? 'bg-emerald-50 text-emerald-700' :
                                                    (material.stok || 0) > 0 ? 'bg-amber-50 text-amber-700' :
                                                    'bg-red-50 text-red-700'}`}>
                                                    {(material.stok || 0)} unit
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => openStockModal(material, 'add')}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Tambah Stok"
                                                    >
                                                        <PlusCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openStockModal(material, 'reduce')}
                                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Kurangi Stok"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => openEditModal(material)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(material.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                            <Box className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-sm">Belum ada bahan pokok yang ditambahkan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-slate-600">
                            Menampilkan <span className="font-semibold text-slate-900">{materials.from || 0}</span> - <span className="font-semibold text-slate-900">{materials.to || 0}</span> dari <span className="font-semibold text-slate-900">{materials.total}</span>
                        </span>
                        <div className="flex space-x-2">
                            {materials.prev_page_url ? (
                                <Link href={materials.prev_page_url} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50">Sebelumnya</button>
                            )}

                            {materials.next_page_url ? (
                                <Link href={materials.next_page_url} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                    Selanjutnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50">Selanjutnya</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dialog - Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">
                                {modalMode === 'add' ? 'Tambah Bahan Pokok' : 'Edit Bahan Pokok'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bahan Pokok</label>
                                    <input
                                        type="text"
                                        value={data.nama_bahan}
                                        onChange={e => setData('nama_bahan', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all ${errors.nama_bahan ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Contoh: Daging Sapi / Beras"
                                    />
                                    {errors.nama_bahan && <p className="mt-1.5 text-sm text-red-600">{errors.nama_bahan}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estimasi Harga / Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        value={data.nominal}
                                        onChange={e => setData('nominal', e.target.value)}
                                        min="0"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all ${errors.nominal ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Contoh: 50000"
                                    />
                                    {errors.nominal && <p className="mt-1.5 text-sm text-red-600">{errors.nominal}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal</label>
                                    <input
                                        type="number"
                                        value={data.stok}
                                        onChange={e => setData('stok', e.target.value)}
                                        min="0"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all ${errors.stok ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Contoh: 10"
                                    />
                                    {errors.stok && <p className="mt-1.5 text-sm text-red-600">{errors.stok}</p>}
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
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Bahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Dialog - Stock Adjustment */}
            {isStockModalOpen && stockItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeStockModal}></div>

                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900">
                                {stockItem?.type === 'add' ? 'Tambah Stok' : 'Kurangi Stok'}
                            </h3>
                            <button onClick={closeStockModal} className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                {stockItem?.type === 'add' ? 'Masukkan jumlah stok yang ingin ditambahkan.' : 'Masukkan jumlah stok yang ingin dikurangi.'}
                            </p>
                            <p className="text-sm font-medium text-slate-900 mb-4">
                                {stockItem?.nama_bahan} <span className="text-slate-500">(Stok saat ini: {stockItem?.stok || 0})</span>
                            </p>

                            <form onSubmit={handleStockSubmit}>
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                                    <input
                                        type="number"
                                        value={stockData.jumlah}
                                        onChange={e => setStockDataData('jumlah', e.target.value)}
                                        min="1"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-${stockItem?.type === 'add' ? 'emerald' : 'orange'}-600 focus:border-transparent outline-none transition-all ${errors.jumlah ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Masukkan jumlah"
                                    />
                                    {errors.jumlah && <p className="mt-1.5 text-sm text-red-600">{errors.jumlah}</p>}
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={closeStockModal}
                                        className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={stockProcessing}
                                        className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors ${stockItem?.type === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}
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
