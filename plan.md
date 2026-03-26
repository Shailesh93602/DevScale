# Challenge System Evolution Plan: Phase 2

This plan outlines the next steps to make the coding challenges feature robust, professional, and competitive (LeetCode-style).

## 1. Challenge Content & Quality (Robustness)

- [ ] **Edge Case Audit**: Systematically add hidden test cases for every challenge:
    - Empty inputs, null values.
    - Maximum/Minimum constraints.
    - Large data sets for performance testing ($TLE$ detection).
    - Unordered or negative inputs where applicable.
- [ ] **Solution Coverage**: Validate all `solution.ts` files against the test cases to ensure the provided solutions are actually correct and optimized.
- [ ] **Boilerplate Standardization**: Ensure every language (JavaScript, Python, Java, C++, Go) has high-quality, working boilerplates for all 319 challenges.
- [ ] **Image/Diagram Support**: Add Mermaid diagrams or images to `description.md` for complex tree/graph problems.

## 2. User Experience (UI/UX) Improvements

- [ ] **Collapsed Hints**:
    - [ ] Modify `CodingChallenge.tsx` to use an Accordion or a "Show Hint" button for each hint individually.
    - [ ] Prevent spoilers by hiding hints by default.
- [ ] **Console Overhaul**:
    - [ ] Add a "Test Case" tab where users can modify the input for a custom run.
    - [ ] Better error formatting (tracebacks for Python, stack traces for JS).
- [ ] **Editor Enhancements**:
    - [ ] Local persistence of code drafts (currently in `localStorage`, ensure it's robust across browser sessions).
    - [ ] Auto-complete and IntelliSense for problem-specific types.
- [ ] **Submissions History**:
    - [ ] Build a robust "Submissions" tab showing past attempts, status, runtime, and memory usage.

## 3. Platform Reliability

- [ ] **Execution Security**: Ensure the `/run-code` backend is fully isolated (sandboxed) to prevent malicious code execution.
- [ ] **Resource Limits**: Implement strict `time_limit` and `memory_limit` enforcement in the runner.
- [ ] **Concurrency**: Optimize the backend to handle multiple simultaneous code execution requests efficiently.

## 4. Engagement Features

- [ ] **Discussion Board**: Allow users to share solutions and discuss problems.
- [ ] **Personal Stats**: Track solve rates, difficulty distribution, and "Streaks".
- [ ] **Company Tracking**: Highlight challenges recently asked at specific companies (Google, Meta, etc.) more prominently.

## Next Priority Tasks (Immediate Action)

1. **Fix Hint UI**: Update the frontend to collapse hints.
2. **Add Missing Test Cases**: Focus on "Hard" challenges first to ensure they are truly robust.
3. **Validate Solutions**: Run a script to batch-validate all seeded challenges using their provided solutions.
