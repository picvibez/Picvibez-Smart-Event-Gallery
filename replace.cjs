const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-\\[#0A0A0A\\]': 'bg-background',
  'bg-\\[#1A1A1A\\]': 'bg-card',
  'bg-\\[#2A2A2A\\]': 'bg-muted',
  'bg-\\[#121212\\]': 'bg-background',
  'text-white': 'text-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'border-white/5': 'border-border-light',
  'border-white/10': 'border-border',
  'border-white/20': 'border-border',
  'bg-white/5': 'bg-card',
  'bg-white/10': 'bg-muted',
  'text-black': 'text-foreground'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [search, replace] of Object.entries(replacements)) {
        const regex = new RegExp(search, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory('./src');
