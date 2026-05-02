import "@/app/globals.css";


export const metadata = {
  title: "Koperasi Smaneka",
  description: "Solusi Belanja Digital Siswa Smaneka",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased text-gray-900">
        {children}
      </body>
    </html>
  );
}
