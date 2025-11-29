/**
 * Algorithm runner/dispatcher
 * Keeps algorithm-selection logic out of app.js
 */
const AlgorithmRunner = (() => {
    function runGrid(agent, grid, rows, cols) {
        switch (agent.algorithm) {
            case 'astar':
                return astar(grid, agent.start, agent.goal, rows, cols);
            case 'dijkstra':
                return dijkstra(grid, agent.start, agent.goal, rows, cols);
            case 'greedy':
                return greedyBestFirst(grid, agent.start, agent.goal, rows, cols);
            case 'rrt':
                return rrt(grid, agent.start, agent.goal, rows, cols);
            case 'jps':
                return jps(grid, agent.start, agent.goal, rows, cols);
            case 'theta':
                return thetaStar(grid, agent.start, agent.goal, rows, cols);
            default:
                return null;
        }
    }

    function runNavmesh(agent, grid, navmesh, rows, cols, cellSize) {
        // Build navmesh lazily
        if (!navmesh) {
            navmesh = generateNavMesh(grid, rows, cols, cellSize);
        }

        let result = null;
        switch (agent.algorithm) {
            case 'astar':
                result = navmeshAStar(navmesh, agent.start, agent.goal, grid);
                break;
            case 'dijkstra':
                result = navmeshDijkstra(navmesh, agent.start, agent.goal, grid);
                break;
            case 'greedy':
                result = navmeshGreedy(navmesh, agent.start, agent.goal, grid);
                break;
            case 'rrt':
                result = navmeshRRT(navmesh, agent.start, agent.goal, grid);
                break;
            case 'jps':
            case 'theta':
                // Not supported directly on navmesh; use A* fallback
                result = navmeshAStar(navmesh, agent.start, agent.goal, grid);
                break;
            default:
                result = null;
        }

        return { result, navmesh };
    }

    return {
        runGrid,
        runNavmesh
    };
})();
