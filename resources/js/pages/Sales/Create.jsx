import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Receipt, ArrowLeft, Save, Calculator } from 'lucide-react';

export default function Create({ shifts, products, employees }) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        shift_id: '',
        modal_awal: 0,
        cash: 0,
        qris: 0,
        sf_out: 0,
        sf_in: 0,
        sf_selisih: 0,
        omset_penjualan: 0,
        omset_bubuk: 0,
        omset_topping: 0,
        biaya_packaging: 0,
        is_karyawan_hadir: false,
        employee_id: '',
        gaji_karyawan: 0,
        untung_kotor: 0,
        untung_bersih: 0,
        untung_bersih_tanpa_karyawan: 0,
        selisih_uang_penjualan: 0,
        catatan: '',
        items: products.map(p => ({ product_id: p.id, qty: 0 })),
    });

    const [isAutoCalc, setIsAutoCalc] = useState(true);

    // Auto calculate if enabled
    useEffect(() => {
        if (!isAutoCalc) return;

        // Auto hitung omset penjualan (Cash + QRIS + SF IN) - asumsi rumus standar, bisa disesuaikan
        const omset = Number(data.cash) + Number(data.qris) + Number(data.sf_in);
        
        // Auto hitung sf_selisih (SF OUT - SF IN)
        const sfSelisih = Number(data.sf_out) - Number(data.sf_in);

        // Auto hitung untung kotor (Omset - Modal Awal - Biaya Packaging) - contoh rumus
        const untungKotor = omset - Number(data.biaya_packaging);

        // Auto hitung untung bersih
        const untungBersih = untungKotor - Number(data.gaji_karyawan);
        const untungBersihTanpaKaryawan = untungKotor;

        setData(prev => ({
            ...prev,
            omset_penjualan: omset,
            sf_selisih: sfSelisih,
            untung_kotor: untungKotor,
            untung_bersih: untungBersih,
            untung_bersih_tanpa_karyawan: untungBersihTanpaKaryawan
        }));

    }, [data.cash, data.qris, data.sf_in, data.sf_out, data.modal_awal, data.biaya_packaging, data.gaji_karyawan, isAutoCalc]);

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

    const inputClasses = "w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all";

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Input Transaksi Kasir" />
            
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            <div className="flex items-center mb-4">
                                <input type="checkbox" id="karyawan_hadir" checked={data.is_karyawan_hadir} onChange={e => setData('is_karyawan_hadir', e.target.checked)} className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                <label htmlFor="karyawan_hadir" className="ml-2 block text-sm text-slate-900 font-medium">Karyawan Hadir?</label>
                            </div>
                            
                            {data.is_karyawan_hadir && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Karyawan</label>
                                        <select value={data.employee_id} onChange={e => setData('employee_id', e.target.value)} className={inputClasses}>
                                            <option value="">Pilih Karyawan</option>
                                            {employees.map(e => <option key={e.id} value={e.id}>{e.nama}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Gaji Dibayarkan (Rp)</label>
                                        <input type="number" value={data.gaji_karyawan} onChange={e => setData('gaji_karyawan', e.target.value)} className={inputClasses} min="0" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Financial Inputs */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                                <div className="absolute top-4 right-6 flex items-center gap-2">
                                    <label className="text-xs text-slate-500 flex items-center cursor-pointer">
                                        <input type="checkbox" checked={isAutoCalc} onChange={e => setIsAutoCalc(e.target.checked)} className="mr-2 rounded text-blue-600 focus:ring-blue-500" />
                                        Auto Calculate
                                    </label>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2 flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-emerald-500" /> Rincian Keuangan
                                </h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Modal Awal</label>
                                        <input type="number" value={data.modal_awal} onChange={e => setData('modal_awal', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Cash</label>
                                        <input type="number" value={data.cash} onChange={e => setData('cash', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">QRIS</label>
                                        <input type="number" value={data.qris} onChange={e => setData('qris', e.target.value)} className={inputClasses} />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">SF IN</label>
                                        <input type="number" value={data.sf_in} onChange={e => setData('sf_in', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">SF OUT</label>
                                        <input type="number" value={data.sf_out} onChange={e => setData('sf_out', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">SF Selisih</label>
                                        <input type="number" value={data.sf_selisih} onChange={e => !isAutoCalc && setData('sf_selisih', e.target.value)} readOnly={isAutoCalc} className={`${inputClasses} ${isAutoCalc ? 'bg-slate-100' : ''}`} />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Biaya Packaging</label>
                                        <input type="number" value={data.biaya_packaging} onChange={e => setData('biaya_packaging', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Omset Bubuk</label>
                                        <input type="number" value={data.omset_bubuk} onChange={e => setData('omset_bubuk', e.target.value)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Omset Topping</label>
                                        <input type="number" value={data.omset_topping} onChange={e => setData('omset_topping', e.target.value)} className={inputClasses} />
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">TOTAL OMSET PENJUALAN</label>
                                        <input type="number" value={data.omset_penjualan} onChange={e => !isAutoCalc && setData('omset_penjualan', e.target.value)} readOnly={isAutoCalc} className={`w-full rounded-lg border-2 px-4 py-3 text-lg font-bold text-blue-700 focus:outline-none ${isAutoCalc ? 'border-blue-100 bg-blue-50' : 'border-slate-300'}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">UNTUNG BERSIH</label>
                                        <input type="number" value={data.untung_bersih} onChange={e => !isAutoCalc && setData('untung_bersih', e.target.value)} readOnly={isAutoCalc} className={`w-full rounded-lg border-2 px-4 py-3 text-lg font-bold text-emerald-700 focus:outline-none ${isAutoCalc ? 'border-emerald-100 bg-emerald-50' : 'border-slate-300'}`} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Untung Kotor</label>
                                        <input type="number" value={data.untung_kotor} onChange={e => !isAutoCalc && setData('untung_kotor', e.target.value)} readOnly={isAutoCalc} className={`${inputClasses} ${isAutoCalc ? 'bg-slate-100' : ''}`} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Selisih Uang Penjualan</label>
                                        <input type="number" value={data.selisih_uang_penjualan} onChange={e => setData('selisih_uang_penjualan', e.target.value)} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Input */}
                        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[800px]">
                            <div className="p-4 border-b bg-slate-50">
                                <h2 className="text-lg font-semibold text-slate-900">Input Porsi Terjual</h2>
                                <p className="text-xs text-slate-500">Masukkan Qty / Jumlah item yang laku</p>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto space-y-4">
                                {products.map(product => (
                                    <div key={product.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-slate-800">{product.nama_produk}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{product.kategori}</p>
                                        </div>
                                        <div className="w-24">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                value={getQty(product.id)} 
                                                onChange={e => handleItemChange(product.id, e.target.value)}
                                                className="w-full text-center rounded-lg border-slate-200 py-1.5 focus:ring-blue-500 focus:border-blue-500" 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan</label>
                        <textarea value={data.catatan} onChange={e => setData('catatan', e.target.value)} rows="3" className={inputClasses} placeholder="Tulis keterangan atau kendala hari ini..."></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link href="/sales" className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                            Batal
                        </Link>
                        <button type="submit" disabled={processing} className="inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 disabled:opacity-70 transition-all">
                            <Save className="w-5 h-5 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
