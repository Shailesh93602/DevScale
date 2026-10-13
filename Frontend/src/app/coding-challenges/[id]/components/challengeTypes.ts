export interface IChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  inputFormat: string;
  outputFormat: string;
  exampleInput: string;
  exampleOutput: string;
  constraints: string;
  hints: string[];
  editorial: string;
  boilerplates: Record<string, string>;
  companyTags: string[];
  tags: string[];
}

export interface ITestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: 'Accepted' | 'Wrong Answer' | 'Error';
  executionTime: number;
  memoryUsed: number;
}

export const DEFAULT_BOILERPLATE = {
  javascript: `// JavaScript boilerplate
function main() {
    console.log('Hello, World!');
}
main();`,
  python: `# Python boilerplate
if __name__ == "__main__":
    print("Hello, World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  go: `package main
import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
};

export const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
];
