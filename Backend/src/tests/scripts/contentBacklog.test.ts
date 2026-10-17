// eduscale-backend#20-05 (samples that do not run), #20-06 (bcrypt as encryption).
import { describe, it, expect } from '@jest/globals';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vm from 'node:vm';

const DIR = path.join(__dirname, '../../../prisma/seeders/content_backlog');
const read = (slug: string, file = 'article.html') =>
  fs.readFileSync(path.join(DIR, slug, file), 'utf8');

const codeBlocks = (html: string): string[] =>
  [...html.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map((m) =>
    m[1]
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&amp;', '&')
  );

const compile = (code: string) =>
  new vm.Script(`(async () => {\n${code.replace(/^.*require\(.*$/gm, '')}\n})`);

describe('content_backlog code samples', () => {
  it.each(['sequelize_querying', 'mongoose_basics'])(
    '%s: every code block parses',
    (slug) => {
      for (const block of codeBlocks(read(slug))) {
        if (/^\s*(npm|yarn)\s/.test(block)) continue;
        expect(() => compile(block)).not.toThrow();
      }
    }
  );

  it('sequelize_transactions: the unmanaged example commits using the created user', async () => {
    const block = codeBlocks(read('sequelize_transactions'))[0];
    const profiles: unknown[] = [];
    let committed = false;
    const context = vm.createContext({
      sequelize: {
        transaction: async () => ({
          commit: async () => void (committed = true),
          rollback: async () => undefined,
        }),
      },
      User: { create: async () => ({ id: 7 }) },
      Profile: { create: async (p: unknown) => void profiles.push(p) },
    });
    await compile(block).runInContext(context)();
    expect(committed).toBe(true);
    expect(profiles).toEqual([{ userId: 7 }]);
  });

  it('e2e_testing: selects the password field by its name attribute', () => {
    expect(read('e2e_testing')).not.toContain('input[password=');
  });
});

describe('content_backlog security guidance', () => {
  it.each(['encrypting_sensitive_info', 'implementing_encryption_v2'])(
    '%s: never offers bcrypt as an encryption library',
    (slug) => {
      for (const text of [read(slug), read(slug, 'quiz.json')]) {
        expect(text).not.toMatch(/librar(y|ies)[^.]*bcrypt/i);
      }
    }
  );

  it('hashing: does not call a digest unique', () => {
    expect(read('hashing')).not.toMatch(/into a unique/i);
    expect(read('hashing', 'quiz.json')).not.toMatch(/into a unique/i);
  });
});
