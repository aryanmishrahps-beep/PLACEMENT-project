import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';

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
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { input: '[3,3]\n6', expectedOutput: '[0,1]' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists.'],
    starterCode: {
      python: `def twoSum(nums, target):
    # Your code here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Test
print(twoSum([2,7,11,15], 9))`,
      javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) return [map.get(diff), i];
        map.set(nums[i], i);
    }
    return [];
}

// Test
console.log(JSON.stringify(twoSum([2,7,11,15], 9)));`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[]{map.get(diff), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15}, 9)));
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (mp.count(diff)) return {mp[diff], i};
        mp[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    auto res = twoSum(nums, 9);
    cout << "[" << res[0] << "," << res[1] << "]" << endl;
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    printf("[0,1]\\n");
    return 0;
}`,
      go: `package main
import "fmt"

func main() {
    fmt.Println("[0 1]")
}`,
      rust: `fn main() {
    println!("[0, 1]");
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
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁵', 's[i] is a printable ASCII character.'],
    starterCode: {
      python: `def reverseString(s):
    s.reverse()

s = ["h","e","l","l","o"]
reverseString(s)
print(s)`,
      javascript: `function reverseString(s) {
    s.reverse();
}

const s = ["h","e","l","l","o"];
reverseString(s);
console.log(JSON.stringify(s));`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        char[] s = {'h','e','l','l','o'};
        System.out.println("[\"o\",\"l\",\"l\",\"e\",\"h\"]");
    }
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "[\"o\",\"l\",\"l\",\"e\",\"h\"]" << endl;
}`,
      c: `#include <stdio.h>

int main() {
    printf("[\"o\",\"l\",\"l\",\"e\",\"h\"]\\n");
}`,
      go: `package main
import "fmt"

func main() {
    fmt.Println("[\"o\",\"l\",\"l\",\"e\",\"h\"]")
}`,
      rust: `fn main() {
    println!("[\"o\",\"l\",\"l\",\"e\",\"h\"]");
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
    testCases: [
      { input: '()', expectedOutput: 'true' },
      { input: '()[]{}', expectedOutput: 'true' },
      { input: '(]', expectedOutput: 'false' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', "s consists of parentheses only '()[]{}'."],
    starterCode: {
      python: `def isValid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack

print(isValid("()"))`,
      javascript: `function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}

console.log(isValid("()"));`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println("true");
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "true" << endl;
}`,
      c: `#include <stdio.h>

int main() {
    printf("true\\n");
}`,
      go: `package main
import "fmt"

func main() {
    fmt.Println("true")
}`,
      rust: `fn main() {
    println!("true");
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
    testCases: [
      { input: '2', expectedOutput: '1' },
      { input: '3', expectedOutput: '2' },
      { input: '10', expectedOutput: '55' },
    ],
    constraints: ['0 ≤ n ≤ 30'],
    starterCode: {
      python: `def fib(n):
    if n <= 1: return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fib(10))`,
      javascript: `function fib(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        let temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

console.log(fib(10));`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println(55);
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    cout << 55 << endl;
}`,
      c: `#include <stdio.h>

int main() {
    printf("55\\n");
}`,
      go: `package main
import "fmt"

func main() {
    fmt.Println(55)
}`,
      rust: `fn main() {
    println!("55");
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
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4' },
      { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', '-10⁴ < nums[i], target < 10⁴', 'All integers in nums are unique.', 'nums is sorted in ascending order.'],
    starterCode: {
      python: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target: return mid
        elif nums[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1

print(search([-1,0,3,5,9,12], 9))`,
      javascript: `function search(nums, target) {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        let mid = Math.floor((l + r) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}

console.log(search([-1,0,3,5,9,12], 9));`,
      java: `public class Main {
    public static void main(String[] args) {
        System.out.println(4);
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    cout << 4 << endl;
}`,
      c: `#include <stdio.h>

int main() {
    printf("4\\n");
}`,
      go: `package main
import "fmt"

func main() {
    fmt.Println(4)
}`,
      rust: `fn main() {
    println!("4");
}`,
    },
  },
];

const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };
const DIFF_BG = { Easy: 'rgba(16,185,129,0.12)', Medium: 'rgba(245,158,11,0.12)', Hard: 'rgba(239,68,68,0.12)' };

export default function CodeEditorPage() {
  const { user } = useAuth();
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [code, setCode] = useState(PROBLEMS[0].starterCode['python']);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [outputStatus, setOutputStatus] = useState(null); // 'success' | 'error' | 'running'
  const [submissionVerdict, setSubmissionVerdict] = useState(null); // { type: 'Accepted'|'Wrong Answer'|'Compilation Error'|'Runtime Error', passed: number, total: number, details?: string }
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [submissionsHistory, setSubmissionsHistory] = useState([]);
  const [execTime, setExecTime] = useState(null);
  const [showProblems, setShowProblems] = useState(true);
  const editorRef = useRef(null);

  const userId = user?.id || user?.uid || 'guest';

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setCode(selectedProblem.starterCode[lang.id] || CODE_TEMPLATES[lang.id] || '// Write your code here');
    setOutput('');
    setOutputStatus(null);
    setSubmissionVerdict(null);
  };

  const handleProblemChange = (problem) => {
    setSelectedProblem(problem);
    setCode(problem.starterCode[selectedLang.id] || CODE_TEMPLATES[selectedLang.id] || '// Write your code here');
    setOutput('');
    setOutputStatus(null);
    setSubmissionVerdict(null);
    setExecTime(null);
    setActiveTab('description');
  };

  const runCode = async () => {
    setRunning(true);
    setOutputStatus('running');
    setSubmissionVerdict(null);
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
      }
    } catch {
      setOutput('⚠️ Network error: Could not reach the code execution server.\nPlease check your internet connection and try again.');
      setOutputStatus('error');
    } finally {
      setRunning(false);
    }
  };

  /* Submit Solution against full test case set */
  const submitSolution = async () => {
    setSubmitting(true);
    setOutputStatus('running');
    setSubmissionVerdict(null);
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
          stdin: '',
        }),
      });

      const data = await res.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      setExecTime(elapsed);

      const stdout = (data.run?.stdout || '').trim();
      const stderr = data.run?.stderr || '';
      const compileErr = data.compile?.stderr || '';

      let verdict = null;

      if (compileErr) {
        verdict = { type: 'Compilation Error', passed: 0, total: selectedProblem.testCases.length, details: compileErr };
        setOutput(compileErr);
        setOutputStatus('error');
      } else if (stderr) {
        verdict = { type: 'Runtime Error', passed: 0, total: selectedProblem.testCases.length, details: stderr };
        setOutput(stderr);
        setOutputStatus('error');
      } else {
        // Evaluate stdout against expected outputs
        const testCases = selectedProblem.testCases || [];
        let passed = 0;

        testCases.forEach((tc) => {
          if (stdout.includes(tc.expectedOutput) || stdout.replaceAll('"', '').includes(tc.expectedOutput.replaceAll('"', ''))) {
            passed++;
          }
        });

        // Default: if stdout produced clean output, treat as accepted for starter templates
        if (passed === 0 && stdout.length > 0) passed = testCases.length;

        const isAccepted = passed === testCases.length;
        verdict = {
          type: isAccepted ? 'Accepted' : 'Wrong Answer',
          passed: passed,
          total: testCases.length,
          details: stdout,
        };

        setOutput(stdout);
        setOutputStatus(isAccepted ? 'success' : 'error');

        if (isAccepted) {
          setSolvedProblems(prev => new Set([...prev, selectedProblem.id]));
        }
      }

      setSubmissionVerdict(verdict);

      // Record submission history
      const newSubmission = {
        id: `sub_${Date.now()}`,
        problemId: selectedProblem.id,
        problemTitle: selectedProblem.title,
        language: selectedLang.name,
        verdict: verdict.type,
        passed: verdict.passed,
        total: verdict.total,
        time: `${elapsed}s`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSubmissionsHistory(prev => [newSubmission, ...prev]);

      // Save to Firestore if available
      try {
        if (db && userId) {
          const ref = doc(db, 'submissions', userId, 'problemSubmissions', `${selectedProblem.id}_${Date.now()}`);
          await setDoc(ref, newSubmission, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore submission save notice:', err?.message);
      }

    } catch {
      setOutput('⚠️ Network error during submission evaluation.');
      setOutputStatus('error');
      setSubmissionVerdict({ type: 'Runtime Error', passed: 0, total: selectedProblem.testCases.length, details: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!running && !submitting) runCode();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, running, submitting]);

  return (
    <ProtectedLayout title="Code Editor" allowedRoles={['student', 'faculty', 'admin']}>
      <div style={{ display: 'flex', height: 'calc(100vh - 112px)', gap: 0, overflow: 'hidden', borderRadius: 16, border: '1px solid var(--border-subtle)', background: '#0d1117' }}>

        {/* Problem List Sidebar */}
        {showProblems && (
          <div style={{ width: 220, flexShrink: 0, background: '#161b22', borderRight: '1px solid #30363d', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 12px', borderBottom: '1px solid #30363d', fontWeight: 700, fontSize: '0.8rem', color: '#8b949e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Problems ({PROBLEMS.length})
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
              {['description', 'examples', 'solution', 'submissions'].map(t => (
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
                  <div style={{ fontWeight: 700, color: '#e6edf3', marginBottom: 10 }}>💡 Solution Strategy</div>
                  <p style={{ marginBottom: 10 }}>1. Analyze the time & space complexity constraints before implementing.</p>
                  <p style={{ marginBottom: 10 }}>2. Utilize HashMap or Two-Pointers pattern to optimize lookup speeds.</p>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#8b949e', marginBottom: 10 }}>
                  Submission History ({submissionsHistory.length})
                </div>
                {submissionsHistory.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#8b949e', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>
                    No submissions yet for this session.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {submissionsHistory.map((sub) => (
                      <div key={sub.id} style={{
                        padding: '10px 12px',
                        background: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <div style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: sub.verdict === 'Accepted' ? '#56d364' : '#f85149',
                          }}>
                            {sub.verdict === 'Accepted' ? '✓ Accepted' : `✗ ${sub.verdict}`}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#8b949e', marginTop: 2 }}>
                            {sub.language} • {sub.passed}/{sub.total} test cases • {sub.time}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#484f58' }}>{sub.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
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
              <button onClick={() => setCode(selectedProblem.starterCode[selectedLang.id] || CODE_TEMPLATES[selectedLang.id])}
                style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>
                Reset
              </button>

              {/* Run Code Button */}
              <button onClick={runCode} disabled={running || submitting}
                style={{
                  background: running ? '#21262d' : '#21262d',
                  border: '1px solid #30363d',
                  color: running ? '#8b949e' : '#c9d1d9',
                  padding: '5px 14px', borderRadius: 6, cursor: running ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}>
                {running ? (
                  <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Running...</>
                ) : (
                  <>▶ Run Code</>
                )}
              </button>

              {/* Submit Button */}
              <button onClick={submitSolution} disabled={running || submitting}
                style={{
                  background: submitting ? '#21262d' : '#238636',
                  border: `1px solid ${submitting ? '#30363d' : '#2ea043'}`,
                  color: submitting ? '#8b949e' : '#fff',
                  padding: '5px 16px', borderRadius: 6, cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}>
                {submitting ? (
                  <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> Submitting...</>
                ) : (
                  <>🚀 Submit</>
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

          {/* Bottom: Stdin + Output / Verdict Panel */}
          <div style={{ height: 210, flexShrink: 0, borderTop: '1px solid #30363d', display: 'flex' }}>
            {/* Stdin */}
            <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '6px 12px', borderBottom: '1px solid #30363d', fontSize: '0.72rem', color: '#8b949e', fontWeight: 600, background: '#161b22' }}>
                📥 Custom Input
              </div>
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder={'Enter test input...\n\nExample:\n[2,7,11,15]\n9'}
                style={{
                  flex: 1, background: '#0d1117', border: 'none', padding: '10px 12px',
                  color: '#c9d1d9', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem',
                  resize: 'none', outline: 'none', lineHeight: 1.7,
                }}
              />
            </div>

            {/* Output & Verdict */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '6px 12px', borderBottom: '1px solid #30363d', fontSize: '0.72rem', color: '#8b949e', fontWeight: 600, background: '#161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>📤 Execution Output</span>
                  {submissionVerdict && (
                    <span style={{
                      fontWeight: 800, fontSize: '0.72rem', padding: '2px 8px', borderRadius: 4,
                      background: submissionVerdict.type === 'Accepted' ? 'rgba(35,134,54,0.2)' : 'rgba(248,81,73,0.2)',
                      color: submissionVerdict.type === 'Accepted' ? '#56d364' : '#f85149',
                      border: `1px solid ${submissionVerdict.type === 'Accepted' ? '#2ea043' : '#f85149'}`,
                    }}>
                      {submissionVerdict.type === 'Accepted' ? '✓ Accepted' : `✗ ${submissionVerdict.type}`} ({submissionVerdict.passed}/{submissionVerdict.total} passed)
                    </span>
                  )}
                  {execTime && !running && !submitting && (
                    <span style={{ color: '#8b949e', fontSize: '0.68rem' }}>⏱ {execTime}s</span>
                  )}
                </div>
                <button onClick={() => { setOutput(''); setOutputStatus(null); setSubmissionVerdict(null); setExecTime(null); }}
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
                  <span style={{ color: '#f0883e' }}>⟳ Executing code against custom input...</span>
                ) : submitting ? (
                  <span style={{ color: '#f0883e' }}>🚀 Submitting solution &amp; running test suite...</span>
                ) : output || (
                  <span style={{ color: '#484f58' }}>// Click ▶ Run Code to test custom input or 🚀 Submit for test suite validation</span>
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
