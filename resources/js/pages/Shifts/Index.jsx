import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Store } from 'lucide-react';

export default function Index({ shifts, cabangs = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);
    const [isCustomCabang, setIsCustomCabang] = useState(false);
    const [customCabangInput, setCustomCabangInput] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_shift: '',
        cabang: '',
    });

    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        setIsCustomCabang(false);
        setCustomCabangInput('');
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (shift) => {
        setModalMode('edit');
        setEditingId(shift.id);
        const hasExisting = cabangs.includes(shift.cabang);
        const isCustom = !hasExisting && Boolean(shift.cabang);
        setIsCustomCabang(isCustom);
        setCustomCabangInput(isCustom ? shift.cabang : '');
        setData({
            nama_shift: shift.nama_shift,
            cabang: shift.cabang || '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsCustomCabang(false);
        setCustomCabangInput('');
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            post('/shifts', {
                onSuccess: () => closeModal(),
            });
        } else {
            put('/shifts/' + editingId, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus shift ini? Data penjualan terkait mungkin akan terpengaruh!')) {
            destroy('/shifts/' + id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Master Cabang & Shift" />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Store className="w-6 h-6" />
                            </div>
                            Master Cabang & Shift
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Kelola daftar cabang atau jam shift operasional.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                            Kembali
                        </Link>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-sm shadow-indigo-600/20 dark:shadow-indigo-600/30"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Cabang
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nama Cabang / Shift</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cabang / Merk</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                                {shifts.data.length > 0 ? (
                                    shifts.data.map((shift) => (
                                        <tr key={shift.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {shift.nama_shift}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {shift.cabang ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400">
                                                        {shift.cabang}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Semua Cabang</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(shift)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(shift.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-600 dark:text-gray-400">
                                            <Store className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="text-sm">Belum ada cabang atau shift yang ditambahkan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{shifts.from || 0}</span> - <span className="font-semibold text-gray-900 dark:text-white">{shifts.to || 0}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{shifts.total}</span>
                        </span>
                        <div className="flex space-x-2">
                            {shifts.prev_page_url ? (
                                <Link href={shifts.prev_page_url} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 bg-slate-50 dark:bg-slate-800/50">Sebelumnya</button>
                            )}

                            {shifts.next_page_url ? (
                                <Link href={shifts.next_page_url} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Selanjutnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 bg-slate-50 dark:bg-slate-800/50">Selanjutnya</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                    <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {modalMode === 'add' ? 'Tambah Cabang Baru' : 'Edit Cabang'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Cabang / Shift <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.nama_shift}
                                        onChange={e => setData('nama_shift', e.target.value)}
                                        className={`w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all ${errors.nama_shift ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="Contoh: Pleburan - Malam"
                                        required
                                    />
                                    {errors.nama_shift && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.nama_shift}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pilih Merk / Cabang Menu
                                    </label>
                                    <select
                                        value={isCustomCabang ? '__new__' : (data.cabang || '')}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === '__new__') {
                                                setIsCustomCabang(true);
                                                setData('cabang', customCabangInput);
                                            } else {
                                                setIsCustomCabang(false);
                                                setData('cabang', val);
                                            }
                                        }}
                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="">-- Semua Menu (Tidak Terikat Merk Tertentu) --</option>
                                        {cabangs.map((c, idx) => (
                                            <option key={idx} value={c}>
                                                Merk: {c}
                                            </option>
                                        ))}
                                        <option value="__new__">+ Tambah Merk Baru...</option>
                                    </select>

                                    {isCustomCabang && (
                                        <div className="mt-2.5">
                                            <input
                                                type="text"
                                                value={customCabangInput}
                                                onChange={e => {
                                                    setCustomCabangInput(e.target.value);
                                                    setData('cabang', e.target.value);
                                                }}
                                                placeholder="Ketik nama merk / cabang baru..."
                                                className="w-full rounded-lg border border-indigo-300 dark:border-indigo-600 bg-indigo-50/30 dark:bg-slate-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none"
                                                autoFocus
                                            />
                                            <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                                                Merk baru ini otomatis tersimpan dan dapat dipilih di menu Kategori & Shift lainnya.
                                            </p>
                                        </div>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Menentukan menu makanan apa saja yang dijual di shift cabang ini.
                                    </p>
                                    {errors.cabang && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.cabang}</p>}
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
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
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
