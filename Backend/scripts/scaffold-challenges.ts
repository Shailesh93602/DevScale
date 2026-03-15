#!/usr/bin/env tsx
/**
 * scaffold-challenges.ts
 * 
 * Creates folder skeletons for all planned challenges.
 * Each folder gets an empty meta.json template + placeholder files.
 * Run: npx tsx scripts/scaffold-challenges.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const CHALLENGES_DIR = path.resolve(__dirname, '../resources/challenges');

// ─── Planned challenges: [slug, title, difficulty, category] ─────────────────
const PLANNED: [string, string, 'Easy' | 'Medium' | 'Hard', string][] = [
  // Algorithms – Arrays
  ['best-time-to-buy-and-sell-stock',    'Best Time to Buy and Sell Stock',         'Easy',   'algorithms'],
  ['contains-duplicate',                  'Contains Duplicate',                       'Easy',   'algorithms'],
  ['product-of-array-except-self',        'Product of Array Except Self',             'Medium', 'algorithms'],
  ['maximum-subarray',                    'Maximum Subarray',                         'Medium', 'algorithms'],
  ['maximum-product-subarray',            'Maximum Product Subarray',                 'Medium', 'algorithms'],
  ['find-minimum-in-rotated-sorted-array','Find Minimum in Rotated Sorted Array',     'Medium', 'algorithms'],
  ['search-in-rotated-sorted-array',      'Search in Rotated Sorted Array',           'Medium', 'algorithms'],
  ['3sum',                                '3Sum',                                     'Medium', 'algorithms'],
  ['container-with-most-water',           'Container With Most Water',                'Medium', 'algorithms'],
  ['trapping-rain-water',                 'Trapping Rain Water',                      'Hard',   'algorithms'],
  ['sort-colors',                         'Sort Colors',                              'Medium', 'algorithms'],
  ['rotate-array',                        'Rotate Array',                             'Medium', 'algorithms'],
  ['spiral-matrix',                       'Spiral Matrix',                            'Medium', 'algorithms'],
  ['set-matrix-zeroes',                   'Set Matrix Zeroes',                        'Medium', 'algorithms'],
  ['search-a-2d-matrix',                  'Search a 2D Matrix',                       'Medium', 'algorithms'],
  ['rotate-image',                        'Rotate Image',                             'Medium', 'algorithms'],
  ['subarray-sum-equals-k',               'Subarray Sum Equals K',                    'Medium', 'algorithms'],
  ['longest-consecutive-sequence',        'Longest Consecutive Sequence',             'Medium', 'algorithms'],
  ['find-all-duplicates-in-array',        'Find All Duplicates in an Array',          'Medium', 'algorithms'],
  ['top-k-frequent-elements',             'Top K Frequent Elements',                  'Medium', 'algorithms'],
  // Algorithms – Two Pointers
  ['move-zeroes',                         'Move Zeroes',                              'Easy',   'algorithms'],
  ['squares-of-sorted-array',             'Squares of a Sorted Array',               'Easy',   'algorithms'],
  ['two-sum-ii-sorted-array',             'Two Sum II - Input Array Is Sorted',       'Medium', 'algorithms'],
  ['4sum',                                '4Sum',                                     'Medium', 'algorithms'],
  // Algorithms – Sliding Window
  ['minimum-window-substring',            'Minimum Window Substring',                 'Hard',   'algorithms'],
  ['sliding-window-maximum',              'Sliding Window Maximum',                   'Hard',   'algorithms'],
  ['longest-substring-without-repeating', 'Longest Substring Without Repeating Chars','Medium', 'algorithms'],
  ['permutation-in-string',               'Permutation in String',                    'Medium', 'algorithms'],
  ['fruit-into-baskets',                  'Fruit Into Baskets',                       'Medium', 'algorithms'],
  // Algorithms – Binary Search
  ['binary-search',                       'Binary Search',                            'Easy',   'algorithms'],
  ['first-bad-version',                   'First Bad Version',                        'Easy',   'algorithms'],
  ['search-insert-position',              'Search Insert Position',                   'Easy',   'algorithms'],
  ['koko-eating-bananas',                 'Koko Eating Bananas',                      'Medium', 'algorithms'],
  ['find-peak-element',                   'Find Peak Element',                        'Medium', 'algorithms'],
  ['median-of-two-sorted-arrays',         'Median of Two Sorted Arrays',              'Hard',   'algorithms'],
  // Algorithms – Greedy
  ['jump-game',                           'Jump Game',                                'Medium', 'algorithms'],
  ['jump-game-ii',                        'Jump Game II',                             'Medium', 'algorithms'],
  ['gas-station',                         'Gas Station',                              'Medium', 'algorithms'],
  ['task-scheduler',                      'Task Scheduler',                           'Medium', 'algorithms'],
  ['hand-of-straights',                   'Hand of Straights',                        'Medium', 'algorithms'],
  ['merge-intervals',                     'Merge Intervals',                          'Medium', 'algorithms'],
  ['non-overlapping-intervals',           'Non-overlapping Intervals',                'Medium', 'algorithms'],
  ['meeting-rooms-ii',                    'Meeting Rooms II',                         'Medium', 'algorithms'],
  // Algorithms – Dynamic Programming
  ['climbing-stairs',                     'Climbing Stairs',                          'Easy',   'algorithms'],
  ['house-robber',                        'House Robber',                             'Medium', 'algorithms'],
  ['house-robber-ii',                     'House Robber II',                          'Medium', 'algorithms'],
  ['coin-change',                         'Coin Change',                              'Medium', 'algorithms'],
  ['longest-increasing-subsequence',      'Longest Increasing Subsequence',           'Medium', 'algorithms'],
  ['longest-common-subsequence',          'Longest Common Subsequence',               'Medium', 'algorithms'],
  ['word-break',                          'Word Break',                               'Medium', 'algorithms'],
  ['combination-sum-iv',                  'Combination Sum IV',                       'Medium', 'algorithms'],
  ['unique-paths',                        'Unique Paths',                             'Medium', 'algorithms'],
  ['unique-paths-ii',                     'Unique Paths II',                          'Medium', 'algorithms'],
  ['decode-ways',                         'Decode Ways',                              'Medium', 'algorithms'],
  ['partition-equal-subset-sum',          'Partition Equal Subset Sum',               'Medium', 'algorithms'],
  ['target-sum',                          'Target Sum',                               'Medium', 'algorithms'],
  ['edit-distance',                       'Edit Distance',                            'Medium', 'algorithms'],
  ['interleaving-string',                 'Interleaving String',                      'Medium', 'algorithms'],
  ['burst-balloons',                      'Burst Balloons',                           'Hard',   'algorithms'],
  ['regular-expression-matching',         'Regular Expression Matching',              'Hard',   'algorithms'],
  // Algorithms – Backtracking
  ['permutations',                        'Permutations',                             'Medium', 'algorithms'],
  ['permutations-ii',                     'Permutations II',                          'Medium', 'algorithms'],
  ['combination-sum',                     'Combination Sum',                          'Medium', 'algorithms'],
  ['combination-sum-ii',                  'Combination Sum II',                       'Medium', 'algorithms'],
  ['subsets',                             'Subsets',                                  'Medium', 'algorithms'],
  ['subsets-ii',                          'Subsets II',                               'Medium', 'algorithms'],
  ['word-search',                         'Word Search',                              'Medium', 'algorithms'],
  ['n-queens',                            'N-Queens',                                 'Hard',   'algorithms'],
  ['sudoku-solver',                       'Sudoku Solver',                            'Hard',   'algorithms'],
  ['letter-combinations-of-phone-number', 'Letter Combinations of a Phone Number',    'Medium', 'algorithms'],
  ['palindrome-partitioning',             'Palindrome Partitioning',                  'Medium', 'algorithms'],
  // Algorithms – Graphs
  ['number-of-islands',                   'Number of Islands',                        'Medium', 'algorithms'],
  ['clone-graph',                         'Clone Graph',                              'Medium', 'algorithms'],
  ['pacific-atlantic-water-flow',         'Pacific Atlantic Water Flow',              'Medium', 'algorithms'],
  ['course-schedule',                     'Course Schedule',                          'Medium', 'algorithms'],
  ['course-schedule-ii',                  'Course Schedule II',                       'Medium', 'algorithms'],
  ['word-ladder',                         'Word Ladder',                              'Hard',   'algorithms'],
  ['network-delay-time',                  'Network Delay Time',                       'Medium', 'algorithms'],
  ['cheapest-flights-within-k-stops',     'Cheapest Flights Within K Stops',          'Medium', 'algorithms'],
  ['redundant-connection',                'Redundant Connection',                     'Medium', 'algorithms'],
  ['graph-valid-tree',                    'Graph Valid Tree',                         'Medium', 'algorithms'],
  ['number-of-connected-components',      'Number of Connected Components',           'Medium', 'algorithms'],
  ['alien-dictionary',                    'Alien Dictionary',                         'Hard',   'algorithms'],
  ['minimum-spanning-tree',               'Minimum Spanning Tree - Kruskal',          'Medium', 'algorithms'],
  ['swim-in-rising-water',                'Swim in Rising Water',                     'Hard',   'algorithms'],
  ['reconstruct-itinerary',               'Reconstruct Itinerary',                    'Hard',   'algorithms'],
  // Algorithms – Trees
  ['maximum-depth-of-binary-tree',        'Maximum Depth of Binary Tree',             'Easy',   'algorithms'],
  ['same-tree',                           'Same Tree',                                'Easy',   'algorithms'],
  ['symmetric-tree',                      'Symmetric Tree',                           'Easy',   'algorithms'],
  ['path-sum',                            'Path Sum',                                 'Easy',   'algorithms'],
  ['diameter-of-binary-tree',             'Diameter of Binary Tree',                  'Easy',   'algorithms'],
  ['balanced-binary-tree',                'Balanced Binary Tree',                     'Easy',   'algorithms'],
  ['invert-binary-tree',                  'Invert Binary Tree',                       'Easy',   'algorithms'],
  ['binary-tree-level-order-traversal',   'Binary Tree Level Order Traversal',        'Medium', 'algorithms'],
  ['binary-tree-right-side-view',         'Binary Tree Right Side View',              'Medium', 'algorithms'],
  ['count-good-nodes-in-binary-tree',     'Count Good Nodes in Binary Tree',          'Medium', 'algorithms'],
  ['lowest-common-ancestor',              'Lowest Common Ancestor of a Binary Tree',  'Medium', 'algorithms'],
  ['binary-tree-maximum-path-sum',        'Binary Tree Maximum Path Sum',             'Hard',   'algorithms'],
  ['serialize-deserialize-binary-tree',   'Serialize and Deserialize Binary Tree',    'Hard',   'algorithms'],
  ['flatten-binary-tree-to-linked-list',  'Flatten Binary Tree to Linked List',       'Medium', 'algorithms'],
  ['all-nodes-distance-k',                'All Nodes Distance K in Binary Tree',      'Medium', 'algorithms'],
  ['maximum-width-of-binary-tree',        'Maximum Width of Binary Tree',             'Medium', 'algorithms'],
  ['construct-binary-tree-from-preorder', 'Construct Binary Tree From Preorder and Inorder', 'Medium', 'algorithms'],
  // Algorithms – BST
  ['validate-bst',                        'Validate Binary Search Tree',              'Medium', 'algorithms'],
  ['kth-smallest-element-in-bst',         'Kth Smallest Element in BST',             'Medium', 'algorithms'],
  ['inorder-successor-in-bst',            'Inorder Successor in BST',                'Medium', 'algorithms'],
  ['insert-into-bst',                     'Insert into a Binary Search Tree',         'Medium', 'algorithms'],
  ['delete-node-in-bst',                  'Delete Node in a BST',                     'Medium', 'algorithms'],
  ['convert-sorted-array-to-bst',         'Convert Sorted Array to Binary Search Tree','Easy',  'algorithms'],
  // Algorithms – Heaps
  ['find-median-from-data-stream',        'Find Median from Data Stream',             'Hard',   'algorithms'],
  ['kth-largest-element-in-stream',       'Kth Largest Element in a Stream',          'Easy',   'algorithms'],
  ['kth-largest-element-in-array',        'Kth Largest Element in an Array',          'Medium', 'algorithms'],
  ['find-k-pairs-with-smallest-sums',     'Find K Pairs with Smallest Sums',          'Medium', 'algorithms'],
  ['kth-smallest-in-sorted-matrix',       'Kth Smallest Element in a Sorted Matrix',  'Medium', 'algorithms'],
  ['minimum-cost-to-connect-sticks',      'Minimum Cost to Connect Sticks',           'Medium', 'algorithms'],
  // Algorithms – Linked Lists
  ['reverse-linked-list',                 'Reverse Linked List',                      'Easy',   'algorithms'],
  ['merge-two-sorted-lists',              'Merge Two Sorted Lists',                   'Easy',   'algorithms'],
  ['linked-list-cycle',                   'Linked List Cycle',                        'Easy',   'algorithms'],
  ['intersection-of-two-linked-lists',    'Intersection of Two Linked Lists',         'Easy',   'algorithms'],
  ['remove-nth-node-from-end',            'Remove Nth Node From End of List',         'Medium', 'algorithms'],
  ['add-two-numbers',                     'Add Two Numbers',                          'Medium', 'algorithms'],
  ['reorder-list',                        'Reorder List',                             'Medium', 'algorithms'],
  ['copy-list-with-random-pointer',       'Copy List with Random Pointer',            'Medium', 'algorithms'],
  ['sort-list',                           'Sort List',                                'Medium', 'algorithms'],
  ['find-the-duplicate-number',           'Find the Duplicate Number',                'Medium', 'algorithms'],
  ['reverse-linked-list-ii',              'Reverse Linked List II',                   'Medium', 'algorithms'],
  ['odd-even-linked-list',                'Odd Even Linked List',                     'Medium', 'algorithms'],
  ['merge-k-sorted-lists',                'Merge k Sorted Lists',                     'Hard',   'algorithms'],
  // Algorithms – Stack & Queue
  ['min-stack',                           'Min Stack',                                'Medium', 'algorithms'],
  ['evaluate-reverse-polish-notation',    'Evaluate Reverse Polish Notation',         'Medium', 'algorithms'],
  ['daily-temperatures',                  'Daily Temperatures',                       'Medium', 'algorithms'],
  ['car-fleet',                           'Car Fleet',                                'Medium', 'algorithms'],
  ['largest-rectangle-in-histogram',      'Largest Rectangle in Histogram',           'Hard',   'algorithms'],
  ['maximum-frequency-stack',             'Maximum Frequency Stack',                  'Hard',   'algorithms'],
  ['sliding-window-maximum-queue',        'Sliding Window Maximum - Monotonic Queue', 'Hard',   'algorithms'],
  // Design
  ['lru-cache',                           'LRU Cache',                                'Medium', 'algorithms'],
  ['lfu-cache',                           'LFU Cache',                                'Hard',   'algorithms'],
  ['insert-delete-get-random',            'Insert Delete GetRandom O(1)',             'Medium', 'algorithms'],
  ['time-based-key-value-store',          'Time Based Key-Value Store',               'Medium', 'algorithms'],
  ['design-twitter',                      'Design Twitter',                           'Medium', 'algorithms'],
  // Data Structures
  ['implement-trie',                      'Implement Trie (Prefix Tree)',             'Medium', 'data_structures'],
  ['design-add-search-words',             'Design Add and Search Words',              'Medium', 'data_structures'],
  ['implement-queue-using-stacks',        'Implement Queue using Stacks',             'Easy',   'data_structures'],
  ['implement-stack-using-queues',        'Implement Stack using Queues',             'Easy',   'data_structures'],
  ['design-circular-queue',              'Design Circular Queue',                    'Medium', 'data_structures'],
  ['range-sum-query-mutable',             'Range Sum Query - Mutable (BIT)',          'Medium', 'data_structures'],
  ['range-minimum-query',                 'Range Minimum Query (Sparse Table)',        'Medium', 'data_structures'],
  ['lca-binary-lifting',                  'LCA using Binary Lifting',                 'Hard',   'data_structures'],
  ['segment-tree-range-sum',             'Segment Tree - Range Sum Update',          'Hard',   'data_structures'],
  ['disjoint-set-union',                 'Disjoint Set Union (Union-Find)',           'Medium', 'data_structures'],
  // Strings
  ['valid-anagram',                       'Valid Anagram',                            'Easy',   'strings'],
  ['group-anagrams',                      'Group Anagrams',                           'Medium', 'strings'],
  ['longest-palindromic-substring',       'Longest Palindromic Substring',            'Medium', 'strings'],
  ['palindromic-substrings',              'Palindromic Substrings',                   'Medium', 'strings'],
  ['valid-palindrome',                    'Valid Palindrome',                         'Easy',   'strings'],
  ['reverse-words-in-a-string',           'Reverse Words in a String',               'Medium', 'strings'],
  ['string-to-integer-atoi',              'String to Integer (atoi)',                 'Medium', 'strings'],
  ['implement-strstr',                    'Implement strStr()',                        'Easy',   'strings'],
  ['longest-valid-parentheses',          'Longest Valid Parentheses',                'Hard',   'strings'],
  ['wildcard-matching',                   'Wildcard Matching',                        'Hard',   'strings'],
  ['roman-to-integer',                    'Roman to Integer',                         'Easy',   'strings'],
  ['integer-to-roman',                    'Integer to Roman',                         'Medium', 'strings'],
  ['zigzag-conversion',                   'Zigzag Conversion',                        'Medium', 'strings'],
  ['encode-decode-strings',               'Encode and Decode Strings',               'Medium', 'strings'],
  ['count-and-say',                       'Count and Say',                            'Medium', 'strings'],
  ['minimum-window-substring-str',        'Minimum Window Substring',                 'Hard',   'strings'],
  ['word-pattern',                        'Word Pattern',                             'Easy',   'strings'],
  ['repeated-dna-sequences',              'Repeated DNA Sequences',                   'Medium', 'strings'],
  ['longest-repeating-char-replacement',  'Longest Repeating Character Replacement',  'Medium', 'strings'],
  ['find-all-anagrams-in-string',         'Find All Anagrams in a String',           'Medium', 'strings'],
  // Math & Bit Manipulation
  ['number-of-1-bits',                    'Number of 1 Bits',                         'Easy',   'bit_manipulation'],
  ['counting-bits',                       'Counting Bits',                            'Easy',   'bit_manipulation'],
  ['reverse-bits',                        'Reverse Bits',                             'Easy',   'bit_manipulation'],
  ['missing-number',                      'Missing Number',                           'Easy',   'bit_manipulation'],
  ['single-number',                       'Single Number',                            'Easy',   'bit_manipulation'],
  ['bitwise-and-of-numbers-range',        'Bitwise AND of Numbers Range',             'Medium', 'bit_manipulation'],
  ['sum-of-two-integers',                 'Sum of Two Integers (No + Operator)',      'Medium', 'bit_manipulation'],
  ['reverse-integer',                     'Reverse Integer',                          'Medium', 'mathematics'],
  ['palindrome-number',                   'Palindrome Number',                        'Easy',   'mathematics'],
  ['power-function',                      'Pow(x, n)',                                'Medium', 'mathematics'],
  ['sqrt-x',                              'Sqrt(x)',                                  'Easy',   'mathematics'],
  ['excel-sheet-column-number',           'Excel Sheet Column Number',                'Easy',   'mathematics'],
  ['happy-number',                        'Happy Number',                             'Easy',   'mathematics'],
  ['factorial-trailing-zeroes',           'Factorial Trailing Zeroes',                'Medium', 'mathematics'],
  ['sieve-of-eratosthenes',               'Count Primes',                             'Medium', 'mathematics'],
  // Concurrency
  ['print-in-order',                      'Print in Order',                           'Easy',   'concurrency'],
  ['print-foobar-alternately',            'Print FooBar Alternately',                 'Medium', 'concurrency'],
  ['print-zero-even-odd',                 'Print Zero Even Odd',                      'Medium', 'concurrency'],
  ['building-h2o',                        'Building H2O',                             'Medium', 'concurrency'],
  ['dining-philosophers',                 'The Dining Philosophers',                  'Medium', 'concurrency'],
  ['fizzbuzz-multithreaded',              'FizzBuzz Multithreaded',                   'Medium', 'concurrency'],
  // Databases
  ['employees-earning-more-than-managers','Employees Earning More Than Their Managers','Easy',  'databases'],
  ['duplicate-emails',                    'Duplicate Emails',                         'Easy',   'databases'],
  ['customers-who-never-order',           'Customers Who Never Order',                'Easy',   'databases'],
  ['find-customers-with-positive-revenue','Find Customers With Positive Revenue',     'Easy',   'databases'],
  ['department-top-three-salaries',       'Department Top Three Salaries',            'Hard',   'databases'],
  ['nth-highest-salary',                  'Nth Highest Salary',                       'Medium', 'databases'],
  ['rank-scores',                         'Rank Scores',                              'Medium', 'databases'],
  ['consecutive-numbers',                 'Consecutive Numbers',                      'Medium', 'databases'],
  ['department-highest-salary',           'Department Highest Salary',                'Medium', 'databases'],
  ['second-highest-salary',               'Second Highest Salary',                    'Medium', 'databases'],
  ['delete-duplicate-emails',             'Delete Duplicate Emails',                  'Easy',   'databases'],
  ['rising-temperature',                  'Rising Temperature',                       'Easy',   'databases'],
  ['game-play-analysis',                  'Game Play Analysis I',                     'Easy',   'databases'],
  ['count-students-unable-to-eat',        'Students Unable to Eat Lunch',             'Easy',   'databases'],
  ['report-contiguous-dates',             'Report Contiguous Dates',                  'Hard',   'databases'],
  ['user-activity-for-past-30-days',      'User Activity for the Past 30 Days',       'Easy',   'databases'],
  ['product-sales-analysis',              'Product Sales Analysis',                   'Easy',   'databases'],
  ['article-views',                       'Article Views I',                          'Easy',   'databases'],
  ['tree-node-type',                      'Tree Node Type Classification',            'Medium', 'databases'],
  ['exchange-seats',                      'Exchange Seats',                           'Medium', 'databases'],
  ['movie-rating',                        'Movie Rating',                             'Medium', 'databases'],
  ['restaurant-growth',                   'Restaurant Growth - Moving Average',        'Medium', 'databases'],
  ['friend-requests-ii',                  'Friend Requests II - Who Has Most Friends', 'Medium','databases'],
  ['investments-in-2016',                 'Investments in 2016',                      'Medium', 'databases'],
  ['monthly-transactions',                'Monthly Transactions',                     'Medium', 'databases'],
  ['immediate-food-delivery',             'Immediate Food Delivery',                  'Medium', 'databases'],
  // System Design
  ['design-url-shortener',                'Design a URL Shortener',                   'Medium', 'system_design'],
  ['design-rate-limiter',                 'Implement a Rate Limiter',                 'Medium', 'system_design'],
  ['design-notification-system',          'Design a Notification System',             'Medium', 'system_design'],
  ['design-cache-system',                 'Design a Distributed Cache',               'Hard',   'system_design'],
  ['design-message-queue',                'Design a Message Queue',                   'Hard',   'system_design'],
  ['design-api-gateway',                  'Design an API Gateway',                    'Hard',   'system_design'],
  ['design-news-feed',                    'Design a News Feed System',                'Hard',   'system_design'],
  ['design-search-autocomplete',          'Design Search Autocomplete System',        'Hard',   'system_design'],
  // Frontend
  ['implement-debounce',                  'Implement Debounce',                       'Medium', 'frontend'],
  ['implement-throttle',                  'Implement Throttle',                       'Medium', 'frontend'],
  ['deep-clone-object',                   'Deep Clone an Object',                     'Medium', 'frontend'],
  ['implement-promise-all',               'Implement Promise.all',                    'Medium', 'frontend'],
  ['implement-promise-any',               'Implement Promise.any',                    'Medium', 'frontend'],
  ['flatten-nested-array',                'Flatten a Nested Array',                   'Easy',   'frontend'],
  ['implement-curry',                     'Implement Curry Function',                 'Medium', 'frontend'],
  ['implement-event-emitter',             'Implement an Event Emitter',               'Medium', 'frontend'],
  ['virtual-dom-diff',                    'Virtual DOM Diffing Algorithm',            'Hard',   'frontend'],
  ['implement-react-usestate',            'Implement React useState Hook',            'Hard',   'frontend'],
  ['implement-react-useeffect',           'Implement React useEffect Hook',           'Hard',   'frontend'],
  ['css-responsive-grid',                 'CSS: Responsive Grid System',              'Medium', 'frontend'],
  ['infinite-scroll',                     'Implement Infinite Scroll',                'Medium', 'frontend'],
  ['drag-and-drop',                       'Build a Drag and Drop List',               'Hard',   'frontend'],
  ['memoize-function',                    'Memoize Function',                         'Medium', 'frontend'],
  ['observable-from-promise',             'Implement Observable from Promise',        'Hard',   'frontend'],
  // Backend
  ['design-restful-blog-api',             'Design a RESTful API for a Blog',          'Medium', 'backend'],
  ['implement-jwt-auth',                  'Implement JWT Authentication Middleware',  'Medium', 'backend'],
  ['implement-redis-cache',               'Implement Caching Layer with Redis',       'Medium', 'backend'],
  ['build-job-queue',                     'Build a Job Queue with BullMQ',            'Hard',   'backend'],
  ['websocket-notifications',             'WebSocket Real-Time Notifications',        'Hard',   'backend'],
  ['database-transactions',               'Database Transactions & Optimistic Locking','Hard',  'backend'],
  ['build-graphql-api',                   'Build a GraphQL API',                      'Hard',   'backend'],
  ['microservices-saga-pattern',          'Microservices: Saga Pattern',              'Hard',   'backend'],
  // Security
  ['prevent-sql-injection',               'Prevent SQL Injection',                    'Easy',   'security'],
  ['prevent-xss',                         'Prevent Cross-Site Scripting (XSS)',       'Medium', 'security'],
  ['secure-password-storage',             'Implement Secure Password Storage',        'Medium', 'security'],
  ['csrf-protection',                     'CSRF Protection Implementation',           'Medium', 'security'],
  ['oauth-flow',                          'Implement OAuth 2.0 Authorization Code',   'Hard',   'security'],
  ['penetration-testing-find-bugs',       'Find All Security Vulnerabilities',        'Hard',   'security'],
  // DevOps
  ['write-multi-stage-dockerfile',        'Write a Multi-Stage Dockerfile',           'Medium', 'devops'],
  ['kubernetes-deployment',               'Kubernetes Deployment Configuration',      'Hard',   'devops'],
  ['github-actions-cicd',                 'CI/CD Pipeline with GitHub Actions',       'Hard',   'devops'],
  ['terraform-infrastructure',            'Infrastructure as Code with Terraform',    'Hard',   'devops'],
  ['distributed-tracing',                 'Implement Distributed Tracing',            'Hard',   'devops'],
  ['monitoring-alerting-setup',           'Set Up Monitoring and Alerting',           'Medium', 'devops'],
  // Mobile
  ['react-native-offline-sync',           'React Native Offline Data Sync',           'Hard',   'mobile'],
  ['push-notifications-setup',            'Implement Push Notifications',             'Medium', 'mobile'],
  ['mobile-deep-linking',                 'Mobile Deep Linking Setup',                'Medium', 'mobile'],
  // Machine Learning
  ['implement-linear-regression',         'Implement Linear Regression from Scratch', 'Medium', 'machine_learning'],
  ['implement-k-nearest-neighbors',       'Implement K-Nearest Neighbors',            'Medium', 'machine_learning'],
  ['implement-k-means-clustering',        'Implement K-Means Clustering',             'Medium', 'machine_learning'],
  ['feature-engineering-pipeline',        'Build a Feature Engineering Pipeline',     'Hard',   'machine_learning'],
  ['build-recommendation-engine',         'Build a Simple Recommendation Engine',     'Hard',   'machine_learning'],
];

// ─── Scaffold a single challenge folder ──────────────────────────────────────
function scaffoldChallenge(slug: string, title: string, difficulty: 'Easy' | 'Medium' | 'Hard', category: string) {
  const dir = path.join(CHALLENGES_DIR, slug);

  if (fs.existsSync(dir)) {
    // Check if already has content
    const hasContent = fs.existsSync(path.join(dir, 'meta.json'));
    if (hasContent) {
      console.log(`  ⏭️  ${slug} — already exists`);
      return;
    }
  }

  fs.mkdirSync(dir, { recursive: true });

  const points = difficulty === 'Easy' ? 50 : difficulty === 'Medium' ? 100 : 200;

  // meta.json
  const meta = {
    title,
    slug,
    difficulty,
    category,
    points,
    tags: [] as string[],
    company_tags: [] as string[],
    topic_tags: [] as string[],
    time_limit_ms: 2000,
    memory_limit_kb: 262144,
    input_format: "TODO",
    output_format: "TODO",
    example_input: "TODO",
    example_output: "TODO",
    constraints: "TODO",
    function_signature: "// TODO",
    status: "DRAFT" as const,
  };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2));

  // description.md
  fs.writeFileSync(path.join(dir, 'description.md'), `# ${title}\n\nTODO: Add full problem description.\n`);

  // hints.json
  fs.writeFileSync(path.join(dir, 'hints.json'), `[\n  "TODO: Add hint 1",\n  "TODO: Add hint 2"\n]`);

  // test_cases.json
  fs.writeFileSync(path.join(dir, 'test_cases.json'), `[\n  { "input": "TODO", "output": "TODO", "explanation": "TODO", "is_hidden": false }\n]`);

  // editorial.md
  fs.writeFileSync(path.join(dir, 'editorial.md'), `# Editorial — ${title}\n\nTODO: Add editorial with multiple approaches and complexity analysis.\n`);

  // solution.ts
  fs.writeFileSync(path.join(dir, 'solution.ts'), `// TODO: Add reference solution\n`);

  // boilerplates.json
  const sig = meta.function_signature;
  const boilerplates = {
    typescript: `${sig}\n  // Your code here\n}`,
    javascript: `/**\n * @param {TODO} param\n * @return {TODO}\n */\nvar solve = function() {\n  // Your code here\n};`,
    python: `class Solution:\n    def solve(self) -> None:\n        # Your code here\n        pass`,
    java: `class Solution {\n    public void solve() {\n        // Your code here\n    }\n}`,
    cpp: `class Solution {\npublic:\n    void solve() {\n        // Your code here\n    }\n};`,
    go: `func solve() {\n    // Your code here\n}`,
    rust: `impl Solution {\n    pub fn solve() {\n        // Your code here\n    }\n}`,
    csharp: `public class Solution {\n    public void Solve() {\n        // Your code here\n    }\n}`,
  };
  fs.writeFileSync(path.join(dir, 'boilerplates.json'), JSON.stringify(boilerplates, null, 2));

  console.log(`  ✅ ${slug}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`\n🏗️  Scaffolding ${PLANNED.length} challenge folders...\n`);

let created = 0;
let skipped = 0;

for (const [slug, title, difficulty, category] of PLANNED) {
  const dir = path.join(CHALLENGES_DIR, slug);
  const exists = fs.existsSync(path.join(dir, 'meta.json'));
  if (exists) {
    skipped++;
  } else {
    scaffoldChallenge(slug, title, difficulty, category);
    created++;
  }
}

console.log(`\n✅ Done! Created: ${created} | Skipped (existing): ${skipped}`);
console.log(`\nNext steps:`);
console.log(`  1. Fill in each challenge folder's files (meta.json, description.md, hints.json, test_cases.json, editorial.md, solution.ts)`);
console.log(`  2. Change status from "DRAFT" to "ACTIVE" when ready`);
console.log(`  3. Run: npx tsx prisma/seeders/masterChallenge.seeder.ts`);
console.log(`\nOnly ACTIVE challenges are seeded to the database.\n`);
