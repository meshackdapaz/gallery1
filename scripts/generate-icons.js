const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, '../resources');
const assetsDir = path.join(__dirname, '../assets');

[resourcesDir, assetsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function generate() {
  const iconSvg = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="#000000" />
      <text x="50%" y="60%" font-family="Georgia, serif" font-size="600" font-weight="normal" font-style="italic" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">V</text>
    </svg>
  `;

  const splashSvg = `
    <svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
      <rect width="2732" height="2732" fill="#000000" />
      <!-- We leave the splash mostly blank since we use the animated splash component, just an empty black image -->
    </svg>
  `;

  console.log('Generating icon.png...');
  const iconBuffer = await sharp(Buffer.from(iconSvg)).png().toBuffer();
  await fs.promises.writeFile(path.join(resourcesDir, 'icon.png'), iconBuffer);
  await fs.promises.writeFile(path.join(assetsDir, 'icon.png'), iconBuffer);

  console.log('Generating splash.png...');
  const splashBuffer = await sharp(Buffer.from(splashSvg)).png().toBuffer();
  await fs.promises.writeFile(path.join(resourcesDir, 'splash.png'), splashBuffer);
  await fs.promises.writeFile(path.join(assetsDir, 'splash.png'), splashBuffer);

  console.log('Icons generated successfully.');
}

generate().catch(console.error);
