import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getPackageRoot() {
  return path.join(__dirname, '..');
}

export function getTemplatesDir() {
  return path.join(getPackageRoot(), 'templates');
}
