export const nptelTests = [
  {
    id: 'nptel-daa-1',
    title: 'NPTEL Assignment 1: DAA - Recurrence Relations & Dynamic Programming',
    course: 'Design and Analysis of Algorithms (DAA)',
    durationMinutes: 45,
    totalMarks: 30,
    instructions: [
      'Write step-by-step derivations for algorithm complexities.',
      'For Dynamic Programming questions, explicitly specify: (a) State Definition, (b) Recurrence Relation, and (c) Base Cases.',
      'Show trace calculations where requested.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'descriptive',
        marks: 10,
        topic: 'Recurrence Relations & Master Theorem',
        questionText: `Analyze the following recurrence relation using Master Theorem:
T(n) = 3T(n/4) + n log n

(a) Identify a, b, and f(n).
(b) Calculate n^(log_b a).
(c) Compare f(n) with n^(log_b a) and state which Case of Master Theorem applies.
(d) Derive the tight asymptotic bound T(n).`,
        placeholder: 'Enter your step-by-step mathematical derivation here...',
        modelAnswer: `(a) a = 3, b = 4, f(n) = n log n.
(b) n^(log_b a) = n^(log_4 3) ≈ n^0.793.
(c) Compare f(n) = n log n with n^(log_4 3):
    Since f(n) = Ω(n^(log_4 3 + ε)) for ε ≈ 0.207, and regularity condition 3 * (n/4) log(n/4) <= c * n log n holds for c = 3/4 < 1.
(d) By Case 3 of Master Theorem: T(n) = Θ(n log n).`,
        rubric: [
          'Correct identification of a=3, b=4, f(n)=n log n (2 marks)',
          'Calculation of n^(log_4 3) ≈ n^0.793 (2 marks)',
          'Verification of Case 3 condition & regularity test (3 marks)',
          'Final bound T(n) = Θ(n log n) (3 marks)'
        ]
      },
      {
        id: 'q2',
        type: 'descriptive',
        marks: 10,
        topic: 'Dynamic Programming - 0/1 Knapsack State Derivation',
        questionText: `Consider a 0/1 Knapsack problem with items having weights W = [2, 3, 4, 5] and values V = [3, 4, 5, 6], with total capacity C = 5.

(a) Define the 2D DP state table entry DP[i][w].
(b) Write the state transition equation for DP[i][w].
(c) Construct and show the full 2D DP matrix for i = 0..4 and w = 0..5.
(d) State the maximum achievable profit and list the selected items.`,
        placeholder: 'Show state formulation, transition equation, and final DP matrix trace...',
        modelAnswer: `(a) DP[i][w] = Maximum value achievable using a subset of first i items with capacity w.
(b) Transition Equation:
    If w[i] > w: DP[i][w] = DP[i-1][w]
    Else: DP[i][w] = max(DP[i-1][w], V[i-1] + DP[i-1][w - W[i-1]])

(c) DP Table:
    w: 0  1  2  3  4  5
i=0: 0  0  0  0  0  0
i=1: 0  0  3  3  3  3  (W1=2, V1=3)
i=2: 0  0  3  4  4  7  (W2=3, V2=4)
i=3: 0  0  3  4  5  7  (W3=4, V3=5)
i=4: 0  0  3  4  5  7  (W4=5, V4=6)

(d) Max Profit = 7 (Items selected: Item 1 with W=2, V=3 and Item 2 with W=3, V=4).`,
        rubric: [
          'Correct state definition and transition formula (3 marks)',
          'Accurate 2D DP table construction (4 marks)',
          'Correct max profit = 7 and selected items traceback (3 marks)'
        ]
      },
      {
        id: 'q3',
        type: 'descriptive',
        marks: 10,
        topic: 'Greedy Strategy vs Dynamic Programming',
        questionText: `Explain why the Greedy choice property fails for the 0/1 Knapsack Problem, but works for the Fractional Knapsack Problem. Provide a counterexample illustrating why taking the maximum value-to-weight ratio item first leads to a sub-optimal solution in 0/1 Knapsack.`,
        placeholder: 'Explain greedy choice failure and provide a clear counterexample...',
        modelAnswer: `In Fractional Knapsack, items can be divided, ensuring capacity is fully utilized by taking items in decreasing order of value-to-weight ratio (v_i / w_i).

In 0/1 Knapsack, items cannot be broken. A greedy choice based on ratio may leave empty unused capacity, missing a combination of larger total value.

Counterexample:
Capacity C = 50.
Item 1: W1 = 10, V1 = 60 (Ratio = 6)
Item 2: W2 = 20, V2 = 100 (Ratio = 5)
Item 3: W3 = 30, V3 = 120 (Ratio = 4)

Greedy Strategy takes Item 1 (W=10, V=60) then Item 2 (W=20, V=100) -> Total Weight = 30, Total Value = 160. Remaining capacity = 20 (cannot take Item 3).
Optimal Solution: Take Item 2 and Item 3 -> Total Weight = 50, Total Value = 220.
Since 220 > 160, Greedy choice fails for 0/1 Knapsack.`,
        rubric: [
          'Explanation of fractional divisibility vs 0/1 constraint (4 marks)',
          'Clear counterexample with weights, values, and ratios (3 marks)',
          'Proof that Greedy yields sub-optimal 160 vs optimal 220 (3 marks)'
        ]
      }
    ]
  },
  {
    id: 'nptel-dsa-2',
    title: 'NPTEL Assignment 2: DSA - Graph Algorithms & Binary Search Trees',
    course: 'Data Structures & Algorithms (DSA)',
    durationMinutes: 45,
    totalMarks: 30,
    instructions: [
      'Provide clear step-by-step graph traversal traces.',
      'Show node-by-node state changes for tree manipulations.',
      'State time and space complexities for each algorithm variant.'
    ],
    questions: [
      {
        id: 'q1_dsa',
        type: 'descriptive',
        marks: 10,
        topic: 'Graph Algorithms - Dijkstra Shortest Path Trace',
        questionText: `Trace Dijkstra's Algorithm on a directed graph starting from source node A.
Graph Edges with weights:
A -> B (4), A -> C (2)
B -> C (1), B -> D (5)
C -> B (1), C -> D (8), C -> E (10)
D -> E (2)
E -> D (5)

(a) Show the initial distance array dist[] and priority queue.
(b) Step-by-step node extraction and distance array updates for each iteration.
(c) Final shortest path distances from node A to all other nodes.`,
        placeholder: 'List iteration steps, extracted node, relaxed edges, and updated distance array...',
        modelAnswer: `(a) Initial State:
    dist = [A:0, B:∞, C:∞, D:∞, E:∞], PQ = {(0, A)}

(b) Iteration 1: Extract A (dist 0)
    Relax A->B(4): dist[B] = 4
    Relax A->C(2): dist[C] = 2
    PQ = {(2, C), (4, B)}

    Iteration 2: Extract C (dist 2)
    Relax C->B(2+1=3 < 4): update dist[B] = 3
    Relax C->D(2+8=10): dist[D] = 10
    Relax C->E(2+10=12): dist[E] = 12
    PQ = {(3, B), (10, D), (12, E)}

    Iteration 3: Extract B (dist 3)
    Relax B->D(3+5=8 < 10): update dist[D] = 8
    PQ = {(8, D), (12, E)}

    Iteration 4: Extract D (dist 8)
    Relax D->E(8+2=10 < 12): update dist[E] = 10
    PQ = {(10, E)}

    Iteration 5: Extract E (dist 10)

(c) Final Distances:
    dist[A] = 0, dist[B] = 3, dist[C] = 2, dist[D] = 8, dist[E] = 10.`,
        rubric: [
          'Correct initial distance array and priority queue setup (2 marks)',
          'Accurate step-by-step edge relaxation & distance updates (6 marks)',
          'Correct final shortest paths dist = [0, 3, 2, 8, 10] (2 marks)'
        ]
      },
      {
        id: 'q2_dsa',
        type: 'descriptive',
        marks: 10,
        topic: 'AVL Trees - Self Balancing Rotations Trace',
        questionText: `Consider an empty AVL Tree. Insert the following key sequence one by one:
[30, 20, 10, 25, 40, 50]

(a) Draw or describe the tree state after each insertion.
(b) Identify every step where an imbalance occurs, specifying the node where balance factor becomes invalid (>1 or <-1).
(c) State the exact type of rotation applied (LL, RR, LR, RL) to restore balance.`,
        placeholder: 'Describe insertions step-by-step with imbalance nodes and rotation types...',
        modelAnswer: `(a) Insert 30, then 20, then 10:
    Tree before balance: 30(BF=2) -> Left child 20 -> Left child 10.
    Imbalance at Node 30 (BF = +2). Left-Left case.
    Action: Right Rotation at Node 30.
    Result after RR: Root = 20, Left = 10, Right = 30.

(b) Insert 25:
    Root 20 -> Right child 30 -> Left child 25.
    Balanced! (BF of 20 is -1, 30 is +1).

(c) Insert 40:
    Root 20 -> Right 30 -> Right 40.
    Balanced!

(d) Insert 50:
    30(BF=-2) -> Right 40 -> Right 50.
    Imbalance at Node 30 (BF = -2). Right-Right case.
    Action: Left Rotation at Node 30.
    Result after Left Rotation:
    Root = 20
    Left = 10
    Right = 40 (Left=30, Right=50).`,
        rubric: [
          'Correct initial insertion of 30, 20, 10 and LL rotation identification (4 marks)',
          'Insertion of 25, 40 tree structure (2 marks)',
          'Insertion of 50 and RR rotation at node 30 (4 marks)'
        ]
      }
    ]
  }
];
