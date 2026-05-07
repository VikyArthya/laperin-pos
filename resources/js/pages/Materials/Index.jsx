import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Box } from 'lucide-react';

export default function Index({ materials }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_bahan: '',
    });

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
            post('/materials', {
                onSuccess: () => closeModal(),
            });
        } else {
            put('/materials/' + editingId, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus bahan ini?')) {
            destroy('/materials/' + id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Master Bahan Pokok" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <Box className="w-6 h-6" />
                            </div>
                            Master Bahan Pokok
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Kelola daftar bahan baku harian operasional Anda.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                            Kembali
                        </Link>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 dark:bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-600/20 dark:shadow-emerald-600/30"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Bahan
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px:10px_-3px_rgba(6,81,237,0.05)] border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nama Bahan Pokok</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                                {materials.data.length > 0 ? (
                                    materials.data.map((material) => (
                                        <tr key={material.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {material.nama_bahan}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => openEditModal(material)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(material.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-12 text-center text-gray-600 dark:text-gray-400">
                                            <Box className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="text-sm">Belum ada bahan pokok yang ditambahkan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{materials.from || 0}</span> - <span className="font-semibold text-gray-900 dark:text-white">{materials.to || 0}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{materials.total}</span>
                        </span>
                        <div className="flex space-x-2">
                            {materials.prev_page_url ? (
                                <Link href={materials.prev_page_url} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 bg-slate-50 dark:bg-slate-800/50">Sebelumnya</button>
                            )}

                            {materials.next_page_url ? (
                                <Link href={materials.next_page_url} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
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
                                {modalMode === 'add' ? 'Tambah Bahan Pokok' : 'Edit Bahan Pokok'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Bahan Pokok</label>
                                    <input
                                        type="text"
                                        value={data.nama_bahan}
                                        onChange={e => setData('nama_bahan', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all ${errors.nama_bahan ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="Contoh: Daging Sapi / Beras"
                                    />
                                    {errors.nama_bahan && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.nama_bahan}</p>}
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
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Bahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
