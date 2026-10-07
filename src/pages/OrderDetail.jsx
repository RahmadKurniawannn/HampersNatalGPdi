import { useState } from 'react';

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);

const adminWhatsApp = '628985665487';

const OrderDetail = ({ items, total, onNavigate, onCreateOrder }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillment, setFulfillment] = useState('delivery');
  const [address, setAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderNotice, setOrderNotice] = useState('');
  const [whatsAppUrl, setWhatsAppUrl] = useState('');
  const phoneDigits = customerPhone.replace(/\D/g, '');
  const isPhoneValid = /^[+0-9\s().-]+$/.test(customerPhone)
    && phoneDigits.length >= 8
    && phoneDigits.length <= 15;

  const handleOrderViaWhatsApp = async () => {
    setIsSubmitting(true);
    setOrderError('');
    setOrderNotice('');
    setWhatsAppUrl('');
    const whatsappWindow = window.open('about:blank', '_blank');
    if (whatsappWindow) whatsappWindow.opener = null;

    const orderId = window.crypto.randomUUID();
    const orderCodeSuffix = Array.from(window.crypto.getRandomValues(new Uint8Array(6)))
      .map(value => value.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const orderCode = `HMP-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${orderCodeSuffix}`;
    const itemLines = items.map((item, index) => {
      const lines = [
        `${index + 1}. ${item.product.name}`,
        `Jumlah: ${item.quantity}`,
        `Harga: ${formatPrice(item.totalPrice)}`,
      ];
      if (item.greetingFrom) lines.push(`Dari: ${item.greetingFrom}`);
      if (item.greetingTo) lines.push(`Untuk: ${item.greetingTo}`);
      return lines.join('\n');
    }).join('\n\n');

    const recipientLines = [
      `Nama: ${customerName}`,
      `WhatsApp: ${customerPhone}`,
      `Metode: ${fulfillment === 'delivery' ? 'Diantar ke rumah' : 'Ambil di gereja'}`,
      fulfillment === 'delivery' ? `Alamat: ${address}` : 'Lokasi: Gereja GPdI',
    ];
    if (orderNote) recipientLines.push(`Catatan: ${orderNote}`);

    const message = [
      '*ORDER HAMPERS GPdI*',
      `Kode pesanan: ${orderCode}`,
      '',
      'Halo Admin GPdI, saya ingin melakukan pemesanan dengan detail berikut:',
      '',
      '*DETAIL PESANAN*',
      itemLines,
      '',
      '*DATA PENERIMA*',
      recipientLines.join('\n'),
      '',
      `*TOTAL: ${formatPrice(total)}*`,
      '',
      'Mohon dibantu untuk proses transaksi dan konfirmasi pengiriman. Terima kasih.',
    ].join('\n');

    const url = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;
    try {
      await onCreateOrder({
        id: orderId,
        order_code: orderCode,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        fulfillment,
        address: fulfillment === 'delivery' ? address.trim() : '',
        order_note: orderNote.trim() || null,
        items: items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          total_price: item.totalPrice,
          greeting_from: item.greetingFrom || '',
          greeting_to: item.greetingTo || '',
        })),
        total,
      });
      if (whatsappWindow) {
        whatsappWindow.location.href = url;
      } else {
        setWhatsAppUrl(url);
        setOrderNotice('Pesanan tersimpan. Browser memblokir tab WhatsApp; gunakan tautan di bawah untuk melanjutkan.');
      }
    } catch (error) {
      if (whatsappWindow) whatsappWindow.close();
      setOrderError(`Pesanan tidak dapat disimpan, jadi WhatsApp belum dibuka: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-5 text-center">
        <div>
          <h1 className="font-serif text-3xl text-main">Belum ada pesanan</h1>
          <p className="mt-3 text-sm font-light text-muted">Tambahkan hampers ke keranjang sebelum melakukan order.</p>
          <button
            onClick={() => onNavigate('catalog')}
            className="mt-7 bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Lihat koleksi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-16">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted sm:mb-10" aria-label="Navigasi halaman">
          <button
            onClick={() => onNavigate('home')}
            className="transition-colors hover:text-primary focus:outline-none focus-visible:underline"
          >
            Beranda
          </button>
          <span aria-hidden>/</span>
          <span className="text-main">Detail Order</span>
        </nav>

        <div className="mb-10 border-b border-gray-200 pb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Ringkasan pesanan</p>
          <h1 className="mt-3 font-serif text-4xl text-main sm:text-5xl">Detail Order</h1>
          <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-muted">
            Periksa kembali hampers yang kamu pilih sebelum mengirimkan detail pesanan.
          </p>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <article key={`${item.product.id}-${index}`} className="flex gap-5 border-b border-gray-200 pb-6 sm:gap-7">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-32 w-24 flex-shrink-0 object-cover sm:h-40 sm:w-32"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <h2 className="font-serif text-xl text-main sm:text-2xl">{item.product.name}</h2>
                  <p className="mt-2 text-sm font-light text-muted">Jumlah: {item.quantity}</p>
                  {(item.greetingFrom || item.greetingTo) && (
                    <div className="mt-3 space-y-1 text-sm leading-relaxed text-muted">
                      {item.greetingFrom && <p>Dari: {item.greetingFrom}</p>}
                      {item.greetingTo && <p>Untuk: {item.greetingTo}</p>}
                    </div>
                  )}
                </div>
                <p className="mt-4 text-base font-medium text-main">{formatPrice(item.totalPrice)}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-12 border-t border-gray-200 pt-10">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Informasi penerima</p>
          <h2 className="mt-3 font-serif text-2xl text-main sm:text-3xl">Bagaimana pesanan diterima?</h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-muted">
            Lengkapi detail berikut agar admin dapat langsung menyiapkan pengiriman atau pengambilan.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="text-sm text-main">
              Nama pemesan
              <input
                type="text"
                value={customerName}
                onChange={event => setCustomerName(event.target.value)}
                placeholder="Nama lengkap"
                className="mt-2 w-full border border-gray-200 bg-white px-4 py-3 font-light text-main outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
                required
              />
            </label>
            <label className="text-sm text-main">
              Nomor WhatsApp
              <input
                type="tel"
                value={customerPhone}
                onChange={event => setCustomerPhone(event.target.value)}
                placeholder="08xxxxxxxxxx"
                className="mt-2 w-full border border-gray-200 bg-white px-4 py-3 font-light text-main outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
                required
                aria-invalid={customerPhone.length > 0 && !isPhoneValid}
                aria-describedby="customer-phone-hint"
              />
              <span id="customer-phone-hint" className={`mt-2 block text-xs ${customerPhone.length > 0 && !isPhoneValid ? 'text-red-800' : 'text-muted'}`}>
                {customerPhone.length > 0 && !isPhoneValid
                  ? 'Masukkan nomor yang valid, 8–15 digit. Boleh memakai +, spasi, tanda kurung, titik, atau tanda hubung.'
                  : 'Masukkan nomor dengan 8–15 digit, misalnya 081234567890.'}
              </span>
            </label>
          </div>

          <fieldset className="mt-8">
            <legend className="text-sm text-main">Pilih cara menerima pesanan</legend>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${fulfillment === 'delivery' ? 'border-primary bg-white' : 'border-gray-200 hover:border-gray-400'}`}>
                <input
                  type="radio"
                  name="fulfillment"
                  value="delivery"
                  checked={fulfillment === 'delivery'}
                  onChange={event => setFulfillment(event.target.value)}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-main">Diantar ke rumah</span>
                  <span className="mt-1 block text-xs font-light leading-relaxed text-muted">Admin akan mengonfirmasi ongkos dan waktu kirim.</span>
                </span>
              </label>
              <label className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${fulfillment === 'pickup' ? 'border-primary bg-white' : 'border-gray-200 hover:border-gray-400'}`}>
                <input
                  type="radio"
                  name="fulfillment"
                  value="pickup"
                  checked={fulfillment === 'pickup'}
                  onChange={event => setFulfillment(event.target.value)}
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-main">Ambil di gereja</span>
                  <span className="mt-1 block text-xs font-light leading-relaxed text-muted">Admin akan mengirimkan jadwal pengambilan.</span>
                </span>
              </label>
            </div>
          </fieldset>

          {fulfillment === 'delivery' && (
            <label className="mt-6 block text-sm text-main">
              Alamat lengkap
              <textarea
                rows={3}
                value={address}
                onChange={event => setAddress(event.target.value)}
                placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, dan patokan"
                className="mt-2 w-full resize-none border border-gray-200 bg-white px-4 py-3 font-light text-main outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
                required
              />
            </label>
          )}

          <label className="mt-6 block text-sm text-main">
            Catatan tambahan <span className="font-light text-muted">(opsional)</span>
            <textarea
              rows={2}
              value={orderNote}
              onChange={event => setOrderNote(event.target.value)}
              placeholder="Contoh: kirim setelah jam aja atau hubungi sebelum sampai"
              className="mt-2 w-full resize-none border border-gray-200 bg-white px-4 py-3 font-light text-main outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
            />
          </label>
        </section>

        <div className="mt-8 flex items-center justify-between border-t border-main pt-5">
          <span className="text-sm text-muted">Total pesanan</span>
          <span className="font-serif text-2xl text-main sm:text-3xl">{formatPrice(total)}</span>
        </div>

        <p className="mt-6 text-sm font-light leading-relaxed text-muted">
          Detail pengiriman dan konfirmasi pembayaran akan dibantu oleh tim GPdI setelah pesanan diterima.
        </p>

        {orderError && <p className="mt-5 text-sm text-red-800" role="alert">{orderError}</p>}
        {orderNotice && (
          <p className="mt-5 text-sm text-green-800" role="status">
            {orderNotice}{' '}
            {whatsAppUrl && (
              <a href={whatsAppUrl} target="_blank" rel="noreferrer" className="font-medium underline">
                Buka WhatsApp
              </a>
            )}
          </p>
        )}

        <button
          onClick={handleOrderViaWhatsApp}
          disabled={isSubmitting || !customerName.trim() || !isPhoneValid || (fulfillment === 'delivery' && !address.trim())}
          className="mt-8 w-full bg-primary py-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:px-10"
        >
          {isSubmitting ? 'Menyimpan pesanan...' : 'Order via WhatsApp'}
        </button>
      </div>
    </div>
  );
};

export default OrderDetail;