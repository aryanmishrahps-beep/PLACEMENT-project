// Static seed data for demo mode (no backend needed)
export const MODULES = [
  { id: 'dsa', label: 'Data Structures & Algorithms', icon: '🧮', category: 'technical', color: '#6366f1', desc: 'Arrays, Trees, Graphs, DP, Sorting & Searching' },
  { id: 'dbms', label: 'Database Management Systems', icon: '🗄️', category: 'technical', color: '#8b5cf6', desc: 'SQL, Normalization, Transactions, Indexing' },
  { id: 'os', label: 'Operating Systems', icon: '⚙️', category: 'technical', color: '#a855f7', desc: 'Processes, Memory Management, Scheduling' },
  { id: 'cn', label: 'Computer Networks', icon: '🌐', category: 'technical', color: '#06b6d4', desc: 'OSI Model, TCP/IP, HTTP, DNS, Security' },
  { id: 'oop', label: 'Object-Oriented Programming', icon: '🏗️', category: 'technical', color: '#3b82f6', desc: 'SOLID Principles, Design Patterns, Inheritance' },
  { id: 'aptitude', label: 'Aptitude & Reasoning', icon: '🧠', category: 'professional', color: '#f59e0b', desc: 'Quantitative, Logical & Verbal Reasoning' },
  { id: 'interview', label: 'Interview Preparation', icon: '🎤', category: 'professional', color: '#10b981', desc: 'HR Rounds, STAR Method, Mock Interviews' },
  { id: 'company_track', label: 'Company-Specific Tracks', icon: '🏢', category: 'professional', color: '#ef4444', desc: 'TCS, Infosys, Wipro, Amazon, Google' },
  { id: 'fullstack', label: 'Full Stack Web Dev', icon: '💻', category: 'project', color: '#6366f1', desc: 'React, Node.js, Databases, REST APIs' },
  { id: 'ai_ml', label: 'AI & Machine Learning', icon: '🤖', category: 'project', color: '#8b5cf6', desc: 'Python, Scikit-learn, TensorFlow, Deep Learning' },
  { id: 'cloud', label: 'Cloud & Cyber Security', icon: '☁️', category: 'project', color: '#06b6d4', desc: 'AWS, GCP, Docker, Security Fundamentals' },
  { id: 'mobile', label: 'Mobile & IoT', icon: '📱', category: 'project', color: '#10b981', desc: 'React Native, Flutter, IoT Protocols' },
];

export const COMPANY_TRACKS = [
  { id: 'tcs', name: 'TCS', logo: '🔷', color: '#003366' },
  { id: 'infosys', name: 'Infosys', logo: '🔵', color: '#007CC2' },
  { id: 'wipro', name: 'Wipro', logo: '🟣', color: '#6B2D8B' },
  { id: 'amazon', name: 'Amazon', logo: '📦', color: '#FF9900' },
  { id: 'google', name: 'Google', logo: '🌈', color: '#4285F4' },
  { id: 'microsoft', name: 'Microsoft', logo: '🪟', color: '#00A4EF' },
];

export const SAMPLE_BADGES = [
  { id: 1, name: 'First Step', description: 'Completed your first lesson', icon: '🎯', earned: true },
  { id: 2, name: 'Quiz Champion', description: 'Scored 90%+ on any quiz', icon: '🏆', earned: true },
  { id: 3, name: 'Week Warrior', description: '7-day coding streak', icon: '🔥', earned: false },
  { id: 4, name: 'DSA Master', description: 'Completed DSA module', icon: '💻', earned: false },
  { id: 5, name: 'Speed Coder', description: 'Finished a test in under 10 min', icon: '⚡', earned: true },
  { id: 6, name: 'Aptitude Ace', description: 'Scored 100% on aptitude test', icon: '🧠', earned: false },
];

export const SAMPLE_MCQ = [
  {
    id: 1,
    question_text: 'What is the time complexity of binary search?',
    type: 'mcq',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correct_answer: 'O(log n)',
    explanation: 'Binary search halves the search space each time, giving O(log n) complexity.',
    marks: 1,
  },
  {
    id: 2,
    question_text: 'Which data structure uses LIFO principle?',
    type: 'mcq',
    options: ['Queue', 'Array', 'Stack', 'Linked List'],
    correct_answer: 'Stack',
    explanation: 'A Stack follows Last-In-First-Out (LIFO) — the last element pushed is the first to be popped.',
    marks: 1,
  },
  {
    id: 3,
    question_text: 'What does SQL stand for?',
    type: 'mcq',
    options: ['Structured Query Language', 'Simple Query Language', 'Sequential Query Logic', 'Standard Query Listing'],
    correct_answer: 'Structured Query Language',
    explanation: 'SQL stands for Structured Query Language, used to manage relational databases.',
    marks: 1,
  },
  {
    id: 4,
    question_text: 'Which of the following is NOT a feature of OOP?',
    type: 'mcq',
    options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'],
    correct_answer: 'Compilation',
    explanation: 'OOP features are Encapsulation, Polymorphism, Inheritance, and Abstraction. Compilation is not an OOP concept.',
    marks: 1,
  },
  {
    id: 5,
    question_text: 'Which OSI layer handles routing?',
    type: 'mcq',
    options: ['Data Link', 'Network', 'Transport', 'Session'],
    correct_answer: 'Network',
    explanation: 'The Network Layer (Layer 3) handles logical addressing and routing between networks.',
    marks: 1,
  },
];

export const LANGUAGES = [
  { id: 71, name: 'Python 3', ext: 'py' },
  { id: 62, name: 'Java', ext: 'java' },
  { id: 63, name: 'JavaScript', ext: 'js' },
  { id: 54, name: 'C++', ext: 'cpp' },
  { id: 50, name: 'C', ext: 'c' },
];

export const CODE_TEMPLATES = {
  71: `# Python Solution\ndef solution(n):\n    # Write your code here\n    pass\n\nprint(solution(5))`,
  62: `// Java Solution\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
  63: `// JavaScript Solution\nfunction solution(n) {\n    // Write your code here\n}\n\nconsole.log(solution(5));`,
  54: `// C++ Solution\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  50: `// C Solution\n#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
};
