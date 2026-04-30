import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Store } from 'lucide-react';

export default function Index({ shifts }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_shift: '',
    });

    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (shift) => {
        setModalMode('edit');
        setEditingId(shift.id);
        setData({
            nama_shift: shift.nama_shift,
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
            post(route('shifts.store'), {
                onSuccess: () => closeModal(),
            });
        } else {
            put(route('shifts.update', editingId), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus Cabang/Shift ini? Data penjualan terkait mungkin ikut terhapus!')) {
            destroy(route('shifts.destroy', id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Master Cabang & Shift" />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Store className="w-6 h-6" />
                            </div>
                            Master Cabang & Shift
                        </h1>
                        <p className="mt-1 text-slate-500">Kelola daftar cabang atau jam shift operasional.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors">
                            Kembali
                        </Link>
                        <button 
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Cabang
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Cabang / Shift</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {shifts.data.length > 0 ? (
                                    shifts.data.map((shift) => (
                                        <tr key={shift.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {shift.nama_shift}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(shift)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(shift.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-12 text-center text-slate-500">
                                            <Store className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-sm">Belum ada cabang atau shift yang ditambahkan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-slate-600">
                            Menampilkan <span className="font-semibold text-slate-900">{shifts.from || 0}</span> - <span className="font-semibold text-slate-900">{shifts.to || 0}</span> dari <span className="font-semibold text-slate-900">{shifts.total}</span>
                        </span>
                        <div className="flex space-x-2">
                            {shifts.prev_page_url ? (
                                <Link href={shifts.prev_page_url} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50">Sebelumnya</button>
                            )}
                            
                            {shifts.next_page_url ? (
                                <Link href={shifts.next_page_url} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
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
                                {modalMode === 'add' ? 'Tambah Cabang Baru' : 'Edit Cabang'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Cabang / Shift</label>
                                    <input
                                        type="text"
                                        value={data.nama_shift}
                                        onChange={e => setData('nama_shift', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all ${errors.nama_shift ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Contoh: Pleburan - Malam"
                                    />
                                    {errors.nama_shift && <p className="mt-1.5 text-sm text-red-600">{errors.nama_shift}</p>}
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
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
