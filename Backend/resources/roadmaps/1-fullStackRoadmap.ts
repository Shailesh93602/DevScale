import { DetailedRoadmapData } from './roadmapTypes';

export const fullStackRoadmap: DetailedRoadmapData = {
    title: 'Full Stack Web Development',
    description: 'Master the complete modern stack: HTML, CSS, JavaScript, React, Node.js, Databases, and DevOps to build production-ready web applications from scratch.',
    tags: 'Frontend,Backend,FullStack,Node,React',
    mainConcepts: [
        // ─────────────────────────────────────────────────────────
        // MAIN CONCEPT 1: FRONTEND FUNDAMENTALS
        // ─────────────────────────────────────────────────────────
        {
            name: 'Frontend Fundamentals',
            description: 'The absolute core of the web — HTML structure, CSS styling, and JavaScript interactivity.',
            order: 1,
            subjects: [
                {
                    name: 'HTML & Semantic Web',
                    description: 'Learn the structure and accessibility of professional websites.',
                    order: 1,
                    topics: [
                        {
                            name: 'HTML5 Basics & Document Structure',
                            description: 'Setting up the index.html, standard tags, and the semantic DOM.',
                            order: 1,
                            articles: [{
                                title: 'Mastering HTML5 Basics & Document Structure',
                                content: `<h1>The Foundation: HTML5 Basics</h1>
<p>HTML (HyperText Markup Language) is the backbone of every web page. It defines the <strong>structure and meaning</strong> of content. Every element you see in a browser — headings, paragraphs, images, buttons — starts with HTML.</p>
<h2>The Standard Boilerplate</h2>
<p>Every HTML5 document begins with the same skeleton:</p>
<pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
  &lt;head&gt;
    &lt;meta charset="UTF-8"&gt;
    &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
    &lt;title&gt;My Page&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello World&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>
<h2>Key Head Elements</h2>
<ul>
  <li><code>&lt;meta charset="UTF-8"&gt;</code> — Ensures text renders correctly in all languages.</li>
  <li><code>&lt;meta name="viewport"&gt;</code> — Critical for mobile-responsive design.</li>
  <li><code>&lt;title&gt;</code> — Appears in the browser tab and search results.</li>
</ul>
<h2>Semantic HTML</h2>
<p>Semantic elements convey <em>meaning</em>, not just appearance. Use them for accessibility and SEO:</p>
<pre><code>&lt;header&gt;  — Site-wide header / navigation
&lt;nav&gt;     — Navigation links
&lt;main&gt;    — Primary content area
&lt;section&gt; — Thematic grouping of content
&lt;article&gt; — Self-contained piece of content
&lt;aside&gt;   — Sidebar / supplementary content
&lt;footer&gt;  — Site-wide footer</code></pre>
<h2>Block vs Inline Elements</h2>
<p><strong>Block elements</strong> take the full width: <code>&lt;div&gt;, &lt;p&gt;, &lt;h1&gt;-&lt;h6&gt;, &lt;ul&gt;, &lt;section&gt;</code>.</p>
<p><strong>Inline elements</strong> flow within text: <code>&lt;span&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;img&gt;</code>.</p>
<h2>Best Practices</h2>
<ul>
  <li>Always declare <code>&lt;!DOCTYPE html&gt;</code> as the very first line.</li>
  <li>Use semantic tags over generic <code>&lt;div&gt;</code> whenever possible.</li>
  <li>Keep one <code>&lt;h1&gt;</code> per page for proper SEO hierarchy.</li>
  <li>Add <code>alt</code> attributes to all images for accessibility.</li>
</ul>`
                            }],
                            quizzes: [{
                                title: 'HTML5 Basics Quiz',
                                description: 'Test your knowledge of HTML5 structure and semantic tags.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'Which tag is considered semantic in HTML5?',
                                        points: 10,
                                        options: [
                                            { text: '<div>', isCorrect: false },
                                            { text: '<article>', isCorrect: true },
                                            { text: '<b>', isCorrect: false },
                                            { text: '<span>', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'What does <!DOCTYPE html> instruct the browser to do?',
                                        points: 10,
                                        options: [
                                            { text: 'Link the CSS file', isCorrect: false },
                                            { text: 'Render the page in HTML5 mode', isCorrect: true },
                                            { text: 'Declare page language as English', isCorrect: false },
                                            { text: 'Close the HTML document', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'Which meta tag is critical for mobile-responsive design?',
                                        points: 10,
                                        options: [
                                            { text: 'meta charset', isCorrect: false },
                                            { text: 'meta description', isCorrect: false },
                                            { text: 'meta viewport', isCorrect: true },
                                            { text: 'meta robots', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'HTML Forms & Validation',
                            description: 'Building forms to capture user input with client-side validation.',
                            order: 2,
                            articles: [{
                                title: 'Building HTML Forms with Validation',
                                content: `<h1>HTML Forms & User Input</h1>
<p>Forms are the primary way users interact with web apps — from login pages to search bars. Understanding forms deeply is essential for any developer.</p>
<h2>The Form Element</h2>
<pre><code>&lt;form action="/submit" method="POST"&gt;
  &lt;label for="email"&gt;Email:&lt;/label&gt;
  &lt;input type="email" id="email" name="email" required&gt;
  &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</code></pre>
<h2>Essential Input Types</h2>
<ul>
  <li><code>type="text"</code> — General single-line text</li>
  <li><code>type="email"</code> — Browser validates email format automatically</li>
  <li><code>type="password"</code> — Masks the input characters</li>
  <li><code>type="number"</code> — Numeric input with min/max support</li>
  <li><code>type="checkbox"</code> — Boolean toggle</li>
  <li><code>type="radio"</code> — Single selection from a group</li>
  <li><code>type="file"</code> — File upload</li>
  <li><code>type="date"</code> — Date picker</li>
</ul>
<h2>HTML5 Validation Attributes</h2>
<pre><code>&lt;input type="text" 
  required               
  minlength="3"          
  maxlength="50"         
  pattern="[A-Za-z]+"   
  placeholder="Username"&gt;</code></pre>
<h2>The Label Element</h2>
<p>Always use <code>&lt;label&gt;</code> paired with inputs via the <code>for</code> attribute. This improves accessibility and increases the clickable area.</p>
<h2>Dropdown & Textarea</h2>
<pre><code>&lt;select name="country"&gt;
  &lt;option value="us"&gt;United States&lt;/option&gt;
  &lt;option value="in"&gt;India&lt;/option&gt;
&lt;/select&gt;

&lt;textarea name="bio" rows="4" cols="40"&gt;&lt;/textarea&gt;</code></pre>
<h2>Best Practices</h2>
<ul>
  <li>Always use <code>method="POST"</code> for sensitive data.</li>
  <li>Pair every input with a <code>&lt;label&gt;</code>.</li>
  <li>Use HTML5 validation as a first layer — always validate on the server too.</li>
  <li>Use <code>autocomplete</code> attributes for better UX.</li>
</ul>`
                            }],
                            quizzes: [{
                                title: 'HTML Forms Quiz',
                                description: 'Test your understanding of form elements and validation attributes.',
                                passingScore: 80,
                                timeLimit: 8,
                                questions: [
                                    {
                                        question: 'Which attribute forces the user to fill an input before submitting?',
                                        points: 10,
                                        options: [
                                            { text: 'validate', isCorrect: false },
                                            { text: 'mandatory', isCorrect: false },
                                            { text: 'required', isCorrect: true },
                                            { text: 'important', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'Which input type automatically validates email format?',
                                        points: 10,
                                        options: [
                                            { text: 'type="text"', isCorrect: false },
                                            { text: 'type="email"', isCorrect: true },
                                            { text: 'type="username"', isCorrect: false },
                                            { text: 'type="input"', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'Accessibility & ARIA',
                            description: 'Making web content usable for everyone including users with disabilities.',
                            order: 3,
                            articles: [{
                                title: 'Web Accessibility & ARIA Attributes',
                                content: `<h1>Web Accessibility (a11y)</h1>
<p>Accessibility ensures your website can be used by everyone — including people with visual, motor, auditory, or cognitive disabilities. It is also a legal requirement in many countries.</p>
<h2>Why Accessibility Matters</h2>
<ul>
  <li>Over <strong>1 billion people</strong> worldwide have some form of disability.</li>
  <li>Improves SEO — screen readers and search engines process HTML the same way.</li>
  <li>Required by WCAG 2.1 standards and laws like ADA, Section 508.</li>
</ul>
<h2>Core Principles (POUR)</h2>
<ul>
  <li><strong>Perceivable</strong> — Content can be seen or heard by all users.</li>
  <li><strong>Operable</strong> — All functionality works via keyboard.</li>
  <li><strong>Understandable</strong> — Content and UI are clear.</li>
  <li><strong>Robust</strong> — Compatible with assistive technologies.</li>
</ul>
<h2>Practical Techniques</h2>
<pre><code>&lt;!-- Always add alt text to images --&gt;
&lt;img src="chart.png" alt="Bar chart showing Q4 revenue"&gt;

&lt;!-- Use aria-label when text is unclear --&gt;
&lt;button aria-label="Close dialog"&gt;X&lt;/button&gt;

&lt;!-- Skip navigation link for keyboard users --&gt;
&lt;a href="#main-content" class="skip-link"&gt;Skip to Content&lt;/a&gt;

&lt;!-- Announce dynamic changes --&gt;
&lt;div aria-live="polite" id="status"&gt;Form submitted!&lt;/div&gt;</code></pre>
<h2>ARIA Roles</h2>
<p>ARIA (Accessible Rich Internet Applications) roles help screen readers understand interactive widgets:</p>
<pre><code>role="dialog"       — Modal dialogs
role="alert"        — Important messages
role="navigation"   — Navigation landmark
role="tablist"      — Tab interface container
role="tooltip"      — Hover tooltips</code></pre>
<h2>Keyboard Navigation</h2>
<p>Ensure all interactive elements are reachable via Tab key. Never remove <code>:focus</code> styles from CSS without a visible alternative.</p>`
                            }],
                            quizzes: [{
                                title: 'Accessibility Quiz',
                                description: 'Test your knowledge of web accessibility principles.',
                                passingScore: 80,
                                timeLimit: 8,
                                questions: [
                                    {
                                        question: 'What does ARIA stand for?',
                                        points: 10,
                                        options: [
                                            { text: 'Automated Responsive Interface Attributes', isCorrect: false },
                                            { text: 'Accessible Rich Internet Applications', isCorrect: true },
                                            { text: 'Advanced React Interface Architecture', isCorrect: false },
                                            { text: 'Accessible Rendering in Applications', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'What attribute provides a text alternative for images?',
                                        points: 10,
                                        options: [
                                            { text: 'title', isCorrect: false },
                                            { text: 'aria-label', isCorrect: false },
                                            { text: 'alt', isCorrect: true },
                                            { text: 'caption', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        }
                    ]
                },
                {
                    name: 'CSS Mastery',
                    description: 'Style web pages with modern CSS including Flexbox, Grid, and animations.',
                    order: 2,
                    topics: [
                        {
                            name: 'CSS Box Model & Selectors',
                            description: 'Understanding how the browser calculates size and spacing for every element.',
                            order: 1,
                            articles: [{
                                title: 'The CSS Box Model & Selectors Deep Dive',
                                content: `<h1>The CSS Box Model</h1>
<p>Every HTML element is a rectangular box. The box model defines how its dimensions are calculated.</p>
<h2>The Four Layers</h2>
<pre><code>┌─────────────────────────┐
│         Margin          │  Space outside the border
│  ┌─────────────────┐   │
│  │     Border      │   │  The visible outline
│  │  ┌───────────┐  │   │
│  │  │  Padding  │  │   │  Space inside the border
│  │  │ ┌───────┐ │  │   │
│  │  │ │Content│ │  │   │  The actual text/image
│  │  │ └───────┘ │  │   │
│  │  └───────────┘  │   │
│  └─────────────────┘   │
└─────────────────────────┘</code></pre>
<h2>box-sizing: border-box</h2>
<p>By default, width/height only includes content. <code>border-box</code> includes padding and border in the declared width — use it always:</p>
<pre><code>* {
  box-sizing: border-box; /* Best practice: apply globally */
}</code></pre>
<h2>CSS Selectors</h2>
<pre><code>/* Element selector */
p { color: gray; }

/* Class selector */
.card { background: white; }

/* ID selector */
#hero { font-size: 2rem; }

/* Attribute selector */
input[type="email"] { border-color: blue; }

/* Pseudo-class */
a:hover { text-decoration: underline; }

/* Pseudo-element */
p::first-line { font-weight: bold; }

/* Combinator (child) */
nav > a { margin: 0 8px; }

/* Combinator (descendant) */
.card p { font-size: 0.9rem; }</code></pre>
<h2>CSS Specificity</h2>
<p>When multiple rules target the same element, specificity determines which wins:</p>
<ul>
  <li>Inline styles → 1000 points</li>
  <li>ID selectors → 100 points</li>
  <li>Class/attribute/pseudo-class → 10 points</li>
  <li>Element/pseudo-element → 1 point</li>
</ul>`
                            }],
                            quizzes: [{
                                title: 'CSS Box Model Quiz',
                                description: 'Test your understanding of the CSS box model and selectors.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'Which CSS property includes padding and border in the element\'s total width?',
                                        points: 10,
                                        options: [
                                            { text: 'box-sizing: content-box', isCorrect: false },
                                            { text: 'box-sizing: border-box', isCorrect: true },
                                            { text: 'box-model: inclusive', isCorrect: false },
                                            { text: 'width: auto', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'In CSS specificity, which selector has the highest priority?',
                                        points: 10,
                                        options: [
                                            { text: 'Element selector (p)', isCorrect: false },
                                            { text: 'Class selector (.btn)', isCorrect: false },
                                            { text: 'ID selector (#hero)', isCorrect: false },
                                            { text: 'Inline style', isCorrect: true }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'Flexbox Layout',
                            description: 'Master one-dimensional layouts with CSS Flexbox.',
                            order: 2,
                            articles: [{
                                title: 'CSS Flexbox — The Complete Guide',
                                content: `<h1>CSS Flexbox</h1>
<p>Flexbox is a one-dimensional layout method designed to place items in rows or columns. It solves common layout problems that were painful with older CSS techniques.</p>
<h2>Enabling Flexbox</h2>
<pre><code>.container {
  display: flex;
}</code></pre>
<h2>Flex Direction</h2>
<pre><code>.container {
  flex-direction: row;           /* default — horizontal */
  flex-direction: column;        /* vertical */
  flex-direction: row-reverse;   /* reversed horizontal */
  flex-direction: column-reverse;
}</code></pre>
<h2>Alignment Properties</h2>
<pre><code>.container {
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
  align-items: flex-start | flex-end | center | stretch | baseline;
  align-content: flex-start | center | space-between; /* multi-line */
  gap: 16px; /* space between items */
}</code></pre>
<h2>Flex Item Properties</h2>
<pre><code>.item {
  flex-grow: 1;    /* how much it grows to fill space */
  flex-shrink: 1;  /* how much it shrinks if needed */
  flex-basis: auto;/* initial size before flex adjustments */
  /* Shorthand: */
  flex: 1;         /* flex-grow: 1, shrink: 1, basis: 0 */
  
  align-self: center; /* override align-items for this item */
  order: 2;           /* change visual order without changing HTML */
}</code></pre>
<h2>Common Flexbox Patterns</h2>
<pre><code>/* Perfect centering */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Navigation bar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Equal width columns */
.columns { display: flex; }
.column { flex: 1; }</code></pre>`
                            }],
                            quizzes: [{
                                title: 'Flexbox Quiz',
                                description: 'Validate your Flexbox knowledge.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'Which Flexbox property distributes space between items along the main axis?',
                                        points: 10,
                                        options: [
                                            { text: 'align-items', isCorrect: false },
                                            { text: 'justify-content', isCorrect: true },
                                            { text: 'flex-direction', isCorrect: false },
                                            { text: 'align-content', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'What value of flex-direction makes items stack vertically?',
                                        points: 10,
                                        options: [
                                            { text: 'row', isCorrect: false },
                                            { text: 'horizontal', isCorrect: false },
                                            { text: 'column', isCorrect: true },
                                            { text: 'vertical', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'CSS Grid Layout',
                            description: 'Build complex two-dimensional layouts with CSS Grid.',
                            order: 3,
                            articles: [{
                                title: 'CSS Grid — Two-Dimensional Layouts',
                                content: `<h1>CSS Grid</h1>
<p>CSS Grid is a two-dimensional layout system — it handles both rows and columns simultaneously, making it perfect for page-level layouts.</p>
<h2>Defining a Grid</h2>
<pre><code>.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px; /* 3 columns */
  grid-template-rows: auto 1fr auto;       /* 3 rows */
  gap: 20px;
}</code></pre>
<h2>The fr Unit</h2>
<p>The <code>fr</code> (fraction) unit distributes available space. <code>1fr 2fr</code> means one column gets 1/3 and the other gets 2/3 of space.</p>
<h2>repeat() Function</h2>
<pre><code>/* 12 equal columns like Bootstrap */
grid-template-columns: repeat(12, 1fr);

/* Auto-fill responsive grid */
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));</code></pre>
<h2>Placing Items</h2>
<pre><code>.header {
  grid-column: 1 / -1; /* span full width */
}
.sidebar {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}
.main {
  grid-column: 2 / -1;
  grid-row: 2 / 3;
}</code></pre>
<h2>Named Areas</h2>
<pre><code>.container {
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main   { grid-area: main; }
.footer { grid-area: footer; }</code></pre>
<h2>When to Use Grid vs Flexbox</h2>
<ul>
  <li>Use <strong>Grid</strong> for page-level, two-dimensional layouts.</li>
  <li>Use <strong>Flexbox</strong> for component-level, one-dimensional alignment.</li>
  <li>They work great together!</li>
</ul>`
                            }],
                            quizzes: [{
                                title: 'CSS Grid Quiz',
                                description: 'Test your CSS Grid knowledge.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'What does the "fr" unit represent in CSS Grid?',
                                        points: 10,
                                        options: [
                                            { text: 'Fixed row', isCorrect: false },
                                            { text: 'Fractional unit of available space', isCorrect: true },
                                            { text: 'Font-relative unit', isCorrect: false },
                                            { text: 'Frame unit', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'Which property defines named regions in a CSS Grid layout?',
                                        points: 10,
                                        options: [
                                            { text: 'grid-column', isCorrect: false },
                                            { text: 'grid-template-areas', isCorrect: true },
                                            { text: 'grid-area', isCorrect: false },
                                            { text: 'grid-region', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'Responsive Design & Media Queries',
                            description: 'Building websites that look great on all screen sizes.',
                            order: 4,
                            articles: [{
                                title: 'Responsive Design with CSS Media Queries',
                                content: `<h1>Responsive Web Design</h1>
<p>Responsive design ensures your website looks and works well on every device — from mobile phones to large desktop monitors.</p>
<h2>The Viewport Meta Tag</h2>
<p>This tag is essential — without it, mobile browsers will render the page at desktop width and scale it down:</p>
<pre><code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</code></pre>
<h2>Media Queries</h2>
<p>Media queries apply CSS rules conditionally based on screen size:</p>
<pre><code>/* Mobile first — default styles apply to mobile */
.container { padding: 16px; }

/* Tablet (768px and up) */
@media (min-width: 768px) {
  .container { padding: 32px; }
}

/* Desktop (1024px and up) */
@media (min-width: 1024px) {
  .container { padding: 64px; max-width: 1200px; margin: 0 auto; }
}</code></pre>
<h2>Common Breakpoints</h2>
<pre><code>/* Mobile:  0–767px (default) */
/* Tablet:  768px–1023px */
/* Desktop: 1024px–1279px */
/* Large:   1280px+ */</code></pre>
<h2>Mobile-First vs Desktop-First</h2>
<p><strong>Mobile-first</strong> (recommended): Write base styles for mobile, add complexity for larger screens using <code>min-width</code>.</p>
<p><strong>Desktop-first</strong>: Write base styles for desktop, simplify for smaller screens using <code>max-width</code>.</p>
<h2>Responsive Images</h2>
<pre><code>img {
  max-width: 100%;
  height: auto;
}

/* Responsive background image */
.hero {
  background-image: url('hero-mobile.jpg');
}
@media (min-width: 768px) {
  .hero { background-image: url('hero-desktop.jpg'); }
}</code></pre>
<h2>CSS Clamp for Responsive Typography</h2>
<pre><code>/* Font scales fluidly between 16px (mobile) and 24px (desktop) */
h1 { font-size: clamp(1rem, 4vw, 1.5rem); }</code></pre>`
                            }],
                            quizzes: [{
                                title: 'Responsive Design Quiz',
                                description: 'Test your responsive design knowledge.',
                                passingScore: 80,
                                timeLimit: 8,
                                questions: [
                                    {
                                        question: 'Which CSS at-rule is used to apply styles based on screen size?',
                                        points: 10,
                                        options: [
                                            { text: '@viewport', isCorrect: false },
                                            { text: '@media', isCorrect: true },
                                            { text: '@screen', isCorrect: false },
                                            { text: '@responsive', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'What does "mobile-first" mean in responsive design?',
                                        points: 10,
                                        options: [
                                            { text: 'The site is only designed for mobile', isCorrect: false },
                                            { text: 'You build the mobile layout first and enhance for larger screens', isCorrect: true },
                                            { text: 'The site loads faster on mobile than desktop', isCorrect: false },
                                            { text: 'Mobile styles override desktop styles', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'CSS Animations & Transitions',
                            description: 'Adding motion and life to UI elements for better user experience.',
                            order: 5,
                            articles: [{
                                title: 'CSS Transitions & Animations',
                                content: `<h1>CSS Animations & Transitions</h1>
<p>Motion design is a critical part of modern UX. CSS provides two powerful tools: transitions (for state changes) and animations (for complex sequences).</p>
<h2>CSS Transitions</h2>
<p>Transitions smoothly animate between two states (e.g., hover vs. normal):</p>
<pre><code>.button {
  background: #6366f1;
  transition: background 0.3s ease, transform 0.2s ease;
}
.button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}</code></pre>
<h2>Transition Properties</h2>
<ul>
  <li><code>transition-property</code> — Which property to animate (or <code>all</code>)</li>
  <li><code>transition-duration</code> — How long (e.g., <code>0.3s</code>)</li>
  <li><code>transition-timing-function</code> — Speed curve (<code>ease</code>, <code>linear</code>, <code>ease-in-out</code>)</li>
  <li><code>transition-delay</code> — Wait before starting</li>
</ul>
<h2>CSS Keyframe Animations</h2>
<pre><code>@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.5s ease forwards;
}

/* With stages */
@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.loader { animation: pulse 1.5s infinite; }</code></pre>
<h2>Animation Properties</h2>
<pre><code>.element {
  animation-name: fadeIn;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-delay: 0.1s;
  animation-iteration-count: 1;     /* or infinite */
  animation-direction: normal;       /* or alternate */
  animation-fill-mode: forwards;     /* keep final state */
  /* Shorthand: */
  animation: fadeIn 0.5s ease-out 0.1s forwards;
}</code></pre>
<h2>Performance Tips</h2>
<ul>
  <li>Animate only <code>transform</code> and <code>opacity</code> for best performance — these don't cause repaints.</li>
  <li>Add <code>will-change: transform</code> to hint the browser to use GPU acceleration.</li>
  <li>Respect user preferences: <code>@media (prefers-reduced-motion: reduce)</code></li>
</ul>`
                            }],
                            quizzes: [{
                                title: 'CSS Animations Quiz',
                                description: 'Test your knowledge of CSS transitions and animations.',
                                passingScore: 80,
                                timeLimit: 8,
                                questions: [
                                    {
                                        question: 'Which CSS properties should you prefer animating for performance?',
                                        points: 10,
                                        options: [
                                            { text: 'width and height', isCorrect: false },
                                            { text: 'margin and padding', isCorrect: false },
                                            { text: 'transform and opacity', isCorrect: true },
                                            { text: 'color and background', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'What CSS rule is used to define keyframe-based animations?',
                                        points: 10,
                                        options: [
                                            { text: '@transition', isCorrect: false },
                                            { text: '@animate', isCorrect: false },
                                            { text: '@keyframes', isCorrect: true },
                                            { text: '@motion', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        }
                    ]
                },
                {
                    name: 'JavaScript Core',
                    description: 'Master JavaScript from variables to async programming.',
                    order: 3,
                    topics: [
                        {
                            name: 'Variables, Types & Operators',
                            description: 'The fundamental building blocks of JavaScript programs.',
                            order: 1,
                            articles: [{
                                title: 'JavaScript Variables, Data Types & Operators',
                                content: `<h1>JavaScript Variables & Types</h1>
<p>JavaScript is a dynamically typed language — variables can hold any value and types are determined at runtime.</p>
<h2>Declaring Variables</h2>
<pre><code>// let — block-scoped, can be reassigned
let score = 0;
score = 10; // ✅

// const — block-scoped, cannot be reassigned
const PI = 3.14159;
PI = 3; // ❌ TypeError

// var — function-scoped (avoid in modern JS)
var name = "Alice"; // has hoisting quirks</code></pre>
<h2>Primitive Data Types</h2>
<pre><code>let str  = "Hello";          // String
let num  = 42;               // Number
let big  = 9007199254740991n;// BigInt
let bool = true;             // Boolean
let nil  = null;             // Null (intentional absence)
let undef;                   // Undefined (not assigned)
let sym  = Symbol("id");     // Symbol (unique identifier)</code></pre>
<h2>Type Checking</h2>
<pre><code>typeof "hello"    // "string"
typeof 42         // "number"
typeof true       // "boolean"
typeof undefined  // "undefined"
typeof null       // "object" (⚠️ historic quirk!)
typeof []         // "object"
typeof {}         // "object"
// To check arrays:
Array.isArray([]) // true</code></pre>
<h2>Comparison Operators</h2>
<pre><code>==  // Loose equality (type coercion) — AVOID
=== // Strict equality (no coercion) — USE THIS
!=  // Loose inequality
!== // Strict inequality

// Examples:
0 == "0"  // true (coercion!)
0 === "0" // false (different types)</code></pre>
<h2>Nullish & Logical Operators</h2>
<pre><code>// Nullish coalescing — use default if null/undefined
const name = user.name ?? "Guest";

// Optional chaining — safely access nested props
const city = user?.address?.city;

// Logical AND/OR
const result = isLoggedIn && user.name;
const display = value || "Default";</code></pre>`
                            }],
                            quizzes: [{
                                title: 'JavaScript Variables Quiz',
                                description: 'Test your understanding of JS variables and types.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'What is the difference between == and === in JavaScript?',
                                        points: 10,
                                        options: [
                                            { text: 'Both are identical', isCorrect: false },
                                            { text: '=== checks value and type, == only checks value', isCorrect: true },
                                            { text: '== is for objects, === is for primitives', isCorrect: false },
                                            { text: '=== throws an error if types differ', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'Which keyword creates a block-scoped, re-assignable variable?',
                                        points: 10,
                                        options: [
                                            { text: 'var', isCorrect: false },
                                            { text: 'const', isCorrect: false },
                                            { text: 'let', isCorrect: true },
                                            { text: 'static', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'Functions & Scope',
                            description: 'Understanding function declarations, arrow functions, closures, and scope.',
                            order: 2,
                            articles: [{
                                title: 'JavaScript Functions, Scope & Closures',
                                content: `<h1>JavaScript Functions & Scope</h1>
<p>Functions are the fundamental building blocks of JavaScript applications. Understanding scope and closures is key to writing maintainable code.</p>
<h2>Function Declarations & Expressions</h2>
<pre><code>// Function Declaration (hoisted)
function greet(name) {
  return "Hello, " + name;
}

// Function Expression (not hoisted)
const greet = function(name) {
  return "Hello, " + name;
};

// Arrow Function (no own 'this')
const greet = (name) => "Hello, " + name;

// Arrow with multiple statements
const greet = (name) => {
  const msg = "Hello, " + name;
  return msg.toUpperCase();
};</code></pre>
<h2>Default Parameters</h2>
<pre><code>function createUser(name, role = "user") {
  return { name, role };
}
createUser("Alice");         // { name: "Alice", role: "user" }
createUser("Bob", "admin"); // { name: "Bob", role: "admin" }</code></pre>
<h2>Scope</h2>
<pre><code>// Global scope
let globalVar = "I'm global";

function outer() {
  let outerVar = "I'm in outer"; // function scope

  function inner() {
    let innerVar = "I'm in inner"; // block scope
    console.log(outerVar); // ✅ can access parent scope
    console.log(globalVar); // ✅ can access global
  }
  // console.log(innerVar); // ❌ ReferenceError
}
</code></pre>
<h2>Closures</h2>
<p>A closure is a function that remembers variables from its outer scope even after the outer function has returned:</p>
<pre><code>function makeCounter() {
  let count = 0; // private variable
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count
  };
}
const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.value();     // 2</code></pre>
<h2>Rest & Spread</h2>
<pre><code>// Rest parameters
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }</code></pre>`
                            }],
                            quizzes: [{
                                title: 'Functions & Scope Quiz',
                                description: 'Test your knowledge of JS functions and closures.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'What is a closure in JavaScript?',
                                        points: 10,
                                        options: [
                                            { text: 'A way to close/terminate a function', isCorrect: false },
                                            { text: 'A function that retains access to its outer scope after the outer function returns', isCorrect: true },
                                            { text: 'A function with no return value', isCorrect: false },
                                            { text: 'A built-in error handler', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'What is the main difference between arrow functions and regular functions?',
                                        points: 10,
                                        options: [
                                            { text: 'Arrow functions are faster', isCorrect: false },
                                            { text: 'Arrow functions do not have their own "this" binding', isCorrect: true },
                                            { text: 'Arrow functions can only have one parameter', isCorrect: false },
                                            { text: 'Arrow functions are not hoisted (only regular functions are)', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'DOM Manipulation',
                            description: 'Selecting, modifying and interacting with page elements using JavaScript.',
                            order: 3,
                            articles: [{
                                title: 'JavaScript DOM Manipulation',
                                content: `<h1>The Document Object Model (DOM)</h1>
<p>The DOM is the in-memory representation of your HTML page as a tree of nodes. JavaScript can read and modify this tree to dynamically update the page.</p>
<h2>Selecting Elements</h2>
<pre><code>// By ID (returns single element)
const el = document.getElementById('hero');

// By CSS selector (returns first match)
const btn = document.querySelector('.btn-primary');

// By CSS selector (returns all matches, NodeList)
const cards = document.querySelectorAll('.card');

// Iterate NodeList
cards.forEach(card => card.classList.add('visible'));</code></pre>
<h2>Reading & Modifying Content</h2>
<pre><code>const heading = document.querySelector('h1');

// Read
heading.textContent;     // Plain text
heading.innerHTML;       // HTML string

// Write
heading.textContent = 'New Title';
heading.innerHTML = '&lt;span&gt;New&lt;/span&gt; Title';</code></pre>
<h2>Modifying Styles & Classes</h2>
<pre><code>const el = document.querySelector('.card');

// Classes
el.classList.add('active');
el.classList.remove('hidden');
el.classList.toggle('expanded');
el.classList.contains('active'); // true/false

// Inline styles (avoid where possible; prefer classes)
el.style.backgroundColor = '#6366f1';
el.style.display = 'none';</code></pre>
<h2>Creating & Inserting Elements</h2>
<pre><code>const li = document.createElement('li');
li.textContent = 'New Item';
li.classList.add('list-item');

const ul = document.querySelector('ul');
ul.appendChild(li);           // At end
ul.prepend(li);               // At start
ul.insertBefore(li, ul.children[2]); // At index</code></pre>
<h2>Removing Elements</h2>
<pre><code>const el = document.querySelector('.toast');
el.remove(); // Modern
// or: el.parentNode.removeChild(el);</code></pre>
<h2>Reading & Setting Attributes</h2>
<pre><code>const link = document.querySelector('a');
link.getAttribute('href');
link.setAttribute('href', 'https://example.com');
link.removeAttribute('disabled');</code></pre>`
                            }],
                            quizzes: [{
                                title: 'DOM Manipulation Quiz',
                                description: 'Test your DOM navigation and manipulation skills.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'Which method returns all elements matching a CSS selector?',
                                        points: 10,
                                        options: [
                                            { text: 'getElementById()', isCorrect: false },
                                            { text: 'querySelector()', isCorrect: false },
                                            { text: 'querySelectorAll()', isCorrect: true },
                                            { text: 'getElementsBySelector()', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'What is the difference between textContent and innerHTML?',
                                        points: 10,
                                        options: [
                                            { text: 'They are identical', isCorrect: false },
                                            { text: 'textContent sets plain text, innerHTML parses HTML tags', isCorrect: true },
                                            { text: 'innerHTML is safer because it escapes HTML', isCorrect: false },
                                            { text: 'textContent only works on block elements', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'ES6+ Features',
                            description: 'Modern JavaScript syntax: destructuring, spread, modules, and more.',
                            order: 4,
                            articles: [{
                                title: 'Modern JavaScript — ES6+ Features',
                                content: `<h1>Modern JavaScript (ES6+)</h1>
<p>ES6 (2015) and later versions brought massive improvements to JavaScript. These features are now essential for any professional JS developer.</p>
<h2>Destructuring</h2>
<pre><code>// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Object destructuring
const { name, age, role = 'user' } = user;

// Rename on destructure
const { name: userName } = user;

// Nested destructuring
const { address: { city } } = user;</code></pre>
<h2>Template Literals</h2>
<pre><code>const greeting = \`Hello, \${user.name}! You have \${messages.length} messages.\`;

// Multi-line strings
const html = \`
  &lt;div class="card"&gt;
    &lt;h2&gt;\${title}&lt;/h2&gt;
    &lt;p&gt;\${description}&lt;/p&gt;
  &lt;/div&gt;
\`;</code></pre>
<h2>Modules (import/export)</h2>
<pre><code>// utils.js — Named exports
export const add = (a, b) => a + b;
export const PI = 3.14159;

// Default export
export default function greet(name) { return \`Hi, \${name}\`; }

// main.js — Importing
import greet, { add, PI } from './utils.js';
import * as utils from './utils.js';</code></pre>
<h2>Optional Chaining & Nullish Coalescing</h2>
<pre><code>// Without optional chaining (crash-prone)
const city = user && user.address && user.address.city;

// With optional chaining
const city = user?.address?.city;

// Nullish coalescing (prefer over || for falsy handling)
const name = user.name ?? 'Anonymous'; // only null/undefined, not 0 or ""</code></pre>
<h2>Object Shorthand & Computed Keys</h2>
<pre><code>const name = "Alice";
const role = "admin";

// Old way:
const user = { name: name, role: role };
// New shorthand:
const user = { name, role };

// Computed property keys
const key = "dynamicKey";
const obj = { [key]: "value" }; // { dynamicKey: "value" }</code></pre>
<h2>Array Methods</h2>
<pre><code>const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2)           // [2,4,6,8,10]
nums.filter(n => n % 2 === 0)  // [2,4]
nums.reduce((sum, n) => sum + n, 0) // 15
nums.find(n => n > 3)          // 4
nums.some(n => n > 4)          // true
nums.every(n => n > 0)         // true
nums.flat()                    // flattens nested arrays</code></pre>`
                            }],
                            quizzes: [{
                                title: 'ES6+ Features Quiz',
                                description: 'Test your knowledge of modern JavaScript features.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'What does the ?. operator do in JavaScript?',
                                        points: 10,
                                        options: [
                                            { text: 'It is a ternary operator shorthand', isCorrect: false },
                                            { text: 'Optional chaining — safely accesses nested properties, returns undefined instead of throwing', isCorrect: true },
                                            { text: 'Nullish coalescing — provides a default value', isCorrect: false },
                                            { text: 'It checks if a value is null only', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'What is the difference between ?? and || operators?',
                                        points: 10,
                                        options: [
                                            { text: 'They are identical', isCorrect: false },
                                            { text: '?? only treats null/undefined as falsy; || treats any falsy value (0, "", false) as absent', isCorrect: true },
                                            { text: '|| is more modern than ??', isCorrect: false },
                                            { text: '?? works only with strings', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        },
                        {
                            name: 'Async JavaScript — Promises & Async/Await',
                            description: 'Handling asynchronous operations with Promises and async/await.',
                            order: 5,
                            articles: [{
                                title: 'Async JavaScript — Promises & Async/Await',
                                content: `<h1>Asynchronous JavaScript</h1>
<p>JavaScript is single-threaded, but handles async operations (network requests, timers, file I/O) via an event loop with callbacks, Promises, and async/await.</p>
<h2>The Problem with Callbacks</h2>
<pre><code>// Callback hell — hard to read and maintain
fetchUser(id, function(user) {
  fetchPosts(user.id, function(posts) {
    fetchComments(posts[0].id, function(comments) {
      // deeply nested, error-prone
    });
  });
});</code></pre>
<h2>Promises</h2>
<p>A Promise represents an eventual value — either resolved (success) or rejected (failure):</p>
<pre><code>const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Data!"), 1000);
});

promise
  .then(data => console.log(data))   // "Data!" after 1s
  .catch(err => console.error(err))
  .finally(() => console.log("Done"));</code></pre>
<h2>Promise Combinators</h2>
<pre><code>// Run all in parallel, wait for all:
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);

// First one to resolve wins:
const fastest = await Promise.race([fetchA(), fetchB()]);

// Wait for all, get results including failures:
const results = await Promise.allSettled([fetchA(), fetchB()]);</code></pre>
<h2>Async/Await (modern syntax)</h2>
<pre><code>async function loadDashboard(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    console.error('Failed to load:', error);
    throw error; // re-throw so caller can handle
  }
}</code></pre>
<h2>Fetching Data from APIs</h2>
<pre><code>async function getUser(id) {
  const response = await fetch(\`https://api.example.com/users/\${id}\`);
  
  if (!response.ok) {
    throw new Error(\`HTTP error! Status: \${response.status}\`);
  }
  
  const data = await response.json();
  return data;
}</code></pre>
<h2>The Event Loop</h2>
<p>JavaScript uses a non-blocking event loop: when an async operation starts, it is offloaded; when it completes, its callback is queued. The call stack processes queues in order: <strong>Call Stack → Microtasks (Promises) → Macrotasks (setTimeout)</strong>.</p>`
                            }],
                            quizzes: [{
                                title: 'Async JavaScript Quiz',
                                description: 'Test your understanding of Promises and async/await.',
                                passingScore: 80,
                                timeLimit: 10,
                                questions: [
                                    {
                                        question: 'What are the three states of a JavaScript Promise?',
                                        points: 10,
                                        options: [
                                            { text: 'Start, Running, End', isCorrect: false },
                                            { text: 'Pending, Fulfilled, Rejected', isCorrect: true },
                                            { text: 'Loading, Success, Error', isCorrect: false },
                                            { text: 'Open, Closed, Settled', isCorrect: false }
                                        ]
                                    },
                                    {
                                        question: 'Which Promise combinator runs all promises in parallel and waits for ALL to complete?',
                                        points: 10,
                                        options: [
                                            { text: 'Promise.race()', isCorrect: false },
                                            { text: 'Promise.any()', isCorrect: false },
                                            { text: 'Promise.all()', isCorrect: true },
                                            { text: 'Promise.resolve()', isCorrect: false }
                                        ]
                                    }
                                ]
                            }]
                        }
                    ]
                }
            ]
        },
        // ─────────────────────────────────────────────────────────
        // PLACEHOLDER FOR CHUNKS 2-6 (added in subsequent files)
        // ─────────────────────────────────────────────────────────
    ]
};
