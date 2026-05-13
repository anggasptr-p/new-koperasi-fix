"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Package, Plus, Minus } from "lucide-react";

export default function InventoryModule() {
  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("name", { ascending: true });
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const updateStock = async (id: number, current: number, op: 'add' | 'sub') => {
    const next = op === 'add' ? current + 1 : Math.max(0, current - 1);
    await supabase.from("products").update({ stock: next }).eq("id", id);
    fetchProducts();
  };

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      <h2 className="text-xl font-black text-white flex items-center gap-3"><Package className="text-amber-500"/> Gudang Smaneka</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-xl">
            <div><span className="text-[7px] font-black text-amber-500 uppercase">{p.category}</span><h3 className="font-bold text-white text-sm mt-0.5">{p.name}</h3></div>
            <div className="flex items-center gap-4 bg-slate-950 p-2 rounded-2xl">
              <button onClick={() => updateStock(p.id, p.stock, 'sub')} className="w-8 h-8 bg-slate-800 text-red-400 rounded-xl flex items-center justify-center font-black shadow-lg"><Minus size={16}/></button>
              <span className="font-black text-white text-base w-6 text-center">{p.stock}</span>
              <button onClick={() => updateStock(p.id, p.stock, 'add')} className="w-8 h-8 bg-emerald-500 text-slate-950 rounded-xl flex items-center justify-center font-black shadow-lg"><Plus size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}