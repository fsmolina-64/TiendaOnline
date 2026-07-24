const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.error('ERROR: API_URL environment variable is required');
  process.exit(1);
}

const envContent = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}',
};
`;

const outputPath = path.join(__dirname, '../src/environments/environment.prod.ts');
fs.writeFileSync(outputPath, envContent);
console.log(`Generated ${outputPath} with API_URL=${apiUrl}`);