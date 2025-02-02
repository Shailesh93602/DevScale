'use client';

import { fetchData } from '@/app/services/fetchData';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CodingChallenge({ id }: { id: string }) {
  const [challenge, setChallenge] = useState<{
    title: string;
    description: string;
    difficulty: string;
    inputFormat: string;
    outputFormat: string;
    exampleInput: string;
    exampleOutput: string;
  }>();
  const solution = {
    javascript: `// JavaScript boilerplate
function main() {
    console.log('Hello, World!');
}
main();`,
    python: `# Python boilerplate
if __name__ == "__main__":
    print("Hello, World!")`,
    java: `class MrEngineers {
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
    csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
    go: `package main
import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    ruby: `# Ruby boilerplate
puts 'Hello, World!'`,
    swift: `import Foundation

print("Hello, World!")`,
  };
  const router = useRouter();

  router.push('/coding-challenges');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  // const handleSolutionChange = (value: FormData) => {
  //   setSolution({ ...solution, [language]: value });
  // };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      const { data } = await fetchData('POST', '/run-code', {
        language,
        code: solution[language as keyof object],
      });
      if (data?.error) {
        setOutput(data.error);
      } else {
        setOutput(data?.output);
      }
    } catch (error) {
      setOutput(`Error: ${(error as { message: string }).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const fetchChallenge = async () => {
    try {
      const response = await fetchData('GET', `/challenges/${id}`);
      setChallenge(response.data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  return (
    <div className="mx-auto w-full p-6">
      <div className="flex flex-col rounded-lg bg-lightSecondary p-6 shadow-2xl md:flex-row">
        <div className="w-full overflow-auto border-r border-border pr-4 md:w-1/2">
          <div>
            <h1 className="mb-4 text-3xl font-bold">{challenge?.title}</h1>
            <p className="mb-2 text-gray-700 dark:text-gray-300">
              <strong>Description:</strong> {challenge?.description}
            </p>
            <p className="mb-2">
              <strong>Difficulty:</strong> {challenge?.difficulty}
            </p>
            <p className="mb-2">
              <strong>Input Format:</strong> {challenge?.inputFormat}
            </p>
            <p className="mb-2">
              <strong>Output Format:</strong> {challenge?.outputFormat}
            </p>
            <p className="mb-2">
              <strong>Sample Input:</strong> {challenge?.exampleInput}
            </p>
            <p className="mb-4">
              <strong>Sample Output:</strong> {challenge?.exampleOutput}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col pl-4 md:w-1/2">
          <div className="">
            <div className="mb-4 flex justify-between">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="rounded-md border border-border bg-light p-2"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
              </select>

              <Button
                onClick={handleRunCode}
                className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary2"
                disabled={isRunning}
              >
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </div>
            <div className="mb-4 flex-grow">
              {/* <Editor
                height="calc(100vh - 20rem)"
                language={language}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
                value={solution[language]}
                onChange={handleSolutionChange}
                options={{
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: "line",
                  automaticLayout: true,
                }}
                className="shadow-md"
              /> */}
            </div>
            <div className="overflow-auto rounded-md bg-light p-4">
              <pre>{output}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
