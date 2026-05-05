import React, { useEffect, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Receipt, ArrowLeft, Save, Calculator, Lock } from 'lucide-react';

export default function Create({ shifts, products, employees, authEmployee }) {
    const { props } = usePage();
    const authUser = props.auth?.user;
    const isKaryawan = authUser?.role === 'karyawan';

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        shift_id: '',
        modal_awal: 0,
        dana_keluar: 0,
        dana_masuk: 0,
        selisih_dana: 0,
        omset_penjualan: 0,
        cash: 0,
        qris: 0,
        sf: 0,
        is_karyawan_hadir: isKaryawan ? true : false,
        employee_id: isKaryawan && authEmployee ? authEmployee.id : '',
        gaji_karyawan: 0,
        catatan: '',
        items: products.map(p => ({ product_id: p.id, qty: 0 })),
    });

    // Hitung total omset dari harga jual produk
    const calculateTotalOmset = () => {
        return data.items.reduce((total, item) => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                return total + (product.harga * item.qty);
            }
            return total;
        }, 0);
    };

    // Hitung modal awal dari harga beli produk
    const calculateModalAwal = () => {
        return data.items.reduce((total, item) => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                return total + ((product.harga_beli || 0) * item.qty);
            }
            return total;
        }, 0);
    };

    // Hitung gaji otomatis berdasarkan rumus: (omset × 20%) + (floor(omset / 100rb) × 5rb)
    const calculateGaji = (omset) => {
        const gajiBase = Math.floor(omset * 0.20);
        const bonus = Math.floor(omset / 100000) * 5000;
        return gajiBase + bonus;
    };

    const totalOmsetProduk = calculateTotalOmset();
    const totalModalAwal = calculateModalAwal();
    const autoGaji = calculateGaji(totalOmsetProduk);

    // Auto calculate selisih dana
    useEffect(() => {
        const selisihDana = Number(data.dana_keluar) - Number(data.dana_masuk);

        setData(prev => ({
            ...prev,
            selisih_dana: selisihDana,
            omset_penjualan: totalOmsetProduk,
            modal_awal: totalModalAwal,
        }));
    }, [data.dana_keluar, data.dana_masuk]);

    // Update omset, modal, dana_masuk & gaji saat qty berubah
    useEffect(() => {
        setData(prev => ({
            ...prev,
            omset_penjualan: totalOmsetProduk,
            modal_awal: totalModalAwal,
            dana_masuk: totalOmsetProduk,
            gaji_karyawan: prev.is_karyawan_hadir ? autoGaji : 0,
        }));
    }, [totalOmsetProduk, totalModalAwal]);

    // Update gaji saat toggle karyawan hadir
    useEffect(() => {
        setData(prev => ({
            ...prev,
            gaji_karyawan: prev.is_karyawan_hadir ? autoGaji : 0,
        }));
    }, [data.is_karyawan_hadir, autoGaji]);

    const handleItemChange = (productId, qty) => {
        const newItems = data.items.map(item =>
            item.product_id === productId ? { ...item, qty: Number(qty) } : item
        );
        setData('items', newItems);
    };

    const getQty = (productId) => {
        const item = data.items.find(i => i.product_id === productId);
        return item ? item.qty : 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/sales');
    };

    const formatRp = (num) => {
        if (num === null || num === undefined || num === '') return 'Rp 0';
        const number = typeof num === 'string' ? parseInt(num, 10) || 0 : Number(num);
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    const inputClasses = "w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all";

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Input Transaksi Kasir" />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Receipt className="w-6 h-6" />
                            </div>
                            Input Transaksi Baru
                        </h1>
                        <p className="mt-1 text-slate-500">Catat rekap penjualan harian untuk sebuah cabang / shift.</p>
                    </div>
                    <Link href="/sales" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Batal & Kembali
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* General Info & Staffing */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Informasi Umum & Shift</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Transaksi</label>
                                <input type="date" value={data.tanggal} onChange={e => setData('tanggal', e.target.value)} className={inputClasses} required />
                                {errors.tanggal && <p className="mt-1 text-sm text-red-600">{errors.tanggal}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cabang / Shift</label>
                                <select value={data.shift_id} onChange={e => setData('shift_id', e.target.value)} className={inputClasses} required>
                                    <option value="">Pilih Cabang</option>
                                    {shifts.map(s => <option key={s.id} value={s.id}>{s.nama_shift}</option>)}
                                </select>
                                {errors.shift_id && <p className="mt-1 text-sm text-red-600">{errors.shift_id}</p>}
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-4">
                            {!isKaryawan && (
                                <div className="flex items-center mb-4">
                                    <input type="checkbox" id="karyawan_hadir" checked={data.is_karyawan_hadir} onChange={e => setData('is_karyawan_hadir', e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                    <label htmlFor="karyawan_hadir" className="ml-2 block text-sm text-slate-900 font-medium">Karyawan Hadir?</label>
                                </div>
                            )}

                            {data.is_karyawan_hadir && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Karyawan</label>
                                        {isKaryawan ? (
                                            <input
                                                type="text"
                                                value={authEmployee?.nama || authUser?.name || 'Tidak ada data karyawan'}
                                                disabled
                                                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-400 bg-slate-100 cursor-not-allowed"
                                                readOnly
                                            />
                                        ) : (
                                            <select value={data.employee_id} onChange={e => setData('employee_id', e.target.value)} className={inputClasses}>
                                                <option value="">Pilih Karyawan</option>
                                                {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
                                            </select>
                                        )}
                                        {isKaryawan && (
                                            <p className="text-[10px] text-amber-600 mt-1">🔒 Terkait akun Anda (tidak bisa diubah)</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Gaji Dibayarkan <span className="text-emerald-500">(Auto)</span></label>
                                        <input type="number" value={data.gaji_karyawan} readOnly className={`${inputClasses} bg-slate-100 cursor-not-allowed`} min="0" />
                                        <div className="mt-1.5 space-y-0.5">
                                            <p className="text-[10px] text-emerald-600 font-semibold">{formatRp(autoGaji)}</p>
                                            <p className="text-[10px] text-slate-400">= (Omset {formatRp(totalOmsetProduk)} × 20%) + ({Math.floor(totalOmsetProduk / 100000)} × Rp 5.000)</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Financial Inputs */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2 flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-emerald-500" /> Rincian Keuangan
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Modal Awal <span className="text-emerald-500">(Auto)</span></label>
                                        <input type="number" value={data.modal_awal} readOnly className={`${inputClasses} bg-slate-100 cursor-not-allowed`} />
                                        <p className="text-[10px] text-emerald-500 mt-1">= Σ(Harga Beli × Qty) = {formatRp(totalModalAwal)}</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Dana Masuk <span className="text-blue-500">(Auto)</span></label>
                                        <input type="number" value={data.dana_masuk} readOnly className={`${inputClasses} bg-slate-100 cursor-not-allowed`} />
                                        <p className="text-[10px] text-blue-500 mt-1">= Σ(Harga Jual × Qty) = {formatRp(totalOmsetProduk)}</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Dana Keluar</label>
                                        <input type="number" value={data.dana_keluar} onChange={e => setData('dana_keluar', e.target.value)} className={inputClasses} />
                                        <p className="text-[10px] text-slate-400 mt-1">{formatRp(data.dana_keluar)}</p>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Metode Pembayaran</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">💵 Cash</label>
                                            <input type="number" value={data.cash} onChange={e => setData('cash', e.target.value)} className={inputClasses} placeholder="0" />
                                            <p className="text-[10px] text-slate-400 mt-1">{formatRp(data.cash)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">📱 QRIS</label>
                                            <input type="number" value={data.qris} onChange={e => setData('qris', e.target.value)} className={inputClasses} placeholder="0" />
                                            <p className="text-[10px] text-slate-400 mt-1">{formatRp(data.qris)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">🍔 ShopeeFood (SF)</label>
                                            <input type="number" value={data.sf} onChange={e => setData('sf', e.target.value)} className={inputClasses} placeholder="0" />
                                            <p className="text-[10px] text-slate-400 mt-1">{formatRp(data.sf)}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-800 font-medium">Total Pembayaran: {formatRp(Number(data.cash) + Number(data.qris) + Number(data.sf))}</p>
                                        <p className="text-[10px] text-blue-600 mt-1">Cash + QRIS + SF = {formatRp(Number(data.cash) + Number(data.qris) + Number(data.sf))}</p>
                                    </div>
                                </div>

                                {/* Summary Section - Dark */}
                                <div className="mt-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                                    <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                                    <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                                        <div>
                                            <label className="block text-xs font-bold tracking-wider text-slate-400 mb-2">TOTAL OMSET</label>
                                            <p className="text-2xl sm:text-3xl font-black text-blue-400">{formatRp(data.dana_masuk)}</p>
                                            <p className="text-[10px] text-slate-400 mt-2">= Dana Masuk</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-wider text-slate-400 mb-2">UNTUNG BERSIH</label>
                                            <p className={`text-2xl sm:text-3xl font-black ${(Number(data.dana_masuk) - Number(data.modal_awal) - Number(data.gaji_karyawan)) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatRp(Number(data.dana_masuk) - Number(data.modal_awal) - Number(data.gaji_karyawan))}</p>
                                            <p className="text-[10px] text-slate-400 mt-2">= Dana Masuk - Modal Awal - Gaji</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold tracking-wider text-slate-400 mb-2">UNTUNG TANPA GAJI</label>
                                            <p className={`text-2xl sm:text-3xl font-black ${(Number(data.dana_masuk) - Number(data.modal_awal)) >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{formatRp(Number(data.dana_masuk) - Number(data.modal_awal))}</p>
                                            <p className="text-[10px] text-slate-400 mt-2">= Dana Masuk - Modal Awal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Input */}
                        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px] lg:h-[800px]">
                            <div className="p-4 border-b bg-slate-50">
                                <h2 className="text-lg font-semibold text-slate-900">Input Porsi Terjual</h2>
                                <p className="text-xs text-slate-500">Masukkan Qty / Jumlah item yang laku</p>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto space-y-4">
                                {products.map(product => {
                                    const stock = product.stok || 0;
                                    const qty = getQty(product.id);
                                    const isOverStock = qty > stock && stock > 0;
                                    const stockColor = stock > 10 ? 'text-emerald-600 bg-emerald-50' : stock > 0 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
                                    return (
                                        <div key={product.id} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 group ${
                                            isOverStock ? 'border-red-300 bg-red-50/50' : 'border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md hover:shadow-blue-500/5'
                                        }`}>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors truncate">{product.nama_produk}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.kategori}</p>
                                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stockColor}`}>Stok: {stock}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1">Beli: {formatRp(product.harga_beli)} · Jual: {formatRp(product.harga)}</p>
                                                {isOverStock && (
                                                    <p className="text-[10px] font-bold text-red-600 mt-1 flex items-center gap-1">
                                                        <span>⚠️</span> Melebihi stok! (max: {stock})
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-24 ml-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={stock}
                                                    value={qty}
                                                    onChange={e => handleItemChange(product.id, e.target.value)}
                                                    className={`w-full text-center rounded-xl border py-2 font-bold focus:ring-2 focus:bg-white transition-all shadow-sm ${
                                                        isOverStock
                                                            ? 'border-red-400 text-red-600 bg-red-50 focus:ring-red-500 focus:border-red-500'
                                                            : 'border-slate-200 text-slate-900 bg-slate-50 focus:ring-blue-500 focus:border-blue-500'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan</label>
                        <textarea value={data.catatan} onChange={e => setData('catatan', e.target.value)} rows="3" className={inputClasses} placeholder="Tulis keterangan atau kendala hari ini..."></textarea>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                        <Link href="/sales" className="w-full sm:w-auto text-center px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 sm:border-transparent">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="w-full sm:w-auto justify-center inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-70 transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
