// O(V + E) Time, O(V + E) Space — DFS cycle detection with 3-state coloring
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const adj: number[][] = Array.from({ length: numCourses }, () => []);
  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
  }

  // 0 = unvisited, 1 = visiting, 2 = done
  const state = new Array(numCourses).fill(0);

  function hasCycle(node: number): boolean {
    if (state[node] === 1) return true;   // Back edge = cycle
    if (state[node] === 2) return false;  // Already fully processed

    state[node] = 1; // Mark as visiting

    for (const neighbor of adj[node]) {
      if (hasCycle(neighbor)) return true;
    }

    state[node] = 2; // Mark as done
    return false;
  }

  for (let i = 0; i < numCourses; i++) {
    if (hasCycle(i)) return false;
  }

  return true;
}
