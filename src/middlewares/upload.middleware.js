import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const productsDir = path.join(__dirname, '..', '..', 'asset', 'products');
fs.mkdirSync(productsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${unique}${safeExt}`);
  },
});

function imageOnlyFileFilter(req, file, cb) {
  if (!file?.mimetype?.startsWith('image/')) {
    const err = new Error('Only image files are allowed');
    err.statusCode = 400;
    return cb(err);
  }
  cb(null, true);
}

export const uploadProductImage = multer({
  storage,
  fileFilter: imageOnlyFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

