"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { BookOpen, LayoutDashboard } from "lucide-react";

export default function LedgerModule() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (data) setOrders(data);
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-3"><BookOpen className="text-emerald-500"/> Financial Ledger</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Audit Real-Time (Read-Only)</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-500/20">
          <LayoutDashboard size={14}/> Omzet: Rp {orders.filter(o=>o.payment_status==='PAID'&&o.order_status==='ACCEPTED').reduce((s,o)=>s+o.total_price,0).toLocaleString()}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[9px] font-bold">
            <thead className="bg-slate-950 text-slate-500 uppercase tracking-widest border-b border-slate-800">
              <tr><th className="px-6 py-5">Tanggal</th><th className="px-6 py-5">Pembeli</th><th className="px-6 py-5">Item</th><th className="px-6 py-5">Total</th><th className="px-6 py-5">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-white uppercase">{o.user_name}</td>
                  <td className="px-6 py-4 text-slate-400 truncate max-w-xs">{o.items.map((it:any)=>`${it.qty}x ${it.name}`).join(', ')}</td>
                  <td className="px-6 py-4 text-emerald-500">Rp {o.total_price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[8px] uppercase">{o.order_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
