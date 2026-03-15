import { DetailedRoadmapData } from './roadmapTypes';

export const dataEngineeringRoadmap: DetailedRoadmapData = {
    title: 'Modern Data Engineering',
    description: 'A comprehensive guide to becoming a Data Engineer. Learn how to design, build, and maintain data pipelines and architectures.',
    tags: 'DataEngineering,BigData,Python,SQL',
    mainConcepts: [
        {
            name: 'Data Engineering Fundamentals',
            description: 'The core skills required for data engineering.',
            order: 1,
            subjects: [
                {
                    name: 'SQL & Database Design',
                    description: 'Mastering relational databases and querying languages.',
                    order: 1,
                    topics: [
                        {
                            name: 'Advanced SQL Queries',
                            description: 'Learn complex JOINs, window functions, and CTEs.',
                            order: 1,
                            articles: [
                                {
                                    title: 'Mastering Advanced SQL',
                                    content: `
                    <h1>Advanced SQL for Data Engineers</h1>
                    <p>SQL is the lingua franca of data. To be an effective data engineer, you must go beyond basic SELECT statements.</p>
                    <h2>Common Table Expressions (CTEs)</h2>
                    <p>CTEs allow you to write more readable query code by defining temporary result sets.</p>
                    <pre><code>
WITH RegionalSales AS (
  SELECT region, SUM(amount) as total_sales
  FROM orders
  GROUP BY region
)
SELECT * FROM RegionalSales WHERE total_sales > 100000;
                    </code></pre>
                    <h2>Window Functions</h2>
                    <p>Window functions perform a calculation across a set of table rows that are somehow related to the current row.</p>
                    <pre><code>
SELECT employee_name, department, salary,
       AVG(salary) OVER(PARTITION BY department) as avg_dept_salary
FROM employees;
                    </code></pre>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'Advanced SQL Quiz',
                                    description: 'Test your understanding of CTEs and Window Functions.',
                                    passingScore: 80,
                                    timeLimit: 10,
                                    questions: [
                                        {
                                            question: 'What is the primary benefit of using a CTE (Common Table Expression)?',
                                            points: 10,
                                            options: [
                                                { text: 'It permanently stores data in the database.', isCorrect: false },
                                                { text: 'It improves query readability and organization.', isCorrect: true },
                                                { text: 'It is the only way to join three or more tables.', isCorrect: false },
                                                { text: 'It prevents SQL injection automatically.', isCorrect: false }
                                            ]
                                        },
                                        {
                                            question: 'Which keyword is typically used with Window Functions to define the window?',
                                            points: 10,
                                            options: [
                                                { text: 'GROUP BY', isCorrect: false },
                                                { text: 'WINDOW', isCorrect: false },
                                                { text: 'OVER', isCorrect: true },
                                                { text: 'PARTITION', isCorrect: false }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            name: 'Data Warehousing Concepts',
                            description: 'Understanding OLAP, Star Schemas, and Snowflake Schemas.',
                            order: 2,
                            articles: [
                                {
                                    title: 'Data Warehousing Fundamentals',
                                    content: `
                    <h1>Data Warehousing</h1>
                    <p>A data warehouse is a centralized repository of integrated data from one or more disparate sources.</p>
                    <h2>OLTP vs OLAP</h2>
                    <p><strong>OLTP (Online Transaction Processing):</strong> Designed for fast, high-volume transactional processing (e.g., e-commerce orders).</p>
                    <p><strong>OLAP (Online Analytical Processing):</strong> Designed for complex queries and analysis (e.g., sales forecasting).</p>
                    <h2>Star Schema</h2>
                    <p>The Star Schema consists of one or more fact tables referencing any number of dimension tables. It is designed for query performance and simplicity.</p>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'Data Warehousing Quiz',
                                    description: 'Check your knowledge on OLAP and schemas.',
                                    passingScore: 100,
                                    timeLimit: 5,
                                    questions: [
                                        {
                                            question: 'Which of the following is characteristic of an OLAP system?',
                                            points: 10,
                                            options: [
                                                { text: 'Optimized for fast, single-row inserts and updates.', isCorrect: false },
                                                { text: 'Highly normalized data structure.', isCorrect: false },
                                                { text: 'Optimized for complex queries and read-heavy workloads.', isCorrect: true },
                                                { text: 'Used primarily as the backend database for live web applications.', isCorrect: false }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: 'Data Pipelines & Orchestration',
            description: 'Moving and transforming data automatically.',
            order: 2,
            subjects: [
                {
                    name: 'ETL and Orchestration Tools',
                    description: 'Extract, Transform, Load processes and tools like Airflow.',
                    order: 1,
                    topics: [
                        {
                            name: 'Introduction to Apache Airflow',
                            description: 'Learn how to schedule and monitor workflows using Airflow.',
                            order: 1,
                            articles: [
                                {
                                    title: 'Orchestrating Pipelines with Airflow',
                                    content: `
                    <h1>Apache Airflow</h1>
                    <p>Apache Airflow is an open-source platform to programmatically author, schedule, and monitor workflows.</p>
                    <h2>DAGs (Directed Acyclic Graphs)</h2>
                    <p>In Airflow, a workflow is defined as a DAG. It represents a collection of tasks with directional dependencies.</p>
                    <h2>Operators</h2>
                    <p>Operators determine what actually executes when your DAG runs. Examples include PythonOperator, BashOperator, and PostgresOperator.</p>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'Airflow Basics Quiz',
                                    description: 'Basic concepts of Apache Airflow.',
                                    passingScore: 100,
                                    timeLimit: 5,
                                    questions: [
                                        {
                                            question: 'In Apache Airflow, what does DAG stand for?',
                                            points: 10,
                                            options: [
                                                { text: 'Data Analytics Graph', isCorrect: false },
                                                { text: 'Directed Acyclic Graph', isCorrect: true },
                                                { text: 'Dynamic Automated Generator', isCorrect: false },
                                                { text: 'Data Application Gateway', isCorrect: false }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
