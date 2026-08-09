import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProtectedLayout from '../../components/layout/ProtectedLayout';

const COURSE_CONTENT = {
  dsa: {
    label: 'Data Structures & Algorithms',
    icon: '🧮',
    color: '#6366f1',
    desc: 'Master the core DSA concepts required for top product company interviews.',
    duration: '40 hrs',
    topics: 12,
    enrolled: 2840,
    progress: 35,
    sections: [
      {
        title: 'Arrays & Strings',
        lessons: [
          { id: 1, title: 'Introduction to Arrays', duration: '12 min', type: 'video', done: true },
          { id: 2, title: 'Two Pointer Technique', duration: '18 min', type: 'video', done: true },
          { id: 3, title: 'Sliding Window Pattern', duration: '20 min', type: 'video', done: false },
          { id: 4, title: 'Practice: Array Problems', duration: '30 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Linked Lists',
        lessons: [
          { id: 5, title: 'Singly & Doubly Linked List', duration: '15 min', type: 'video', done: false },
          { id: 6, title: 'Cycle Detection (Floyd\'s Algorithm)', duration: '22 min', type: 'video', done: false },
          { id: 7, title: 'Reverse a Linked List', duration: '14 min', type: 'video', done: false },
          { id: 8, title: 'Practice: LinkedList Problems', duration: '25 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Trees & Graphs',
        lessons: [
          { id: 9, title: 'Binary Trees & BST', duration: '20 min', type: 'video', done: false },
          { id: 10, title: 'Tree Traversals (BFS, DFS)', duration: '18 min', type: 'video', done: false },
          { id: 11, title: 'Graph Representation', duration: '16 min', type: 'video', done: false },
          { id: 12, title: 'Dijkstra & BFS Shortest Path', duration: '25 min', type: 'video', done: false },
          { id: 13, title: 'Practice: Tree & Graph Problems', duration: '40 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Dynamic Programming',
        lessons: [
          { id: 14, title: 'What is DP? Memoization vs Tabulation', duration: '20 min', type: 'video', done: false },
          { id: 15, title: 'Fibonacci, Climbing Stairs', duration: '15 min', type: 'video', done: false },
          { id: 16, title: 'Knapsack Problem', duration: '22 min', type: 'video', done: false },
          { id: 17, title: 'Longest Common Subsequence', duration: '18 min', type: 'video', done: false },
          { id: 18, title: 'Practice: DP Problems', duration: '45 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1, exp: 'Binary search halves the search space each time → O(log n).' },
      { q: 'Which data structure uses LIFO principle?', options: ['Queue', 'Array', 'Stack', 'LinkedList'], ans: 2, exp: 'Stack follows Last-In-First-Out (LIFO).' },
      { q: 'Best case complexity of Quick Sort?', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], ans: 1, exp: 'Quick Sort best case is O(n log n) with good pivot selection.' },
      { q: 'A complete binary tree with n nodes has height?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], ans: 1, exp: 'Height of a complete binary tree = O(log n).' },
      { q: 'Which traversal visits root first?', options: ['Inorder', 'Postorder', 'Preorder', 'Level order'], ans: 2, exp: 'Preorder: Root → Left → Right.' },
    ],
  },
  dbms: {
    label: 'Database Management Systems',
    icon: '🗄️',
    color: '#8b5cf6',
    desc: 'Deep dive into relational databases, SQL, transactions, and system design concepts.',
    duration: '30 hrs',
    topics: 10,
    enrolled: 1970,
    progress: 60,
    sections: [
      {
        title: 'Fundamentals of DBMS',
        lessons: [
          { id: 1, title: 'What is DBMS? RDBMS vs NoSQL', duration: '15 min', type: 'video', done: true },
          { id: 2, title: 'ER Diagram & Schema Design', duration: '20 min', type: 'video', done: true },
          { id: 3, title: 'Keys: Primary, Foreign, Candidate, Super', duration: '12 min', type: 'video', done: true },
          { id: 4, title: 'Practice: DBMS Basics MCQ', duration: '20 min', type: 'quiz', done: true },
        ],
      },
      {
        title: 'SQL Mastery',
        lessons: [
          { id: 5, title: 'SELECT, WHERE, ORDER BY, GROUP BY', duration: '18 min', type: 'video', done: true },
          { id: 6, title: 'JOINs: INNER, LEFT, RIGHT, FULL', duration: '25 min', type: 'video', done: false },
          { id: 7, title: 'Subqueries & Views', duration: '20 min', type: 'video', done: false },
          { id: 8, title: 'Stored Procedures & Triggers', duration: '22 min', type: 'video', done: false },
          { id: 9, title: 'SQL Practice Problems', duration: '40 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Normalization & Transactions',
        lessons: [
          { id: 10, title: '1NF, 2NF, 3NF, BCNF', duration: '20 min', type: 'video', done: false },
          { id: 11, title: 'ACID Properties', duration: '15 min', type: 'video', done: false },
          { id: 12, title: 'Concurrency Control & Locking', duration: '18 min', type: 'video', done: false },
          { id: 13, title: 'Indexing & Query Optimization', duration: '22 min', type: 'video', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'What does ACID stand for?', options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Index, Data', 'Array, Class, Index, Delete', 'None'], ans: 0, exp: 'ACID = Atomicity, Consistency, Isolation, Durability.' },
      { q: 'Which normal form removes partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], ans: 1, exp: '2NF removes partial dependencies on primary key.' },
      { q: 'What is a foreign key?', options: ['Primary key of same table', 'Key referencing primary key of another table', 'Any unique column', 'Encrypted key'], ans: 1, exp: 'A foreign key references the primary key in another table.' },
      { q: 'Which JOIN returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], ans: 3, exp: 'FULL OUTER JOIN returns all records from both tables.' },
      { q: 'What is an Index in DBMS?', options: ['Duplicate of a table', 'Data structure for fast lookup', 'A foreign key constraint', 'A type of join'], ans: 1, exp: 'Index is a data structure that speeds up query retrieval.' },
    ],
  },
  os: {
    label: 'Operating Systems',
    icon: '⚙️',
    color: '#a855f7',
    desc: 'Understand how operating systems manage resources, processes, and memory.',
    duration: '28 hrs',
    topics: 9,
    enrolled: 1430,
    progress: 20,
    sections: [
      {
        title: 'Process Management',
        lessons: [
          { id: 1, title: 'Process vs Thread', duration: '14 min', type: 'video', done: true },
          { id: 2, title: 'Process States & PCB', duration: '16 min', type: 'video', done: false },
          { id: 3, title: 'CPU Scheduling: FCFS, SJF, Round Robin', duration: '25 min', type: 'video', done: false },
          { id: 4, title: 'Deadlocks: Detection & Prevention', duration: '20 min', type: 'video', done: false },
          { id: 5, title: 'Practice: Process Scheduling MCQ', duration: '25 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Memory Management',
        lessons: [
          { id: 6, title: 'Paging & Segmentation', duration: '18 min', type: 'video', done: false },
          { id: 7, title: 'Virtual Memory & Page Replacement', duration: '22 min', type: 'video', done: false },
          { id: 8, title: 'Thrashing & Working Set Model', duration: '15 min', type: 'video', done: false },
          { id: 9, title: 'Practice: Memory Management MCQ', duration: '20 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'File Systems & I/O',
        lessons: [
          { id: 10, title: 'File Allocation Methods', duration: '16 min', type: 'video', done: false },
          { id: 11, title: 'Disk Scheduling: SSTF, SCAN', duration: '18 min', type: 'video', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'What is a deadlock?', options: ['Infinite loop', 'State where processes wait for each other forever', 'Memory overflow', 'CPU idle state'], ans: 1, exp: 'A deadlock is when processes are waiting on each other in a cycle.' },
      { q: 'Which scheduling is non-preemptive?', options: ['Round Robin', 'SJF (Non-preemptive)', 'SRTF', 'Multilevel Queue'], ans: 1, exp: 'Non-preemptive SJF runs a process to completion once started.' },
      { q: 'What is a TLB in OS?', options: ['Translation Lookaside Buffer', 'Thread Level Barrier', 'Task Load Balancer', 'Temporary Log Buffer'], ans: 0, exp: 'TLB is a cache for page table entries, speeding up virtual address translation.' },
      { q: 'Banker\'s Algorithm is used for?', options: ['CPU Scheduling', 'Deadlock Avoidance', 'Page Replacement', 'Memory Allocation'], ans: 1, exp: 'Banker\'s Algorithm avoids deadlock by checking safe states.' },
      { q: 'LRU stands for?', options: ['Last Recently Used', 'Least Recently Used', 'Longest Running Unit', 'Low Resource Usage'], ans: 1, exp: 'LRU (Least Recently Used) replaces the page not used for the longest time.' },
    ],
  },
  cn: {
    label: 'Computer Networks',
    icon: '🌐',
    color: '#06b6d4',
    desc: 'Learn how data travels across networks: from OSI model to TCP/IP protocols.',
    duration: '25 hrs',
    topics: 8,
    enrolled: 2110,
    progress: 45,
    sections: [
      {
        title: 'Network Fundamentals',
        lessons: [
          { id: 1, title: 'OSI Model - 7 Layers Explained', duration: '20 min', type: 'video', done: true },
          { id: 2, title: 'TCP/IP Protocol Suite', duration: '18 min', type: 'video', done: true },
          { id: 3, title: 'IP Addressing & Subnetting (CIDR)', duration: '25 min', type: 'video', done: false },
          { id: 4, title: 'Practice: Network Basics MCQ', duration: '20 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Application Layer Protocols',
        lessons: [
          { id: 5, title: 'HTTP vs HTTPS, REST APIs', duration: '15 min', type: 'video', done: true },
          { id: 6, title: 'DNS, DHCP, FTP, SMTP', duration: '18 min', type: 'video', done: false },
          { id: 7, title: 'WebSockets & Real-time Communication', duration: '16 min', type: 'video', done: false },
        ],
      },
      {
        title: 'Transport & Network Security',
        lessons: [
          { id: 8, title: 'TCP vs UDP - When to use what?', duration: '15 min', type: 'video', done: false },
          { id: 9, title: 'Firewalls, VPNs, and Encryption', duration: '20 min', type: 'video', done: false },
          { id: 10, title: 'Practice: CN Full Test', duration: '30 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'Which layer handles routing in OSI?', options: ['Data Link', 'Network', 'Transport', 'Session'], ans: 1, exp: 'Network Layer (Layer 3) handles logical addressing and routing.' },
      { q: 'TCP is?', options: ['Connectionless', 'Connection-oriented', 'Both', 'Neither'], ans: 1, exp: 'TCP is connection-oriented — it establishes a connection before sending data.' },
      { q: 'What does DNS resolve?', options: ['IP to MAC', 'Domain name to IP', 'IP to Port', 'URL to HTML'], ans: 1, exp: 'DNS resolves human-readable domain names to IP addresses.' },
      { q: 'HTTPS uses which port by default?', options: ['80', '21', '443', '8080'], ans: 2, exp: 'HTTPS uses port 443, HTTP uses port 80.' },
      { q: 'Which protocol is used to assign IP addresses?', options: ['DNS', 'FTP', 'DHCP', 'ARP'], ans: 2, exp: 'DHCP automatically assigns IP addresses to devices on a network.' },
    ],
  },
  oop: {
    label: 'Object-Oriented Programming',
    icon: '🏗️',
    color: '#3b82f6',
    desc: 'Master OOP principles, design patterns, and SOLID principles for clean code.',
    duration: '22 hrs',
    topics: 7,
    enrolled: 980,
    progress: 70,
    sections: [
      {
        title: 'OOP Core Pillars',
        lessons: [
          { id: 1, title: 'Classes, Objects & Constructors', duration: '14 min', type: 'video', done: true },
          { id: 2, title: 'Encapsulation & Data Hiding', duration: '16 min', type: 'video', done: true },
          { id: 3, title: 'Inheritance & Method Overriding', duration: '18 min', type: 'video', done: true },
          { id: 4, title: 'Polymorphism: Overloading vs Overriding', duration: '20 min', type: 'video', done: true },
          { id: 5, title: 'Abstraction & Interfaces', duration: '16 min', type: 'video', done: false },
          { id: 6, title: 'Practice: OOP MCQ', duration: '20 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'SOLID Principles',
        lessons: [
          { id: 7, title: 'Single Responsibility Principle', duration: '12 min', type: 'video', done: false },
          { id: 8, title: 'Open/Closed Principle', duration: '12 min', type: 'video', done: false },
          { id: 9, title: 'Liskov, Interface Segregation, Dependency Inversion', duration: '18 min', type: 'video', done: false },
        ],
      },
      {
        title: 'Design Patterns',
        lessons: [
          { id: 10, title: 'Singleton & Factory Pattern', duration: '18 min', type: 'video', done: false },
          { id: 11, title: 'Observer & Strategy Pattern', duration: '20 min', type: 'video', done: false },
          { id: 12, title: 'Practice: Design Patterns Quiz', duration: '25 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'Which OOP concept allows same method name, different implementations?', options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'], ans: 2, exp: 'Polymorphism allows one interface to be used for different types.' },
      { q: 'What does "private" access modifier mean?', options: ['Accessible everywhere', 'Only within same class', 'Only subclasses', 'Only same package'], ans: 1, exp: 'Private restricts access to within the same class only.' },
      { q: 'Which principle: "Open for extension, closed for modification"?', options: ['SRP', 'OCP', 'LSP', 'DIP'], ans: 1, exp: 'Open/Closed Principle: classes should be open for extension but closed for modification.' },
      { q: 'What is an abstract class?', options: ['Cannot be instantiated', 'Has no methods', 'Is always final', 'Has only static methods'], ans: 0, exp: 'Abstract classes cannot be instantiated and may have abstract methods.' },
      { q: 'Design pattern: only one instance of a class exists?', options: ['Factory', 'Observer', 'Singleton', 'Proxy'], ans: 2, exp: 'Singleton pattern ensures only one instance of a class is created.' },
    ],
  },
  aptitude: {
    label: 'Aptitude & Reasoning',
    icon: '🧠',
    color: '#f59e0b',
    desc: 'Ace the aptitude rounds in placement exams with speed and accuracy.',
    duration: '20 hrs',
    topics: 8,
    enrolled: 3200,
    progress: 25,
    sections: [
      {
        title: 'Quantitative Aptitude',
        lessons: [
          { id: 1, title: 'Number System & HCF/LCM', duration: '20 min', type: 'video', done: true },
          { id: 2, title: 'Percentages, Profit & Loss', duration: '18 min', type: 'video', done: false },
          { id: 3, title: 'Time, Speed & Distance', duration: '22 min', type: 'video', done: false },
          { id: 4, title: 'Permutations & Combinations', duration: '25 min', type: 'video', done: false },
          { id: 5, title: 'Practice: Quant Test', duration: '30 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Logical Reasoning',
        lessons: [
          { id: 6, title: 'Blood Relations & Directions', duration: '15 min', type: 'video', done: false },
          { id: 7, title: 'Syllogisms & Coding-Decoding', duration: '18 min', type: 'video', done: false },
          { id: 8, title: 'Seating Arrangement & Puzzles', duration: '22 min', type: 'video', done: false },
          { id: 9, title: 'Practice: Logical Reasoning Test', duration: '25 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Verbal Ability',
        lessons: [
          { id: 10, title: 'Reading Comprehension Strategies', duration: '16 min', type: 'video', done: false },
          { id: 11, title: 'Grammar & Vocabulary Essentials', duration: '20 min', type: 'video', done: false },
          { id: 12, title: 'Practice: Verbal Ability Test', duration: '20 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'A train 200m long passes a pole in 10 sec. Speed?', options: ['15 m/s', '18 m/s', '20 m/s', '25 m/s'], ans: 2, exp: 'Speed = Distance/Time = 200/10 = 20 m/s.' },
      { q: 'If 20% of X = 40, find X.', options: ['100', '160', '200', '240'], ans: 2, exp: '0.2 × X = 40 → X = 200.' },
      { q: 'Which number completes: 2, 6, 12, 20, ?', options: ['28', '30', '32', '36'], ans: 1, exp: 'Pattern: n×(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30.' },
      { q: 'A can do work in 10 days, B in 15. Together?', options: ['5 days', '6 days', '8 days', '12 days'], ans: 1, exp: '1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. So 6 days.' },
      { q: 'All dogs are animals. Some animals are cats. Which conclusion is valid?', options: ['All cats are dogs', 'Some dogs are cats', 'No conclusion', 'All animals are dogs'], ans: 2, exp: 'We cannot conclude a direct relation between dogs and cats from these statements.' },
    ],
  },
  interview: {
    label: 'Interview Preparation',
    icon: '🎤',
    color: '#10b981',
    desc: 'Crack HR rounds, technical interviews, and system design discussions.',
    duration: '18 hrs',
    topics: 6,
    enrolled: 4100,
    progress: 15,
    sections: [
      {
        title: 'HR Interview',
        lessons: [
          { id: 1, title: 'Tell Me About Yourself - Framework', duration: '10 min', type: 'video', done: true },
          { id: 2, title: 'STAR Method for Behavioral Questions', duration: '14 min', type: 'video', done: false },
          { id: 3, title: 'Common HR Questions & Answers', duration: '20 min', type: 'video', done: false },
          { id: 4, title: 'Salary Negotiation Tips', duration: '12 min', type: 'video', done: false },
        ],
      },
      {
        title: 'Technical Interview',
        lessons: [
          { id: 5, title: 'How to Approach Coding Problems (Live)', duration: '25 min', type: 'video', done: false },
          { id: 6, title: 'System Design Basics: URL Shortener, Chat App', duration: '30 min', type: 'video', done: false },
          { id: 7, title: 'Explaining Projects on Resume', duration: '15 min', type: 'video', done: false },
          { id: 8, title: 'Mock Technical Interview (Simulated)', duration: '45 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Group Discussion & Soft Skills',
        lessons: [
          { id: 9, title: 'GD Techniques: How to Lead & Contribute', duration: '18 min', type: 'video', done: false },
          { id: 10, title: 'Body Language & Confidence Building', duration: '16 min', type: 'video', done: false },
          { id: 11, title: 'Mock GD Session', duration: '30 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'STAR method stands for?', options: ['Situation, Task, Action, Result', 'Subject, Time, Action, Review', 'Strategy, Target, Analysis, Result', 'None'], ans: 0, exp: 'STAR = Situation, Task, Action, Result — used for behavioral interview answers.' },
      { q: 'Best way to handle "What is your weakness?"', options: ['Say you have none', 'Mention a real weakness + how you\'re improving it', 'Say you work too hard', 'Refuse to answer'], ans: 1, exp: 'Interviewers want to see self-awareness and a growth mindset.' },
      { q: 'System design: Which component handles millions of requests?', options: ['Single server', 'Load Balancer', 'Database', 'Cache'], ans: 1, exp: 'Load Balancers distribute traffic across multiple servers.' },
      { q: 'In a GD, you should?', options: ['Talk continuously', 'Interrupt others when they\'re wrong', 'Listen actively and contribute with substance', 'Wait for the moderator to pick you'], ans: 2, exp: 'Good GD participants are assertive yet respectful, and add value to the discussion.' },
      { q: 'What is the best posture in an interview?', options: ['Slouch to look relaxed', 'Sit upright, maintain eye contact', 'Fold arms to show confidence', 'Look at the desk while answering'], ans: 1, exp: 'Upright posture and eye contact show confidence and attentiveness.' },
    ],
  },
  fullstack: {
    label: 'Full Stack Web Dev',
    icon: '💻',
    color: '#6366f1',
    desc: 'Build production-grade full-stack web apps with React, Node.js & databases.',
    duration: '50 hrs',
    topics: 14,
    enrolled: 1560,
    progress: 40,
    sections: [
      {
        title: 'Frontend with React',
        lessons: [
          { id: 1, title: 'React Fundamentals: JSX, Props, State', duration: '25 min', type: 'video', done: true },
          { id: 2, title: 'useEffect, useState, Custom Hooks', duration: '20 min', type: 'video', done: true },
          { id: 3, title: 'React Router & Navigation', duration: '18 min', type: 'video', done: true },
          { id: 4, title: 'State Management with Context API / Redux', duration: '25 min', type: 'video', done: false },
        ],
      },
      {
        title: 'Backend with Node.js & Express',
        lessons: [
          { id: 5, title: 'Express.js: Routes, Middleware, REST APIs', duration: '25 min', type: 'video', done: false },
          { id: 6, title: 'Authentication: JWT & Sessions', duration: '22 min', type: 'video', done: false },
          { id: 7, title: 'File Uploads with Multer', duration: '15 min', type: 'video', done: false },
        ],
      },
      {
        title: 'Databases & Deployment',
        lessons: [
          { id: 8, title: 'MongoDB / PostgreSQL Integration', duration: '20 min', type: 'video', done: false },
          { id: 9, title: 'Deploying to Render, Netlify, Vercel', duration: '18 min', type: 'video', done: false },
          { id: 10, title: 'CI/CD Basics with GitHub Actions', duration: '20 min', type: 'video', done: false },
          { id: 11, title: 'Capstone Project: Build a Full Stack App', duration: '90 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'What is the virtual DOM in React?', options: ['A browser API', 'A lightweight copy of the real DOM for efficient updates', 'A CSS framework', 'A database'], ans: 1, exp: 'React\'s virtual DOM compares changes and only updates what\'s necessary in the real DOM.' },
      { q: 'REST stands for?', options: ['Relational Entity State Transfer', 'Representational State Transfer', 'Remote Execution Standard Technology', 'None'], ans: 1, exp: 'REST = Representational State Transfer — an architectural style for APIs.' },
      { q: 'JWT is used for?', options: ['Encrypting databases', 'Authentication & Authorization', 'CSS animations', 'File compression'], ans: 1, exp: 'JSON Web Tokens are used to securely transmit user identity and claims.' },
      { q: 'npm stands for?', options: ['Node Package Manager', 'New Programming Method', 'Network Protocol Manager', 'None'], ans: 0, exp: 'npm = Node Package Manager — used to install JavaScript packages.' },
      { q: 'Which HTTP method is used to update a resource?', options: ['GET', 'POST', 'PUT/PATCH', 'DELETE'], ans: 2, exp: 'PUT replaces entire resource; PATCH partially updates it.' },
    ],
  },
  ai_ml: {
    label: 'AI & Machine Learning',
    icon: '🤖',
    color: '#8b5cf6',
    desc: 'Understand machine learning concepts, algorithms, and Python libraries.',
    duration: '45 hrs',
    topics: 12,
    enrolled: 2240,
    progress: 10,
    sections: [
      {
        title: 'ML Foundations',
        lessons: [
          { id: 1, title: 'What is ML? Types: Supervised, Unsupervised, RL', duration: '18 min', type: 'video', done: true },
          { id: 2, title: 'Python for Data Science: NumPy, Pandas', duration: '25 min', type: 'video', done: false },
          { id: 3, title: 'Data Preprocessing & Feature Engineering', duration: '22 min', type: 'video', done: false },
        ],
      },
      {
        title: 'Core ML Algorithms',
        lessons: [
          { id: 4, title: 'Linear & Logistic Regression', duration: '20 min', type: 'video', done: false },
          { id: 5, title: 'Decision Trees & Random Forest', duration: '22 min', type: 'video', done: false },
          { id: 6, title: 'K-Means Clustering', duration: '18 min', type: 'video', done: false },
          { id: 7, title: 'Support Vector Machines (SVM)', duration: '20 min', type: 'video', done: false },
          { id: 8, title: 'Practice: ML Algorithm MCQ', duration: '25 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Deep Learning & NLP',
        lessons: [
          { id: 9, title: 'Neural Networks: Forward & Backpropagation', duration: '25 min', type: 'video', done: false },
          { id: 10, title: 'CNNs for Image Recognition', duration: '22 min', type: 'video', done: false },
          { id: 11, title: 'Intro to NLP: Transformers & BERT', duration: '20 min', type: 'video', done: false },
          { id: 12, title: 'Capstone: Build an ML Model', duration: '60 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'What is Overfitting?', options: ['Model performs well on test data', 'Model memorizes training data but fails on new data', 'Model is too simple', 'None'], ans: 1, exp: 'Overfitting: model is too complex and memorizes noise in training data.' },
      { q: 'Which algorithm is used for classification?', options: ['K-Means', 'Linear Regression', 'Logistic Regression', 'PCA'], ans: 2, exp: 'Logistic Regression outputs probabilities and is used for classification.' },
      { q: 'What does CNN stand for?', options: ['Convolutional Neural Network', 'Connected Node Network', 'Clustered Neuron Net', 'None'], ans: 0, exp: 'CNN = Convolutional Neural Network, used mainly for image tasks.' },
      { q: 'Gradient Descent is used to?', options: ['Increase model accuracy', 'Minimize the loss function', 'Increase training speed', 'Normalize data'], ans: 1, exp: 'Gradient Descent minimizes the loss function by adjusting weights iteratively.' },
      { q: 'Which library is used for ML in Python?', options: ['React', 'Scikit-learn', 'Express', 'Pandas only'], ans: 1, exp: 'Scikit-learn is the most popular Python library for traditional ML algorithms.' },
    ],
  },
  cloud: {
    label: 'Cloud & Cyber Security',
    icon: '☁️',
    color: '#06b6d4',
    desc: 'Learn cloud platforms, DevOps practices, and cybersecurity fundamentals.',
    duration: '35 hrs',
    topics: 10,
    enrolled: 1120,
    progress: 5,
    sections: [
      {
        title: 'Cloud Computing Basics',
        lessons: [
          { id: 1, title: 'IaaS, PaaS, SaaS Explained', duration: '16 min', type: 'video', done: true },
          { id: 2, title: 'AWS Core Services: EC2, S3, RDS, Lambda', duration: '25 min', type: 'video', done: false },
          { id: 3, title: 'GCP & Azure Overview', duration: '18 min', type: 'video', done: false },
          { id: 4, title: 'Practice: Cloud Basics MCQ', duration: '20 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'DevOps & Containers',
        lessons: [
          { id: 5, title: 'Docker: Containers & Dockerfiles', duration: '22 min', type: 'video', done: false },
          { id: 6, title: 'Kubernetes Fundamentals', duration: '25 min', type: 'video', done: false },
          { id: 7, title: 'CI/CD Pipeline Setup', duration: '20 min', type: 'video', done: false },
        ],
      },
      {
        title: 'Cybersecurity',
        lessons: [
          { id: 8, title: 'OWASP Top 10 Vulnerabilities', duration: '22 min', type: 'video', done: false },
          { id: 9, title: 'Encryption: SSL/TLS, AES, RSA', duration: '18 min', type: 'video', done: false },
          { id: 10, title: 'Ethical Hacking & Penetration Testing Intro', duration: '20 min', type: 'video', done: false },
          { id: 11, title: 'Practice: Security MCQ', duration: '25 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'What is IaaS?', options: ['Internet as a Service', 'Infrastructure as a Service', 'Integration as a Service', 'None'], ans: 1, exp: 'IaaS provides virtualized computing infrastructure over the internet (e.g., AWS EC2).' },
      { q: 'Docker is used for?', options: ['Database management', 'Containerization', 'UI design', 'Machine learning'], ans: 1, exp: 'Docker packages applications and their dependencies into portable containers.' },
      { q: 'SQL Injection is?', options: ['A database backup technique', 'An attack inserting malicious SQL code', 'A query optimizer', 'A security protocol'], ans: 1, exp: 'SQL Injection inserts malicious SQL commands through input fields to manipulate databases.' },
      { q: 'HTTPS ensures?', options: ['Faster loading', 'Encrypted communication', 'Better SEO only', 'Caching'], ans: 1, exp: 'HTTPS uses SSL/TLS to encrypt data between browser and server.' },
      { q: 'What is a VPN?', options: ['Virtual Private Network', 'Virtual Processing Node', 'Variable Protocol Network', 'None'], ans: 0, exp: 'VPN creates an encrypted tunnel for secure internet communication.' },
    ],
  },
  mobile: {
    label: 'Mobile & IoT',
    icon: '📱',
    color: '#10b981',
    desc: 'Build mobile applications with React Native & Flutter, and explore IoT.',
    duration: '30 hrs',
    topics: 8,
    enrolled: 870,
    progress: 0,
    sections: [
      {
        title: 'React Native',
        lessons: [
          { id: 1, title: 'React Native Setup & First App', duration: '20 min', type: 'video', done: false },
          { id: 2, title: 'Core Components: View, Text, ScrollView', duration: '18 min', type: 'video', done: false },
          { id: 3, title: 'Navigation with React Navigation', duration: '22 min', type: 'video', done: false },
          { id: 4, title: 'API Integration in Mobile Apps', duration: '20 min', type: 'video', done: false },
        ],
      },
      {
        title: 'Flutter Basics',
        lessons: [
          { id: 5, title: 'Flutter & Dart: Language Basics', duration: '22 min', type: 'video', done: false },
          { id: 6, title: 'Widgets: Stateful vs Stateless', duration: '18 min', type: 'video', done: false },
          { id: 7, title: 'Building a To-Do App in Flutter', duration: '35 min', type: 'video', done: false },
        ],
      },
      {
        title: 'IoT Fundamentals',
        lessons: [
          { id: 8, title: 'What is IoT? Use Cases & Architecture', duration: '16 min', type: 'video', done: false },
          { id: 9, title: 'MQTT Protocol & Sensors', duration: '20 min', type: 'video', done: false },
          { id: 10, title: 'Raspberry Pi / Arduino Integration', duration: '25 min', type: 'video', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'React Native is?', options: ['A web framework', 'A cross-platform mobile framework', 'A CSS library', 'A testing tool'], ans: 1, exp: 'React Native allows building native iOS and Android apps using JavaScript and React.' },
      { q: 'Flutter uses which language?', options: ['JavaScript', 'Kotlin', 'Dart', 'Swift'], ans: 2, exp: 'Flutter uses Dart, a language created by Google.' },
      { q: 'MQTT is a protocol used in?', options: ['Web development', 'IoT communication', 'Database queries', 'Video streaming'], ans: 1, exp: 'MQTT is a lightweight messaging protocol commonly used in IoT devices.' },
      { q: 'StatefulWidget in Flutter?', options: ['Has no state', 'Can rebuild UI on state change', 'Is only for animations', 'Cannot receive props'], ans: 1, exp: 'StatefulWidget holds mutable state and can trigger UI rebuilds via setState().' },
      { q: 'What is APK?', options: ['Apple Package Kit', 'Android Package Kit', 'Application Protocol Key', 'None'], ans: 1, exp: 'APK = Android Package Kit — the file format used to distribute Android apps.' },
    ],
  },
  company_track: {
    label: 'Company-Specific Tracks',
    icon: '🏢',
    color: '#ef4444',
    desc: 'Targeted preparation for top companies: TCS, Infosys, Amazon, Google and more.',
    duration: '35 hrs',
    topics: 6,
    enrolled: 5600,
    progress: 0,
    sections: [
      {
        title: 'TCS & Infosys Track',
        lessons: [
          { id: 1, title: 'TCS NQT: Exam Pattern & Strategy', duration: '18 min', type: 'video', done: false },
          { id: 2, title: 'Infosys InfyTQ: Coding + Aptitude', duration: '20 min', type: 'video', done: false },
          { id: 3, title: 'Practice: TCS Mock Test', duration: '45 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Amazon & Flipkart Track',
        lessons: [
          { id: 4, title: 'Amazon Leadership Principles (LP)', duration: '20 min', type: 'video', done: false },
          { id: 5, title: 'Amazon OA: Coding Patterns', duration: '30 min', type: 'video', done: false },
          { id: 6, title: 'Flipkart Interview: DSA + System Design', duration: '25 min', type: 'video', done: false },
          { id: 7, title: 'Practice: FAANG Style Mock Test', duration: '60 min', type: 'quiz', done: false },
        ],
      },
      {
        title: 'Google & Microsoft Track',
        lessons: [
          { id: 8, title: 'Google Interview Process Explained', duration: '15 min', type: 'video', done: false },
          { id: 9, title: 'System Design for Google Scale', duration: '35 min', type: 'video', done: false },
          { id: 10, title: 'Microsoft: OOP + Behavioral Questions', duration: '22 min', type: 'video', done: false },
          { id: 11, title: 'Full Mock: Google/Microsoft Style', duration: '60 min', type: 'quiz', done: false },
        ],
      },
    ],
    mcq: [
      { q: 'Amazon Leadership Principle: "Customer Obsession" means?', options: ['Focus only on profit', 'Start with the customer and work backwards', 'Please only senior management', 'None'], ans: 1, exp: 'Amazon\'s Customer Obsession LP means prioritizing customer needs above everything else.' },
      { q: 'TCS NQT primarily tests?', options: ['Only coding', 'Aptitude + English + Coding', 'Personality only', 'Group Discussion'], ans: 1, exp: 'TCS NQT tests Aptitude, English Communication, and Coding skills.' },
      { q: 'In Google interviews, what is most important?', options: ['Knowing every algorithm', 'Problem-solving approach & communication', 'Speed only', 'Knowing Google products'], ans: 1, exp: 'Google values how you think and communicate your approach, not just the final answer.' },
      { q: 'System Design interview tests?', options: ['Syntax knowledge', 'Ability to design scalable systems', 'Memory of data structures', 'Speed of coding'], ans: 1, exp: 'System Design assesses your ability to architect large-scale distributed systems.' },
      { q: 'STAR method is used in?', options: ['Technical rounds', 'Aptitude tests', 'Behavioral/HR interviews', 'Coding contests'], ans: 2, exp: 'STAR (Situation, Task, Action, Result) is a framework for answering behavioral interview questions.' },
    ],
  },
};

const FALLBACK = {
  label: 'Course Module',
  icon: '📚',
  color: '#6366f1',
  desc: 'Learn and grow with this module.',
  duration: '20 hrs',
  topics: 6,
  enrolled: 500,
  progress: 0,
  sections: [],
  mcq: [],
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = COURSE_CONTENT[courseId] || FALLBACK;

  const [activeTab, setActiveTab] = useState('content');
  const [openSection, setOpenSection] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(() => {
    const initial = {};
    (COURSE_CONTENT[courseId]?.sections || []).forEach(sec => {
      sec.lessons.forEach(l => { if (l.done) initial[l.id] = true; });
    });
    return initial;
  });
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const totalLessons = course.sections.reduce((a, s) => a + s.lessons.length, 0);
  const doneLessons = Object.keys(completedLessons).length;
  const progress = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const showToast = (msg, color = '#10b981') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const toggleLesson = (id) => {
    setCompletedLessons(prev => {
      const updated = { ...prev };
      if (updated[id]) { delete updated[id]; }
      else {
        updated[id] = true;
        showToast('✅ Lesson marked complete! +10 XP');
      }
      return updated;
    });
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const correct = course.mcq.filter((q, i) => quizAnswers[i] === q.ans).length;
    showToast(`Quiz done! ${correct}/${course.mcq.length} correct 🎯`, correct >= 4 ? '#10b981' : '#f59e0b');
  };

  const quizScore = course.mcq.filter((q, i) => quizAnswers[i] === q.ans).length;

  return (
    <ProtectedLayout title={course.label} allowedRoles={['student']}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      {/* Back button */}
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/student/courses')}>
        ← Back to Courses
      </button>

      {/* Hero */}
      <div className="card animate-fadeInUp" style={{ marginBottom: 24, background: `linear-gradient(135deg, ${course.color}22 0%, ${course.color}08 100%)`, borderColor: `${course.color}44` }}>
        <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
          <div style={{ fontSize: '4rem', filter: `drop-shadow(0 0 20px ${course.color}88)` }}>{course.icon}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>{course.label}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: '0.9rem' }}>{course.desc}</p>
            <div className="flex gap-md" style={{ flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>⏱ {course.duration}</span>
              <span>📋 {course.topics} Topics</span>
              <span>👥 {course.enrolled.toLocaleString()} Enrolled</span>
            </div>
          </div>
          <div style={{ minWidth: 140, textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: course.color }}>{progress}%</div>
            <div className="progress-bar-container" style={{ marginTop: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${course.color}, ${course.color}88)` }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{doneLessons}/{totalLessons} lessons done</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-sm" style={{ marginBottom: 20 }}>
        {['content', 'quiz', 'resources'].map(tab => (
          <button key={tab} className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab(tab); setQuizSubmitted(false); setQuizAnswers({}); setQuizActive(tab === 'quiz'); }}
            style={{ textTransform: 'capitalize' }}>
            {tab === 'content' ? '📚 Content' : tab === 'quiz' ? '📝 Practice Quiz' : '🔗 Resources'}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="animate-fadeInUp">
          {course.sections.map((sec, si) => (
            <div key={si} className="card" style={{ marginBottom: 12 }}>
              <div className="flex items-center justify-between" style={{ cursor: 'pointer', padding: '4px 0' }}
                onClick={() => setOpenSection(openSection === si ? -1 : si)}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{sec.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {sec.lessons.length} lessons · {sec.lessons.filter(l => completedLessons[l.id]).length} completed
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem', transition: 'transform 0.2s', transform: openSection === si ? 'rotate(90deg)' : '' }}>›</span>
              </div>

              {openSection === si && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  {sec.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-md"
                      style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                      onClick={() => toggleLesson(lesson.id)}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: completedLessons[lesson.id] ? '#10b981' : 'var(--bg-glass)',
                        border: `2px solid ${completedLessons[lesson.id] ? '#10b981' : 'var(--border-default)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                      }}>
                        {completedLessons[lesson.id] ? '✓' : lesson.type === 'quiz' ? '📝' : '▶'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem', color: completedLessons[lesson.id] ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: completedLessons[lesson.id] ? 'line-through' : 'none' }}>
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {lesson.type === 'quiz' ? '📝 Quiz · ' : '🎬 Video · '}{lesson.duration}
                        </div>
                      </div>
                      {completedLessons[lesson.id] && <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Done</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="animate-fadeInUp">
          {course.mcq.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📝</div>
              <div style={{ color: 'var(--text-muted)' }}>No quiz available for this module yet.</div>
            </div>
          ) : quizSubmitted ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '4rem', marginBottom: 12 }}>{quizScore >= 4 ? '🏆' : quizScore >= 3 ? '🎯' : '📚'}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: quizScore >= 4 ? '#10b981' : '#f59e0b', marginBottom: 8 }}>
                {quizScore}/{course.mcq.length} Correct
              </div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                {quizScore >= 4 ? 'Excellent! You mastered this topic.' : quizScore >= 3 ? 'Good effort! Review the explanations below.' : 'Keep practicing! Read the explanations carefully.'}
              </div>
              {course.mcq.map((q, i) => (
                <div key={i} className="card" style={{ textAlign: 'left', marginBottom: 12, borderColor: quizAnswers[i] === q.ans ? '#10b98155' : '#ef444455' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{i + 1}. {q.q}</div>
                  <div style={{ fontSize: '0.85rem', color: quizAnswers[i] === q.ans ? '#10b981' : '#ef4444', marginBottom: 6 }}>
                    {quizAnswers[i] === q.ans ? '✅ Correct' : `❌ Your answer: ${q.options[quizAnswers[i]] || 'Not answered'}`}
                  </div>
                  {quizAnswers[i] !== q.ans && (
                    <div style={{ fontSize: '0.82rem', color: '#10b981', marginBottom: 4 }}>✓ Correct: {q.options[q.ans]}</div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-glass)', borderRadius: 8, padding: '8px 12px' }}>
                    💡 {q.exp}
                  </div>
                </div>
              ))}
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
                Retake Quiz
              </button>
            </div>
          ) : (
            <div>
              <div className="card" style={{ marginBottom: 16, background: `${course.color}11`, borderColor: `${course.color}33` }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>📝 Practice Quiz: {course.label}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{course.mcq.length} questions · Select the best answer · Explanations provided after submission</div>
              </div>
              {course.mcq.map((q, i) => (
                <div key={i} className="card animate-fadeInUp" style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.95rem' }}>{i + 1}. {q.q}</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {q.options.map((opt, oi) => (
                      <button key={oi} onClick={() => setQuizAnswers(prev => ({ ...prev, [i]: oi }))}
                        style={{
                          padding: '10px 16px', borderRadius: 10, border: `2px solid ${quizAnswers[i] === oi ? course.color : 'var(--border-default)'}`,
                          background: quizAnswers[i] === oi ? `${course.color}22` : 'var(--bg-glass)',
                          color: quizAnswers[i] === oi ? course.color : 'var(--text-primary)',
                          textAlign: 'left', cursor: 'pointer', fontWeight: quizAnswers[i] === oi ? 700 : 400,
                          transition: 'all 0.15s',
                        }}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn btn-primary btn-lg w-full" style={{ marginTop: 8 }}
                onClick={handleQuizSubmit}
                disabled={Object.keys(quizAnswers).length < course.mcq.length}>
                {Object.keys(quizAnswers).length < course.mcq.length
                  ? `Answer all questions (${Object.keys(quizAnswers).length}/${course.mcq.length})`
                  : '✅ Submit Quiz'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="animate-fadeInUp">
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📌 Recommended Resources</h3>
            {[
              { title: 'Official Documentation', desc: 'Read the official docs for deeper understanding.', icon: '📄', link: '#' },
              { title: 'GeeksForGeeks Articles', desc: `Curated articles for ${course.label}`, icon: '🌐', link: 'https://www.geeksforgeeks.org/' },
              { title: 'YouTube Playlist', desc: 'Video lectures for visual learners.', icon: '▶️', link: 'https://www.youtube.com/' },
              { title: 'Cheatsheet PDF', desc: 'Quick reference for revision before interviews.', icon: '📋', link: '#' },
              { title: 'Practice on LeetCode', desc: 'Solve real problems asked in top companies.', icon: '💡', link: 'https://leetcode.com/' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-md" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '1.5rem', width: 40, textAlign: 'center' }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                </div>
                <a href={r.link} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Open →</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
