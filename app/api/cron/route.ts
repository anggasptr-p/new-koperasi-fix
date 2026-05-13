import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  const now = new Date();
  
  // Hitung-hitungan waktu mundur (Time Travel)
  const twentyMinsAgo = new Date(now.getTime() - 20 * 60000).toISOString();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 3600000).toISOString();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 3600000).toISOString();

  try {
    // 1. SAPU BERSIH QRIS (Belom Bayar > 20 Menit)
    await supabase.from('orders')
      .update({ order_status: 'REJECTED', reject_reason: 'Auto-Reject: QRIS Expired (20 mnt)' })
      .eq('payment_method', 'QRIS').eq('payment_status', 'PENDING').eq('order_status', 'WAITING')
      .lt('created_at', twentyMinsAgo);

    // 2. SAPU BERSIH TUNAI (Belom Bayar & Ambil > 12 Jam)
    await supabase.from('orders')
      .update({ order_status: 'REJECTED', reject_reason: 'Auto-Reject: Kelamaan Kaga Diambil (12 jam)' })
      .eq('payment_method', 'TUNAI').eq('payment_status', 'PENDING').eq('order_status', 'WAITING')
      .lt('created_at', twelveHoursAgo);

    // 3. SAPU BERSIH UDAH BAYAR TAPI GA DIAMBIL (Misterius > 24 Jam)
    await supabase.from('orders')
      .update({ order_status: 'REJECTED', reject_reason: 'Auto-Reject: Barang Ga Diambil (Hangus 24 Jam)' })
      .eq('payment_status', 'PAID').eq('order_status', 'WAITING')
      .lt('created_at', twentyFourHoursAgo);

    return NextResponse.json({ success: true, message: "Robot bersih-bersih Smaneka berhasil jalan, Ler!" });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
