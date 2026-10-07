import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Cropper = lazy(() => import('react-easy-crop'));

const formatRupiah = price => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(Number(price) || 0);

const parsePrice = price => Number(String(price).replace(/[^0-9]/g, '')) || 0;

const exportSuccessfulOrders = orders => {
  const rows = [
    ['Kode Pesanan', 'Tanggal', 'Nama', 'WhatsApp', 'Metode', 'Alamat', 'Catatan', 'Rincian Hampers', 'Total', 'Status'],
    ...orders.map(order => [
      order.order_code || order.id,
      new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.created_at)),
      order.customer_name,
      order.customer_phone,
      order.fulfillment === 'delivery' ? 'Diantar' : 'Ambil di gereja',
      order.address || '',
      order.order_note || '',
      (order.items || []).map(item => `${item.quantity}x ${item.name} (${formatRupiah(item.total_price)})`).join(' | '),
      order.total,
      'Berhasil',
    ]),
  ];
  const csv = `\uFEFF${rows.map(row => row.map(value => {
    const text = String(value ?? '');
    const safeText = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  }).join(';')).join('\r\n')}`;
  const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pesanan-berhasil-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const createCroppedFile = async (imageUrl, area, originalFile) => {
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'));
    element.src = imageUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = area.width;
  canvas.height = area.height;
  canvas.getContext('2d').drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height,
  );

  const outputType = originalFile.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(result => {
      if (result) resolve(result);
      else reject(new Error('Hasil crop gagal dibuat.'));
    }, outputType, 0.92);
  });
  const baseName = originalFile.name.replace(/\.[^.]+$/, '');
  const extension = outputType === 'image/jpeg' ? 'jpg' : 'png';

  return new File([blob], `${baseName}-crop.${extension}`, { type: outputType });
};

const emptyProduct = {
  name: '',
  category: 'Hampers',
  basePrice: 0,
  image: '',
  description: '',
  weight: '',
  includes: [],
};

const Admin = ({ products, adminUsers, adminUsersError, orders, ordersError, logoutError, onRefreshAdminUsers, onRefreshOrders, onUpdateOrderStatus, onDeleteOrder, onCreateAdmin, onNavigate, onSaveProduct, onDeleteProduct, onUploadImage, onLogout }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingAdminUsers, setIsRefreshingAdminUsers] = useState(false);
  const [refreshAdminUsersError, setRefreshAdminUsersError] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [createAdminError, setCreateAdminError] = useState('');
  const [createAdminNotice, setCreateAdminNotice] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [ordersNotice, setOrdersNotice] = useState('');
  const [cropSource, setCropSource] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const isSavingRef = useRef(false);
  const successfulOrders = orders.filter(order => order.status === 'successful');

  const handleRefreshOrders = async () => {
    setIsRefreshingOrders(true);
    setOrdersNotice('');
    try {
      await onRefreshOrders();
    } catch (error) {
      setOrdersNotice(`Daftar pesanan gagal diperbarui: ${error.message}`);
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  const handleOrderStatusChange = async (order, status) => {
    setUpdatingOrderId(order.id);
    setOrdersNotice('');
    try {
      await onUpdateOrderStatus(order.id, status);
    } catch (error) {
      setOrdersNotice(`Status pesanan gagal diperbarui: ${error.message}`);
    } finally {
      setUpdatingOrderId('');
    }
  };

  const handleOrderDelete = async order => {
    const orderLabel = order.order_code || order.id;
    if (!window.confirm(`Hapus pesanan ${orderLabel}? Tindakan ini tidak dapat dibatalkan.`)) return;

    setUpdatingOrderId(order.id);
    setOrdersNotice('');
    try {
      await onDeleteOrder(order.id);
    } catch (error) {
      setOrdersNotice(`Pesanan gagal dihapus: ${error.message}`);
    } finally {
      setUpdatingOrderId('');
    }
  };

  useEffect(() => {
    if (!cropSource?.url) return undefined;
    return () => URL.revokeObjectURL(cropSource.url);
  }, [cropSource?.url]);

  const startNewProduct = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setNotice('');
  };

  const startEditing = product => {
    setEditingId(product.id);
    setForm({
      ...product,
      category: product.category || 'Hampers',
      includes: [...product.includes],
    });
    setNotice('');
    window.scrollTo(0, 0);
  };

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleImageUpload = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotice('File yang dipilih harus berupa gambar.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setNotice('Ukuran gambar maksimal 3 MB agar upload ke Supabase tetap ringan.');
      return;
    }

    setCropSource({ file, url: URL.createObjectURL(file) });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setNotice('Atur posisi gambar, lalu gunakan hasil crop sebelum menyimpan produk.');
  };

  const handleApplyCrop = async () => {
    if (!cropSource || !croppedArea) return;

    setIsImageUploading(true);
    setNotice('Menyiapkan gambar hasil crop...');
    try {
      const croppedFile = await createCroppedFile(cropSource.url, croppedArea, cropSource.file);
      if (croppedFile.size > 3 * 1024 * 1024) {
        throw new Error('Ukuran hasil crop melebihi 3 MB. Kurangi ukuran gambar sumber.');
      }
      setNotice('Mengunggah gambar hasil crop...');
      const imageUrl = await onUploadImage(croppedFile);
      updateField('image', imageUrl);
      setCropSource(null);
      setNotice('Gambar hasil crop siap disimpan.');
    } catch (error) {
      setNotice(`Gambar gagal diproses atau diunggah: ${error.message}`);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSave = async event => {
    event.preventDefault();
    if (isSavingRef.current) return;
    const missingFields = [];
    if (!form.name.trim()) missingFields.push('nama');
    if (!form.category.trim()) missingFields.push('kategori');
    if (!form.image?.trim()) missingFields.push('gambar lokal atau URL');
    if (parsePrice(form.basePrice) <= 0) missingFields.push('harga');

    if (isImageUploading) {
      setNotice('Tunggu sampai upload gambar selesai.');
      return;
    }

    if (cropSource) {
      setNotice('Terapkan atau batalkan crop sebelum menyimpan produk.');
      return;
    }

    if (missingFields.length > 0) {
      setNotice(`Lengkapi ${missingFields.join(', ')} produk terlebih dahulu.`);
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const isEditing = Boolean(editingId);
      await onSaveProduct({
        ...form,
        id: editingId ?? Date.now(),
        name: form.name.trim(),
        category: form.category.trim(),
        basePrice: parsePrice(form.basePrice),
        includes: form.includes.filter(item => item.trim()),
      });
      if (!isEditing) setForm(emptyProduct);
      setNotice(isEditing ? 'Produk berhasil diperbarui di Supabase.' : 'Produk baru berhasil ditambahkan ke Supabase.');
    } catch (error) {
      setNotice(`Produk gagal disimpan: ${error.message}`);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleRefreshAdminUsers = async () => {
    setIsRefreshingAdminUsers(true);
    setRefreshAdminUsersError('');
    try {
      await onRefreshAdminUsers();
    } catch (error) {
      setRefreshAdminUsersError(`Daftar akun gagal diperbarui: ${error.message}`);
    } finally {
      setIsRefreshingAdminUsers(false);
    }
  };

  const handleCreateAdmin = async event => {
    event.preventDefault();
    setIsCreatingAdmin(true);
    setCreateAdminError('');
    setCreateAdminNotice('');
    if (newAdminPassword !== confirmAdminPassword) {
      setCreateAdminError('Konfirmasi password tidak sama.');
      setIsCreatingAdmin(false);
      return;
    }
    try {
      const user = await onCreateAdmin(newAdminEmail.trim(), newAdminPassword);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setCreateAdminNotice(`Akun admin ${user.email} berhasil dibuat.`);
    } catch (error) {
      setCreateAdminError(`Akun admin gagal ditambahkan: ${error.message}`);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDelete = async product => {
    if (window.confirm(`Hapus produk ${product.name}?`)) {
      try {
        await onDeleteProduct(product.id);
        if (editingId === product.id) startNewProduct();
        setNotice('Produk berhasil dihapus.');
      } catch (error) {
        setNotice(`Produk gagal dihapus: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-base">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">Panel pengelola</p>
              <h1 className="mt-3 font-serif text-4xl text-main sm:text-5xl">Kelola katalog</h1>
              <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-muted">
                Atur tampilan produk yang muncul di Home, katalog, dan halaman detail dari satu tempat.
              </p>
              <p className="mt-4 text-xs text-muted">Perubahan disimpan ke Supabase setelah tombol simpan berhasil.</p>
            </div>
            <div className="flex items-center gap-5 self-start lg:self-auto">
              <button
                onClick={() => onNavigate('home')}
                className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Lihat website
              </button>
              <button
                onClick={onLogout}
                className="text-sm text-muted underline-offset-4 hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Keluar
              </button>
            </div>
          </div>
          {logoutError && <p className="mt-5 border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{logoutError}</p>}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
        <section className="border border-gray-200 bg-white p-5 sm:p-7 lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary">Transaksi</p>
              <h2 className="mt-2 font-serif text-2xl text-main">Pesanan pelanggan</h2>
              <p className="mt-2 text-sm font-light text-muted">
                Tandai berhasil setelah pembayaran atau transaksi diverifikasi. Hanya pesanan berhasil yang diekspor.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefreshOrders}
                disabled={isRefreshingOrders}
                className="border border-gray-300 px-4 py-2.5 text-sm font-medium text-main transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRefreshingOrders ? 'Memuat...' : 'Refresh pesanan'}
              </button>
              <button
                onClick={() => exportSuccessfulOrders(successfulOrders)}
                disabled={successfulOrders.length === 0}
                className="bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Ekspor Excel ({successfulOrders.length})
              </button>
            </div>
          </div>
          {(ordersError || ordersNotice) && (
            <p className="mt-4 text-sm text-red-800" role="alert">{ordersNotice || ordersError}</p>
          )}
          {orders.length === 0 && !ordersError ? (
            <p className="mt-6 border-t border-gray-200 py-6 text-sm font-light text-muted">Belum ada pesanan pelanggan.</p>
          ) : orders.length > 0 ? (
            <>
              <div className="mt-6 space-y-4 border-t border-gray-200 pt-5 xl:hidden">
                {orders.map(order => (
                  <article key={order.id} className="min-w-0 border border-gray-200 bg-base p-4 sm:p-5">
                    <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="break-all font-mono text-xs font-medium text-main">{order.order_code || order.id}</p>
                        <p className="mt-1 text-xs text-muted">
                          {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.created_at))}
                        </p>
                      </div>
                      <span className={`self-start px-2.5 py-1 text-xs font-medium ${order.status === 'successful' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-gray-100 text-muted' : 'bg-amber-100 text-amber-900'}`}>
                        {order.status === 'successful' ? 'Berhasil' : order.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu verifikasi'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-muted">Pelanggan</p>
                        <p className="mt-1 break-words text-sm font-medium text-main">{order.customer_name}</p>
                        <p className="mt-1 break-all text-sm text-muted">{order.customer_phone}</p>
                        <p className="mt-2 break-words text-sm text-muted">
                          {order.fulfillment === 'delivery' ? `Diantar: ${order.address}` : 'Ambil di gereja'}
                        </p>
                        {order.order_note && <p className="mt-2 break-words text-xs text-muted">Catatan: {order.order_note}</p>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-muted">Rincian hampers</p>
                        {(order.items || []).map((item, index) => (
                          <p key={`${order.id}-${index}`} className="mt-1 break-words text-sm text-main">
                            {item.quantity}x {item.name} <span className="text-muted">({formatRupiah(item.total_price)})</span>
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-serif text-xl text-main">{formatRupiah(order.total)}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {order.status !== 'successful' && (
                          <button
                            onClick={() => handleOrderStatusChange(order, 'successful')}
                            disabled={updatingOrderId === order.id}
                            className="text-xs font-medium text-green-800 underline underline-offset-2 disabled:opacity-50"
                          >
                            Tandai berhasil
                          </button>
                        )}
                        {order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleOrderStatusChange(order, 'cancelled')}
                            disabled={updatingOrderId === order.id}
                            className="text-xs text-muted underline underline-offset-2 disabled:opacity-50"
                          >
                            Batalkan
                          </button>
                        )}
                        {order.status !== 'pending' && (
                          <button
                            onClick={() => handleOrderStatusChange(order, 'pending')}
                            disabled={updatingOrderId === order.id}
                            className="text-xs text-primary underline underline-offset-2 disabled:opacity-50"
                          >
                            Kembalikan ke menunggu
                          </button>
                        )}
                        <button
                          onClick={() => handleOrderDelete(order)}
                          disabled={updatingOrderId === order.id}
                          className="text-xs font-medium text-red-800 underline underline-offset-2 disabled:opacity-50"
                        >
                          Hapus pesanan
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-6 hidden overflow-x-auto border-t border-gray-200 xl:block">
              <table className="w-full min-w-[68rem] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="py-4 pr-5 font-medium">Pesanan</th>
                    <th className="py-4 pr-5 font-medium">Pelanggan</th>
                    <th className="py-4 pr-5 font-medium">Rincian</th>
                    <th className="py-4 pr-5 font-medium">Total</th>
                    <th className="py-4 pr-5 font-medium">Status</th>
                    <th className="py-4 font-medium">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="align-top">
                      <td className="py-4 pr-5 text-muted">
                        <span className="block max-w-40 break-all font-mono text-xs text-main">{order.order_code || order.id}</span>
                        <span className="mt-1 block text-xs">
                          {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.created_at))}
                        </span>
                      </td>
                      <td className="py-4 pr-5">
                        <span className="block font-medium text-main">{order.customer_name}</span>
                        <span className="mt-1 block text-xs text-muted">{order.customer_phone}</span>
                        <span className="mt-1 block text-xs text-muted">
                          {order.fulfillment === 'delivery' ? `Diantar: ${order.address}` : 'Ambil di gereja'}
                        </span>
                        {order.order_note && <span className="mt-1 block max-w-56 text-xs text-muted">Catatan: {order.order_note}</span>}
                      </td>
                      <td className="max-w-64 py-4 pr-5 text-xs text-muted">
                        {(order.items || []).map((item, index) => (
                          <span key={`${order.id}-${index}`} className="mb-1 block">
                            {item.quantity}x {item.name} ({formatRupiah(item.total_price)})
                          </span>
                        ))}
                      </td>
                      <td className="whitespace-nowrap py-4 pr-5 font-medium text-main">{formatRupiah(order.total)}</td>
                      <td className="py-4 pr-5">
                        <span className={`inline-flex whitespace-nowrap px-2.5 py-1 text-xs font-medium ${order.status === 'successful' ? 'bg-green-100 text-green-800' : order.status === 'cancelled' ? 'bg-gray-100 text-muted' : 'bg-amber-100 text-amber-900'}`}>
                          {order.status === 'successful' ? 'Berhasil' : order.status === 'cancelled' ? 'Dibatalkan' : 'Menunggu verifikasi'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col items-start gap-2">
                          {order.status !== 'successful' && (
                            <button
                              onClick={() => handleOrderStatusChange(order, 'successful')}
                              disabled={updatingOrderId === order.id}
                              className="text-xs font-medium text-green-800 underline underline-offset-2 disabled:opacity-50"
                            >
                              Tandai berhasil
                            </button>
                          )}
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleOrderStatusChange(order, 'cancelled')}
                              disabled={updatingOrderId === order.id}
                              className="text-xs text-muted underline underline-offset-2 disabled:opacity-50"
                            >
                              Batalkan
                            </button>
                          )}
                          {order.status !== 'pending' && (
                            <button
                              onClick={() => handleOrderStatusChange(order, 'pending')}
                              disabled={updatingOrderId === order.id}
                              className="text-xs text-primary underline underline-offset-2 disabled:opacity-50"
                            >
                              Kembalikan ke menunggu
                            </button>
                          )}
                          <button
                            onClick={() => handleOrderDelete(order)}
                            disabled={updatingOrderId === order.id}
                            className="text-xs font-medium text-red-800 underline underline-offset-2 disabled:opacity-50"
                          >
                            Hapus pesanan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          ) : null}
          <p className="mt-4 text-xs font-light text-muted">
            File CSV menggunakan UTF-8 dan dapat dibuka di Microsoft Excel. Pilih &quot;Simpan Sebagai&quot; di Excel untuk menyimpannya sebagai .xlsx.
          </p>
        </section>

        <section className="border border-gray-200 bg-white p-5 sm:p-7 lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary">Akses pengelola</p>
              <h2 className="mt-2 font-serif text-2xl text-main">Akun yang terdaftar</h2>
              <p className="mt-2 text-sm font-light text-muted">Buat akun admin baru dan kelola akses akun yang sudah terdaftar.</p>
            </div>
            <button
              onClick={handleRefreshAdminUsers}
              disabled={isRefreshingAdminUsers}
              className="self-start border border-gray-300 px-4 py-2.5 text-sm font-medium text-main transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              {isRefreshingAdminUsers ? 'Memuat...' : 'Refresh akun'}
            </button>
          </div>

          <form onSubmit={handleCreateAdmin} className="mt-6 grid gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2">
            <label className="block text-sm text-main">
              Email admin baru
              <input
                type="email"
                value={newAdminEmail}
                onChange={event => setNewAdminEmail(event.target.value)}
                className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none transition-colors focus:border-primary"
                placeholder="admin@contoh.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-sm text-main">
              Password
              <input
                type="password"
                value={newAdminPassword}
                onChange={event => setNewAdminPassword(event.target.value)}
                className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none transition-colors focus:border-primary"
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <label className="block text-sm text-main">
              Konfirmasi password
              <input
                type="password"
                value={confirmAdminPassword}
                onChange={event => setConfirmAdminPassword(event.target.value)}
                className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none transition-colors focus:border-primary"
                placeholder="Ulangi password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="self-end bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingAdmin ? 'Membuat akun...' : 'Buat akun admin'}
            </button>
          </form>
          <p className="mt-3 text-sm font-light text-muted">Akun langsung dibuat dengan role admin. Berikan email dan password tersebut secara aman kepada admin baru.</p>
          {createAdminError && <p className="mt-4 text-sm text-red-800" role="alert">{createAdminError}</p>}
          {createAdminNotice && <p className="mt-4 text-sm text-green-800" role="status">{createAdminNotice}</p>}

          <div className="mt-6 overflow-x-auto border-t border-gray-200">
            {(adminUsersError || refreshAdminUsersError) && (
              <p className="py-4 text-sm text-red-800" role="alert">{refreshAdminUsersError || adminUsersError}</p>
            )}
            {adminUsers.length === 0 && !adminUsersError && !refreshAdminUsersError ? (
              <p className="py-6 text-sm font-light text-muted">Belum ada profil yang bisa ditampilkan.</p>
            ) : adminUsers.length > 0 ? (
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="py-4 pr-5 font-medium">Email</th>
                    <th className="py-4 pr-5 font-medium">Role</th>
                    <th className="py-4 font-medium">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminUsers.map(user => (
                    <tr key={user.id}>
                      <td className="py-4 pr-5 text-main">{user.email || 'Email tidak tersedia'}</td>
                      <td className="py-4 pr-5">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium ${user.role === 'admin' ? 'bg-primary text-white' : 'bg-gray-100 text-muted'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 text-muted">
                        {user.created_at ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(user.created_at)) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">{products.length} produk aktif</p>
              <h2 className="mt-2 font-serif text-2xl text-main">Daftar produk</h2>
            </div>
            <button
              onClick={startNewProduct}
              className="bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Tambah produk
            </button>
          </div>

          <div className="space-y-3">
            {products.length === 0 && (
              <div className="border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <p className="font-serif text-xl text-main">Belum ada produk</p>
                <p className="mt-2 text-sm font-light text-muted">Mulai dengan menambahkan produk pertama.</p>
              </div>
            )}
            {products.map(product => (
              <article key={product.id} className={`flex gap-4 border bg-white p-4 transition-colors ${editingId === product.id ? 'border-primary shadow-sm' : 'border-gray-200'}`}>
                <img src={product.image} alt={product.name} className="h-24 w-20 flex-shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="mt-1 font-serif text-xl text-main">{product.name}</h3>
                  <p className="mt-1 text-xs text-muted">{product.category || 'Hampers'}</p>
                  <p className="mt-1 text-sm text-muted">{formatRupiah(product.basePrice)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button onClick={() => startEditing(product)} className="border border-primary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">Edit</button>
                  <button onClick={() => handleDelete(product)} className="text-xs text-muted underline-offset-2 hover:text-primary hover:underline focus:outline-none focus-visible:underline">Hapus</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-gray-200 bg-white p-5 sm:p-7 lg:sticky lg:top-24 lg:self-start">
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
            <p className="text-xs uppercase tracking-widest text-primary">{editingId ? 'Edit produk' : 'Produk baru'}</p>
            <h2 className="mt-2 font-serif text-2xl text-main">Informasi produk</h2>
            </div>
            {editingId && (
              <button onClick={startNewProduct} className="text-xs text-muted underline-offset-2 hover:text-primary hover:underline focus:outline-none focus-visible:underline">
                Batal edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <label className="block text-sm text-main">
              Nama produk
              <input value={form.name} onChange={event => updateField('name', event.target.value)} className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none focus:border-primary" placeholder="Christmas Warmth" />
            </label>
            <label className="block text-sm text-main">
              Kategori
              <input list="product-categories" value={form.category} onChange={event => updateField('category', event.target.value)} className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none focus:border-primary" placeholder="Kue" />
              <datalist id="product-categories">
                {[...new Set(['Hampers', 'Kue', ...products.map(product => product.category).filter(Boolean)])].map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>
            <div className="grid grid-cols-1">
              <label className="block text-sm text-main">
                Harga dasar
                <div className="mt-2 flex border border-gray-200 bg-white focus-within:border-primary">
                  <span className="flex items-center border-r border-gray-200 px-3 text-sm text-muted">Rp</span>
                  <input type="text" inputMode="numeric" value={form.basePrice} onChange={event => updateField('basePrice', event.target.value)} className="min-w-0 w-full px-3 py-3 font-light outline-none" placeholder="150000 atau 150.000" />
                </div>
              </label>
            </div>
            <div className="space-y-3">
              <label className="block text-sm text-main">
                Gambar produk dari komputer
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="mt-2 block w-full border border-gray-200 bg-white px-3 py-3 text-sm text-muted file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-dark"
                />
              </label>
              <p className="text-xs font-light leading-relaxed text-muted">
                JPG, PNG, WEBP, atau GIF maksimal 3 MB. Atur crop sebelum gambar diunggah.
              </p>
              {cropSource && (
                <div className="space-y-4 border-y border-gray-200 py-5">
                  <div>
                    <h3 className="font-serif text-lg text-main">Atur gambar</h3>
                    <p className="mt-1 text-xs font-light text-muted">Geser gambar untuk mengatur bagian yang terlihat.</p>
                  </div>
                  <div className="relative mx-auto aspect-[4/5] w-full max-w-[18rem] overflow-hidden bg-main">
                    <Suspense fallback={<p className="p-4 text-sm text-white">Memuat editor gambar...</p>}>
                      <Cropper
                        image={cropSource.url}
                        crop={crop}
                        zoom={zoom}
                        aspect={4 / 5}
                        keyboardStep={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(_, area) => setCroppedArea(area)}
                      />
                    </Suspense>
                  </div>
                  <label className="block text-sm text-main">
                    Perbesar gambar
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.01"
                      value={zoom}
                      onChange={event => setZoom(Number(event.target.value))}
                      className="mt-3 block w-full accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      aria-label="Perbesar atau perkecil gambar"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCropSource(null)}
                      disabled={isImageUploading}
                      className="min-h-11 border border-gray-300 px-3 py-2.5 text-sm font-medium text-main transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyCrop}
                      disabled={!croppedArea || isImageUploading}
                      className="min-h-11 bg-primary px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {isImageUploading ? 'Mengunggah...' : 'Gunakan crop'}
                    </button>
                  </div>
                </div>
              )}
              <label className="block text-sm text-main">
                Atau gunakan URL gambar
                <input value={form.image.startsWith('data:') ? '' : form.image} onChange={event => updateField('image', event.target.value)} className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none focus:border-primary" placeholder="https://..." />
              </label>
            </div>
            {form.image && !cropSource && <img src={form.image} alt="Preview produk" className="aspect-[4/5] w-full object-cover" />}
            <label className="block text-sm text-main">
              Deskripsi
              <textarea rows={3} value={form.description} onChange={event => updateField('description', event.target.value)} className="mt-2 w-full resize-none border border-gray-200 px-4 py-3 font-light outline-none focus:border-primary" />
            </label>
            <div className="grid grid-cols-1">
              <label className="block text-sm text-main">
                Berat
                <input value={form.weight} onChange={event => updateField('weight', event.target.value)} className="mt-2 w-full border border-gray-200 px-4 py-3 font-light outline-none focus:border-primary" placeholder="± 1.0 kg" />
              </label>
            </div>
            <label className="block text-sm text-main">
              Isi produk <span className="font-light text-muted">(satu item per baris)</span>
              <textarea rows={4} value={form.includes.join('\n')} onChange={event => updateField('includes', event.target.value.split('\n'))} className="mt-2 w-full resize-none border border-gray-200 px-4 py-3 font-light outline-none focus:border-primary" />
            </label>

            {notice && <p className="border-l-2 border-primary bg-base px-3 py-3 text-sm text-muted">{notice}</p>}
            <button type="submit" disabled={isSaving || isImageUploading || Boolean(cropSource)} className="w-full bg-primary py-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-gray-300">
              {isSaving ? 'Menyimpan...' : isImageUploading ? 'Menunggu upload gambar...' : cropSource ? 'Selesaikan crop gambar dulu' : 'Simpan produk'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Admin;
