const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
let databaseUrl = process.env.DATABASE_URL;
let directUrl = process.env.DIRECT_URL;

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
       const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
       if (key.trim() === 'DATABASE_URL') {
         databaseUrl = val;
       }
       if (key.trim() === 'DIRECT_URL') {
         directUrl = val;
       }
    }
  }
}

function printUrl(name, url) {
    if (!url) {
        console.log(`${name} is undefined`);
        return;
    }
    try {
        const urlObj = new URL(url);
        console.log(`--- ${name} ---`);
        console.log('Protocol:', urlObj.protocol);
        console.log('Username:', urlObj.username);
        console.log('Host:', urlObj.hostname);
        console.log('Port:', urlObj.port);
        console.log('Pathname (Database):', urlObj.pathname);
        console.log('Search params:', urlObj.search);
    } catch (e) {
        console.log(`Could not parse ${name}:`, e.message);
    }
}

printUrl('DATABASE_URL', databaseUrl);
printUrl('DIRECT_URL', directUrl);
