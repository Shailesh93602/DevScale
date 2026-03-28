import { Challenge } from '@prisma/client';

export const getFunctionName = (signature: string): string => {
  // Matches: function name(...), func name(...), public int name(...), def name(self, ...), name(...)
  // We try to find the word before the first parenthesis that is not a keyword
  const keywords = ['function', 'func', 'public', 'private', 'static', 'def', 'var', 'let', 'const', 'class', 'struct'];
  
  const cleanSignature = signature.replaceAll(/[:][^,)]+/g, ''); // Simple strip of TS types like : string
  const match = /([\w]+)\s*\(/.exec(cleanSignature);
  
  if (match) {
    const candidate = match[1];
    if (!keywords.includes(candidate)) {
      return candidate;
    }
  }
  
  // Try to find "var name = function" or "const name =" patterns
  const assignmentMatch = /(?:var|let|const)\s+([\w]+)\s*=/.exec(signature);
  if (assignmentMatch) return assignmentMatch[1];
  
  // Try harder if it's "function name"
  const funcMatch = /(?:function|func|def)\s+([\w]+)/.exec(signature);
  if (funcMatch) return funcMatch[1];

  return 'solution'; // fallback
};

export const wrapCode = (code: string, language: string, challenge: Challenge): string => {
  const functionName = getFunctionName(challenge.function_signature);

  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
      return `
${code}

const fs = require('fs');
try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) {
        // Just run the code, maybe user added their own calls
    } else {
        const inputObj = JSON.parse(input);
        if (typeof ${functionName} === 'function') {
            const result = ${functionName}(...Object.values(inputObj));
            if (result !== undefined) console.log(result);
        }
    }
} catch (err) {
    // If wrapping fails, we still want the user's console logs to show up
}
`;

    case 'python':
      return `
import sys
import json

${code}

try:
    input_data = sys.stdin.read().strip()
    if input_data:
        params = json.loads(input_data)
        if 'Solution' in globals():
            sol = Solution()
            method = getattr(sol, '${functionName}')
            print(method(**params))
        else:
            print(${functionName}(**params))
except Exception as e:
    pass
`;

    case 'cpp':
      if (code.includes('int main') || code.includes('void main')) {
        return code;
      }
      return `
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
    
    // Use hex escapes for quotes to avoid template escaping issues: \\x22 is "
    size_t firstQuote = input.find("\\x22:\\x22");
    if (firstQuote != std::string::npos) {
        size_t start = firstQuote + 3;
        size_t end = input.find("\\x22", start);
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
