const fs = require('fs');
const readline = require('readline');
const path = require('path');

const transcriptPath = 'C:\\Users\\sulis\\.gemini\\antigravity-ide\\brain\\ede443ca-a2d9-49e7-90ee-6e18711f7c82\\.system_generated\\logs\\transcript_full.jsonl';

async function extract() {
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let latestState = {};

    for await (const line of rl) {
        try {
            const parsed = JSON.parse(line);
            
            if (parsed.type === 'VIEW_FILE' && parsed.status === 'DONE') {
                const timestamp = parsed.created_at;
                if (timestamp < '2026-09-22T14:15:00Z') {
                    const lines = parsed.content.split('\n');
                    let contentLines = [];
                    let inCode = false;
                    for (const l of lines) {
                        if (l.match(/^1:( |$)/)) { inCode = true; }
                        if (inCode) {
                            if (l.match(/^\d+:( |$)/)) {
                                let codeLine = l.substring(l.indexOf(':') + 1);
                                if (codeLine.startsWith(' ')) { codeLine = codeLine.substring(1); }
                                contentLines.push(codeLine);
                            } else {
                                inCode = false;
                            }
                        }
                    }
                    if (contentLines.length > 0) {
                        const pathMatch = parsed.content.match(/File Path: `file:\/\/\/(.+?)`/);
                        if (pathMatch) {
                            let fpath = pathMatch[1].replace(/\//g, '\\').replace(/%28/g, '(').replace(/%29/g, ')');
                            fpath = decodeURIComponent(fpath);
                            latestState[fpath] = { content: contentLines.join('\n'), time: timestamp, source: 'view_file' };
                        }
                    }
                }
            }

            if (parsed.tool_calls) {
                const timestamp = parsed.created_at;
                if (timestamp < '2026-09-22T14:15:00Z') {
                    for (const tool of parsed.tool_calls) {
                        if (tool.name === 'write_to_file') {
                            const target = tool.args.TargetFile;
                            latestState[target] = { content: tool.args.CodeContent, time: timestamp, source: 'write_to_file' };
                        }
                    }
                }
            }
        } catch (e) {}
    }
    
    for (const [fpath, data] of Object.entries(latestState)) {
        console.log(`\n\n--- FILE: ${fpath} (from ${data.time} via ${data.source}) ---`);
        const outPath = path.join(__dirname, 'recovered', path.basename(path.dirname(fpath)) + '_' + path.basename(fpath));
        fs.mkdirSync(path.join(__dirname, 'recovered'), { recursive: true });
        fs.writeFileSync(outPath, data.content);
    }
}
extract();
