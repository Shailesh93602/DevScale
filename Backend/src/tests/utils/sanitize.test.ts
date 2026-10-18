// Runs the REAL sanitize-html (no mock). Two jobs:
// 1. the article/forum sanitizers keep safe markup and strip script vectors;
// 2. the installed sanitize-html is not vulnerable to GHSA-g8qq-57p8-ggw5 or
//    GHSA-jxwj-j7wr-gfrw. Both need a config wider than ours (SVG animation,
//    textarea), so each PoC runs with the advisory's own options: a downgrade
//    to an affected version fails here even though our allow-list is narrower.
import { describe, it, expect } from '@jest/globals';
import sanitizeHtml from 'sanitize-html';
import { sanitizeRichText, sanitizeText } from '../../utils/sanitize';

describe('sanitizeRichText', () => {
  it('keeps the article markup it allows', () => {
    const html =
      '<h2>Title</h2><p>Hi <strong>there</strong> <a href="https://x.dev" title="t">link</a></p>' +
      '<pre><code class="language-ts">const a = 1;</code></pre>' +
      '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it('strips scripts, handlers, javascript: and data: URLs', () => {
    const out = sanitizeRichText(
      '<p onclick="alert(1)">x</p><script>alert(1)</script>' +
        '<a href="javascript:alert(1)">a</a><img src="data:image/png;base64,AAAA" onerror="alert(1)">' +
        '<iframe src="https://evil.example"></iframe>'
    );
    expect(out).not.toMatch(/script|onclick|onerror|javascript:|data:|iframe/i);
    expect(out).toContain('<p>x</p>');
  });

  it('neutralises both advisory payloads under our own config', () => {
    const out = sanitizeRichText(
      `<svg><a><animate attributeName="href" values="#safe;javascript:alert(1)"></animate></a></svg>` +
        '<textarea></textarea/><img src=x onerror="alert(document.domain)">'
    );
    expect(out).not.toMatch(/javascript:|onerror|<svg|<animate|<textarea/i);
  });
});

describe('sanitizeText', () => {
  it('removes every tag', () => {
    expect(sanitizeText('<b>bold</b><script>alert(1)</script>')).toBe('bold');
  });
});

describe('installed sanitize-html is patched', () => {
  it('GHSA-g8qq-57p8-ggw5: SVG animate values URI list cannot smuggle javascript:', () => {
    const out = sanitizeHtml(
      `<svg><a><animate attributeName="href" values="#safe;javascript:alert('XSS')" dur=".01s" fill="freeze"></animate><text y="30">Click me</text></a></svg>`,
      {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'svg',
          'animate',
          'text',
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          animate: ['attributename', 'values', 'dur', 'fill'],
          text: ['y'],
        },
        allowedSchemesAppliedToAttributes:
          sanitizeHtml.defaults.allowedSchemesAppliedToAttributes.concat([
            'values',
          ]),
      }
    );
    expect(out).not.toMatch(/javascript:/i);
  });

  it('GHSA-jxwj-j7wr-gfrw: </textarea/> cannot release a live <img onerror>', () => {
    const out = sanitizeHtml(
      '<textarea></textarea/><img src=x onerror="alert(document.domain)">',
      {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['textarea']),
      }
    );
    expect(out).not.toMatch(/<img|onerror="/i);
  });
});
