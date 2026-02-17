import { beforeAll, afterEach, afterAll } from 'vitest';
import '@angular/compiler';
import { ɵresolveComponentResources as resolveComponentResources } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { readFile, readdir } from 'node:fs/promises';
import { basename, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { server } from './mocks/setup';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

const packageRoot = process.cwd();
const srcRoot = join(packageRoot, 'src');

async function findFileByName(rootDir: string, fileName: string): Promise<string | null> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findFileByName(fullPath, fileName);
      if (nested) {
        return nested;
      }
      continue;
    }
    if (entry.isFile() && entry.name === fileName) {
      return fullPath;
    }
  }
  return null;
}

async function readResource(url: string): Promise<string> {
  if (url.startsWith('file://')) {
    return readFile(fileURLToPath(url), 'utf-8');
  }

  if (isAbsolute(url)) {
    return readFile(url, 'utf-8');
  }

  const directFromRoot = join(packageRoot, url.replace(/^\.\//, ''));
  try {
    return await readFile(directFromRoot, 'utf-8');
  } catch {
    const byName = await findFileByName(srcRoot, basename(url));
    if (!byName) {
      throw new Error(`Cannot resolve component resource: ${url}`);
    }
    return readFile(byName, 'utf-8');
  }
}

beforeAll(async () => {
  await resolveComponentResources(async (url) => readResource(url));
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
