import { Head, Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, FileText, Package, Wallet, CheckSquare, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';

export default function Show({ laporan, itemsByCategory, stockRefillMaterials }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const isKaryawan = authUser?.role === 'karyawan';
    const isAdmin = authUser?.role === 'admin';

    const formatRp = (num) => {
        if (num === null || num === undefined) return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : num;
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    const formatDateFull = (dateStr) => {
        if (!dateStr) return '-';
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const date = new Date(dateStr);
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatItem = (qty_sisa, qty_bawa) => {
        const sisa = Number(qty_sisa);
        const bawa = Number(qty_bawa);
        const terjual = Math.max(0, bawa - sisa);
        return `${sisa} (${bawa})`;
    };

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus laporan ini? Seluruh data penjualan terkait akan dihapus dan stok akan dikembalikan.')) {
            router.delete(`/laporan-pulang/${laporan.id}`);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'submitted_by_admin':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-4 h-4" />
                        Menunggu Karyawan
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-4 h-4" />
                        Selesai
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Draft
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <Head title={`Laporan Penjualan - ${laporan.tanggal}`} />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            Laporan Penjualan
                        </h1>
                        <p className="mt-1 text-gray-600 dark:text-gray-400 font-medium">{formatDateFull(laporan.tanggal)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(laporan.status)}
                        {isAdmin && (
                            <>
                                <Link
                                    href={`/laporan-pulang/${laporan.id}/edit`}
                                    className="inline-flex items-center text-sm font-medium text-white bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-600 px-4 py-2 rounded-lg shadow-sm transition-colors"
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center text-sm font-medium text-white bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-600 px-4 py-2 rounded-lg shadow-sm transition-colors"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                </button>
                            </>
                        )}
                        <Link
                            href="/laporan-pulang"
                            className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Link>
                    </div>
                </div>

                {/* Laporan Content */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8 space-y-8">

                        {/* ISIAN Section */}
                        {itemsByCategory['Menu Utama'] && itemsByCategory['Menu Utama'].length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700">
                                    ISIAN
                                </h2>
                                <div className="space-y-2">
                                    {itemsByCategory['Menu Utama'].map((item) => {
                                        const qtyBawa = Number(item.qty_bawa);
                                        const qtySisa = Number(item.qty_sisa);
                                        const qtyTerjual = Math.max(0, qtyBawa - qtySisa);
                                        const product = item.product;

                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="flex items-center gap-3">

                                                    <div>
                                                        <span className="text-gray-700 dark:text-gray-300">{product?.nama_produk || '-'}</span>
                                                        {laporan.status === 'completed' && (
                                                            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                                Terjual: {qtyTerjual}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                        {formatItem(item.qty_sisa, item.qty_bawa)}
                                                    </span>
                                                    {laporan.status === 'completed' && qtyTerjual > 0 && product && (
                                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                            {formatRp(product.harga * qtyTerjual)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* TOPPING Section */}
                        {itemsByCategory['Topping'] && itemsByCategory['Topping'].length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700">
                                    TOPPING
                                </h2>
                                <div className="space-y-2">
                                    {itemsByCategory['Topping'].map((item) => {
                                        const qtyBawa = Number(item.qty_bawa);
                                        const qtySisa = Number(item.qty_sisa);
                                        const qtyTerjual = Math.max(0, qtyBawa - qtySisa);

                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="flex items-center gap-3">

                                                    <div>
                                                        <span className="text-gray-700 dark:text-gray-300">{item.product?.nama_produk || '-'}</span>
                                                        {laporan.status === 'completed' && (
                                                            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                                Terjual: {qtyTerjual}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                        {qtySisa} ({qtyBawa})
                                                    </span>
                                                    {laporan.status === 'completed' && qtyTerjual > 0 && item.product && (
                                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                            {formatRp(item.product.harga * qtyTerjual)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* PACKAGING Section */}
                        {itemsByCategory['Packaging'] && itemsByCategory['Packaging'].length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700">
                                    PACKAGING
                                </h2>
                                <div className="space-y-2">
                                    {itemsByCategory['Packaging'].map((item) => {
                                        const qtyBawa = Number(item.qty_bawa);
                                        const qtySisa = Number(item.qty_sisa);
                                        const qtyTerjual = Math.max(0, qtyBawa - qtySisa);

                                        return (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                <div className="flex items-center gap-3">

                                                    <div>
                                                        <span className="text-gray-700 dark:text-gray-300">{item.product?.nama_produk || '-'}</span>
                                                        {laporan.status === 'completed' && (
                                                            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                                Terjual: {qtyTerjual}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                                        {formatItem(item.qty_sisa, item.qty_bawa)}
                                                    </span>
                                                    {laporan.status === 'completed' && qtyTerjual > 0 && item.product && (
                                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                            {formatRp(item.product.harga * qtyTerjual)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* CASH Section */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700">
                                CASH
                            </h2>
                            <div className="space-y-3">
                                {laporan.ma_50 && (
                                    <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Modal Awal (50)</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{laporan.ma_50}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Cash :</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{formatRp(laporan.cash)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Qr&nbsp;&nbsp;&nbsp;&nbsp;:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{formatRp(laporan.qris)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Sf&nbsp;&nbsp;&nbsp;&nbsp;:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{formatRp(laporan.sf)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white">
                                    <span className="font-bold">Total :</span>
                                    <span className="font-black text-xl">{formatRp(laporan.total_pembayaran)}</span>
                                </div>
                            </div>

                            {/* Ringkasan Sisa Produk */}
                            {laporan.items.some(item => Number(item.qty_sisa) > 0) && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">📦 Ringkasan Sisa Produk (Tidak Terjual)</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {laporan.items.filter(item => Number(item.qty_sisa) > 0).map(item => (
                                            <div key={item.id} className="flex flex-col p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold truncate">{item.product?.nama_produk}</span>
                                                <span className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1">{item.qty_sisa} <span className="text-[10px] font-medium text-slate-400">unit</span></span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* DANA KELUAR Section */}
                        {laporan.status === 'completed' && laporan.dana_keluar > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700">
                                    DANA KELUAR
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">💸 Dana Keluar:</span>
                                        <span className="font-bold text-red-600 dark:text-red-400">{formatRp(laporan.dana_keluar)}</span>
                                    </div>
                                    {laporan.catatan_dana_keluar && (
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Catatan Dana Keluar:</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{laporan.catatan_dana_keluar}</p>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <span className="font-medium text-amber-800 dark:text-amber-300">Keuntungan:</span>
                                        <span className="font-bold text-amber-900 dark:text-amber-200">{formatRp(laporan.total_pembayaran - laporan.dana_keluar)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STOK Section */}
                        {laporan.status === 'completed' && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700">
                                    STOK
                                </h2>
                                {stockRefillMaterials && stockRefillMaterials.length > 0 ? (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                                            {stockRefillMaterials.map((material) => (
                                                <div key={material.id} className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                    <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center">
                                                        <span className="text-white text-xs">!</span>
                                                    </div>
                                                    <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{material.nama_bahan}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {/* <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">CATATAN STOK</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-400">( ! ) perlu direfill &nbsp; (   ) kosongi jika masih banyak</p>
                                        </div> */}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line font-mono">
                                            {laporan.catatan_stok || 'Tidak ada item yang perlu direfill.'}
                                        </div>
                                        {/* <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">CATATAN STOK</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-400">( ! ) perlu direfill</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-400">(   ) kosongi jika masih banyak</p>
                                        </div> */}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info Footer */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-4">
                                <span>Shift: <strong className="text-gray-700 dark:text-gray-300">{laporan.shift?.nama_shift || '-'}</strong></span>
                                <span>Karyawan: <strong className="text-gray-700 dark:text-gray-300">{laporan.employee?.nama || laporan.user?.name || '-'}</strong></span>
                            </div>
                            <span className="text-xs">ID: #{laporan.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
