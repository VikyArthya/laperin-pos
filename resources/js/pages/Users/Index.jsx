import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, ShieldAlert, UserCheck } from 'lucide-react';

export default function Index({ users }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'karyawan',
    });

    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setEditingId(user.id);
        setData({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
            password: '', // Leave empty if not changing
            role: user.role,
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
            post('/users', {
                onSuccess: () => closeModal(),
            });
        } else {
            put(`/users/${editingId}`, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus akun user ini?')) {
            destroy(`/users/${id}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Manajemen User" />

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            Manajemen User
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">Kelola akses login (Admin & Karyawan) ke dalam aplikasi.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                            Kembali
                        </Link>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-sm shadow-indigo-600/20 dark:shadow-indigo-600/30"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah User
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nama / Kontak</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role Hak Akses</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {user.email && <span className="block">{user.email}</span>}
                                                            {user.phone && <span className="block font-mono text-indigo-600 dark:text-indigo-400">{user.phone}</span>}
                                                            {!user.email && !user.phone && <span className="text-red-400 dark:text-red-400 italic">Tidak ada kontak</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                    {user.role === 'admin' ? 'Administrator' : 'Karyawan'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(user)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-600 dark:text-gray-400">
                                            <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="text-sm">Belum ada user.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                                {modalMode === 'add' ? 'Tambah Akun User' : 'Edit Akun User'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all ${errors.name ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        required
                                    />
                                    {errors.name && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="Kosongkan jika hanya pakai No HP"
                                    />
                                    {errors.email && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor HP (WhatsApp)</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all ${errors.phone ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        placeholder="08123xxxxxxx"
                                    />
                                    {errors.phone && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                                    <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">*Wajib isi salah satu (Email atau No HP)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password {modalMode === 'edit' && <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">(Kosongkan jika tidak diubah)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all ${errors.password ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                        required={modalMode === 'add'}
                                        minLength="8"
                                    />
                                    {errors.password && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hak Akses (Role)</label>
                                    <select
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all ${errors.role ? 'border-red-500 dark:border-red-600 ring-red-500/20' : 'border-slate-300 dark:border-slate-600'}`}
                                    >
                                        <option value="karyawan">Karyawan (Hanya input transaksi)</option>
                                        <option value="admin">Administrator (Akses penuh)</option>
                                    </select>
                                    {errors.role && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.role}</p>}
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
                                    {processing ? 'Menyimpan...' : 'Simpan User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
