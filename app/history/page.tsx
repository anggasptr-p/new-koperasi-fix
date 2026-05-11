"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, XCircle, ShoppingBag } from "lucide-react";

export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };
    fetchHistory();
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">MEMUAT RIWAYAT...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <header className="bg-white border-b border-slate-100 px-6 py-5 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ArrowLeft size={20}/></button>
        <h1 className="text-xl font-black tracking-tight">Riwayat Jajan</h1>
      </header>

      <main className="max-w-xl mx-auto px-6 mt-8 space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum pernah jajan, Ler?</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm">Pesanan #{order.id.substring(0, 8)}</h4>
                </div>
                <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                  order.order_status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' : 
                  order.order_status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {order.order_status}
                </span>
              </div>
              
              <div className="space-y-1 mb-4">
                {order.items.map((it: any, i: number) => (
                  <p key={i} className="text-[11px] font-bold text-slate-500">{it.qty}x {it.name}</p>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <p className="text-xs font-black text-slate-950">Rp {order.total_price.toLocaleString()}</p>
                {order.reject_reason && (
                  <p className="text-[9px] text-red-500 font-bold italic">Alasan: "{order.reject_reason}"</p>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}