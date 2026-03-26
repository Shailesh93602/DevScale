# Design Search Autocomplete System

Design a real-time search autocomplete system similar to Google Search or Amazon's search bar. When a user types a prefix, the system should suggest the top $K$ (e.g., 5-10) most relevant and popular completed queries.

## Requirements

### Functional Requirements
1. **Top K Suggestions**: Return the most popular/relevant completions starting with the given prefix.
2. **Frequency Tracking**: When a user completes a search, its popularity score should be updated.
3. **Real-time Performance**: Suggestions must appear as the user types, requiring extremely low latency.

### Non-Functional Requirements
1. **Low Latency**: The response time for each character typed should be under 100ms.
2. **High Scalability**: Handle billions of searches per day and a massive dictionary of potential queries.
3. **High Availability**: The system must remain operational even if some backend components fail.
4. **Accuracy**: Suggestions should be relevant and spelled correctly.

## Architectural Components

### 1. Data Structure: Trie
A **Trie** (Prefix Tree) is the classic choice for storing strings for prefix-based recovery.
*   Each node represents a character.
*   To speed up queries, each node can store the top $K$ results for its prefix directly, avoiding a full tree traversal during a live search.

### 2. Scaling: Sharding
How do you shard a Trie across multiple servers?
*   **By First Character**: Server A handles prefixes starting with 'a', Server B for 'b', and so on.
*   **Pros**: Easy to implement.
*   **Cons**: Uneven distribution (e.g., 's' and 't' are more common than 'x' and 'z').
*   **Solution**: Use consistent hashing or a range-based partition mapping (e.g., 'a-m' on one node, 'n-z' on another).

### 3. Updating Popularity: The Aggregation Service
Query frequencies shouldn't be updated in the Trie in real-time for every single keystroke.
1.  **Log Sink**: Log all completed searches.
2.  **Aggregation**: Batch process logs (e.g., every 5-15 mins) to count frequencies.
3.  **Trie Update**: Update the persistent Trie storage and refresh the in-memory caches.

## Examples

**Example Scenario**:
1. Dictionary starts with `{"how to bake": 100, "how to code": 120}`.
2. User types "how t".
3. System finds node `t` in the trie path `h -> o -> w -> _ -> t`.
4. Node `t` already has a pre-computed list: `["how to code", "how to bake"]`.
5. User completes "how to bake". The system increments its score.

## Constraints
- Max prefix length: 50 characters.
- Dictionary size: 100M+ unique queries.
- Read/Write ratio: Read-heavy (100:1).

