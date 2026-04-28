const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            if (fullPath.includes('auth\\page.tsx') || fullPath.includes('auth/page.tsx')) continue;
            
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            if (content.includes('from "convex/react"') && (content.includes('useQuery') || content.includes('useMutation'))) {
                content = content.replace(/import\s+{([^}]*)}\s+from\s+["']convex\/react["'];/g, (match, imports) => {
                    const hasQuery = imports.includes('useQuery');
                    const hasMutation = imports.includes('useMutation');
                    
                    if (!hasQuery && !hasMutation) return match;
                    
                    let authImports = [];
                    if (hasQuery) authImports.push('useAuthQuery as useQuery');
                    if (hasMutation) authImports.push('useAuthMutation as useMutation');
                    
                    let otherImports = imports
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s && s !== 'useQuery' && s !== 'useMutation');
                    
                    let res = `import { ${authImports.join(', ')} } from "@/lib/auth-context";`;
                    if (otherImports.length > 0) {
                        res += `\nimport { ${otherImports.join(', ')} } from "convex/react";`;
                    }
                    return res;
                });
                changed = true;
            }
            
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir('./app');
processDir('./components');
console.log('Done');
