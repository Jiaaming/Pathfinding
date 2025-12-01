/**
 * Predefined Scenarios for Pathfinding Comparison
 * Separated by map type: Grid-only and NavMesh-compatible
 */

const SCENARIOS = {
    // ===== GRID MODE SCENARIOS (with JPS and Theta*) =====

    gridUltimate: {
        name: "Grid 1",
        description: "Grid mode: dense maze-like map; long detours force hard searches.",
        mapType: 'grid', // Grid-only
        rows: 30,
        cols: 40,
        obstacles: [
            // Complex maze-like structure: multiple layers of corridors
            ...Array.from({ length: 14 }, (_, i) => ({ row: 6, col: 8 + i })),
            ...Array.from({ length: 12 }, (_, i) => ({ row: 10, col: 10 + i })),
            ...Array.from({ length: 16 }, (_, i) => ({ row: 14, col: 6 + i })),
            ...Array.from({ length: 14 }, (_, i) => ({ row: 18, col: 12 + i })),
            ...Array.from({ length: 12 }, (_, i) => ({ row: 22, col: 14 + i })),
            ...Array.from({ length: 20 }, (_, i) => ({ row: 26, col: 5 + i })),
            // Vertical pillars
            ...Array.from({ length: 8 }, (_, i) => ({ row: 7 + i, col: 12 })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 11 + i, col: 20 })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 9 + i, col: 26 })),
            ...Array.from({ length: 7 }, (_, i) => ({ row: 15 + i, col: 32 })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 12 + i, col: 16 })),
            // Dead ends / blockers
            ...Array.from({ length: 4 }, (_, i) => ({ row: 4 + i, col: 5 })),
            ...Array.from({ length: 4 }, (_, i) => ({ row: 4 + i, col: 35 })),
            ...Array.from({ length: 5 }, (_, i) => ({ row: 20 + i, col: 4 })),
            ...Array.from({ length: 5 }, (_, i) => ({ row: 20 + i, col: 36 })),
        ],
        agents: [
            {
                color: '#FF6B6B',
                algorithm: 'astar',
                start: { row: 14, col: 5 },
                goal: { row: 14, col: 35 }
            },
            {
                color: '#4ECDC4',
                algorithm: 'jps',
                start: { row: 14, col: 5 },
                goal: { row: 14, col: 35 }
            },
            {
                color: '#45B7D1',
                algorithm: 'theta',
                start: { row: 14, col: 5 },
                goal: { row: 14, col: 35 }
            },
            {
                color: '#FFA07A',
                algorithm: 'dijkstra',
                start: { row: 14, col: 5 },
                goal: { row: 14, col: 35 }
            },
            {
                color: '#98D8C8',
                algorithm: 'greedy',
                start: { row: 14, col: 5 },
                goal: { row: 14, col: 35 }
            },
            {
                color: '#F7DC6F',
                algorithm: 'rrt',
                start: { row: 14, col: 5 },
                goal: { row: 14, col: 35 }
            }
        ]
    },

    gridMaze: {
        name: "Grid 2",
        description: "Grid mode: tight corridors, multiple chokepoints; very punishing for greedy paths.",
        mapType: 'grid',
        rows: 30,
        cols: 40,
        obstacles: [
            // Vertical walls
            ...Array.from({ length: 24 }, (_, i) => ({ row: 3 + i, col: 8 })),
            ...Array.from({ length: 22 }, (_, i) => ({ row: 4 + i, col: 16 })),
            ...Array.from({ length: 24 }, (_, i) => ({ row: 3 + i, col: 24 })),
            ...Array.from({ length: 22 }, (_, i) => ({ row: 4 + i, col: 32 })),
            // Horizontal walls
            ...Array.from({ length: 14 }, (_, i) => ({ row: 8, col: 10 + i })),
            ...Array.from({ length: 14 }, (_, i) => ({ row: 16, col: 2 + i })),
            ...Array.from({ length: 14 }, (_, i) => ({ row: 16, col: 18 + i })),
            ...Array.from({ length: 16 }, (_, i) => ({ row: 24, col: 6 + i })),
            // Extra blockers
            ...Array.from({ length: 5 }, (_, i) => ({ row: 12 + i, col: 4 })),
            ...Array.from({ length: 5 }, (_, i) => ({ row: 12 + i, col: 28 })),
            ...Array.from({ length: 4 }, (_, i) => ({ row: 22 + i, col: 12 })),
            ...Array.from({ length: 4 }, (_, i) => ({ row: 22 + i, col: 20 })),
        ],
        agents: [
            {
                color: '#FF6B6B',
                algorithm: 'astar',
                start: { row: 15, col: 2 },
                goal: { row: 15, col: 37 }
            },
            {
                color: '#4ECDC4',
                algorithm: 'jps',
                start: { row: 15, col: 2 },
                goal: { row: 15, col: 37 }
            },
            {
                color: '#45B7D1',
                algorithm: 'theta',
                start: { row: 15, col: 2 },
                goal: { row: 15, col: 37 }
            },
            {
                color: '#FFA07A',
                algorithm: 'dijkstra',
                start: { row: 15, col: 2 },
                goal: { row: 15, col: 37 }
            }
        ]
    },

    // ===== NAVMESH MODE SCENARIOS (4 algorithms only) =====

    navmeshUrban: {
        name: "NavMesh 1",
        description: "NavMesh mode: dense block layout with long detours; hard portal sequence.",
        mapType: 'navmesh',
        rows: 30,
        cols: 40,
        obstacles: [
            // Dense blocks with narrow corridors
            ...Array.from({ length: 10 }, (_, i) => ({ row: 2, col: 4 + i })),   // block top-left
            ...Array.from({ length: 8 }, (_, i) => ({ row: 3 + i, col: 4 })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 3 + i, col: 13 })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 11, col: 4 + i })),

            ...Array.from({ length: 14 }, (_, i) => ({ row: 2, col: 18 + i })),  // block top-center
            ...Array.from({ length: 10 }, (_, i) => ({ row: 3 + i, col: 18 })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 3 + i, col: 31 })),
            ...Array.from({ length: 14 }, (_, i) => ({ row: 13, col: 18 + i })),

            ...Array.from({ length: 12 }, (_, i) => ({ row: 16, col: 6 + i })),  // block mid-left
            ...Array.from({ length: 10 }, (_, i) => ({ row: 17 + i, col: 6 })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 17 + i, col: 17 })),
            ...Array.from({ length: 12 }, (_, i) => ({ row: 27, col: 6 + i })),

            ...Array.from({ length: 12 }, (_, i) => ({ row: 17, col: 22 + i })), // block bottom-right
            ...Array.from({ length: 9 }, (_, i) => ({ row: 18 + i, col: 22 })),
            ...Array.from({ length: 9 }, (_, i) => ({ row: 18 + i, col: 33 })),
            ...Array.from({ length: 12 }, (_, i) => ({ row: 27, col: 22 + i })),
        ],
        agents: [
            {
                color: '#FF6B6B',
                algorithm: 'astar',
                start: { row: 1, col: 1 },
                goal: { row: 28, col: 38 }
            },
            {
                color: '#4ECDC4',
                algorithm: 'dijkstra',
                start: { row: 1, col: 1 },
                goal: { row: 28, col: 38 }
            },
            {
                color: '#45B7D1',
                algorithm: 'greedy',
                start: { row: 1, col: 1 },
                goal: { row: 28, col: 38 }
            },
            {
                color: '#FFA07A',
                algorithm: 'rrt',
                start: { row: 1, col: 1 },
                goal: { row: 28, col: 38 }
            }
        ]
    },

    navmeshBattlefield: {
        name: "NavMesh 2",
        description: "NavMesh mode: scattered clusters create many portals; harder funnel choices.",
        mapType: 'navmesh',
        rows: 30,
        cols: 40,
        obstacles: [
            // Scattered formations
            { row: 4, col: 6 }, { row: 4, col: 7 }, { row: 5, col: 6 }, { row: 5, col: 7 },
            { row: 3, col: 18 }, { row: 3, col: 19 }, { row: 4, col: 17 }, { row: 4, col: 18 },
            { row: 4, col: 19 }, { row: 4, col: 20 }, { row: 5, col: 18 }, { row: 5, col: 19 },
            { row: 12, col: 8 }, { row: 12, col: 9 }, { row: 12, col: 10 },
            { row: 13, col: 8 }, { row: 13, col: 9 }, { row: 13, col: 10 },
            { row: 13, col: 19 }, { row: 13, col: 20 }, { row: 13, col: 21 },
            { row: 14, col: 18 }, { row: 14, col: 19 }, { row: 14, col: 20 }, { row: 14, col: 21 },
            { row: 15, col: 18 }, { row: 15, col: 19 }, { row: 15, col: 20 }, { row: 15, col: 21 },
            { row: 21, col: 7 }, { row: 21, col: 8 }, { row: 22, col: 6 }, { row: 22, col: 7 },
            { row: 23, col: 20 }, { row: 23, col: 21 }, { row: 24, col: 19 }, { row: 24, col: 20 },
        ],
        agents: [
            {
                color: '#FF6B6B',
                algorithm: 'astar',
                start: { row: 2, col: 2 },
                goal: { row: 27, col: 37 }
            },
            {
                color: '#4ECDC4',
                algorithm: 'dijkstra',
                start: { row: 2, col: 2 },
                goal: { row: 27, col: 37 }
            },
            {
                color: '#45B7D1',
                algorithm: 'greedy',
                start: { row: 2, col: 2 },
                goal: { row: 27, col: 37 }
            },
            {
                color: '#FFA07A',
                algorithm: 'rrt',
                start: { row: 2, col: 2 },
                goal: { row: 27, col: 37 }
            }
        ]
    },

    // Empty grid
    empty: {
        name: "Custom",
        description: "Blank canvas - works in both Grid and NavMesh modes.",
        mapType: 'both',
        rows: 30,
        cols: 40,
        obstacles: [],
        agents: []
    }
};
