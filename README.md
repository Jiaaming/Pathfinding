## Pathfinding Animation

Small web demo for my computer animation course. It shows how multiple agents can move across a 2D arena without hand-authored keyframes. Everything is driven by pathfinding and simple interpolation.

### Features
- 30×40 grid plus auto-generated navmesh overlay (blue edges/green nodes) for any-angle motion.
- Agents have color tags, start/goal markers, algorithm selector, live status, and metrics (time, explored nodes, path length).
- Eight preset scenarios: simple lane, complex maze, central detour, narrow corridor, four-agent race, A* challenge, spiral maze, and an empty sandbox.

### Algorithms
Grid mode: A*, Dijkstra, Greedy Best-First, Jump Point Search, Theta*, RRT.  
NavMesh mode: waypoint A*, Dijkstra, Greedy, RRT (JPS/Theta fall back to navmesh A*). Every run reports the same metrics so comparisons are simple.

### Run It
```bash
open index.html
# or
python -m http.server 8000
```
Pick a scenario (Complex Maze is a good intro), press Start, and watch the colored agents move.

### Why It Matters
The project links algorithmic path planning with animation practice: users sketch obstacles, choose algorithms, and the app animates the result. It is a quick classroom demo for behavioral animation and navmesh concepts.
