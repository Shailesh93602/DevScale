import { DetailedRoadmapData } from './roadmapTypes';

export const aiMlRoadmap: DetailedRoadmapData = {
    title: 'AI/Machine Learning Engineering',
    description: 'Embark on a journey to master Artificial Intelligence, Machine Learning algorithms, and Neural Networks.',
    tags: 'AI,MachineLearning,Python,DeepLearning',
    mainConcepts: [
        {
            name: 'Machine Learning Algorithms',
            description: 'Understanding Supervised, Unsupervised, and Reinforcement learning models.',
            order: 1,
            subjects: [
                {
                    name: 'Supervised Learning',
                    description: 'Learning models based on labeled training data.',
                    order: 1,
                    topics: [
                        {
                            name: 'Linear & Logistic Regression',
                            description: 'The mathematical foundations of predictive modeling for continuous and categorical outputs.',
                            order: 1,
                            articles: [
                                {
                                    title: 'A Primer on Linear and Logistic Regression',
                                    content: `
                    <h1>Regression Fundamentals</h1>
                    <p>Linear and Logistic Regression are two of the most popular Supervised Learning algorithms.</p>
                    <h2>Linear Regression</h2>
                    <p>Linear Regression is used to predict continuous outcomes. It works by fitting a straight line to the dataset that minimizes the error between actual data points and the line itself.</p>
                    <pre><code>
from sklearn.linear_model import LinearRegression
model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
                    </code></pre>
                    <h2>Logistic Regression</h2>
                    <p>Logistic Regression is used for binary classification (e.g., predicting "yes/no", "spam/not spam"). It relies on the Sigmoid function to squash values between 0 and 1.</p>
                    <pre><code>
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X_train, y_train_binary)
y_pred_probs = model.predict_proba(X_test)
                    </code></pre>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'Regression Basics Quiz',
                                    description: 'Check your fundamental knowledge of linear vs logistic models.',
                                    passingScore: 80,
                                    timeLimit: 10,
                                    questions: [
                                        {
                                            question: 'What is the primary difference between Linear and Logistic Regression outcomes?',
                                            points: 10,
                                            options: [
                                                { text: 'Linear predicts text; Logistic predicts numbers.', isCorrect: false },
                                                { text: 'Linear predicts continuous values; Logistic predicts binary categories.', isCorrect: true },
                                                { text: 'Linear is unsupervised; Logistic is supervised.', isCorrect: false },
                                                { text: 'Logistic relies on deep learning architectures.', isCorrect: false }
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
            name: 'Deep Learning Architectures',
            description: 'Building and training Neural Networks using TensorFlow and PyTorch.',
            order: 2,
            subjects: [
                {
                    name: 'Neural Networks basics',
                    description: 'Understanding neurons, activation functions, and backpropagation.',
                    order: 1,
                    topics: [
                        {
                            name: 'Perceptrons and Neural Layers',
                            description: 'The foundation of Artificial Neural Networks.',
                            order: 1,
                            articles: [
                                {
                                    title: 'Introduction to Artificial Neural Networks',
                                    content: `
                    <h1>The Perceptron</h1>
                    <p>The perceptron is the fundamental building block of an Artificial Neural Network, acting mathematically as an artificial neuron.</p>
                    <h2>Activation Functions</h2>
                    <p>Activation functions determine the output of a neural network node given an input or set of inputs (e.g., ReLU, Sigmoid, Tanh).</p>
                    <h2>Hidden Layers</h2>
                    <p>A Deep Neural Network is defined by having one or more "hidden" layers situated between the primary input and output layers. These hidden layers allow the network to learn non-linear patterns.</p>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'Neural Networks Quiz',
                                    description: 'Validate your grasp on neurons and network layers.',
                                    passingScore: 100,
                                    timeLimit: 5,
                                    questions: [
                                        {
                                            question: 'What is the role of an activation function in an Artificial Neural Network?',
                                            points: 10,
                                            options: [
                                                { text: 'To download the training datasets.', isCorrect: false },
                                                { text: 'To introduce non-linearity into the output of a neuron.', isCorrect: true },
                                                { text: 'To connect to the database via SQL.', isCorrect: false },
                                                { text: 'To randomly skip neurons during training (Dropout).', isCorrect: false }
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
