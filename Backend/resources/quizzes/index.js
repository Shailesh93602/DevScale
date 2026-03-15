"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizzes = void 0;
exports.quizzes = [
    {
        topicName: 'HTML Basics',
        passingMarks: 60,
        questions: [
            {
                question: 'What does HTML stand for?',
                options: [
                    { answerText: 'Hyper Text Markup Language', isCorrect: true },
                    { answerText: 'Home Tool Markup Language', isCorrect: false },
                    {
                        answerText: 'Hyperlinks and Text Markup Language',
                        isCorrect: false,
                    },
                ],
            },
            {
                question: 'Which is the correct HTML tag for the largest heading?',
                options: [
                    { answerText: '<heading>', isCorrect: false },
                    { answerText: '<h6>', isCorrect: false },
                    { answerText: '<h1>', isCorrect: true },
                ],
            },
        ],
    },
    {
        topicName: 'HTML Document Structure',
        passingMarks: 50,
        questions: [
            {
                question: 'Which tag is used to define the document type in HTML5?',
                options: [
                    { answerText: '<!DOCTYPE>', isCorrect: true },
                    { answerText: '<html>', isCorrect: false },
                    { answerText: '<meta>', isCorrect: false },
                ],
            },
            {
                question: 'Which part of the HTML document contains the metadata?',
                options: [
                    { answerText: '<head>', isCorrect: true },
                    { answerText: '<body>', isCorrect: false },
                    { answerText: '<title>', isCorrect: false },
                ],
            },
        ],
    },
];
//# sourceMappingURL=index.js.map