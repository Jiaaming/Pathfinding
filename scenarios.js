/**
 * Predefined Scenarios for Pathfinding Comparison
 * Separated by map type: Grid-only and NavMesh-compatible
 */

const SCENARIOS = {
    // ===== GRID MODE SCENARIOS (with JPS and Theta*) =====

    gridUltimate: {
        name: "🏆 Grid: All 6 Algorithms",
        description: "GRID MODE: Compare all algorithms including JPS and Theta*. Long complex path.",
        mapType: 'grid', // Grid-only
        rows: 30,
        cols: 40,
        obstacles: [
            // Complex maze-like structure
            ...Array.from({ length: 10 }, (_, i) => ({ row: 10, col: 12 + i })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 19, col: 18 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 11 + i, col: 22 })),
            ...Array.from({ length: 6 }, (_, i) => ({ row: 5, col: 8 + i })),
            ...Array.from({ length: 6 }, (_, i) => ({ row: 24, col: 25 + i })),
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
        name: "🌀 Grid: Complex Maze",
        description: "GRID MODE: Tight corridors. JPS shows 10-40x speedup over A*!",
        mapType: 'grid',
        rows: 30,
        cols: 40,
        obstacles: [
            // Vertical walls
            ...Array.from({ length: 20 }, (_, i) => ({ row: 5 + i, col: 10 })),
            ...Array.from({ length: 15 }, (_, i) => ({ row: 10 + i, col: 20 })),
            ...Array.from({ length: 18 }, (_, i) => ({ row: 5 + i, col: 30 })),
            // Horizontal walls
            ...Array.from({ length: 8 }, (_, i) => ({ row: 10, col: 12 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 20, col: 22 + i })),
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
        name: "🏙️ NavMesh: Urban Environment",
        description: "NAVMESH MODE: Buildings and streets. Funnel Algorithm creates smooth paths!",
        mapType: 'navmesh',
        rows: 30,
        cols: 40,
        obstacles: [
            // Building 1 (top-left)
            ...Array.from({ length: 8 }, (_, i) => ({ row: 3, col: 5 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 4 + i, col: 5 })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 4 + i, col: 12 })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 11, col: 5 + i })),

            // Building 2 (top-center)
            ...Array.from({ length: 10 }, (_, i) => ({ row: 2, col: 18 + i })),
            ...Array.from({ length: 7 }, (_, i) => ({ row: 3 + i, col: 18 })),
            ...Array.from({ length: 7 }, (_, i) => ({ row: 3 + i, col: 27 })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 9, col: 18 + i })),

            // Building 3 (bottom-left)
            ...Array.from({ length: 7 }, (_, i) => ({ row: 18, col: 3 + i })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 19 + i, col: 3 })),
            ...Array.from({ length: 8 }, (_, i) => ({ row: 19 + i, col: 9 })),
            ...Array.from({ length: 7 }, (_, i) => ({ row: 26, col: 3 + i })),

            // Building 4 (bottom-center)
            ...Array.from({ length: 9 }, (_, i) => ({ row: 16, col: 15 + i })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 17 + i, col: 15 })),
            ...Array.from({ length: 10 }, (_, i) => ({ row: 17 + i, col: 23 })),
            ...Array.from({ length: 9 }, (_, i) => ({ row: 26, col: 15 + i })),
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
        name: "⚔️ NavMesh: Battlefield",
        description: "NAVMESH MODE: Scattered obstacles. NavMesh waypoints show clear advantage!",
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
        name: "Empty Grid",
        description: "Blank canvas - works in both Grid and NavMesh modes!",
        mapType: 'both',
        rows: 30,
        cols: 40,
        obstacles: [],
        agents: []
    }
};
