import fs from 'fs';
import crypto from 'crypto';

const path = 'apps/api/.env';
if (!fs.existsSync(path)) {
  console.log('No .env file — copy from .env.example first');
  process.exit(0);
}

let content = fs.readFileSync(path, 'utf8');
const access = crypto.randomBytes(32).toString('hex');
const refresh = crypto.randomBytes(32).toString('hex');

content = content.replace(/JWT_SECRET=.*/, `JWT_SECRET="${access}"`);
content = content.replace(/JWT_REFRESH_SECRET=.*/, `JWT_REFRESH_SECRET="${refresh}"`);
if (/JWT_ACCESS_SECRET=/.test(content)) {
  content = content.replace(/JWT_ACCESS_SECRET=.*/, `JWT_ACCESS_SECRET="${access}"`);
} else {
  content += `\nJWT_ACCESS_SECRET="${access}"\n`;
}

fs.writeFileSync(path, content);
console.log('JWT secrets rotated in apps/api/.env — sign in again.');
