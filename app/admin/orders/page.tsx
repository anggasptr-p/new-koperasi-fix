"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { PackageSearch, XCircle, CheckCircle2 } from "lucide-react";

export default function OrdersModule() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").eq('order_status', 'WAITING').order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => { 
    fetchOrders();
    const sub = supabase.channel('order-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleAccept = async (order: any) => {
    if (!confirm("Terima pesanan?")) return;
    await supabase.from("orders").update({ order_status: "ACCEPTED" }).eq("id", order.id);
    for (const it of order.items) {
      const { data: p } = await supabase.from("products").select("stock").eq("id", it.id).single();
      if (p) await supabase.from("products").update({ stock: Math.max(0, p.stock - it.qty) }).eq("id", it.id);
    }
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      <h2 className="text-xl font-black text-white flex items-center gap-3"><PackageSearch className="text-blue-500"/> Transaksi Masuk</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((o) => (
          <div key={o.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-base font-black text-white">{o.user_name}</h4>
              <span className="text-[8px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded uppercase">{o.payment_status}</span>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl mb-4 space-y-1">
              {o.items.map((it:any, i:number) => <p key={i} className="text-[10px] font-bold text-slate-400 flex justify-between"><span>{it.qty}x {it.name}</span> <span>Rp {(it.price*it.qty).toLocaleString()}</span></p>)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => supabase.from("orders").update({ order_status: "REJECTED", reject_reason: "Ditolak Admin" }).eq("id", o.id)} className="bg-red-500/10 text-red-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20">Reject</button>
              <button onClick={() => handleAccept(o)} disabled={o.payment_status === 'PENDING'} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${o.payment_status === 'PAID' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>Accept</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
