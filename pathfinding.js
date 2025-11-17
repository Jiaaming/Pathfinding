/**
 * Pathfinding Algorithms for Animation
 * This file implements A* and Dijkstra algorithms for agent navigation
 */

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift()?.element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

/**
 * A* Pathfinding Algorithm
 * Uses heuristic (Manhattan distance) for efficient pathfinding
 * Returns: { path, metrics } or null if no path found
 */
function astar(grid, start, goal, rows, cols) {
    const startTime = performance.now();

    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${start.row},${start.col}`;
    const goalKey = `${goal.row},${goal.col}`;

    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(start, goal));
    openSet.enqueue(start, fScore.get(startKey));

    const visited = new Set();
    let nodesExplored = 0;

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentKey = `${current.row},${current.col}`;

        if (currentKey === goalKey) {
            const endTime = performance.now();
            const path = reconstructPath(cameFrom, current);
            return {
                path,
                metrics: {
                    computationTime: (endTime - startTime).toFixed(3),
                    nodesExplored,
                    pathLength: path.length,
                    pathCost: path.length - 1
                }
            };
        }

        visited.add(currentKey);
        nodesExplored++;

        const neighbors = getNeighbors(current, grid, rows, cols);

        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;

            if (visited.has(neighborKey)) continue;

            const tentativeGScore = gScore.get(currentKey) + 1;

            if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, goal));

                openSet.enqueue(neighbor, fScore.get(neighborKey));
            }
        }
    }

    return null; // No path found
}

/**
 * Dijkstra's Algorithm
 * Guarantees shortest path without heuristics
 * Returns: { path, metrics } or null if no path found
 */
function dijkstra(grid, start, goal, rows, cols) {
    const startTime = performance.now();

    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const distance = new Map();

    const startKey = `${start.row},${start.col}`;
    const goalKey = `${goal.row},${goal.col}`;

    distance.set(startKey, 0);
    openSet.enqueue(start, 0);

    const visited = new Set();
    let nodesExplored = 0;

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentKey = `${current.row},${current.col}`;

        if (visited.has(currentKey)) continue;
        visited.add(currentKey);
        nodesExplored++;

        if (currentKey === goalKey) {
            const endTime = performance.now();
            const path = reconstructPath(cameFrom, current);
            return {
                path,
                metrics: {
                    computationTime: (endTime - startTime).toFixed(3),
                    nodesExplored,
                    pathLength: path.length,
                    pathCost: path.length - 1
                }
            };
        }

        const neighbors = getNeighbors(current, grid, rows, cols);

        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;

            if (visited.has(neighborKey)) continue;

            const newDistance = distance.get(currentKey) + 1;

            if (!distance.has(neighborKey) || newDistance < distance.get(neighborKey)) {
                distance.set(neighborKey, newDistance);
                cameFrom.set(neighborKey, current);
                openSet.enqueue(neighbor, newDistance);
            }
        }
    }

    return null; // No path found
}

/**
 * Manhattan distance heuristic for A*
 */
function heuristic(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Get valid neighboring cells (4-directional movement for most algorithms)
 */
function getNeighbors(cell, grid, rows, cols, allowDiagonal = false) {
    const neighbors = [];
    const directions = [
        { row: -1, col: 0 },  // up
        { row: 1, col: 0 },   // down
        { row: 0, col: -1 },  // left
        { row: 0, col: 1 }    // right
    ];

    // Add diagonals for JPS and Theta*
    if (allowDiagonal) {
        directions.push(
            { row: -1, col: -1 },  // up-left
            { row: -1, col: 1 },   // up-right
            { row: 1, col: -1 },   // down-left
            { row: 1, col: 1 }     // down-right
        );
    }

    for (const dir of directions) {
        const newRow = cell.row + dir.row;
        const newCol = cell.col + dir.col;

        if (newRow >= 0 && newRow < rows &&
            newCol >= 0 && newCol < cols &&
            !grid[newRow][newCol].isObstacle) {
            neighbors.push({ row: newRow, col: newCol });
        }
    }

    return neighbors;
}

/**
 * Reconstruct the path from goal to start
 */
function reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = `${current.row},${current.col}`;

    while (cameFrom.has(currentKey)) {
        current = cameFrom.get(currentKey);
        path.unshift(current);
        currentKey = `${current.row},${current.col}`;
    }

    return path;
}

/**
 * Greedy Best-First Search
 * Uses only heuristic (no cost consideration) - fast but may not find optimal path
 * Returns: { path, metrics } or null if no path found
 */
function greedyBestFirst(grid, start, goal, rows, cols) {
    const startTime = performance.now();

    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const visited = new Set();

    const startKey = `${start.row},${start.col}`;
    const goalKey = `${goal.row},${goal.col}`;

    openSet.enqueue(start, heuristic(start, goal));
    let nodesExplored = 0;

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentKey = `${current.row},${current.col}`;

        if (visited.has(currentKey)) continue;
        visited.add(currentKey);
        nodesExplored++;

        if (currentKey === goalKey) {
            const endTime = performance.now();
            const path = reconstructPath(cameFrom, current);
            return {
                path,
                metrics: {
                    computationTime: (endTime - startTime).toFixed(3),
                    nodesExplored,
                    pathLength: path.length,
                    pathCost: path.length - 1
                }
            };
        }

        const neighbors = getNeighbors(current, grid, rows, cols);

        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;

            if (visited.has(neighborKey)) continue;

            // Only use heuristic (greedy approach)
            if (!cameFrom.has(neighborKey)) {
                cameFrom.set(neighborKey, current);
                openSet.enqueue(neighbor, heuristic(neighbor, goal));
            }
        }
    }

    return null; // No path found
}

/**
 * RRT (Rapidly-exploring Random Tree)
 * Sampling-based algorithm - explores space randomly
 * Returns: { path, metrics, tree } or null if no path found
 */
function rrt(grid, start, goal, rows, cols, maxIterations = 2000) {
    const startTime = performance.now();

    // RRT tree nodes
    const tree = [{ position: start, parent: null }];
    const stepSize = 2; // How far to extend toward random point
    const goalThreshold = 1.5; // How close to goal is "reached"
    let nodesExplored = 0;

    for (let i = 0; i < maxIterations; i++) {
        // Sample random point (bias toward goal 10% of the time)
        const randomPoint = Math.random() < 0.1 ? goal : {
            row: Math.floor(Math.random() * rows),
            col: Math.floor(Math.random() * cols)
        };

        // Find nearest node in tree
        let nearest = tree[0];
        let minDist = distance(tree[0].position, randomPoint);

        for (const node of tree) {
            const dist = distance(node.position, randomPoint);
            if (dist < minDist) {
                minDist = dist;
                nearest = node;
            }
        }

        // Extend toward random point
        const newPos = extendToward(nearest.position, randomPoint, stepSize, rows, cols);

        // Check if new position is valid (not obstacle)
        if (!newPos || grid[newPos.row][newPos.col].isObstacle) {
            continue;
        }

        // Check if path from nearest to newPos crosses obstacles
        if (pathCrossesObstacle(nearest.position, newPos, grid)) {
            continue;
        }

        // Add new node to tree
        const newNode = { position: newPos, parent: nearest };
        tree.push(newNode);
        nodesExplored++;

        // Check if we reached the goal
        if (distance(newPos, goal) < goalThreshold) {
            const endTime = performance.now();

            // Add goal as final node to ensure path ends exactly at goal
            const goalNode = { position: goal, parent: newNode };

            const path = reconstructRRTPath(goalNode);

            // Convert to grid path for smooth animation
            const gridPath = smoothRRTPath(path, grid, rows, cols);

            return {
                path: gridPath,
                metrics: {
                    computationTime: (endTime - startTime).toFixed(3),
                    nodesExplored,
                    pathLength: gridPath.length,
                    pathCost: calculatePathDistance(gridPath)
                },
                tree: tree // For visualization
            };
        }
    }

    return null; // No path found
}

function distance(a, b) {
    return Math.sqrt(Math.pow(a.row - b.row, 2) + Math.pow(a.col - b.col, 2));
}

function extendToward(from, to, stepSize, rows, cols) {
    const dist = distance(from, to);
    if (dist === 0) return null;

    const ratio = Math.min(stepSize / dist, 1.0);
    const newRow = Math.round(from.row + (to.row - from.row) * ratio);
    const newCol = Math.round(from.col + (to.col - from.col) * ratio);

    // Ensure within bounds
    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
        return null;
    }

    return { row: newRow, col: newCol };
}

function pathCrossesObstacle(from, to, grid) {
    // Check line between two points for obstacles
    const steps = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));

    for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const row = Math.round(from.row + (to.row - from.row) * t);
        const col = Math.round(from.col + (to.col - from.col) * t);

        if (grid[row][col].isObstacle) {
            return true;
        }
    }

    return false;
}

function reconstructRRTPath(node) {
    const path = [];
    let current = node;

    while (current) {
        path.unshift(current.position);
        current = current.parent;
    }

    return path;
}

function smoothRRTPath(rrtPath, grid, rows, cols) {
    // Convert RRT path to grid cells for animation
    const gridPath = [];

    for (let i = 0; i < rrtPath.length - 1; i++) {
        const from = rrtPath[i];
        const to = rrtPath[i + 1];
        const dist = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));

        for (let j = 0; j <= dist; j++) {
            const t = dist === 0 ? 0 : j / dist;
            const row = Math.round(from.row + (to.row - from.row) * t);
            const col = Math.round(from.col + (to.col - from.col) * t);

            // Avoid duplicates
            if (gridPath.length === 0 ||
                gridPath[gridPath.length - 1].row !== row ||
                gridPath[gridPath.length - 1].col !== col) {
                gridPath.push({ row, col });
            }
        }
    }

    return gridPath;
}

/**
 * Jump Point Search (JPS)
 * Optimized A* for uniform-cost grids - skips redundant nodes
 * Industry standard for 2D grid games (10-40x faster than A*)
 * Returns: { path, metrics } or null if no path found
 */
function jps(grid, start, goal, rows, cols) {
    const startTime = performance.now();

    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${start.row},${start.col}`;
    const goalKey = `${goal.row},${goal.col}`;

    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(start, goal));
    openSet.enqueue(start, fScore.get(startKey));

    const visited = new Set();
    let nodesExplored = 0;

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentKey = `${current.row},${current.col}`;

        if (visited.has(currentKey)) continue;
        visited.add(currentKey);
        nodesExplored++;

        if (currentKey === goalKey) {
            const endTime = performance.now();
            const path = reconstructPath(cameFrom, current);
            return {
                path,
                metrics: {
                    computationTime: (endTime - startTime).toFixed(3),
                    nodesExplored,
                    pathLength: path.length,
                    pathCost: calculatePathDistance(path)
                }
            };
        }

        // JPS: Find jump points in each direction
        const jumpPoints = identifySuccessors(current, grid, rows, cols, goal);

        for (const jp of jumpPoints) {
            const jpKey = `${jp.row},${jp.col}`;
            if (visited.has(jpKey)) continue;

            const tentativeG = gScore.get(currentKey) +
                               distance({row: current.row, col: current.col}, jp);

            if (!gScore.has(jpKey) || tentativeG < gScore.get(jpKey)) {
                cameFrom.set(jpKey, current);
                gScore.set(jpKey, tentativeG);
                fScore.set(jpKey, tentativeG + heuristic(jp, goal));
                openSet.enqueue(jp, fScore.get(jpKey));
            }
        }
    }

    return null;
}

function identifySuccessors(node, grid, rows, cols, goal) {
    const successors = [];
    const directions = [
        {row: -1, col: 0}, {row: 1, col: 0},  // vertical
        {row: 0, col: -1}, {row: 0, col: 1},  // horizontal
        {row: -1, col: -1}, {row: -1, col: 1}, // diagonals
        {row: 1, col: -1}, {row: 1, col: 1}
    ];

    for (const dir of directions) {
        const jumpPoint = jump(node, dir, grid, rows, cols, goal);
        if (jumpPoint) {
            successors.push(jumpPoint);
        }
    }

    return successors;
}

function jump(current, dir, grid, rows, cols, goal, depth = 0) {
    // Prevent infinite recursion
    if (depth > 100) return null;

    const next = {
        row: current.row + dir.row,
        col: current.col + dir.col
    };

    // Out of bounds or obstacle
    if (next.row < 0 || next.row >= rows || next.col < 0 || next.col >= cols ||
        grid[next.row][next.col].isObstacle) {
        return null;
    }

    // Reached goal
    if (next.row === goal.row && next.col === goal.col) {
        return next;
    }

    // Check for forced neighbors (JPS pruning rules)
    if (dir.row !== 0 && dir.col !== 0) { // Diagonal
        // Check horizontal and vertical directions
        if (jump(next, {row: dir.row, col: 0}, grid, rows, cols, goal, depth + 1) ||
            jump(next, {row: 0, col: dir.col}, grid, rows, cols, goal, depth + 1)) {
            return next;
        }
    } else {
        // Cardinal direction - check for forced neighbors
        if (hasForcedNeighbor(next, dir, grid, rows, cols)) {
            return next;
        }
    }

    // Recursively jump in same direction
    return jump(next, dir, grid, rows, cols, goal, depth + 1);
}

function hasForcedNeighbor(node, dir, grid, rows, cols) {
    if (dir.row !== 0) { // Moving vertically
        const left = node.col - 1;
        const right = node.col + 1;
        if (left >= 0 && grid[node.row][left].isObstacle &&
            node.row + dir.row >= 0 && node.row + dir.row < rows &&
            !grid[node.row + dir.row][left].isObstacle) return true;
        if (right < cols && grid[node.row][right].isObstacle &&
            node.row + dir.row >= 0 && node.row + dir.row < rows &&
            !grid[node.row + dir.row][right].isObstacle) return true;
    } else { // Moving horizontally
        const up = node.row - 1;
        const down = node.row + 1;
        if (up >= 0 && grid[up][node.col].isObstacle &&
            node.col + dir.col >= 0 && node.col + dir.col < cols &&
            !grid[up][node.col + dir.col].isObstacle) return true;
        if (down < rows && grid[down][node.col].isObstacle &&
            node.col + dir.col >= 0 && node.col + dir.col < cols &&
            !grid[down][node.col + dir.col].isObstacle) return true;
    }
    return false;
}

/**
 * Theta* Algorithm
 * Any-angle pathfinding - creates smooth, natural paths (not grid-restricted)
 * Used in RTS games and MOBAs for realistic unit movement
 * Returns: { path, metrics } or null if no path found
 */
function thetaStar(grid, start, goal, rows, cols) {
    const startTime = performance.now();

    const openSet = new PriorityQueue();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${start.row},${start.col}`;
    const goalKey = `${goal.row},${goal.col}`;

    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(start, goal));
    openSet.enqueue(start, fScore.get(startKey));
    // Don't set cameFrom for start - it has no parent

    const visited = new Set();
    let nodesExplored = 0;

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        const currentKey = `${current.row},${current.col}`;

        if (visited.has(currentKey)) continue;
        visited.add(currentKey);
        nodesExplored++;

        if (currentKey === goalKey) {
            const endTime = performance.now();
            const path = reconstructPath(cameFrom, current);
            return {
                path,
                metrics: {
                    computationTime: (endTime - startTime).toFixed(3),
                    nodesExplored,
                    pathLength: path.length,
                    pathCost: calculatePathDistance(path)
                }
            };
        }

        const neighbors = getNeighbors(current, grid, rows, cols, true); // Allow diagonals

        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            if (visited.has(neighborKey)) continue;

            // Theta*: Try line-of-sight to parent's parent
            const parent = cameFrom.get(currentKey);
            let tentativeG;

            if (parent && lineOfSight(parent, neighbor, grid)) {
                // Path 2: Direct line from parent's parent to neighbor
                const parentKey = `${parent.row},${parent.col}`;
                tentativeG = gScore.get(parentKey) + distance(parent, neighbor);

                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, parent);
                    gScore.set(neighborKey, tentativeG);
                    fScore.set(neighborKey, tentativeG + heuristic(neighbor, goal));
                    openSet.enqueue(neighbor, fScore.get(neighborKey));
                }
            } else {
                // Path 1: Normal A* path through current
                tentativeG = gScore.get(currentKey) + distance(current, neighbor);

                if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeG);
                    fScore.set(neighborKey, tentativeG + heuristic(neighbor, goal));
                    openSet.enqueue(neighbor, fScore.get(neighborKey));
                }
            }
        }
    }

    return null;
}

function lineOfSight(a, b, grid) {
    // Bresenham's line algorithm to check visibility
    let x0 = a.col, y0 = a.row;
    let x1 = b.col, y1 = b.row;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
        if (grid[y0][x0].isObstacle) return false;
        if (x0 === x1 && y0 === y1) break;

        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }

    return true;
}

function calculatePathDistance(path) {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
        dist += distance(path[i], path[i + 1]);
    }
    return Math.round(dist * 10) / 10; // Round to 1 decimal
}

/**
 * Export pathfinding functions
 */
const Pathfinding = {
    astar,
    dijkstra,
    greedyBestFirst,
    rrt,
    jps,
    thetaStar
};
