const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const fs = require('fs');
const BACKUP_FILE = path.join(__dirname, 'data_backup.json');

let useMemoryStorage = false;
let mongoConnected = false;

// Initial sample records for instant rich visualization
const now = new Date();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();

const memoryProducts = [
    { _id: 'rec-001', description: 'เงินเดือนประจำเดือน', type: 'income', category: 'เงินเดือน', amount: 55000, date: daysAgo(10) },
    { _id: 'rec-002', description: 'ซื้อของซูเปอร์มาร์เก็ต Big C', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 3450, date: daysAgo(9) },
    { _id: 'rec-003', description: 'รับงานฟรีแลนซ์ออกแบบ UI', type: 'income', category: 'งานพิเศษ', amount: 18500, date: daysAgo(8) },
    { _id: 'rec-004', description: 'ค่าน้ำมันรถยนต์ PTT', type: 'expense', category: 'การเดินทาง', amount: 1500, date: daysAgo(7) },
    { _id: 'rec-005', description: 'ค่าคอนโดประจำเดือน', type: 'expense', category: 'บิล/สาธารณูปโภค', amount: 12000, date: daysAgo(6) },
    { _id: 'rec-006', description: 'อาหารเย็นชาบูไทชิ', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 1280, date: daysAgo(5) },
    { _id: 'rec-007', description: 'ขายของออนไลน์ Shopee', type: 'income', category: 'ขายของ', amount: 6200, date: daysAgo(4) },
    { _id: 'rec-008', description: 'สมัครสมาชิก Netflix & Spotify', type: 'expense', category: 'ความบันเทิง', amount: 589, date: daysAgo(3) },
    { _id: 'rec-009', description: 'ซื้อเสื้อผ้า Uniqlo', type: 'expense', category: 'ช้อปปิ้ง', amount: 2490, date: daysAgo(2) },
    { _id: 'rec-010', description: 'เงินปันผลหุ้นและกองทุน', type: 'income', category: 'โบนัส/การลงทุน', amount: 4500, date: daysAgo(1) },
    { _id: 'rec-011', description: 'กาแฟและขนมคาเฟ่', type: 'expense', category: 'อาหาร/เครื่องดื่ม', amount: 260, date: daysAgo(0) }
];
let nextMemoryId = 12;

function loadDiskData() {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        memoryProducts.length = 0;
        memoryProducts.push(...data);
        nextMemoryId = data.length + 100;
        console.log(`💾 ดึงข้อมูลจากไฟล์ data_backup.json สำเร็จ (${data.length} รายการ)`);
      }
    }
  } catch (e) {
    console.error('Error loading disk backup:', e.message);
  }
}

function saveDiskData() {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(memoryProducts, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving disk backup:', e.message);
  }
}

// Load disk data on boot
loadDiskData();

app.use(cors());
app.use(express.json());


// เชื่อมต่อ MongoDB (รองรับ Cloud MongoDB Atlas ผ่าน MONGODB_URI หรือ localhost)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/koop_db';
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
    .then(() => {
        console.log('เชื่อมต่อฐานข้อมูล MongoDB สำเร็จแล้ว! 🎉');
        mongoConnected = true;
        useMemoryStorage = false;
    })
    .catch(err => {
        console.warn('📌 ไม่สามารถเชื่อมต่อ MongoDB (' + err.message + ') - เปลี่ยนไปใช้ Storage ดิสก์/In-Memory อัตโนมัติ');
        mongoConnected = false;
        useMemoryStorage = true;
    });

const recordSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, default: 0 },
    category: { type: String, default: 'ทั่วไป' },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'cash' },
    receiptUrl: { type: String, default: '' },
    tags: { type: [String], default: [] }
}, { versionKey: false, timestamps: true });

const Record = mongoose.model('Record', recordSchema);

function getMemoryProduct(id) {
    return memoryProducts.find(product => String(product._id) === String(id));
}

function createMemoryProduct(data) {
    const product = {
        _id: 'rec-' + String(nextMemoryId++).padStart(3, '0'),
        description: data.description || 'ไม่มีคำอธิบาย',
        category: data.category || 'ทั่วไป',
        type: data.type || (Number(data.amount) < 0 ? 'expense' : 'income'),
        amount: Math.abs(Number(data.amount)) || 0,
        date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        paymentMethod: data.paymentMethod || 'cash',
        receiptUrl: data.receiptUrl || '',
        tags: Array.isArray(data.tags) ? data.tags : []
    };
    memoryProducts.unshift(product);
    saveDiskData();
    return product;
}

// Helper handler for GET /api/products
async function handleGetProducts(req, res) {
    try {
        if (useMemoryStorage) {
            return res.status(503).json({
                message: 'MongoDB ยังไม่พร้อมใช้งาน จึงไม่สามารถแสดงข้อมูลฐานข้อมูลจริงได้'
            });
        }
        const products = await Record.find().sort({ date: -1, createdAt: -1 });
        if (products.length > 0) {
            return res.json(products);
        }

        // Keep compatibility with older databases that used the products collection.
        const legacyProducts = await mongoose.connection.db
            .collection('products')
            .find()
            .sort({ date: -1, createdAt: -1 })
            .toArray();
        if (legacyProducts.length > 0) {
            return res.json(legacyProducts);
        }

        // An empty database must remain empty in the UI; never return demo records here.
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
    }
}

// Helper handler for POST /api/products
async function handleCreateProduct(req, res) {
    try {
        console.log('POST payload:', req.body);
        if (useMemoryStorage) {
            const newProduct = createMemoryProduct(req.body);
            return res.status(201).json({ message: 'บันทึกข้อมูลสำเร็จ!', data: newProduct });
        }
        const payload = {
            ...req.body,
            amount: Math.abs(Number(req.body.amount)) || 0,
            date: req.body.date ? new Date(req.body.date) : new Date()
        };
        const newProduct = await Record.create(payload);
        res.status(201).json({ message: 'บันทึกลงฐานข้อมูลสำเร็จ!', data: newProduct });
    } catch (error) {
        res.status(400).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: error.message });
    }
}

// Helper handler for GET /api/products/:id
async function handleGetSingleProduct(req, res) {
    try {
        if (useMemoryStorage) {
            const product = getMemoryProduct(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'ไม่พบรายการที่ระบุ' });
            }
            return res.json(product);
        }

        const product = await Record.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'ไม่พบรายการที่ระบุ' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'รหัสรายการผิดพลาด หรือข้อมูลไม่ถูกต้อง', error: error.message });
    }
}

// Helper handler for PUT /api/products/:id
async function handleUpdateProduct(req, res) {
    try {
        if (useMemoryStorage) {
            const product = getMemoryProduct(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'ไม่พบรายการที่ระบุ' });
            }
            if (req.body.description !== undefined) product.description = req.body.description;
            if (req.body.category !== undefined) product.category = req.body.category;
            if (req.body.type !== undefined) product.type = req.body.type;
            if (req.body.amount !== undefined) product.amount = Math.abs(Number(req.body.amount));
            if (req.body.date !== undefined) product.date = new Date(req.body.date).toISOString();
            if (req.body.paymentMethod !== undefined) product.paymentMethod = req.body.paymentMethod;
            if (req.body.receiptUrl !== undefined) product.receiptUrl = req.body.receiptUrl;
            if (req.body.tags !== undefined) product.tags = req.body.tags;

            saveDiskData();
            return res.json({ message: 'อัปเดตข้อมูลเรียบร้อย!', data: product });
        }

        const payload = { ...req.body };
        if (payload.amount !== undefined) payload.amount = Math.abs(Number(payload.amount));
        if (payload.date !== undefined) payload.date = new Date(payload.date);

        const updatedProduct = await Record.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ message: 'ไม่พบรายการที่ระบุ' });
        }
        res.json({ message: 'อัปเดตข้อมูลเรียบร้อย!', data: updatedProduct });
    } catch (error) {
        res.status(400).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', error: error.message });
    }
}

// Helper handler for DELETE /api/products/:id
async function handleDeleteProduct(req, res) {
    try {
        if (useMemoryStorage) {
            const index = memoryProducts.findIndex(product => String(product._id) === String(req.params.id));
            if (index === -1) {
                return res.status(404).json({ message: 'ไม่พบรายการที่ระบุ' });
            }
            const deleted = memoryProducts.splice(index, 1);
            saveDiskData();
            return res.json({ message: 'ลบรายการเรียบร้อยแล้ว', data: deleted[0] });
        }

        const deletedProduct = await Record.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'ไม่พบรายการที่ระบุ' });
        }
        res.json({ message: 'ลบรายการเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(400).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล', error: error.message });
    }
}

// Register routes explicitly
app.get('/api/products', handleGetProducts);
app.get('/api/records', handleGetProducts);

app.post('/api/products', handleCreateProduct);
app.post('/api/records', handleCreateProduct);

app.get('/api/products/:id', handleGetSingleProduct);
app.get('/api/records/:id', handleGetSingleProduct);

app.put('/api/products/:id', handleUpdateProduct);
app.put('/api/records/:id', handleUpdateProduct);

app.delete('/api/products/:id', handleDeleteProduct);
app.delete('/api/records/:id', handleDeleteProduct);


app.use(express.static(DIST_DIR, {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'settings.html'));
});

app.use((req, res) => {
    const distIndex = path.join(DIST_DIR, 'index.html');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    if (require('fs').existsSync(distIndex)) {
        return res.sendFile(distIndex);
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});



app.listen(PORT, () => {
    console.log(`🚀 เซิร์ฟเวอร์ WealthFlow กำลังทำงานที่ http://localhost:${PORT}`);
    console.log(`📊 สถานะ: ${mongoConnected ? '✅ ใช้ MongoDB จริง' : '💾 ใช้ In-Memory Storage'}`);
});