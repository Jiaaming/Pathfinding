/**
 * NavMesh (Navigation Mesh) Implementation
 * Used in game industry for realistic pathfinding
 * Converts grid obstacles into walkable polygons
 */

/**
 * Generate NavMesh from grid obstacles
 * Simplified approach: Create rectangular walkable regions
 */
function generateNavMesh(grid, rows, cols, cellSize) {
    // For simplicity, we'll use a waypoint-based NavMesh
    // Place waypoints at corners of obstacles and open areas
    const waypoints = [];
    const edges = [];

    // Step 1: Generate waypoints at strategic locations
    // Add corner points around obstacles
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col].isObstacle) {
                // Add waypoints at obstacle corners (8 directions around obstacle)
                const corners = [
                    {row: row - 1, col: col - 1}, {row: row - 1, col: col}, {row: row - 1, col: col + 1},
                    {row: row, col: col - 1}, {row: row, col: col + 1},
                    {row: row + 1, col: col - 1}, {row: row + 1, col: col}, {row: row + 1, col: col + 1}
                ];

                for (const corner of corners) {
                    if (corner.row >= 0 && corner.row < rows &&
                        corner.col >= 0 && corner.col < cols &&
                        !grid[corner.row][corner.col].isObstacle) {

                        // Check if waypoint already exists
                        const exists = waypoints.some(w => w.row === corner.row && w.col === corner.col);
                        if (!exists) {
                            waypoints.push({
                                id: waypoints.length,
                                row: corner.row,
                                col: corner.col
                            });
                        }
                    }
                }
            }
        }
    }

    // Step 2: Add waypoints in open areas (every 5 cells)
    const spacing = 5;
    for (let row = 2; row < rows; row += spacing) {
        for (let col = 2; col < cols; col += spacing) {
            if (!grid[row][col].isObstacle) {
                const exists = waypoints.some(w => w.row === row && w.col === col);
                if (!exists) {
                    waypoints.push({
                        id: waypoints.length,
                        row: row,
                        col: col
                    });
                }
            }
        }
    }

    // Step 3: Connect waypoints with edges (if line of sight exists)
    for (let i = 0; i < waypoints.length; i++) {
        for (let j = i + 1; j < waypoints.length; j++) {
            const w1 = waypoints[i];
            const w2 = waypoints[j];

            // Only connect if reasonably close (max distance)
            const dist = Math.sqrt(Math.pow(w1.row - w2.row, 2) + Math.pow(w1.col - w2.col, 2));
            if (dist > 15) continue; // Don't connect waypoints too far apart

            // Check if line of sight exists (no obstacles between)
            if (hasLineOfSight(w1, w2, grid)) {
                edges.push({
                    from: i,
                    to: j,
                    cost: dist
                });
            }
        }
    }

    return {
        waypoints,
        edges,
        type: 'waypoint-navmesh'
    };
}

/**
 * Check if there's a clear line of sight between two points
 */
function hasLineOfSight(from, to, grid) {
    // Bresenham's line algorithm
    let x0 = from.col;
    let y0 = from.row;
    const x1 = to.col;
    const y1 = to.row;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
        // Check if current cell is obstacle
        if (y0 >= 0 && y0 < grid.length && x0 >= 0 && x0 < grid[0].length) {
            if (grid[y0][x0].isObstacle) {
                return false;
            }
        }

        if (x0 === x1 && y0 === y1) break;

        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }

    return true;
}

/**
 * A* pathfinding on NavMesh waypoints
 */
function navmeshAStar(navmesh, start, goal, grid) {
    const startTime = performance.now();

    // Find nearest waypoints to start and goal
    const startWaypoint = findNearestWaypoint(navmesh.waypoints, start, grid);
    const goalWaypoint = findNearestWaypoint(navmesh.waypoints, goal, grid);

    if (!startWaypoint || !goalWaypoint) {
        return null; // Can't find valid waypoints
    }

    // Build adjacency list from edges
    const adjacency = new Map();
    for (let i = 0; i < navmesh.waypoints.length; i++) {
        adjacency.set(i, []);
    }

    for (const edge of navmesh.edges) {
        adjacency.get(edge.from).push({ id: edge.to, cost: edge.cost });
        adjacency.get(edge.to).push({ id: edge.from, cost: edge.cost });
    }

    // A* on waypoint graph
    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startId = startWaypoint.id;
    const goalId = goalWaypoint.id;

    gScore.set(startId, 0);
    const h = heuristicWaypoint(startWaypoint, goalWaypoint);
    fScore.set(startId, h);
    openSet.enqueue(startId, h);

    const visited = new Set();
    const visitedNodes = [];
    let nodesExplored = 0;

    while (!openSet.isEmpty()) {
        const currentId = openSet.dequeue();

        if (visited.has(currentId)) continue;
        visited.add(currentId);
        visitedNodes.push(navmesh.waypoints[currentId]);
        nodesExplored++;

        if (currentId === goalId) {
            // Reconstruct path
            const waypointPath = reconstructWaypointPath(cameFrom, currentId, navmesh.waypoints);

            // Add start and goal to path
            waypointPath.unshift(start);
            waypointPath.push(goal);

            // Smooth path for animation
            const smoothPath = smoothNavMeshPath(waypointPath, grid);

            const endTime = performance.now();
            return {
                path: smoothPath,
                exploredNodes: visitedNodes,
                metrics: {
                    computationTime: (endTime - startTime).toFixed(3),
                    nodesExplored,
                    pathLength: smoothPath.length,
                    pathCost: calculatePathDistanceNavMesh(smoothPath)
                },
                waypointPath: waypointPath
            };
        }

        const neighbors = adjacency.get(currentId) || [];
        for (const neighbor of neighbors) {
            if (visited.has(neighbor.id)) continue;

            const tentativeG = gScore.get(currentId) + neighbor.cost;

            if (!gScore.has(neighbor.id) || tentativeG < gScore.get(neighbor.id)) {
                cameFrom.set(neighbor.id, currentId);
                gScore.set(neighbor.id, tentativeG);
                const h = heuristicWaypoint(navmesh.waypoints[neighbor.id], goalWaypoint);
                fScore.set(neighbor.id, tentativeG + h);
                openSet.enqueue(neighbor.id, fScore.get(neighbor.id));
            }
        }
    }

    return null; // No path found
}

function findNearestWaypoint(waypoints, point, grid) {
    let nearest = null;
    let minDist = Infinity;

    for (const wp of waypoints) {
        // Check if waypoint is reachable from point
        if (hasLineOfSight(point, wp, grid)) {
            const dist = Math.sqrt(Math.pow(point.row - wp.row, 2) + Math.pow(point.col - wp.col, 2));
            if (dist < minDist) {
                minDist = dist;
                nearest = wp;
            }
        }
    }

    return nearest;
}

function heuristicWaypoint(wp1, wp2) {
    return Math.sqrt(Math.pow(wp1.row - wp2.row, 2) + Math.pow(wp1.col - wp2.col, 2));
}

function reconstructWaypointPath(cameFrom, currentId, waypoints) {
    const path = [waypoints[currentId]];
    let current = currentId;

    while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        path.unshift(waypoints[current]);
    }

    return path;
}

function smoothNavMeshPath(waypointPath, grid) {
    // Convert waypoint path to smooth grid path for animation
    const smoothPath = [];

    for (let i = 0; i < waypointPath.length - 1; i++) {
        const from = waypointPath[i];
        const to = waypointPath[i + 1];
        const dist = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));

        for (let j = 0; j <= dist; j++) {
            const t = dist === 0 ? 0 : j / dist;
            const row = Math.round(from.row + (to.row - from.row) * t);
            const col = Math.round(from.col + (to.col - from.col) * t);

            // Avoid duplicates
            if (smoothPath.length === 0 ||
                smoothPath[smoothPath.length - 1].row !== row ||
                smoothPath[smoothPath.length - 1].col !== col) {
                smoothPath.push({ row, col });
            }
        }
    }

    // Always include final point
    const last = waypointPath[waypointPath.length - 1];
    if (smoothPath.length === 0 ||
        smoothPath[smoothPath.length - 1].row !== last.row ||
        smoothPath[smoothPath.length - 1].col !== last.col) {
        smoothPath.push({ row: last.row, col: last.col });
    }

    return smoothPath;
}

function calculatePathDistanceNavMesh(path) {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const dx = path[i + 1].col - path[i].col;
        const dy = path[i + 1].row - path[i].row;
        dist += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.round(dist * 10) / 10;
}

/**
 * Dijkstra on NavMesh - No heuristic, explores uniformly
 */
function navmeshDijkstra(navmesh, start, goal, grid) {
    const startTime = performance.now();

    const startWaypoint = findNearestWaypoint(navmesh.waypoints, start, grid);
    const goalWaypoint = findNearestWaypoint(navmesh.waypoints, goal, grid);

    if (!startWaypoint || !goalWaypoint) return null;

    const adjacency = buildAdjacencyList(navmesh);

    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();

    const startId = startWaypoint.id;
    const goalId = goalWaypoint.id;

    gScore.set(startId, 0);
    openSet.enqueue(startId, 0);

    const visited = new Set();
    const visitedNodes = [];
    let nodesExplored = 0;

    while (!openSet.isEmpty()) {
        const currentId = openSet.dequeue();

        if (visited.has(currentId)) continue;
        visited.add(currentId);
        visitedNodes.push(navmesh.waypoints[currentId]);
        nodesExplored++;

        if (currentId === goalId) {
            return buildNavMeshResult(cameFrom, currentId, navmesh, start, goal, grid, startTime, nodesExplored, visitedNodes);
        }

        const neighbors = adjacency.get(currentId) || [];
        for (const neighbor of neighbors) {
            if (visited.has(neighbor.id)) continue;

            const tentativeG = gScore.get(currentId) + neighbor.cost;

            if (!gScore.has(neighbor.id) || tentativeG < gScore.get(neighbor.id)) {
                cameFrom.set(neighbor.id, currentId);
                gScore.set(neighbor.id, tentativeG);
                openSet.enqueue(neighbor.id, tentativeG); // No heuristic!
            }
        }
    }

    return null;
}

/**
 * Greedy Best-First on NavMesh - Only uses heuristic
 */
function navmeshGreedy(navmesh, start, goal, grid) {
    const startTime = performance.now();

    const startWaypoint = findNearestWaypoint(navmesh.waypoints, start, grid);
    const goalWaypoint = findNearestWaypoint(navmesh.waypoints, goal, grid);

    if (!startWaypoint || !goalWaypoint) return null;

    const adjacency = buildAdjacencyList(navmesh);

    const openSet = new PriorityQueue();
    const cameFrom = new Map();

    const startId = startWaypoint.id;
    const goalId = goalWaypoint.id;

    const h = heuristicWaypoint(startWaypoint, goalWaypoint);
    openSet.enqueue(startId, h);

    const visited = new Set();
    const visitedNodes = [];
    let nodesExplored = 0;

    while (!openSet.isEmpty()) {
        const currentId = openSet.dequeue();

        if (visited.has(currentId)) continue;
        visited.add(currentId);
        visitedNodes.push(navmesh.waypoints[currentId]);
        nodesExplored++;

        if (currentId === goalId) {
            return buildNavMeshResult(cameFrom, currentId, navmesh, start, goal, grid, startTime, nodesExplored, visitedNodes);
        }

        const neighbors = adjacency.get(currentId) || [];
        for (const neighbor of neighbors) {
            if (visited.has(neighbor.id)) continue;

            if (!cameFrom.has(neighbor.id)) {
                cameFrom.set(neighbor.id, currentId);
                const h = heuristicWaypoint(navmesh.waypoints[neighbor.id], goalWaypoint);
                openSet.enqueue(neighbor.id, h); // Only heuristic!
            }
        }
    }

    return null;
}

/**
 * RRT on NavMesh - Sample random waypoints
 */
function navmeshRRT(navmesh, start, goal, grid, maxIterations = 1000) {
    const startTime = performance.now();

    const tree = [{ position: start, parent: null }];
    const goalThreshold = 3.0;
    let nodesExplored = 0;
    const exploredNodes = [];

    for (let i = 0; i < maxIterations; i++) {
        // Sample random waypoint or goal
        let randomPoint;
        if (Math.random() < 0.2) {
            randomPoint = goal;
        } else {
            const randomWp = navmesh.waypoints[Math.floor(Math.random() * navmesh.waypoints.length)];
            randomPoint = { row: randomWp.row, col: randomWp.col };
        }

        // Find nearest node in tree
        let nearest = tree[0];
        let minDist = distance2D(tree[0].position, randomPoint);

        for (const node of tree) {
            const dist = distance2D(node.position, randomPoint);
            if (dist < minDist) {
                minDist = dist;
                nearest = node;
            }
        }

        // Extend toward random point
        const stepSize = 3;
        const dist = distance2D(nearest.position, randomPoint);
        if (dist === 0) continue;

        const ratio = Math.min(stepSize / dist, 1.0);
        const newPos = {
            row: Math.round(nearest.position.row + (randomPoint.row - nearest.position.row) * ratio),
            col: Math.round(nearest.position.col + (randomPoint.col - nearest.position.col) * ratio)
        };

        // Check validity
        if (newPos.row < 0 || newPos.row >= grid.length ||
            newPos.col < 0 || newPos.col >= grid[0].length ||
            grid[newPos.row][newPos.col].isObstacle) {
            continue;
        }

        if (pathCrossesObstacleNavMesh(nearest.position, newPos, grid)) {
            continue;
        }

        // Add new node
        const newNode = { position: newPos, parent: nearest };
        tree.push(newNode);
        exploredNodes.push(newPos);
        nodesExplored++;

        // Check if reached goal
        if (distance2D(newPos, goal) < goalThreshold) {
            const goalNode = { position: goal, parent: newNode };
            const path = reconstructRRTPathNavMesh(goalNode);
            const smoothPath = smoothNavMeshPath(path, grid);

            const endTime = performance.now();
            return {
                path: smoothPath,
                exploredNodes,
                metrics: {
                    computationTime: (endTime - startTime).toFixed(3),
                    nodesExplored,
                    pathLength: smoothPath.length,
                    pathCost: calculatePathDistanceNavMesh(smoothPath)
                }
            };
        }
    }

    return null;
}

/**
 * Helper functions
 */
function buildAdjacencyList(navmesh) {
    const adjacency = new Map();
    for (let i = 0; i < navmesh.waypoints.length; i++) {
        adjacency.set(i, []);
    }

    for (const edge of navmesh.edges) {
        adjacency.get(edge.from).push({ id: edge.to, cost: edge.cost });
        adjacency.get(edge.to).push({ id: edge.from, cost: edge.cost });
    }

    return adjacency;
}

function buildNavMeshResult(cameFrom, goalId, navmesh, start, goal, grid, startTime, nodesExplored, visitedNodes = []) {
    const waypointPath = reconstructWaypointPath(cameFrom, goalId, navmesh.waypoints);
    waypointPath.unshift(start);
    waypointPath.push(goal);

    // Use Funnel Algorithm for industry-standard path smoothing
    const funnelPath = funnelAlgorithm(waypointPath, navmesh, grid);
    const smoothPath = smoothNavMeshPath(funnelPath, grid);

    const endTime = performance.now();
    return {
        path: smoothPath,
        exploredNodes: visitedNodes,
        metrics: {
            computationTime: (endTime - startTime).toFixed(3),
            nodesExplored,
            pathLength: smoothPath.length,
            pathCost: calculatePathDistanceNavMesh(smoothPath)
        },
        waypointPath: waypointPath
    };
}

function distance2D(a, b) {
    return Math.sqrt(Math.pow(a.row - b.row, 2) + Math.pow(a.col - b.col, 2));
}

function pathCrossesObstacleNavMesh(from, to, grid) {
    const steps = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));

    for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const row = Math.round(from.row + (to.row - from.row) * t);
        const col = Math.round(from.col + (to.col - from.col) * t);

        if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
            return true;
        }
        if (grid[row][col].isObstacle) {
            return true;
        }
    }

    return false;
}

function reconstructRRTPathNavMesh(node) {
    const path = [];
    let current = node;

    while (current) {
        path.unshift(current.position);
        current = current.parent;
    }

    return path;
}

/**
 * Simplified Path Smoothing for NavMesh
 * Uses line-of-sight to skip unnecessary waypoints
 * Similar to Funnel Algorithm but simpler and more stable
 */
function funnelAlgorithm(waypointPath, navmesh, grid) {
    if (waypointPath.length <= 2) {
        return waypointPath;
    }

    const smoothPath = [waypointPath[0]];
    let currentIndex = 0;

    while (currentIndex < waypointPath.length - 1) {
        let farthestVisible = currentIndex + 1;

        // Find the farthest waypoint we can see from current position
        for (let i = currentIndex + 2; i < waypointPath.length; i++) {
            if (hasLineOfSight(waypointPath[currentIndex], waypointPath[i], grid)) {
                farthestVisible = i;
            } else {
                break; // Can't see further, stop
            }
        }

        // Move to the farthest visible waypoint
        smoothPath.push(waypointPath[farthestVisible]);
        currentIndex = farthestVisible;
    }

    return smoothPath;
}

/**
 * Note: PriorityQueue is already defined in pathfinding.js
 * We reuse it from there instead of redeclaring
 */
