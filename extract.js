const fs = require('fs');
const readline = require('readline');
const path = require('path');

const transcriptPath = 'C:\\Users\\sulis\\.gemini\\antigravity-ide\\brain\\ede443ca-a2d9-49e7-90ee-6e18711f7c82\\.system_generated\\logs\\transcript_full.jsonl';

async function extract() {
    const fileStream = fs.createReadStream(transcriptPath);
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let edits = [];

    for await (const line of rl) {
        try {
            const parsed = JSON.parse(line);
            if (parsed.tool_calls) {
                for (const tool of parsed.tool_calls) {
                    if (tool.name === 'write_to_file' || tool.name === 'replace_file_content' || tool.name === 'multi_replace_file_content') {
                        const target = tool.args.TargetFile || '';
                        if (target.endsWith('page.tsx')) {
                            edits.push({
                                step: parsed.step_index,
                                tool: tool.name,
                                time: parsed.created_at,
                                target: target,
                                content: tool.args.CodeContent || tool.args.ReplacementContent || tool.args.ReplacementChunks
                            });
                        }
                    }
                }
            }
        } catch (e) {}
    }
    
    console.log(`Found ${edits.length} edits to page.tsx`);
    for (const edit of edits) {
        console.log(`Step ${edit.step} at ${edit.time} - ${edit.tool} to ${edit.target}`);
    }
}
extract();
