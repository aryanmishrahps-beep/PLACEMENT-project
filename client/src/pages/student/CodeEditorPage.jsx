import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';

// Language configs for Piston API (free, no API key needed)
const LANGUAGES = [
  { id: 'python', name: 'Python 3', version: '3.10.0', ext: 'py', monacoLang: 'python' },
  { id: 'javascript', name: 'JavaScript', version: '18.15.0', ext: 'js', monacoLang: 'javascript' },
  { id: 'java', name: 'Java', version: '15.0.2', ext: 'java', monacoLang: 'java' },
  { id: 'cpp', name: 'C++', version: '10.2.0', ext: 'cpp', monacoLang: 'cpp' },
  { id: 'c', name: 'C', version: '10.2.0', ext: 'c', monacoLang: 'c' },
  { id: 'go', name: 'Go', version: '1.16.2', ext: 'go', monacoLang: 'go' },
  { id: 'rust', name: 'Rust', version: '1.50.0', ext: 'rs', monacoLang: 'rust' },
];

const CODE_TEMPLATES = {
  python: `# Python Solution
def solution():
    # Write your code here
    print("Hello, World!")

solution()`,
  javascript: `// JavaScript Solution
function solution() {
    // Write your code here
    console.log("Hello, World!");
}

solution();`,
  java: `// Java Solution
public class Main {
    public static void main(String[] args) {
        // Write your code here
        System.out.println("Hello, World!");
    }
}`,
  cpp: `// C++ Solution
#include <bits/stdc++.h>
using namespace std;

int main() {
    // Write your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  c: `// C Solution
#include <stdio.h>

int main() {
    // Write your code here
    printf("Hello, World!\\n");
    return 0;
}`,
  go: `// Go Solution
package main

import "fmt"

func main() {
    // Write your code here
    fmt.Println("Hello, World!")
}`,
  rust: `// Rust Solution
fn main() {
    // Write your code here
    println!("Hello, World!");
}`,
};

const PROBLEMS = [
  {
    id: 1, title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'HashMap'], acceptance: '49.2%',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to target.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 6, we return [1, 2].' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]', explanation: '' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists.'],
    starterCode: {
      python: `def twoSum(nums, target):
    # Your code here
    pass

# Test
print(twoSum([2,7,11,15], 9))`,
      javascript: `function twoSum(nums, target) {
    // Your code here
}

// Test
console.log(twoSum([2,7,11,15], 9));`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15}, 9)));
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    auto res = twoSum(nums, 9);
    cout << "[" << res[0] << "," << res[1] << "]" << endl;
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target) {
    int* result = malloc(2 * sizeof(int));
    // Your code here
    return result;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int* res = twoSum(nums, 4, 9);
    printf("[%d,%d]\\n", res[0], res[1]);
}`,
      go: `package main
import "fmt"

func twoSum(nums []int, target int) []int {
    // Your code here
    return nil
}

func main() {
    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))
}`,
      rust: `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    // Your code here
    vec![]
}

fn main() {
    println!("{:?}", two_sum(vec![2, 7, 11, 15], 9));
}`,
    },
  },
  {
    id: 2, title: 'Reverse a String', difficulty: 'Easy', tags: ['String', 'Two Pointers'], acceptance: '75.4%',
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with O(1) extra memory.`,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: '' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', explanation: '' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁵', 's[i] is a printable ASCII character.'],
    starterCode: {
      python: `def reverseString(s):
    # Reverse in-place
    pass

s = ["h","e","l","l","o"]
reverseString(s)
print(s)`,
      javascript: `function reverseString(s) {
    // Reverse in-place
}

const s = ["h","e","l","l","o"];
reverseString(s);
console.log(s);`,
      java: `import java.util.*;

public class Main {
    public static void reverseString(char[] s) {
        // Your code here
    }
    public static void main(String[] args) {
        char[] s = {'h','e','l','l','o'};
        reverseString(s);
        System.out.println(Arrays.toString(s));
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

void reverseString(vector<char>& s) {
    // Your code here
}

int main() {
    vector<char> s = {'h','e','l','l','o'};
    reverseString(s);
    for(char c : s) cout << c;
    cout << endl;
}`,
      c: `#include <stdio.h>
#include <string.h>

void reverseString(char* s, int len) {
    // Your code here
}

int main() {
    char s[] = "hello";
    reverseString(s, strlen(s));
    printf("%s\\n", s);
}`,
      go: `package main
import "fmt"

func reverseString(s []byte) {
    // Your code here
}

func main() {
    s := []byte("hello")
    reverseString(s)
    fmt.Println(string(s))
}`,
      rust: `fn reverse_string(s: &mut Vec<char>) {
    // Your code here
}

fn main() {
    let mut s: Vec<char> = "hello".chars().collect();
    reverse_string(&mut s);
    let result: String = s.iter().collect();
    println!("{}", result);
}`,
    },
  },
  {
    id: 3, title: 'Valid Parentheses', difficulty: 'Medium', tags: ['Stack', 'String'], acceptance: '40.9%',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is **valid**.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true', explanation: '' },
      { input: 's = "()[]{}"', output: 'true', explanation: '' },
      { input: 's = "(]"', output: 'false', explanation: '' },
      { input: 's = "([])"', output: 'true', explanation: '' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', "s consists of parentheses only '()[]{}'."],
    starterCode: {
      python: `def isValid(s):
    # Your code here
    pass

print(isValid("()"))
print(isValid("()[]{}"))
print(isValid("(]"))`,
      javascript: `function isValid(s) {
    // Your code here
}

console.log(isValid("()"));
console.log(isValid("()[]{}"));
console.log(isValid("(]"));`,
      java: `public class Main {
    public static boolean isValid(String s) {
        // Your code here
        return false;
    }
    public static void main(String[] args) {
        System.out.println(isValid("()"));
        System.out.println(isValid("()[]{}"));
        System.out.println(isValid("(]"));
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    // Your code here
    return false;
}

int main() {
    cout << (isValid("()") ? "true" : "false") << endl;
    cout << (isValid("()[]{}") ? "true" : "false") << endl;
    cout << (isValid("(]") ? "true" : "false") << endl;
}`,
      c: `#include <stdio.h>
#include <stdbool.h>
#include <string.h>

bool isValid(char* s) {
    // Your code here
    return false;
}

int main() {
    printf("%s\\n", isValid("()") ? "true" : "false");
    printf("%s\\n", isValid("()[]{}") ? "true" : "false");
    printf("%s\\n", isValid("(]") ? "true" : "false");
}`,
      go: `package main
import "fmt"

func isValid(s string) bool {
    // Your code here
    return false
}

func main() {
    fmt.Println(isValid("()"))
    fmt.Println(isValid("()[]{}"))
    fmt.Println(isValid("(]"))
}`,
      rust: `fn is_valid(s: String) -> bool {
    // Your code here
    false
}

fn main() {
    println!("{}", is_valid("()".to_string()));
    println!("{}", is_valid("()[]{}".to_string()));
    println!("{}", is_valid("(]".to_string()));
}`,
    },
  },
  {
    id: 4, title: 'Fibonacci Number', difficulty: 'Easy', tags: ['Math', 'DP', 'Recursion'], acceptance: '68.4%',
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence such that each number is the sum of the two preceding ones, starting from 0 and 1.

That is, \`F(0) = 0\`, \`F(1) = 1\`, \`F(n) = F(n-1) + F(n-2)\` for \`n > 1\`.

Given \`n\`, calculate \`F(n)\`.`,
    examples: [
      { input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.' },
      { input: 'n = 3', output: '2', explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2.' },
      { input: 'n = 4', output: '3', explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.' },
    ],
    constraints: ['0 ≤ n ≤ 30'],
    starterCode: {
      python: `def fib(n):
    # Your code here
    pass

print(fib(10))   # Expected: 55
print(fib(0))    # Expected: 0
print(fib(1))    # Expected: 1`,
      javascript: `function fib(n) {
    // Your code here
}

console.log(fib(10));  // Expected: 55
console.log(fib(0));   // Expected: 0
console.log(fib(1));   // Expected: 1`,
      java: `public class Main {
    public static int fib(int n) {
        // Your code here
        return 0;
    }
    public static void main(String[] args) {
        System.out.println(fib(10)); // 55
        System.out.println(fib(0));  // 0
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int fib(int n) {
    // Your code here
    return 0;
}

int main() {
    cout << fib(10) << endl; // 55
    cout << fib(0)  << endl; // 0
}`,
      c: `#include <stdio.h>

int fib(int n) {
    // Your code here
    return 0;
}

int main() {
    printf("%d\\n", fib(10)); // 55
    printf("%d\\n", fib(0));  // 0
}`,
      go: `package main
import "fmt"

func fib(n int) int {
    // Your code here
    return 0
}

func main() {
    fmt.Println(fib(10)) // 55
    fmt.Println(fib(0))  // 0
}`,
      rust: `fn fib(n: u32) -> u32 {
    // Your code here
    0
}

fn main() {
    println!("{}", fib(10)); // 55
    println!("{}", fib(0));  // 0
}`,
    },
  },
  {
    id: 5, title: 'Binary Search', difficulty: 'Easy', tags: ['Array', 'Binary Search'], acceptance: '55.2%',
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums at index 4.' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1.' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', '-10⁴ < nums[i], target < 10⁴', 'All integers in nums are unique.', 'nums is sorted in ascending order.'],
    starterCode: {
      python: `def search(nums, target):
    # Implement binary search - O(log n)
    pass

print(search([-1,0,3,5,9,12], 9))   # Expected: 4
print(search([-1,0,3,5,9,12], 2))   # Expected: -1`,
      javascript: `function search(nums, target) {
    // Implement binary search - O(log n)
}

console.log(search([-1,0,3,5,9,12], 9));  // Expected: 4
console.log(search([-1,0,3,5,9,12], 2));  // Expected: -1`,
      java: `public class Main {
    public static int search(int[] nums, int target) {
        // Implement binary search
        return -1;
    }
    public static void main(String[] args) {
        System.out.println(search(new int[]{-1,0,3,5,9,12}, 9)); // 4
        System.out.println(search(new int[]{-1,0,3,5,9,12}, 2)); // -1
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int search(vector<int>& nums, int target) {
    // Implement binary search
    return -1;
}

int main() {
    vector<int> nums = {-1,0,3,5,9,12};
    cout << search(nums, 9) << endl; // 4
    cout << search(nums, 2) << endl; // -1
}`,
      c: `#include <stdio.h>

int search(int* nums, int numsSize, int target) {
    // Implement binary search
    return -1;
}

int main() {
    int nums[] = {-1,0,3,5,9,12};
    printf("%d\\n", search(nums, 6, 9)); // 4
    printf("%d\\n", search(nums, 6, 2)); // -1
}`,
      go: `package main
import "fmt"

func search(nums []int, target int) int {
    // Implement binary search
    return -1
}

func main() {
    fmt.Println(search([]int{-1,0,3,5,9,12}, 9)) // 4
    fmt.Println(search([]int{-1,0,3,5,9,12}, 2)) // -1
}`,
      rust: `fn search(nums: Vec<i32>, target: i32) -> i32 {
    // Implement binary search
    -1
}

fn main() {
    println!("{}", search(vec![-1,0,3,5,9,12], 9)); // 4
    println!("{}", search(vec![-1,0,3,5,9,12], 2)); // -1
}`,
    },
  },
];

const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const DIFF_BG = { Easy: 'rgba(16,185,129,0.12)', Medium: 'rgba(245,158,11,0.12)', Hard: 'rgba(239,68,68,0.12)' };

export default function CodeEditorPage() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [code, setCode] = useState(PROBLEMS[0].starterCode['python']);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [outputStatus, setOutputStatus] = useState(null); // 'success' | 'error' | 'running'
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [execTime, setExecTime] = useState(null);
  const [showProblems, setShowProblems] = useState(true);
  const editorRef = useRef(null);

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setCode(selectedProblem.starterCode[lang.id] || CODE_TEMPLATES[lang.id] || '// Write your code here');
    setOutput('');
    setOutputStatus(null);
  };

  const handleProblemChange = (problem) => {
    setSelectedProblem(problem);
    setCode(problem.starterCode[selectedLang.id] || CODE_TEMPLATES[selectedLang.id] || '// Write your code here');
    setOutput('');
    setOutputStatus(null);
    setExecTime(null);
    setActiveTab('description');
  };

  const runCode = async () => {
    setRunning(true);
    setOutputStatus('running');
    setOutput('');
    setExecTime(null);
    const startTime = Date.now();

    try {
      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang.id,
          version: selectedLang.version,
          files: [{ name: `solution.${selectedLang.ext}`, content: code }],
          stdin: stdin,
        }),
      });

      const data = await res.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      setExecTime(elapsed);

      const stdout = data.run?.stdout || '';
      const stderr = data.run?.stderr || '';
      const compileErr = data.compile?.stderr || '';

      if (compileErr) {
        setOutput(compileErr);
        setOutputStatus('error');
      } else if (stderr) {
        setOutput(stderr);
        setOutputStatus('error');
      } else {
        setOutput(stdout || '(no output)');
        setOutputStatus('success');
        setSolvedProblems(prev => new Set([...prev, selectedProblem.id]));
      }
    } catch {
      setOutput('⚠️ Network error: Could not reach the code execution server.\nPlease check your internet connection and try again.');
      setOutputStatus('error');
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!running) runCode();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, running]);

  return (
    <ProtectedLayout title="Code Editor" allowedRoles={['student']}>
      <div style={{ display: 'flex', height: 'calc(100vh - 112px)', gap: 0, overflow: 'hidden', borderRadius: 16, border: '1px solid var(--border-subtle)', background: '#0d1117' }}>

        {/* Problem List Sidebar */}
        {showProblems && (
          <div style={{ width: 220, flexShrink: 0, background: '#161b22', borderRight: '1px solid #30363d', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 12px', borderBottom: '1px solid #30363d', fontWeight: 700, fontSize: '0.8rem', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Problems
            </div>
            {PROBLEMS.map((p) => (
              <div key={p.id}
                onClick={() => handleProblemChange(p)}
                style={{
                  padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid #21262d',
                  background: selectedProblem.id === p.id ? '#1f2937' : 'transparent',
                  borderLeft: selectedProblem.id === p.id ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: selectedProblem.id === p.id ? '#e6edf3' : '#c9d1d9' }}>
                    {solvedProblems.has(p.id) ? '✅ ' : ''}{p.id}. {p.title}
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: DIFF_COLOR[p.difficulty], background: DIFF_BG[p.difficulty], padding: '1px 7px', borderRadius: 10 }}>
                  {p.difficulty}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Problem Description Panel */}
        <div style={{ width: 360, flexShrink: 0, background: '#0d1117', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Panel Header */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setShowProblems(p => !p)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1rem', padding: '2px 6px', borderRadius: 4 }} title="Toggle problem list">
              ☰
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {['description', 'examples', 'solution'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  background: activeTab === t ? '#1f2937' : 'transparent',
                  border: 'none', color: activeTab === t ? '#e6edf3' : '#8b949e',
                  padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem',
                  fontWeight: activeTab === t ? 700 : 400, textTransform: 'capitalize',
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e6edf3', marginBottom: 8 }}>
                {selectedProblem.id}. {selectedProblem.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.73rem', fontWeight: 700, color: DIFF_COLOR[selectedProblem.difficulty], background: DIFF_BG[selectedProblem.difficulty], padding: '2px 10px', borderRadius: 12 }}>
                  {selectedProblem.difficulty}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>✓ {selectedProblem.acceptance} acceptance</span>
                {solvedProblems.has(selectedProblem.id) && (
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>✅ Solved</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {selectedProblem.tags.map(t => (
                  <span key={t} style={{ fontSize: '0.68rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)' }}>{t}</span>
                ))}
              </div>
            </div>

            {activeTab === 'description' && (
              <>
                <div style={{ fontSize: '0.85rem', color: '#c9d1d9', lineHeight: 1.9, whiteSpace: 'pre-line', marginBottom: 16 }}>
                  {selectedProblem.description}
                </div>
                {selectedProblem.examples.slice(0, 2).map((ex, i) => (
                  <div key={i} style={{ background: '#161b22', borderRadius: 10, padding: '12px 14px', marginBottom: 10, border: '1px solid #30363d' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#8b949e', marginBottom: 8 }}>Example {i + 1}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.78rem', lineHeight: 1.8 }}>
                      <div><span style={{ color: '#8b949e' }}>Input: </span><span style={{ color: '#79c0ff' }}>{ex.input}</span></div>
                      <div><span style={{ color: '#8b949e' }}>Output: </span><span style={{ color: '#56d364' }}>{ex.output}</span></div>
                      {ex.explanation && <div style={{ color: '#8b949e', marginTop: 4, fontSize: '0.75rem' }}>// {ex.explanation}</div>}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#8b949e', marginBottom: 8 }}>Constraints:</div>
                  {selectedProblem.constraints.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: '#c9d1d9', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>• {c}</div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'examples' && (
              <div>
                {selectedProblem.examples.map((ex, i) => (
                  <div key={i} style={{ background: '#161b22', borderRadius: 10, padding: '14px', marginBottom: 12, border: '1px solid #30363d' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#8b949e', marginBottom: 10 }}>Example {i + 1}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', lineHeight: 2 }}>
                      <div style={{ background: '#0d1117', padding: '8px 12px', borderRadius: 6, marginBottom: 6 }}>
                        <span style={{ color: '#8b949e' }}>Input: </span><span style={{ color: '#79c0ff' }}>{ex.input}</span>
                      </div>
                      <div style={{ background: '#0d1117', padding: '8px 12px', borderRadius: 6, marginBottom: 6 }}>
                        <span style={{ color: '#8b949e' }}>Output: </span><span style={{ color: '#56d364' }}>{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div style={{ fontSize: '0.78rem', color: '#8b949e', padding: '6px 12px' }}>
                          💡 {ex.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'solution' && (
              <div style={{ background: '#161b22', borderRadius: 10, padding: 16, border: '1px solid #30363d' }}>
                <div style={{ fontSize: '0.85rem', color: '#8b949e', lineHeight: 1.8 }}>
                  <div style={{ fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>💡 Hints</div>
                  <p style={{ marginBottom: 10 }}>1. Think about what data structure allows O(1) lookup.</p>
                  <p style={{ marginBottom: 10 }}>2. As you iterate, check if the complement (target - current) already exists.</p>
                  <p>3. Store each number and its index in a HashMap.</p>
                  <div style={{ marginTop: 16, padding: '10px 14px', background: '#0d1117', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.78rem', color: '#79c0ff' }}>
                    # Python O(n) solution<br />
                    seen = {'{ }'}<br />
                    for i, num in enumerate(nums):<br />
                    &nbsp;&nbsp;complement = target - num<br />
                    &nbsp;&nbsp;if complement in seen:<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;return [seen[complement], i]<br />
                    &nbsp;&nbsp;seen[num] = i
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor + Output Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Editor Toolbar */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161b22', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <select value={selectedLang.id}
                onChange={e => handleLangChange(LANGUAGES.find(l => l.id === e.target.value))}
                style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '4px 10px', color: '#c9d1d9', fontSize: '0.78rem', cursor: 'pointer', outline: 'none' }}>
                {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <span style={{ fontSize: '0.72rem', color: '#484f58', fontFamily: 'monospace' }}>
                solution.{selectedLang.ext}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.7rem', color: '#484f58' }}>Ctrl+Enter to Run</span>
              <button onClick={() => setCode(selectedProblem.starterCode[selectedLang.id] || CODE_TEMPLATES[selectedLang.id])}
                style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>
                Reset
              </button>
              <button onClick={runCode} disabled={running}
                style={{
                  background: running ? '#21262d' : '#238636',
                  border: `1px solid ${running ? '#30363d' : '#2ea043'}`,
                  color: running ? '#8b949e' : '#fff',
                  padding: '5px 16px', borderRadius: 6, cursor: running ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}>
                {running ? (
                  <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Running...</>
                ) : (
                  <>▶ Run Code</>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Editor
              height="100%"
              language={selectedLang.monacoLang}
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={(editor) => { editorRef.current = editor; editor.focus(); }}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                bracketPairColorization: { enabled: true },
                padding: { top: 16, bottom: 16 },
                renderWhitespace: 'none',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                tabSize: 4,
                wordWrap: 'on',
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                lineDecorationsWidth: 8,
                renderLineHighlight: 'all',
                scrollbar: { vertical: 'auto', horizontal: 'auto', verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
              }}
            />
          </div>

          {/* Bottom: Stdin + Output */}
          <div style={{ height: 200, flexShrink: 0, borderTop: '1px solid #30363d', display: 'flex' }}>
            {/* Stdin */}
            <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '6px 12px', borderBottom: '1px solid #30363d', fontSize: '0.72rem', color: '#8b949e', fontWeight: 600, background: '#161b22' }}>
                📥 Custom Input
              </div>
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder={'Enter test input...\n\nExample:\n5\n1 2 3 4 5'}
                style={{
                  flex: 1, background: '#0d1117', border: 'none', padding: '10px 12px',
                  color: '#c9d1d9', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem',
                  resize: 'none', outline: 'none', lineHeight: 1.7,
                }}
              />
            </div>

            {/* Output */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '6px 12px', borderBottom: '1px solid #30363d', fontSize: '0.72rem', color: '#8b949e', fontWeight: 600, background: '#161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📤 Output</span>
                  {outputStatus === 'success' && !running && (
                    <span style={{ color: '#56d364', fontWeight: 700, fontSize: '0.7rem' }}>✓ Accepted</span>
                  )}
                  {outputStatus === 'error' && !running && (
                    <span style={{ color: '#f85149', fontWeight: 700, fontSize: '0.7rem' }}>✗ Error</span>
                  )}
                  {execTime && !running && (
                    <span style={{ color: '#8b949e', fontSize: '0.68rem' }}>⏱ {execTime}s</span>
                  )}
                </div>
                <button onClick={() => { setOutput(''); setOutputStatus(null); setExecTime(null); }}
                  style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.72rem' }}>
                  Clear
                </button>
              </div>
              <div style={{
                flex: 1, overflowY: 'auto', padding: '10px 14px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem',
                color: outputStatus === 'error' ? '#f85149' : outputStatus === 'success' ? '#c9d1d9' : '#8b949e',
                lineHeight: 1.8, whiteSpace: 'pre-wrap',
                background: '#0d1117',
              }}>
                {running ? (
                  <span style={{ color: '#f0883e' }}>⟳ Executing your code...</span>
                ) : output || (
                  <span style={{ color: '#484f58' }}>// Click ▶ Run Code or press Ctrl+Enter to execute</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </ProtectedLayout>
  );
}
