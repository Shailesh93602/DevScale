# Design Search Autocomplete System

## Problem Description

Design a real-time search autocomplete system like Google's search bar. Given a partial query string from a user, return the top 5 most relevant completions in less than 100ms. The system must handle huge volumes of queries and update its completions based on trending topics.

## Requirements

### Functional Requirements
1. **Autocomplete**: Return top 5 suggestions matching the given prefix.
2. **Frequency Updates**: Record user queries to update suggestion popularity.
3. **Real-time Trending**: New popular queries should appear in suggestions quickly.
4. **Weighted Results**: Sort suggestions by a combination of popularity, relevance, and personalization.

### Non-Functional Requirements
1. **Low Latency**: Autocomplete response must be < 100ms for a great user experience.
2. **High Scalability**: Handle 10M+ unique queries per day and 5B+ search completions.
3. **High Availability**: The system must be resilient to server failures.
4. **Data Durability**: Popularity data and prefix data must not be lost.

## API Design

```typescript
class AutocompleteSystem {
  /**
   * Returns top 5 relevant completions for a given prefix.
   */
  getSuggestions(prefix: string): string[];

  /**
   * Records a user's finalized query to update weights.
   */
  recordQuery(query: string): void;
}
```

## Examples

### Example 1
**Input prefix**: "how to "
**Output**: `['how to bake a cake', 'how to code in python', 'how to make coffee', 'how to draw', 'how to swim']`

## Constraints
- Prefix can contain alphanumeric characters and spaces.
- Handle multi-region traffic efficiently.
- Prefix size is typically small (2-50 characters).
- Total dictionary size can be in the millions.
