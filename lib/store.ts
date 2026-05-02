import { create } from 'zustand';

// Cetak biru bentuk barang di keranjang
export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  icon: string; // Kita bawa iconnya juga biar cakep di Checkout
};

// Cetak biru buat brankasnya
interface CartStore {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  getQty: (productId: number) => number;
  clearCart: () => void;
}

// Bikin Brankas Global pake Zustand
export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  
  addToCart: (product) => set((state) => {
    const existingItem = state.cart.find((item) => item.id === product.id);
    if (existingItem) {
      return { cart: state.cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) };
    }
    return { cart: [...state.cart, { id: product.id, name: product.name, price: product.price, icon: product.icon, qty: 1 }] };
  }),
  
  removeFromCart: (productId) => set((state) => {
    const existingItem = state.cart.find((item) => item.id === productId);
    if (existingItem?.qty === 1) {
      return { cart: state.cart.filter((item) => item.id !== productId) };
    }
    return { cart: state.cart.map((item) => item.id === productId ? { ...item, qty: item.qty - 1 } : item) };
  }),
  
  // Fungsi buat ngambil jumlah barang tertentu
  getQty: (productId) => {
    const item = get().cart.find((item) => item.id === productId);
    return item ? item.qty : 0;
  },
  
  // Fungsi buat ngosongin keranjang abis bayar
  clearCart: () => set({ cart: [] }),
}));
