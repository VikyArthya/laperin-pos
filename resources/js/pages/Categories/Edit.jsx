import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, FolderOpen } from 'lucide-react';

export default function Edit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_kategori: category.nama_kategori || '',
        kode: category.kode || '',
        deskripsi: category.deskripsi || '',
        is_active: category.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/categories/${category.id}`);
    };

    const inputClasses = "w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all";

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title={`Edit ${category.nama_kategori}`} />

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FolderOpen className="w-6 h-6" />
                            </div>
                            Edit Kategori
                        </h1>
                        <p className="mt-1 text-slate-500">Edit kategori: <strong>{category.nama_kategori}</strong></p>
                    </div>
                    <Link href="/categories" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori *</label>
                                <input
                                    type="text"
                                    value={data.nama_kategori}
                                    onChange={e => setData('nama_kategori', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Contoh: Menu Utama"
                                    required
                                />
                                {errors.nama_kategori && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nama_kategori}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Kategori</label>
                                <input
                                    type="text"
                                    value={data.kode}
                                    onChange={e => setData('kode', e.target.value.toUpperCase())}
                                    className={inputClasses}
                                    placeholder="Contoh: MENU"
                                    maxLength="50"
                                />
                                {errors.kode && (
                                    <p className="mt-1 text-sm text-red-600">{errors.kode}</p>
                                )}
                                <p className="mt-1 text-xs text-slate-500">Kode singkat untuk kategori (maksimal 50 karakter)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                                <textarea
                                    value={data.deskripsi}
                                    onChange={e => setData('deskripsi', e.target.value)}
                                    className={inputClasses}
                                    placeholder="Jelaskan kategori ini..."
                                    rows="3"
                                />
                                {errors.deskripsi && (
                                    <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-slate-700">
                                    Kategori Aktif
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                        <Link href="/categories" className="w-full sm:w-auto text-center px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 sm:border-transparent">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="w-full sm:w-auto justify-center inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 disabled:opacity-70 transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            {processing ? 'Menyimpan...' : 'Update Kategori'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
