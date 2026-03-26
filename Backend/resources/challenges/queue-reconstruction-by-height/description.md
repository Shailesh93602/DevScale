# Queue Reconstruction by Height

You are given an array of people, `people`, which are the attributes of some people in a queue (not necessarily in order). Each `people[i] = [hi, ki]` represents the `i-th` person of height `hi` with exactly `ki` other people in front who have a height greater than or equal to `hi`.

Reconstruct and return the queue that is represented by the input array `people`. The returned queue should be formatted as an array `ans`, where `ans[j] = [hj, kj]` is the attributes of the `j-th` person in the queue (`ans[0]` is the person at the front of the queue).

### Example 1:
**Input:** `people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]`
**Output:** `[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]`
**Explanation:**
- Person [5,0] has 0 people taller or equal in front.
- Person [7,0] has 0 people taller or equal in front.
- Person [5,2] has 2 people taller or equal in front ([5,0] and [7,0]).
- Person [6,1] has 1 person taller or equal in front ([7,0]).
- Person [4,4] has 4 people taller or equal in front ([5,0], [7,0], [5,2], [6,1]).
- Person [7,1] has 1 person taller or equal in front ([7,0]).

### Example 2:
**Input:** `people = [[6,0],[5,0],[4,0],[3,2],[2,2],[1,4]]`
**Output:** `[[4,0],[5,0],[2,2],[3,2],[1,4],[6,0]]`

### Constraints:
- `1 <= people.length <= 2000`
- `0 <= hi <= 10^6`
- `0 <= ki < people.length`
- It is guaranteed that the queue can be reconstructed.

