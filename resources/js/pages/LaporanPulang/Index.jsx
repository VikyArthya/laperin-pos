import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Eye, FileText, Calendar } from 'lucide-react';

export default function Index({ laporan }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const isKaryawan = authUser?.role === 'karyawan';

    const formatRp = (num) => {
        if (num === null || num === undefined) return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Laporan Pulang" />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        {isKaryawan && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium border border-purple-100">
                                👤 Login sebagai: <span className="font-bold">{authUser?.name}</span> (Karyawan)
                            </div>
                        )}
                        {!isKaryawan && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium border border-purple-100">
                                📊 Mode Admin
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            Laporan Pulang (Peleburan)
                        </h1>
                        <p className="mt-1 text-slate-500">
                            {isKaryawan
                                ? 'Daftar laporan pulang Anda. Anda hanya dapat melihat laporan milik Anda sendiri.'
                                : 'Daftar semua laporan pulang karyawan.'}
                        </p>
                        {isKaryawan && (
                            <p className="text-xs text-purple-600 mt-1">Data di bawah ini adalah laporan yang Anda inputkan.</p>
                        )}
                    </div>
                    <Link
                        href="/laporan-pulang/create"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Buat Laporan Baru
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Shift</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pembayaran</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {laporan.length > 0 ? (
                                    laporan.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                                    <span className="text-sm text-slate-900">{formatDate(item.tanggal)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {item.shift?.nama_shift || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {item.employee?.nama || item.user?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-900">
                                                {formatRp(item.total_pembayaran)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                <Link
                                                    href={`/laporan-pulang/${item.id}`}
                                                    className="inline-flex items-center text-purple-600 hover:text-purple-900"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Lihat
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="text-sm">Belum ada laporan pulang.</p>
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
