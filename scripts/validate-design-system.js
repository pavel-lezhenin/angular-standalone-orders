#!/usr/bin/env node

/**
 * Design System Validator
 * 
 * Checks SCSS files for:
 * - Hardcoded colors (hex, rgb, rgba)
 * - Hardcoded spacing/sizing (px, rem, em values)
 * - @media queries in component files
 * - Proper use of CSS variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_DIRS = [
  'src/areas',
  'src/shared',
];

const DESIGN_SYSTEM_DIRS = [
  'src/styles',
];

const ERRORS = {
  HARDCODED_COLOR: 'hardcoded-color',
  HARDCODED_SIZE: 'hardcoded-size',
  HARDCODED_SPACING: 'hardcoded-spacing',
  MEDIA_QUERY: 'media-query-in-component',
  INVALID_SELECTOR: 'invalid-selector',
};

const RULES = [
  {
    name: 'No hardcoded hex colors',
    pattern: /#[0-9a-fA-F]{3,6}(?!-)/g,
    type: ERRORS.HARDCODED_COLOR,
    excludeValues: ['#fff', '#fff9ee', '#2d3748', '#4a5568', '#718096', '#666', '#333', '#d32f2f', '#f7fafc', '#cbd5e0', '#a0aec0', '#e2e8f0'], // Design system can use these
    message: (match) => `Hardcoded color ${match} - use CSS variables (--text-*, --surface-*, --color-*)`
  },
  {
    name: 'No hardcoded color functions',
    pattern: /\b(rgb|rgba)\s*\(/g,
    type: ERRORS.HARDCODED_COLOR,
    message: (match) => `Hardcoded color function ${match} - use CSS variables instead`
  },
  {
    name: 'No hardcoded px/rem/em spacing',
    pattern: /:\s*([0-9.]+)(px|rem|em)(?!\))/g,
    type: ERRORS.HARDCODED_SPACING,
    excludeValues: ['0', '1px', '2px'], // Allow zero and very small values
    message: (match, value, unit) => `Hardcoded spacing ${match} - use --spacing-* CSS variables`
  },
  {
    name: 'No @media queries in components',
    pattern: /@media\s*\(/g,
    type: ERRORS.MEDIA_QUERY,
    message: (match) => `@media query found - use :host-context(.mobile/.tablet/.desktop) instead`
  },
  {
    name: 'No ::ng-deep in styling',
    pattern: /::ng-deep/g,
    type: ERRORS.INVALID_SELECTOR,
    message: (match) => `${match} found - use component styles or global design system instead`
  }
];

function readFilesRecursive(dir) {
  let files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files = files.concat(readFilesRecursive(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.scss')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  
  return files;
}

function isDesignSystemFile(filePath) {
  return DESIGN_SYSTEM_DIRS.some(dir => filePath.includes(dir));
}

function isComponentFile(filePath) {
  return ALLOWED_DIRS.some(dir => filePath.includes(dir));
}

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, lineNum) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      return;
    }
    
    RULES.forEach(rule => {
      // Skip media query check for design system files
      if (isDesignSystemFile(filePath) && rule.type === ERRORS.MEDIA_QUERY) {
        return;
      }
      
      let match;
      while ((match = rule.pattern.exec(line)) !== null) {
        const fullMatch = match[0];
        
        // Check if this is something we should exclude
        if (rule.excludeValues && rule.excludeValues.includes(fullMatch)) {
          continue;
        }
        
        issues.push({
          file: filePath,
          line: lineNum + 1,
          column: match.index + 1,
          message: rule.message(fullMatch, match[1], match[2]),
          type: rule.type,
          severity: rule.type === ERRORS.MEDIA_QUERY ? 'error' : 'warning'
        });
      }
    });
  });
  
  return issues;
}

function main() {
  console.log('🔍 Validating Design System Compliance...\n');
  
  const allFiles = [];
  
  // Scan allowed directories
  ALLOWED_DIRS.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      allFiles.push(...readFilesRecursive(fullPath));
    }
  });
  
  if (allFiles.length === 0) {
    console.log('❌ No SCSS files found in component directories');
    process.exit(1);
  }
  
  console.log(`📋 Found ${allFiles.length} SCSS files to validate\n`);
  
  let totalIssues = 0;
  const issues = [];
  
  allFiles.forEach(file => {
    const fileIssues = validateFile(file);
    if (fileIssues.length > 0) {
      issues.push(...fileIssues);
      totalIssues += fileIssues.length;
    }
  });
  
  if (totalIssues === 0) {
    console.log('✅ All files comply with design system rules!');
    process.exit(0);
  }
  
  // Group issues by severity
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  
  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):\n`);
    errors.forEach(issue => {
      console.log(`  ${issue.file}`);
      console.log(`    Line ${issue.line}:${issue.column}: ${issue.message}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`);
    warnings.forEach(issue => {
      console.log(`  ${issue.file}`);
      console.log(`    Line ${issue.line}:${issue.column}: ${issue.message}`);
    });
  }
  
  console.log(`\n📊 Total Issues: ${totalIssues}`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}\n`);
  
  // Exit with error if there are any issues
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
