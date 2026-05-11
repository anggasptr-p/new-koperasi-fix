"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Download, Printer, CheckCircle2, Clock, Banknote, ArrowLeft, Hourglass } from "lucide-react";

export default function PaymentPage() {
  const { orderId } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 Menit dalam detik

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SMANEKA_PAY_${orderId}`;

  // 1. Tarik Data Awal
  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase.from("orders").select("*").eq("id", orderId).single();
      setOrder(data);
      setLoading(false);
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  // 2. Auto-Polling: Ngecek status PAID tiap 5 detik
  useEffect(() => {
    if (!order || order.payment_status === 'PAID') return;

    const interval = setInterval(async () => {
      const { data } = await supabase.from("orders").select("payment_status").eq("id", orderId).single();
      if (data && data.payment_status === 'PAID') {
        setOrder((prev: any) => ({ ...prev, payment_status: 'PAID' }));
      }
    }, 5000); // 5000ms = 5 detik

    return () => clearInterval(interval);
  }, [order, orderId]);

  // 3. Countdown Timer QRIS
  useEffect(() => {
    if (!order || order.payment_status === 'PAID' || order.payment_method === 'TUNAI') return;
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, order]);

  // Format Timer (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading || !order) return <div className="h-screen flex items-center justify-center font-black italic">Loading Bill...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-10 print:bg-white print:pb-0">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-5 flex items-center gap-4 print:hidden">
        <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ArrowLeft size={20}/></button>
        <h1 className="text-xl font-bold tracking-tight">Status Pembayaran</h1>
      </header>

      <main className="max-w-md mx-auto px-6 mt-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200 text-center print:shadow-none print:border-none print:p-0">
          
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-black italic tracking-tighter mb-1">SMANEKA<span className="text-emerald-500">.</span></h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order: #{(orderId as string).substring(0, 8)}</p>
          </div>

          {/* DYNAMIC UI: Kalo Udah Dibayar vs Belum */}
          {order.payment_status === 'PAID' ? (
            <div className="bg-emerald-50 p-8 rounded-[2rem] border-2 border-emerald-100 mb-8 animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-black text-emerald-700 text-xl mb-1">Pembayaran Sukses!</h3>
              <p className="text-xs text-emerald-600 font-medium">Pesanan lu udah masuk ke sistem antrean Admin.</p>
            </div>
          ) : (
            <>
              {order.payment_method === 'QRIS' ? (
                <div className="space-y-6 mb-8">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-emerald-100 inline-block shadow-sm">
                    {timeLeft > 0 ? (
                      <img src={qrUrl} alt="QRIS" className="w-56 h-56 mix-blend-multiply" />
                    ) : (
                      <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-xl">
                        <Hourglass size={32} className="mb-2" />
                        <span className="font-bold text-xs uppercase">QRIS Kadaluarsa</span>
                      </div>
                    )}
                  </div>
                  
                  {timeLeft > 0 && (
                    <div className="bg-red-50 text-red-600 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-100">
                      <Clock size={16} />
                      <span className="font-black text-sm">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 p-8 rounded-[2rem] border-2 border-amber-100 text-amber-700 mb-8">
                  <Banknote size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-black text-sm uppercase">Siapkan Uang Tunai</p>
                  <p className="text-[10px] font-medium mt-2">Segera ke kantin, bayar ke Admin dan ambil jajan lu!</p>
                </div>
              )}
            </>
          )}

          {/* Rincian Harga */}
          <div className="text-left bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Tagihan</p>
            <p className="text-3xl font-black text-slate-900">Rp {order.total_price.toLocaleString('id-ID')}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-2">Metode: <span className="uppercase text-slate-800">{order.payment_method}</span></p>
          </div>

          {/* Tombol Cetak & Simpan (Sembunyi pas dicetak) */}
          <div className="grid grid-cols-2 gap-4 mt-8 print:hidden">
             <button onClick={() => window.print()} className="bg-slate-950 hover:bg-slate-800 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
               <Printer size={16}/> Cetak Bukti
             </button>
             {order.payment_method === 'QRIS' && order.payment_status !== 'PAID' && timeLeft > 0 && (
               <a href={qrUrl} download={`QRIS-${orderId}.png`} className="bg-white border-2 border-slate-100 text-slate-600 hover:border-emerald-500 hover:text-emerald-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                 <Download size={16}/> Simpan QR
               </a>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
