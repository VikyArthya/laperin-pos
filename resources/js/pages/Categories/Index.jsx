import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';

export default function Index({ categories }) {
    const formatRp = (num) => {
        if (num === null || num === undefined) return '0';
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Master Kategori Produk" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FolderOpen className="w-6 h-6" />
                            </div>
                            Master Kategori Produk
                        </h1>
                        <p className="mt-1 text-slate-500">Kelola kategori untuk produk Anda.</p>
                    </div>
                    <Link
                        href="/categories/create"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kategori
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Produk</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <tr key={category.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                                                            category.nama_kategori === 'Menu Utama' ? 'bg-amber-100 text-amber-600' :
                                                            category.nama_kategori === 'Topping' ? 'bg-rose-100 text-rose-600' :
                                                            category.nama_kategori === 'Packaging' ? 'bg-slate-100 text-slate-600' :
                                                            'bg-blue-100 text-blue-600'
                                                        }`}>
                                                            {category.nama_kategori.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">{category.nama_kategori}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {category.kode || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                                {category.deskripsi || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {category.is_active ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                        Non-Aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {category.products_count || 0} produk
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                <Link
                                                    href={`/categories/${category.id}/edit`}
                                                    className="inline-flex items-center text-purple-600 hover:text-purple-900 mr-3"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${category.nama_kategori}"?`)) {
                                                            // Inertia delete
                                                        }
                                                    }}
                                                    className="inline-flex items-center text-red-600 hover:text-red-900"
                                                    disabled={(category.products_count || 0) > 0}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <FolderOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-sm">Belum ada kategori.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
