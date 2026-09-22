const fs = require('fs');

const transcriptPath = 'C:\\Users\\sulis\\.gemini\\antigravity-ide\\brain\\ede443ca-a2d9-49e7-90ee-6e18711f7c82\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let l of lines) {
    if (l.includes('VIEW_FILE') && l.includes('1: ') && l.includes('page.tsx')) {
        try {
            const p = JSON.parse(l);
            if (p.content && p.content.includes('totalPages: progressData.totalPages')) {
                const clines = p.content.split('\n');
                for (let i = 0; i < clines.length; i++) {
                    if (clines[i].includes('totalPages: progressData.totalPages')) {
                        console.log('--- LINE AROUND IT ---');
                        for (let j = Math.max(0, i-2); j < Math.min(clines.length, i+3); j++) {
                            console.log(`[${j}] ` + JSON.stringify(clines[j]));
                        }
                    }
                }
            }
        } catch(e) {}
    }
}
