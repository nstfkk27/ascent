const fs = require('fs');
const content = fs.readFileSync('src/app/[locale]/agent/create/page.tsx', 'utf8');

let braceCount = 0;
let parenCount = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Simple counting (ignores strings/comments for now, but usually good enough for syntax errors of this magnitude)
    for (let char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
    }
    
    // Stop at the return statement to check balance
    if (line.trim().startsWith('return (')) {
        console.log(`At line ${i + 1} (return): Brace balance: ${braceCount}, Paren balance: ${parenCount}`);
        break; // Stop after finding the return
    }
    
    // Check balance at the end of what looks like a function close or major block
    if (line.trim().endsWith('};') || line.trim().endsWith('}, []);') || line.trim().endsWith('});')) {
        console.log(`At line ${i + 1}: Brace: ${braceCount}, Paren: ${parenCount} -> ${line.trim()}`);
    }
}

console.log(`Final: Brace balance: ${braceCount}, Paren balance: ${parenCount}`);
