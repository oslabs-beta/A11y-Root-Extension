const fs = require('fs');
const path = require('path');

const chromiumPath = path.join(
  __dirname,
  'node_modules',
  'puppeteer',
  '.local-chromium',
  'chrome',
  'mac-131.0.6778.204',
  'chrome-mac-x64',
  'Google Chrome for Testing.app',
  'Contents',
  'MacOS',
  'Google Chrome for Testing'
);

// Set the file as executable
try {
  fs.chmodSync(chromiumPath, 0o755); // rwxr-xr-x
  console.log(`Set executable permissions for: ${chromiumPath}`);
} catch (error) {
  console.error(
    `Failed to set permissions for ${chromiumPath}:`,
    error.message
  );
}
