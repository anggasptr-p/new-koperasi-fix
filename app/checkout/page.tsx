"use client";
import { useCartStore } from "../../lib/store";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  // Tarik data keranjang dari Brankas Global!
  const { cart, totalItems, totalPrice } = useCartStore((state) => ({
    cart: state.cart,
    totalItems: state.cart.reduce((sum, item) => sum + item.qty, 0),
    totalPrice: state.cart.reduce((sum, item) => sum + item.price * item.qty, 0),
  }));

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <h1 className="text-6xl mb-4">🛒</h1>
        <h2 className="text-xl font-black text-gray-800 mb-2">Keranjang Lu Kosong, Ler!</h2>
        <p className="text-sm text-gray-500 mb-6">Masa mau checkout angin?</p>
        <button onClick={() => router.push('/')} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">
          Balik Jajan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-32">
      <header className="bg-white px-4 py-4 shadow-sm flex items-center sticky top-0 z-50">
        <button onClick={() => router.push('/')} className="text-2xl font-bold text-gray-400 mr-4 active:scale-90 transition-transform">←</button>
        <h1 className="font-black text-lg text-gray-800">Checkout Barang</h1>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Ringkasan Pesanan</h2>
        
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-sm text-gray-800">{item.name}</h3>
                  <p className="text-xs text-gray-400 font-bold mt-0.5">{item.qty}x @ Rp {item.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <p className="font-black text-green-600 text-sm">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold text-gray-500">Total Barang</p>
            <p className="text-sm font-bold text-gray-800">{totalItems} Item</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-base font-black text-gray-800">Total Bayar</p>
            <p className="text-xl font-black text-green-600">Rp {totalPrice.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 max-w-md mx-auto z-50">
        <button className="w-full bg-green-600 text-white py-4 rounded-[20px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-100 active:scale-[0.98] transition-all">
          BAYAR SEKARANG 🚀
        </button>
      </div>
    </div>
  );
}
