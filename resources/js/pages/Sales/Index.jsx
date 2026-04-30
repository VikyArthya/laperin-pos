import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Index({ sales }) {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Rekap Penjualan" />
            
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Data Rekap Penjualan</h1>
                    <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        &larr; Kembali ke Dashboard
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Shift
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Modal Awal
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Omset Penjualan
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Untung Bersih
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {sales.data.length > 0 ? (
                                    sales.data.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {sale.tanggal}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    {sale.shift?.nama_shift || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                Rp {sale.modal_awal.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                                Rp {sale.omset_penjualan.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                                Rp {sale.untung_bersih.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">
                                            Belum ada data penjualan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Minimalis */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm text-slate-600">
                            Menampilkan <span className="font-semibold text-slate-900">{sales.from || 0}</span> - <span className="font-semibold text-slate-900">{sales.to || 0}</span> dari <span className="font-semibold text-slate-900">{sales.total}</span> data
                        </span>
                        <div className="flex space-x-2">
                            {sales.prev_page_url ? (
                                <Link 
                                    href={sales.prev_page_url} 
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Sebelumnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed">
                                    Sebelumnya
                                </button>
                            )}
                            
                            {sales.next_page_url ? (
                                <Link 
                                    href={sales.next_page_url} 
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Selanjutnya
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed">
                                    Selanjutnya
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
