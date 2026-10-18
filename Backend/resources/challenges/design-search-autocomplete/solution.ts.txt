/**
 * Conceptual Autocomplete System implementation using an optimized Trie.
 */

class TrieNode {
    children: Map<string, TrieNode> = new Map();
    // Cache the top results at each node for O(L) retrieval
    topCompletions: string[] = [];
}

class AutocompleteSystem {
    private root: TrieNode = new TrieNode();

    // 1. In-memory Search (Blazing fast)
    public search(prefix: string): string[] {
        let curr = this.root;
        for (const char of prefix) {
            if (!curr.children.has(char)) return [];
            curr = curr.children.get(char)!;
        }
        return curr.topCompletions;
    }

    // 2. Offline aggregation (Data Flow)
    /**
     * In a real system, you wouldn't update the trie in-place for every keystroke.
     * You would log queries to Kafka, aggregate them with Spark/MapReduce,
     * and periodically build/re-deploy the Trie snapshot.
     */
    public buildTrie(queryFrequencies: Map<string, number>) {
        const sortedQueries = Array.from(queryFrequencies.entries())
            .sort((a, b) => b[1] - a[1]);

        for (const [query, freq] of sortedQueries) {
            this.insert(query);
        }
    }

    private insert(query: string) {
        let curr = this.root;
        for (const char of query) {
            if (!curr.children.has(char)) {
                curr.children.set(char, new TrieNode());
            }
            curr = curr.children.get(char)!;
            
            // Add to top completions if it's not already full
            if (curr.topCompletions.length < 5) {
                curr.topCompletions.push(query);
            }
        }
    }
}
