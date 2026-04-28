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
            let originalContent = content;
            
            // Replace exact strings
            content = content.replace('import { useQuery, useMutation } from "convex/react";', 'import { useAuthQuery as useQuery, useAuthMutation as useMutation } from "@/lib/auth-context";');
            content = content.replace('import { useMutation, useQuery } from "convex/react";', 'import { useAuthQuery as useQuery, useAuthMutation as useMutation } from "@/lib/auth-context";');
            content = content.replace('import { useQuery } from "convex/react";', 'import { useAuthQuery as useQuery } from "@/lib/auth-context";');
            content = content.replace('import { useMutation } from "convex/react";', 'import { useAuthMutation as useMutation } from "@/lib/auth-context";');
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                fs.appendFileSync('z:/home/gerberto/projects/media-flmr/refactor_log.txt', 'Updated: ' + fullPath + '\n');
            }
        }
    }
}

fs.writeFileSync('z:/home/gerberto/projects/media-flmr/refactor_log.txt', '');
processDir('./app');
processDir('./components');
