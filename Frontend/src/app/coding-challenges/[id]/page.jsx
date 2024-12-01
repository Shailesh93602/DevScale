"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { fetchData } from "@/app/services/fetchData";

export default function ViewChallengePage({ params }) {
  let { id } = params;
  const [challenge, setChallenge] = useState();

  const [solution, setSolution] = useState({
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
  });

  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);

  const router = useRouter();
  const { theme } = useTheme();

  const fetchChallenge = async () => {
    try {
      const response = await fetchData("get", "/challenges/" + id);
      setChallenge(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!id) {
      router.push("/coding-challenges");
    }
    fetchChallenge();
  }, []);

  const handleSolutionChange = (value) => {
    setSolution({ ...solution, [language]: value });
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      const response = await fetchData("POST", "/run-code", {
        language,
        code: solution[language],
      });
      if (response.data?.error) {
        setOutput(data.error);
      } else {
        setOutput(response.data?.output);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!challenge) {
    return <div className="container mx-auto p-4">Challenge not found.</div>;
  }

  return (
    <div className="w-full mx-auto p-6">
      <div className="bg-lightSecondary shadow-2xl rounded-lg p-6 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 pr-4 overflow-auto border-r border-border">
          <div>
            <h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Description:</strong> {challenge.description}
            </p>
            <p className="mb-2">
              <strong>Difficulty:</strong> {challenge.difficulty}
            </p>
            <p className="mb-2">
              <strong>Input Format:</strong> {challenge.inputFormat}
            </p>
            <p className="mb-2">
              <strong>Output Format:</strong> {challenge.outputFormat}
            </p>
            <p className="mb-2">
              <strong>Sample Input:</strong> {challenge.exampleInput}
            </p>
            <p className="mb-4">
              <strong>Sample Output:</strong> {challenge.exampleOutput}
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
              <Editor
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
              />
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
