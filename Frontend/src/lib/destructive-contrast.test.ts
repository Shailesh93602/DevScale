import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * `--destructive` is BOTH a text colour and a surface colour in this theme, and
 * in dark mode it resolves to a BRIGHT red (hsl(0 72% 65%), #E66565) with a DARK
 * foreground — the same shape as --success and --warning, and the opposite of
 * shadcn's dark default (#7F1D1D under white text).
 *
 * That choice is deliberate and was re-measured on 2026-09-06 rather than
 * assumed. `text-destructive` has 76 call sites and `bg-destructive` has 8, so
 * the token is overwhelmingly a TEXT colour, and only the bright shade works in
 * that role on this dark card:
 *
 *                                              bright (kept)   shadcn dark
 *   label on the solid surface                    5.64 PASS      9.56 PASS
 *   text-destructive on --card (76 uses)          5.51 PASS      1.79 FAIL
 *   text-destructive on --background              5.83 PASS      1.90 FAIL
 *   text-destructive on --popover                 5.39 PASS      1.75 FAIL
 *   text-destructive on a bg-destructive/10 tint  4.90 PASS      1.74 FAIL
 *   solid surface vs page bg (3:1 non-text)       5.83 PASS      1.90 FAIL
 *
 * THE TRAP THIS TEST EXISTS FOR: every shadcn snippet on the internet pairs a
 * destructive surface with a LIGHT foreground, because upstream's surface is
 * dark. Pasted into this theme that is light-on-light. It had already happened
 * three times and no test caught it, because each one renders fine and the axe
 * sweep does not open an error toast or answer a battle question wrongly:
 *
 *   ToastClose        text-red-300 on the surface        1.72:1
 *   ToastClose hover  text-red-50 on the surface         2.98:1
 *   ToastClose focus  ring-red-400 against the surface   1.18:1
 *   battle + replay   text-white on bg-destructive       3.26:1  (dark only —
 *                     in light mode the same class is 6.95:1, which is why it
 *                     survived review)
 *
 * The rule, which holds whichever way the token is later tuned: anything
 * sitting ON a destructive surface uses `text-destructive-foreground`, never a
 * hardcoded light colour.
 */

const SRC = join(__dirname, '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) return walk(p);
    return p.endsWith('.tsx') ? [p] : [];
  });
}

const FILES = walk(SRC);

/** Light foregrounds that are safe on shadcn's dark destructive and wrong here. */
const LIGHT_FOREGROUND =
  /\btext-(white|red-(50|100|200|300)|slate-(50|100)|neutral-(50|100)|gray-(50|100))\b/;

describe('nothing light sits on a destructive surface', () => {
  it('scans the real .tsx sources', () => {
    expect(FILES.length).toBeGreaterThan(50);
  });

  it('no className puts a light foreground on bg-destructive', () => {
    const offenders: string[] = [];

    for (const file of FILES) {
      const source = readFileSync(file, 'utf8');
      for (const [i, line] of source.split('\n').entries()) {
        // A `bg-destructive` and a `text-white` sitting in two different
        // branches of the same template literal are NOT on the same element:
        //
        //   `${isCorrect ? 'bg-green-500 text-white' : ''}
        //    ${isWrong ? 'bg-destructive text-destructive-foreground' : ''}`
        //
        // reads as a violation to a whole-line grep, and all three real call
        // sites look exactly like that. So split each class string on the
        // characters that separate branches — quotes, `${`, `}`, `?`, `:` —
        // and test the fragments, which are the actual class lists.
        //
        // Not covered: `cn('bg-destructive', flag && 'text-white')`, where the
        // two halves are separate arguments. No call site composes it that way
        // today; if one appears, this is the test to widen.
        for (const fragment of line.split(/['"`?:$${}]+/)) {
          if (!/\bbg-destructive\b/.test(fragment)) continue;
          if (LIGHT_FOREGROUND.test(fragment)) {
            offenders.push(
              `${file.replace(SRC, 'src')}:${i + 1} — ${fragment.trim()}`,
            );
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('the destructive toast variant styles its children from the token', () => {
    const toast = readFileSync(join(SRC, 'components/ui/toast.tsx'), 'utf8');

    // Every `group-[.destructive]:` utility inherits the bright surface as its
    // background, so none of them may name a raw red.
    const groupUtilities =
      toast.match(/group-\[\.destructive\]:[\w-/.[\]]+/g) ?? [];
    expect(groupUtilities.length).toBeGreaterThan(4);

    const rawReds = groupUtilities.filter((u) => /red-\d{2,3}/.test(u));
    expect(rawReds).toEqual([]);

    // And the close button must actually be styled — a regression that dropped
    // the rule entirely would pass the check above vacuously.
    expect(toast).toContain('group-[.destructive]:text-destructive-foreground');
  });
});
