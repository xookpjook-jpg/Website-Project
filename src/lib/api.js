const STORAGE_KEY = 'wealthflow_records_db';

const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();

const DEFAULT_SAMPLE_RECORDS = [
  { id: 'rec-001', _id: 'rec-001', description: 'เงินเดือนประจำเดือน', type: 'income', category: 'เงินเดือน', amount: 55000, date: daysAgo(10), paymentMethod: 'bank', tags: ['ประจำ'] },
  { id: 'rec-002', _id: 'rec-002', description: 'ซื้อของซูเปอร์มาร์เก็ต Big C', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 3450, date: daysAgo(9), paymentMethod: 'credit', tags: ['ของใช้'] },
  { id: 'rec-003', _id: 'rec-003', description: 'รับงานฟรีแลนซ์ออกแบบ UI', type: 'income', category: 'งานพิเศษ', amount: 18500, date: daysAgo(8), paymentMethod: 'bank', tags: ['freelance'] },
  { id: 'rec-004', _id: 'rec-004', description: 'ค่าน้ำมันรถยนต์ PTT', type: 'expense', category: 'การเดินทาง', amount: 1500, date: daysAgo(7), paymentMethod: 'credit', tags: [] },
  { id: 'rec-005', _id: 'rec-005', description: 'ค่าคอนโดประจำเดือน', type: 'expense', category: 'บิล/สาธารณูปโภค', amount: 12000, date: daysAgo(6), paymentMethod: 'bank', tags: ['บิล'] },
  { id: 'rec-006', _id: 'rec-006', description: 'อาหารเย็นชาบูไทชิ', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 1280, date: daysAgo(5), paymentMethod: 'qr', tags: ['ปาร์ตี้'] },
  { id: 'rec-007', _id: 'rec-007', description: 'ขายของออนไลน์ Shopee', type: 'income', category: 'ขายของ', amount: 6200, date: daysAgo(4), paymentMethod: 'bank', tags: [] },
  { id: 'rec-008', _id: 'rec-008', description: 'สมัครสมาชิก Netflix & Spotify', type: 'expense', category: 'ความบันเทิง', amount: 589, date: daysAgo(3), paymentMethod: 'credit', tags: [] },
  { id: 'rec-009', _id: 'rec-009', description: 'ซื้อเสื้อผ้า Uniqlo', type: 'expense', category: 'ช้อปปิ้ง', amount: 2490, date: daysAgo(2), paymentMethod: 'credit', tags: [] },
  { id: 'rec-010', _id: 'rec-010', description: 'เงินปันผลหุ้นและกองทุน', type: 'income', category: 'โบนัส/การลงทุน', amount: 4500, date: daysAgo(1), paymentMethod: 'bank', tags: ['ลงทุน'] },
  { id: 'rec-011', _id: 'rec-011', description: 'กาแฟและขนมคาเฟ่', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 260, date: daysAgo(0), paymentMethod: 'cash', tags: [] }
];

function getLocalRecords() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Local storage read error:', e);
    return [];
  }
}

function saveLocalRecords(records) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Local storage save error:', e);
  }
}

const getApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (typeof window === 'undefined') {
    return normalizedPath;
  }

  const hostname = window.location.hostname;
  const port = window.location.port;

  // Local development on Vite dev server (e.g. localhost:5173 -> proxy or direct to 3000)
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && (port === '5173' || port === '4173')) {
    return `http://localhost:3000${normalizedPath}`;
  }

  // In production (Render, Vercel, Live domain), use relative path to talk to same host
  return normalizedPath;
};

function normalizeRecord(r) {
  let dateObj = r.date ? new Date(r.date) : (r.createdAt ? new Date(r.createdAt) : null);
  if (!dateObj || isNaN(dateObj.getTime())) {
    try {
      const id = r._id || r.id || '';
      if (typeof id === 'string' && id.length === 24) {
        const ts = parseInt(id.substring(0, 8), 16) * 1000;
        dateObj = new Date(ts);
      }
    } catch (e) { /* ignore */ }
  }
  if (!dateObj || isNaN(dateObj.getTime())) dateObj = new Date();

  let amount = Math.abs(Number(r.amount ?? 0));
  if (Number.isNaN(amount)) amount = 0;

  let type = r.type;
  if (!type) {
    if (Number(r.amount) < 0) {
      type = 'expense';
    } else {
      const desc = (r.description || '').toString().toLowerCase();
      const cat = (r.category || '').toString().toLowerCase();
      const expenseKeywords = ['expense', 'จ่าย', 'ถอน', 'ค่า', 'pay', 'spent', 'withdraw', 'ซื้อ'];
      const incomeKeywords = ['income', 'รายรับ', 'เงินเดือน', 'salary', 'receive', 'โบนัส', 'รับ'];
      if (expenseKeywords.some(k => desc.includes(k) || cat.includes(k))) type = 'expense';
      else if (incomeKeywords.some(k => desc.includes(k) || cat.includes(k))) type = 'income';
      else type = 'expense';
    }
  }

  const iso = dateObj.toISOString();
  const dateKey = iso.slice(0, 10);
  const id = r._id || r.id || 'rec-' + Math.random().toString(36).substr(2, 9);

  return {
    _id: id,
    id: id,
    description: r.description || 'ไม่มีคำอธิบาย',
    category: r.category || 'ทั่วไป',
    type: type === 'income' ? 'income' : 'expense',
    amount,
    date: iso,
    dateKey,
    paymentMethod: r.paymentMethod || 'cash',
    receiptUrl: r.receiptUrl || '',
    tags: Array.isArray(r.tags) ? r.tags : [],
    raw: r
  };
}

export async function fetchRecords() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(getApiUrl('/api/products'), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeRecord).sort((a, b) => new Date(b.date) - new Date(a.date));
        saveLocalRecords(normalized);
        return normalized;
      }
    }
  } catch (err) {
    console.warn('API fetch unavailable, using local client storage:', err.message);
  }

  // Use local storage only when the database server cannot be reached.
  const local = getLocalRecords();
  return local.map(normalizeRecord).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function createRecord(data) {
  const id = 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const newRecord = normalizeRecord({
    ...data,
    id,
    _id: id,
    date: data.date || new Date().toISOString()
  });

  // Try API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(getApiUrl('/api/products'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      const serverRecord = normalizeRecord(result.data || result);
      // Sync into local
      const current = getLocalRecords();
      saveLocalRecords([serverRecord, ...current.filter(x => x.id !== serverRecord.id)]);
      return serverRecord;
    }
  } catch (err) {
    console.warn('API create unavailable, saving directly to local storage:', err.message);
  }

  // Fallback to local storage
  const current = getLocalRecords();
  const updated = [newRecord, ...current];
  saveLocalRecords(updated);
  return newRecord;
}

export async function updateRecord(id, data) {
  const current = getLocalRecords();
  const existing = current.find(r => String(r.id) === String(id) || String(r._id) === String(id));
  const updatedRecord = normalizeRecord({
    ...(existing || {}),
    ...data,
    id: id,
    _id: id
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(getApiUrl(`/api/products/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const result = await res.json();
      const serverRecord = normalizeRecord(result.data || result);
      saveLocalRecords(current.map(r => (String(r.id) === String(id) || String(r._id) === String(id)) ? serverRecord : r));
      return serverRecord;
    }
  } catch (err) {
    console.warn('API update unavailable, updating local storage:', err.message);
  }

  // Fallback to local storage
  const updatedList = current.map(r => (String(r.id) === String(id) || String(r._id) === String(id)) ? updatedRecord : r);
  saveLocalRecords(updatedList);
  return updatedRecord;
}

export async function deleteRecord(id) {
  const current = getLocalRecords();
  const filtered = current.filter(r => String(r.id) !== String(id) && String(r._id) !== String(id));
  saveLocalRecords(filtered);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    await fetch(getApiUrl(`/api/products/${id}`), {
      method: 'DELETE',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (err) {
    console.warn('API delete unavailable, deleted from local storage:', err.message);
  }

  return { message: 'ลบรายการเรียบร้อยแล้ว' };
}
