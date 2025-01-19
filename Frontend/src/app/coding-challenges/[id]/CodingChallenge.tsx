"use client";

import { fetchData } from "@/app/services/fetchData";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  router.push("/coding-challenges");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  // const handleSolutionChange = (value: FormData) => {
  //   setSolution({ ...solution, [language]: value });
  // };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      const { data } = await fetchData("POST", "/run-code", {
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
      const response = await fetchData("GET", `/challenges/${id}`);
      setChallenge(response.data);
    } catch (error) {
      console.error("Error fetching challenge:", error);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  return (
    <div className="w-full mx-auto p-6">
      <div className="bg-lightSecondary shadow-2xl rounded-lg p-6 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 pr-4 overflow-auto border-r border-border">
          <div>
            <h1 className="text-3xl font-bold mb-4">{challenge?.title}</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
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
        <div className="w-full md:w-1/2 pl-4 flex flex-col">
          <div className="">
            <div className="flex justify-between mb-4">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="border border-border rounded-md p-2 bg-light"
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
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary2"
                disabled={isRunning}
              >
                {isRunning ? "Running..." : "Run Code"}
              </Button>
            </div>
            <div className="flex-grow mb-4">
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
            <div className="bg-light p-4 rounded-md overflow-auto">
              <pre>{output}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
