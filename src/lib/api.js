const getApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  if (typeof window === 'undefined') {
    return normalizedPath
  }

  const port = window.location.port
  const isViteServer = port === '5173' || port === '4173' || port === '3000'

  return isViteServer ? normalizedPath : `http://localhost:3000${normalizedPath}`
}

export async function fetchRecords() {
  const res = await fetch(getApiUrl('/api/products'))
  if (!res.ok) throw new Error('Failed to fetch records')
  const data = await res.json()

  return data.map((r) => {
    let dateObj = r.date ? new Date(r.date) : (r.createdAt ? new Date(r.createdAt) : null)
    if (!dateObj || isNaN(dateObj.getTime())) {
      try {
        const id = r._id || r.id || ''
        if (typeof id === 'string' && id.length === 24) {
          const ts = parseInt(id.substring(0, 8), 16) * 1000
          dateObj = new Date(ts)
        }
      } catch (e) { /* ignore */ }
    }
    if (!dateObj || isNaN(dateObj.getTime())) dateObj = new Date()

    let amount = Math.abs(Number(r.amount ?? 0))
    if (Number.isNaN(amount)) amount = 0

    let type = r.type
    if (!type) {
      if (Number(r.amount) < 0) {
        type = 'expense'
      } else {
        const desc = (r.description || '').toString().toLowerCase()
        const cat = (r.category || '').toString().toLowerCase()
        const expenseKeywords = ['expense', 'จ่าย', 'ถอน', 'ค่า', 'pay', 'spent', 'withdraw', 'ซื้อ']
        const incomeKeywords = ['income', 'รายรับ', 'เงินเดือน', 'salary', 'receive', 'โบนัส', 'รับ']
        if (expenseKeywords.some(k => desc.includes(k) || cat.includes(k))) type = 'expense'
        else if (incomeKeywords.some(k => desc.includes(k) || cat.includes(k))) type = 'income'
        else type = 'expense'
      }
    }

    const iso = dateObj.toISOString()
    const dateKey = iso.slice(0, 10)

    return {
      _id: r._id || r.id,
      id: r._id || r.id,
      description: r.description || '',
      category: r.category || 'ทั่วไป',
      type: type === 'income' ? 'income' : 'expense',
      amount,
      date: iso,
      dateKey,
      paymentMethod: r.paymentMethod || 'cash',
      receiptUrl: r.receiptUrl || '',
      tags: Array.isArray(r.tags) ? r.tags : [],
      raw: r
    }
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function createRecord(data) {
  const res = await fetch(getApiUrl('/api/products'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'บันทึกรายการไม่สำเร็จ')
  }
  return await res.json()
}

export async function updateRecord(id, data) {
  const res = await fetch(getApiUrl(`/api/products/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'อัปเดตรายการไม่สำเร็จ')
  }
  return await res.json()
}

export async function deleteRecord(id) {
  const res = await fetch(getApiUrl(`/api/products/${id}`), {
    method: 'DELETE'
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'ลบรายการไม่สำเร็จ')
  }
  return await res.json()
}

