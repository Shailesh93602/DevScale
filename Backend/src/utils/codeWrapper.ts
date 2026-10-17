import { Challenge } from '@prisma/client';

export const getFunctionName = (signature: string): string => {
  // Matches: function name(...), func name(...), public int name(...), def name(self, ...), name(...)
  // We try to find the word before the first parenthesis that is not a keyword
  const keywords = [
    'function',
    'func',
    'public',
    'private',
    'static',
    'def',
    'var',
    'let',
    'const',
    'class',
    'struct',
  ];

  const cleanSignature = signature.replaceAll(/:[^,)]+/g, ''); // Simple strip of TS types like : string
  const match = /(\w+)\s*\(/.exec(cleanSignature);

  if (match) {
    const candidate = match[1];
    if (!keywords.includes(candidate)) {
      return candidate;
    }
  }

  // Try to find "var name = function" or "const name =" patterns
  const assignmentMatch = /(?:var|let|const)\s+(\w+)\s*=/.exec(signature);
  if (assignmentMatch) return assignmentMatch[1];

  // Try harder if it's "function name"
  const funcMatch = /(?:function|func|def)\s+(\w+)/.exec(signature);
  if (funcMatch) return funcMatch[1];

  return 'solution'; // fallback
};

export const wrapCode = (
  code: string,
  language: string,
  challenge: Challenge
): string => {
  const functionName = getFunctionName(challenge.function_signature);

  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
      // Only reading the input is best-effort; an exception thrown by the
      // solution itself must reach stderr with a non-zero exit.
      return `
${code}

let __harnessArgs = null;
try {
    const __harnessInput = require('fs').readFileSync(0, 'utf-8').trim();
    if (__harnessInput) __harnessArgs = Object.values(JSON.parse(__harnessInput));
} catch (_err) {
    // Not JSON arguments: the solution reads stdin itself.
}
if (__harnessArgs && typeof ${functionName} === 'function') {
    try {
        const __harnessResult = ${functionName}(...__harnessArgs);
        if (__harnessResult !== undefined) console.log(__harnessResult);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
`;

    case 'python':
      return `
import sys
import json

${code}

__harness_params = None
try:
    __harness_input = sys.stdin.read().strip()
    if __harness_input:
        __harness_params = json.loads(__harness_input)
except Exception:
    pass

if __harness_params is not None:
    try:
        if 'Solution' in globals():
            print(getattr(Solution(), '${functionName}')(**__harness_params))
        else:
            print(${functionName}(**__harness_params))
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
`;

    case 'cpp':
      if (code.includes('int main') || code.includes('void main')) {
        return code;
      }
      return String.raw`
#include <iostream>
#include <string>
#include <vector>

${code}

int main() {
    Solution sol;
    std::string input;
    std::string line;
    while (std::getline(std::cin, line)) {
        input += line;
    }
    
    // Use hex escapes for quotes to avoid template escaping issues: \x22 is "
    size_t firstQuote = input.find("\x22:\x22");
    if (firstQuote != std::string::npos) {
        size_t start = firstQuote + 3;
        size_t end = input.find("\x22", start);
        if (end != std::string::npos) {
            std::string val = input.substr(start, end - start);
            auto result = sol.${functionName}(val);
            std::cout << result << std::endl;
            return 0;
        }
    }
    
    return 0;
}
`;

    default:
      return code;
  }
};
