const fs = require('fs');
const path = require('path');

const srcDir = '/Users/maccrey/.gemini/antigravity/brain/bb10a33d-2840-4efa-b566-1eb8a32e39a0/';
const targetDir = '/Users/maccrey/Development/Loglingo_word/apps/web/public/images/cats/';

// Create target directory if it doesn't exist
fs.mkdirSync(targetDir, { recursive: true });

// Read files in source directory
const files = fs.readdirSync(srcDir);

console.log(`Copying cat images to ${targetDir}...`);

let count = 0;
files.forEach(file => {
  if (file.endsWith('.png')) {
    // Remove the numeric timestamp id: e.g. kitten_base_1774507907628.png -> kitten_base.png
    // Or middle_age_healthy_1774508428525.png -> middle-age_healthy.png
    // It's safer to just strip the underscore and numbers before .png
    const newName = file.replace(/_\d+\.png$/, '.png').replace(/_/g, '-');
    
    // Actually, our engine uses stage 'middleAge' and status 'healthy'.
    // Let's just keep the original prefix from artifact creation, e.g. 'kitten-base.png'
    
    fs.copyFileSync(path.join(srcDir, file), path.join(targetDir, newName));
    console.log(`Copied: ${file} -> ${newName}`);
    count++;
  }
});

console.log(`Finished copying ${count} images.`);
