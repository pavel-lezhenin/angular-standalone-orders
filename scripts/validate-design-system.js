#!/usr/bin/env node

/**
 * Design System Validator
 * 
 * Checks SCSS files for:
 * - Hardcoded colors (hex, rgb, rgba)
 * - Hardcoded spacing/sizing (px, rem, em values)
 * - @media queries in component files
 * - Proper use of CSS variables
 * 
 * Usage:
 *   pnpm validate:design-system                    # Check all rules
 *   pnpm validate:design-system spacing            # Check only spacing
 *   pnpm validate:design-system color              # Check only colors
 *   pnpm validate:design-system media              # Check only @media queries
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
    id: 'color',
    name: 'No hardcoded hex colors',
    pattern: /#[0-9a-fA-F]{3,6}(?!-)/g,
    type: ERRORS.HARDCODED_COLOR,
    excludeValues: ['#fff', '#fff9ee', '#2d3748', '#4a5568', '#718096', '#666', '#333', '#d32f2f', '#f7fafc', '#cbd5e0', '#a0aec0', '#e2e8f0'], // Design system can use these
    message: (match) => `Hardcoded color ${match} - use CSS variables (--text-*, --surface-*, --color-*)`
  },
  {
    id: 'color-func',
    name: 'No hardcoded color functions',
    pattern: /\b(rgb|rgba)\s*\(/g,
    type: ERRORS.HARDCODED_COLOR,
    message: (match) => `Hardcoded color function ${match} - use CSS variables instead`
  },
  {
    id: 'spacing',
    name: 'No hardcoded px/rem/em spacing',
    pattern: /(?<![,(--])\s*(?!0)([0-9.]+)(px|rem|em)\b/g,
    type: ERRORS.HARDCODED_SPACING,
    excludeValues: [], // No exceptions - all spacing must use CSS variables
    message: (match, value, unit) => `Hardcoded spacing ${match.trim()} - use --spacing-* CSS variables`
  },
  {
    id: 'media',
    name: 'No responsive @media queries in components',
    pattern: /@media\s*\([^)]*(?:min-width|max-width|min-height|max-height)[^)]*\)/g,
    type: ERRORS.MEDIA_QUERY,
    message: (match) => `Responsive @media query found - use :host-context(.mobile/.tablet/.desktop) instead`
  },
  {
    id: 'ngdeep',
    name: 'No ::ng-deep in styling',
    pattern: /::ng-deep/g,
    type: ERRORS.INVALID_SELECTOR,
    message: (match) => `${match} found - use component styles or global design system instead`
  }
];

// Get command line filter
const filterRule = process.argv[2];
let rulesToCheck = RULES;

if (filterRule === '--help' || filterRule === '-h') {
  console.log('\n📘 Design System Validator\n');
  console.log('Usage: pnpm validate:design-system [rule-id]\n');
  console.log('Available rules:');
  RULES.forEach(rule => {
    console.log(`  ${rule.id.padEnd(15)} - ${rule.name}`);
  });
  console.log('\nExamples:');
  console.log('  pnpm validate:design-system              # Check all rules');
  console.log('  pnpm validate:design-system spacing      # Check only spacing violations');
  console.log('  pnpm validate:design-system color        # Check only color violations\n');
  process.exit(0);
}

if (filterRule && filterRule !== '') {
  const matchedRule = RULES.find(r => r.id === filterRule || r.id.includes(filterRule));
  if (matchedRule) {
    rulesToCheck = [matchedRule];
    console.log(`🔍 Checking only: ${matchedRule.name}\n`);
  } else {
    console.error(`❌ Unknown rule: "${filterRule}". Use --help to see available rules.\n`);
    process.exit(1);
  }
}

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
    // Skip comment-only lines
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      return;
    }
    
    // Skip width/height definitions
    if (line.includes('width:') || line.includes('height:')) {
      return;
    }
    
    rulesToCheck.forEach(rule => {
      // Skip media query check for design system files
      if (isDesignSystemFile(filePath) && rule.type === ERRORS.MEDIA_QUERY) {
        return;
      }
      
      // Create a fresh regex for each line to avoid state issues
      const regex = new RegExp(rule.pattern.source, 'g');
      let match;
      while ((match = regex.exec(line)) !== null) {
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
          severity: (rule.type === ERRORS.MEDIA_QUERY || rule.type === ERRORS.HARDCODED_SPACING || rule.type === ERRORS.HARDCODED_COLOR) ? 'error' : 'warning'
        });
      }
    });
  });
  
  return issues;
}

function main() {
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
  
  if (errors.length > 0) {
    console.log(`\n❌ ERRORS (${errors.length}):\n`);
    errors.forEach(issue => {
      console.log(`  ${issue.file}`);
      console.log(`    Line ${issue.line}:${issue.column}: ${issue.message}`);
    });
  }
  
  // Exit with error if there are any issues
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
