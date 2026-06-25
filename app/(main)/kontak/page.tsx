export default function KontakPage() {
  return (
    <section className="container mx-auto max-w-lg px-4 py-12 md:py-16">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Kontak</h1>
      <div className="space-y-6 text-base [&>h2]:text-[#43decc] [&>h2]:mb-3 [&>h2]:text-xl [&>h2]:font-semibold [&>p]:text-[#dfe4e0]">
        <p>
          Ada pertanyaan, saran, atau mau ajak kerja sama? Silakan hubungi kami
          melalui channel berikut:
        </p>

        <h2>Email</h2>
        <a href="mailto:admin@olahbola.com" className="block text-[#43decc] hover:underline">
          admin@olahbola.com
        </a>

        <h2>WhatsApp</h2>
        <a href="https://wa.me/6287777487925" target="_blank" rel="noopener noreferrer" className="block text-[#43decc] hover:underline">
          +62 877 7748 7925
        </a>

        <h2>Alamat</h2>
        <p>Gedung STC LT.4 Ruang 80, Jakarta, Indonesia</p>
      </div>
    </section>
  );
}
