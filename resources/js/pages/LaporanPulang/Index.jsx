import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Eye, Edit, FileText, Calendar, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function Index({ laporan }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const isKaryawan = authUser?.role === 'karyawan';
    const isAdmin = authUser?.role === 'admin';

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

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus laporan ini? Seluruh data penjualan terkait akan dihapus dan stok akan dikembalikan.')) {
            router.delete(`/laporan-pulang/${id}`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'submitted_by_admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3" />
                        Menunggu Karyawan
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        Selesai
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Draft
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Laporan Penjualan" />

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        {isKaryawan && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium border border-purple-100 dark:border-purple-800">
                                👤 Login sebagai: <span className="font-bold">{authUser?.name}</span> (Karyawan)
                            </div>
                        )}
                        {isAdmin && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium border border-purple-100 dark:border-purple-800">
                                📊 Mode Admin
                            </div>
                        )}
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            Laporan Penjualan
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                            {isKaryawan
                                ? 'Daftar laporan yang di-assign ke Anda.'
                                : 'Daftar semua laporan penjualan.'}
                        </p>
                        {isKaryawan && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Silakan isi laporan yang statusnya "Menunggu Karyawan".</p>
                        )}
                    </div>
                    {isAdmin && (
                        <Link
                            href="/laporan-pulang/create"
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 dark:bg-purple-600 hover:bg-purple-700 dark:hover:bg-purple-600 rounded-lg shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Buat Laporan Baru
                        </Link>
                    )}
                </div>

                {/* Table Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Shift</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Karyawan</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Pembayaran</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                                {laporan.length > 0 ? (
                                    laporan.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-900 dark:text-white">{formatDate(item.tanggal)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {item.shift?.nama_shift || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {item.employee?.nama || item.user?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                                                {formatRp(item.total_pembayaran)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                <div className="flex justify-center items-center gap-3">
                                                    {isKaryawan && item.status === 'submitted_by_admin' && (
                                                        <Link
                                                            href={`/laporan-pulang/${item.id}/edit`}
                                                            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Isi Laporan
                                                        </Link>
                                                    )}
                                                    {(item.status === 'completed' || isAdmin) && (
                                                        <Link
                                                            href={`/laporan-pulang/${item.id}`}
                                                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            <Link
                                                                href={`/laporan-pulang/${item.id}/edit`}
                                                                className="p-1.5 text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                                title="Edit Laporan"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-1.5 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                                title="Hapus Laporan"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-600 dark:text-gray-400">
                                            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="text-sm">
                                                {isKaryawan ? 'Belum ada laporan yang tersedia untuk Anda.' : 'Belum ada laporan penjualan.'}
                                            </p>
                                            {isAdmin && (
                                                <Link
                                                    href="/laporan-pulang/create"
                                                    className="inline-flex items-center mt-3 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Buat Laporan Baru
                                                </Link>
                                            )}
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
