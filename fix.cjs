const fs = require('fs');

let content = fs.readFileSync('src/app/pages/owner/setup.jsx', 'utf-8');

// replace text-xs with text-sm for labels
content = content.replace(/<Label([^>]*)className="([^"]*)\btext-xs\b([^"]*)"/g, '<Label$1className="$2text-sm$3"');
content = content.replace(/<Label className="text-xs font-semibold">/g, '<Label className="text-sm font-semibold">');

// replace text-sm with text-xs for inputs
content = content.replace(/<Input([^>]*)className="([^"]*)\btext-sm\b([^"]*)"/g, '<Input$1className="$2text-[11px]$3"');

// also textareas
content = content.replace(/<Textarea([^>]*)className="([^"]*)\btext-sm\b([^"]*)"/g, '<Textarea$1className="$2text-[11px]$3"');

// SelectTrigger
content = content.replace(/<SelectTrigger([^>]*)className="([^"]*)\btext-sm\b([^"]*)"/g, '<SelectTrigger$1className="$2text-[11px]$3"');

fs.writeFileSync('src/app/pages/owner/setup.jsx', content, 'utf-8');
console.log('done');
