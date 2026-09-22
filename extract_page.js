const fs = require('fs');

const transcriptPath = 'C:\\Users\\sulis\\.gemini\\antigravity-ide\\brain\\ede443ca-a2d9-49e7-90ee-6e18711f7c82\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let count = 0;
for (let l of lines) {
    if (l.includes('VIEW_FILE') && l.includes('1: ') && l.includes('page.tsx')) {
        try {
            const p = JSON.parse(l);
            if (p.content && p.content.includes('file:///c:/Users/sulis/Videos/Fullstack/GoLib/src/app/%28main%29/page.tsx')) {
                // write to a file
                count++;
                fs.writeFileSync(`recovered/page_tsx_view_${count}.txt`, p.content);
            }
        } catch(e) {}
    }
}
