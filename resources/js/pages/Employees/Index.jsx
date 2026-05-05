import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';

export default function Index({ employees, users }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama: '',
        alamat: '',
        gambar_ktp: null,
        user_id: '',
        _method: 'post'
    });

    const openAddModal = () => {
        setModalMode('add');
        setEditingId(null);
        setData({ nama: '', alamat: '', gambar_ktp: null, user_id: '', _method: 'post' });
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (employee) => {
        setModalMode('edit');
        setEditingId(employee.id);
        setData({
            nama: employee.nama,
            alamat: employee.alamat || '',
            gambar_ktp: null,
            user_id: employee.user_id || '',
            _method: 'put'
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
            post('/employees', {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/employees/' + editingId, {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus data karyawan ini? Data gaji terkait akan ikut terhapus!')) {
            destroy('/employees/' + id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Master Karyawan" />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            Master Karyawan
                        </h1>
                        <p className="mt-1 text-slate-500">Kelola data karyawan yang bekerja di Laper.in.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm transition-colors">
                            Kembali
                        </Link>
                        <button 
                            onClick={openAddModal}
                            className="inline-flex items-center justify-center rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-700 transition-all shadow-sm shadow-pink-600/20"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">KTP</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {employees.data.length > 0 ? (
                                    employees.data.map((employee) => (
                                        <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 flex items-center gap-3">
                                                <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                                                    {employee.nama.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p>{employee.nama}</p>
                                                    {employee.user ? (
                                                        <p className="text-[10px] text-emerald-600 font-medium">🔗 {employee.user.email}</p>
                                                    ) : (
                                                        <p className="text-[10px] text-amber-500 italic">Belum terhubung akun</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {employee.gambar_ktp ? (
                                                    <a href={`/storage/${employee.gambar_ktp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors">
                                                        Lihat KTP
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Belum ada KTP</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={employee.alamat}>
                                                {employee.alamat || <span className="text-slate-400 italic">Belum diisi</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(employee)} className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(employee.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-12 text-center text-slate-500">
                                            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-sm">Belum ada karyawan yang ditambahkan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-slate-600">
                            Menampilkan <span className="font-semibold text-slate-900">{employees.from || 0}</span> - <span className="font-semibold text-slate-900">{employees.to || 0}</span> dari <span className="font-semibold text-slate-900">{employees.total}</span>
                        </span>
                        <div className="flex space-x-2">
                            {employees.prev_page_url ? (
                                <Link href={employees.prev_page_url} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50">Sebelumnya</button>
                            )}
                            
                            {employees.next_page_url ? (
                                <Link href={employees.next_page_url} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
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
                                {modalMode === 'add' ? 'Tambah Data Karyawan' : 'Edit Karyawan'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={data.nama}
                                        onChange={e => setData('nama', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all ${errors.nama ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Contoh: Budi Santoso"
                                    />
                                    {errors.nama && <p className="mt-1.5 text-sm text-red-600">{errors.nama}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                                    <textarea
                                        value={data.alamat}
                                        onChange={e => setData('alamat', e.target.value)}
                                        rows="3"
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all ${errors.alamat ? 'border-red-500 ring-red-500/20' : 'border-slate-300'}`}
                                        placeholder="Contoh: Jl. Pahlawan No. 1, Semarang"
                                    ></textarea>
                                    {errors.alamat && <p className="mt-1.5 text-sm text-red-600">{errors.alamat}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Scan / Foto KTP
                                        {modalMode === 'edit' && <span className="text-slate-400 font-normal ml-1">(Abaikan jika tidak diubah)</span>}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setData('gambar_ktp', e.target.files[0])}
                                        className={`w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 ${errors.gambar_ktp ? 'border-red-500' : 'border-slate-300'}`}
                                    />
                                    {errors.gambar_ktp && <p className="mt-1.5 text-sm text-red-600">{errors.gambar_ktp}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hubungkan ke Akun User</label>
                                    <select
                                        value={data.user_id}
                                        onChange={e => setData('user_id', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition-all border-slate-300`}
                                    >
                                        <option value="">-- Tidak dihubungkan --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1">Pilih akun login karyawan agar data penjualan & gaji otomatis tersinkron.</p>
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
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Karyawan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
