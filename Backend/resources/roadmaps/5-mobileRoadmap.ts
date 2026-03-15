import { DetailedRoadmapData } from './roadmapTypes';

export const mobileRoadmap: DetailedRoadmapData = {
    title: 'Mobile App Development',
    description: 'Master cross-platform mobile app creation with frameworks like React Native and Flutter.',
    tags: 'Mobile,ReactNative,Flutter,Frontend',
    mainConcepts: [
        {
            name: 'Cross-Platform Frameworks',
            description: 'Understanding the tools needed to build iOS and Android apps simultaneously.',
            order: 1,
            subjects: [
                {
                    name: 'React Native',
                    description: 'Leveraging JavaScript and React to deploy native iOS and Android applications.',
                    order: 1,
                    topics: [
                        {
                            name: 'Getting Started with Expo',
                            description: 'Setting up your first mobile application environment without XCode or Android Studio.',
                            order: 1,
                            articles: [
                                {
                                    title: 'React Native with Expo Overview',
                                    content: `
                    <h1>Why Expo?</h1>
                    <p>React Native allows you to build mobile applications using JavaScript that look, feel, and run natively. However, configuring the complex native environments (like XCode for iOS, Android Studio for Android) can be intimidating.</p>
                    <h2>Enter Expo</h2>
                    <p>Expo is a framework and a platform for universal React applications. It is a set of tools built over React Native that help you develop, build, deploy, and quickly iterate on iOS, Android, and web apps.</p>
                    <pre><code>
# Initialize a new app
npx create-expo-app my-app

# Start the local development server
cd my-app
npx expo start
                    </code></pre>
                    <h2>The Metro Bundler</h2>
                    <p>When you start Expo, the Metro bundler runs locally, compiling JavaScript code and serving it to the Expo Go app executing on your physical phone or simulator.</p>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'React Native Expo Quiz',
                                    description: 'Validate your basic configuration and CLI knowledge.',
                                    passingScore: 80,
                                    timeLimit: 10,
                                    questions: [
                                        {
                                            question: 'What is the primary benefit of using Expo over the React Native CLI for beginners?',
                                            points: 10,
                                            options: [
                                                { text: 'It comes with pre-installed payment gateways.', isCorrect: false },
                                                { text: 'It hides the complex native (XCode/Android Studio) configuration files from the developer.', isCorrect: true },
                                                { text: 'It uses Python instead of JavaScript for mobile apps.', isCorrect: false },
                                                { text: 'It is the only officially supported tool directly from Google.', isCorrect: false }
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
            name: 'Mobile UX and Components',
            description: 'Designing user interfaces specifically for small touch screens.',
            order: 2,
            subjects: [
                {
                    name: 'Core Components',
                    description: 'Understanding Views, Text, Images, and Touch functionality.',
                    order: 1,
                    topics: [
                        {
                            name: 'Basic Mobile Layouts',
                            description: 'Using Flexbox in a mobile context rather than standard web CSS.',
                            order: 1,
                            articles: [
                                {
                                    title: 'Flexbox but for Mobile',
                                    content: `
                    <h1>The Flexbox Layout</h1>
                    <p>React Native uses a layout engine called Yoga, which translates Flexbox rules to the native mobile platform's layout engine.</p>
                    <h2>Mobile Differences</h2>
                    <p>Unlike standard web development, React Native sets <code>flexDirection: 'column'</code> by default, since mobile phones are viewed vertically.</p>
                    <pre><code>
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    &lt;View style={styles.container}&gt;
      &lt;Text&gt;Hello Mobile World!&lt;/Text&gt;
    &lt;/View&gt;
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
                    </code></pre>
                  `
                                }
                            ],
                            quizzes: [
                                {
                                    title: 'Mobile Flexbox Quiz',
                                    description: 'Test your understanding of layout direction.',
                                    passingScore: 100,
                                    timeLimit: 5,
                                    questions: [
                                        {
                                            question: 'What is the default flexDirection in React Native?',
                                            points: 10,
                                            options: [
                                                { text: 'row', isCorrect: false },
                                                { text: 'row-reverse', isCorrect: false },
                                                { text: 'column', isCorrect: true },
                                                { text: 'absolute', isCorrect: false }
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
