// Copies model files from assets/models into Android native assets folder
// Usage: node scripts/copy-model-assets.js

const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

(function main() {
  const root = process.cwd();
  const srcModelsDir = path.join(root, 'assets', 'models');
  const androidDestDir = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'models');
  const serviceDir = path.join(root, 'src', 'services');

  // Ensure assets/models exists
  ensureDir(srcModelsDir);

  // Android only (Windows dev machines often target Android first)
  if (!fs.existsSync(path.join(root, 'android'))) {
    console.error('Android project not found. Run "npx expo prebuild" first, then re-run this script.');
    process.exit(1);
  }

  ensureDir(androidDestDir);

  // If no .tflite in assets/models, try to find in src/services and copy it in
  let files = fs.readdirSync(srcModelsDir).filter((f) => /\.(tflite|txt)$/i.test(f));
  const hasTflite = files.some((f) => /\.tflite$/i.test(f));
  if (!hasTflite && fs.existsSync(serviceDir)) {
    const candidates = ['modal.tflite', 'model.tflite', 'cattle_model.tflite'];
    const found = candidates.find((name) => fs.existsSync(path.join(serviceDir, name)));
    if (found) {
      const from = path.join(serviceDir, found);
      const to = path.join(srcModelsDir, found);
      copyFile(from, to);
      files = fs.readdirSync(srcModelsDir).filter((f) => /\.(tflite|txt)$/i.test(f));
    }
  }

  if (files.length === 0) {
    console.warn(`No .tflite or labels.txt found in ${srcModelsDir}`);
  }

  files.forEach((f) => {
    const src = path.join(srcModelsDir, f);
    const dest = path.join(androidDestDir, f);
    copyFile(src, dest);
  });

  console.log('\n✅ Model files copied to Android assets.');
  console.log('If you change models later, re-run: npm run copy-models');
})();
