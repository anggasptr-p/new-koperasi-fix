import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // 1. Set waktu ke bulan kemaren
    const now = new Date();
    // Karena jalan di tanggal 1 jam 00:00, kita tarik data bulan sebelumnya
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const namaBulan = firstDayLastMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const fileName = `Laporan_Smaneka_${namaBulan.replace(' ', '_')}.csv`;

    // 2. Tarik SEMUA data bulan kemaren
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', firstDayLastMonth.toISOString())
      .lte('created_at', lastDayLastMonth.toISOString());

    if (fetchError || !orders || orders.length === 0) {
      return NextResponse.json({ message: "Kaga ada data bulan kemaren Ler, aman!" });
    }

    // 3. Ngeracik Data jadi format CSV
    let csvContent = "Order ID,Nama,Item,Total Harga,Payment Method,Payment Status,Order Status,Tanggal,Alasan Reject\n";
    orders.forEach(o => {
      const itemsTeks = o.items.map((it: any) => `${it.qty}x ${it.name}`).join(' | ');
      const tanggal = new Date(o.created_at).toLocaleString('id-ID');
      const reject = o.reject_reason || '-';
      csvContent += `${o.id},${o.user_name},${itemsTeks},${o.total_price},${o.payment_method},${o.payment_status},${o.order_status},${tanggal},${reject}\n`;
    });

    // 4. Upload ke Supabase Storage (Ubah ke Blob)
    const fileBuffer = Buffer.from(csvContent, 'utf-8');
    const { error: uploadError } = await supabase.storage
      .from('laporan_bulanan')
      .upload(fileName, fileBuffer, {
        contentType: 'text/csv',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 5. KALO UPLOAD SUKSES, BARU KITA BUMIHANGUSKAN DATANYA DARI TABEL! 🔥
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .gte('created_at', firstDayLastMonth.toISOString())
      .lte('created_at', lastDayLastMonth.toISOString());

    if (deleteError) throw deleteError;

    return NextResponse.json({ 
      success: true, 
      message: `Mantap Ler! Laporan ${namaBulan} beres disave, dan database udah dibersihin!` 
    });

  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
