const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Setup uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random()*1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

app.use(express.static('public')); // Serve index.html, styles.css, etc.
app.use('/uploads', express.static(uploadDir)); // Public image links

// Simple JSON database
const DB_FILE = './gallery.json';
function loadGallery() {
  if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE));
  return [];
}
function saveGallery(gallery) {
  fs.writeFileSync(DB_FILE, JSON.stringify(gallery, null, 2));
}

app.use(express.json());

// Gallery API
app.get('/api/gallery', (req, res) => {
  res.json(loadGallery());
});

// Image upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  const { description } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;
  const entry = { imageUrl, description };
  const gallery = loadGallery();
  gallery.push(entry);
  saveGallery(gallery);
  res.json(entry);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
