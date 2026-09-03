import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Case-insensitive asset serving helper
app.use('/assets', (req, res, next) => {
  const reqPath = decodeURIComponent(req.path);
  const directPath = path.join(__dirname, 'assets', reqPath);
  
  if (fs.existsSync(directPath)) {
    return res.sendFile(directPath);
  }

  // Look for case-insensitive match
  const parts = reqPath.split('/').filter(Boolean);
  let currentDir = path.join(__dirname, 'assets');
  let matched = true;

  for (const part of parts) {
    if (!fs.existsSync(currentDir) || !fs.statSync(currentDir).isDirectory()) {
      matched = false;
      break;
    }
    const files = fs.readdirSync(currentDir);
    const found = files.find(f => f.toLowerCase() === part.toLowerCase());
    if (found) {
      currentDir = path.join(currentDir, found);
    } else {
      matched = false;
      break;
    }
  }

  if (matched && fs.existsSync(currentDir) && fs.statSync(currentDir).isFile()) {
    return res.sendFile(currentDir);
  }

  next();
});

// Serve root static directory
app.use(express.static(__dirname));

// Friendly routing for clean URLs
app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
