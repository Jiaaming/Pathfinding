/**
 * Main Application for Pathfinding Animation
 * Computer Animation Course Project
 */

class PathfindingApp {
    constructor() {
        // Grid configuration
        this.rows = 30;
        this.cols = 40;
        this.cellSize = 20;

        // Canvas setup
        this.canvas = document.getElementById('gridCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;

        // Grid data structure
        this.grid = this.initializeGrid();

        // Map type: 'grid' or 'navmesh'
        this.mapType = 'grid';
        this.navmesh = null;

        // Agents
        this.agents = [];
        this.agentColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        this.nextAgentId = 1;
        this.selectedAgent = null;

        // UI state
        this.mode = 'obstacle'; // 'obstacle' or 'agent'
        this.settingAgentPhase = null; // 'start' or 'goal'

        // Animation state
        this.isRunning = false;
        this.isPaused = false;
        this.animationSpeed = 5;
        this.animationFrameCounter = 0;
        this.interpolationEnabled = true; // Smooth animation between cells

        // Initialize
        this.setupEventListeners();
        this.draw();
        this.updateStats();
        this.updateMetricsComparison();
    }

    updateMetricsComparison() {
        const metricsDiv = document.getElementById('metricsComparison');
        if (!metricsDiv) return;

        // Filter agents that have metrics
        const agentsWithMetrics = this.agents.filter(a => a.metrics);

        if (agentsWithMetrics.length === 0) {
            metricsDiv.innerHTML = '<p class="metrics-hint">Run simulation to see performance metrics</p>';
            return;
        }

        let html = '<div class="metrics-grid">';

        agentsWithMetrics.forEach(agent => {
            const algorithmName = {
                'astar': 'A* Search',
                'dijkstra': 'Dijkstra',
                'greedy': 'Greedy Best-First',
                'rrt': 'RRT',
                'jps': 'JPS (Jump Point)',
                'theta': 'Theta*'
            }[agent.algorithm] || agent.algorithm;

            html += `
                <div class="metric-card" style="border-left: 4px solid ${agent.color}">
                    <div class="metric-header">
                        <span class="metric-agent">Agent ${agent.id}</span>
                        <span class="metric-algo">${algorithmName}</span>
                    </div>
                    <div class="metric-stats">
                        <div class="metric-item">
                            <span class="metric-label">Computation Time</span>
                            <span class="metric-value">${agent.metrics.computationTime} ms</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Nodes Explored</span>
                            <span class="metric-value highlight">${agent.metrics.nodesExplored}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Path Length</span>
                            <span class="metric-value">${agent.metrics.pathCost} steps</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        metricsDiv.innerHTML = html;
    }

    initializeGrid() {
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                grid[row][col] = {
                    isObstacle: false,
                    isStart: false,
                    isGoal: false
                };
            }
        }
        return grid;
    }

    setupEventListeners() {
        // Scenario selection
        document.getElementById('scenarioSelect').addEventListener('change', (e) => this.loadScenario(e.target.value));

        // Canvas interaction
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));

        // Map type buttons
        document.getElementById('gridMapBtn').addEventListener('click', () => this.setMapType('grid'));
        document.getElementById('navmeshMapBtn').addEventListener('click', () => this.setMapType('navmesh'));

        // Mode buttons
        document.getElementById('obstacleMode').addEventListener('click', () => this.setMode('obstacle'));
        document.getElementById('setAgentMode').addEventListener('click', () => this.setMode('agent'));

        // Agent management
        document.getElementById('addAgentBtn').addEventListener('click', () => this.addAgent());

        // Simulation controls
        document.getElementById('startBtn').addEventListener('click', () => this.startSimulation());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSimulation());
        document.getElementById('clearObstaclesBtn').addEventListener('click', () => this.clearObstacles());

        // Speed control
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = `${this.animationSpeed}x`;
        });
    }

    loadScenario(scenarioKey) {
        if (!scenarioKey || !SCENARIOS[scenarioKey]) {
            document.getElementById('scenarioDescription').textContent = '';
            return;
        }

        const scenario = SCENARIOS[scenarioKey];

        // Auto-switch to correct map type based on scenario
        if (scenario.mapType === 'grid' && this.mapType !== 'grid') {
            this.setMapType('grid');
        } else if (scenario.mapType === 'navmesh' && this.mapType !== 'navmesh') {
            this.setMapType('navmesh');
        }

        // Update description
        document.getElementById('scenarioDescription').textContent = scenario.description;

        // Reset simulation
        this.isRunning = false;
        this.isPaused = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pause';

        // Clear grid
        this.grid = this.initializeGrid();

        // Set obstacles
        for (const obstacle of scenario.obstacles) {
            if (obstacle.row >= 0 && obstacle.row < this.rows &&
                obstacle.col >= 0 && obstacle.col < this.cols) {
                this.grid[obstacle.row][obstacle.col].isObstacle = true;
            }
        }

        // Clear and set agents
        this.agents = [];
        this.nextAgentId = 1;
        this.selectedAgent = null;

        for (const agentData of scenario.agents) {
            const agent = {
                id: this.nextAgentId++,
                color: agentData.color,
                algorithm: agentData.algorithm,
                start: agentData.start ? { ...agentData.start } : null,
                goal: agentData.goal ? { ...agentData.goal } : null,
                currentPos: agentData.start ? { ...agentData.start } : null,
                path: null,
                pathIndex: 0,
                status: agentData.start && agentData.goal ? 'Goal set - Ready' : 'Not configured',
                completed: false,
                metrics: null,
                interpolation: 0
            };
            this.agents.push(agent);
        }

        // Regenerate NavMesh if in NavMesh mode
        if (this.mapType === 'navmesh') {
            this.navmesh = generateNavMesh(this.grid, this.rows, this.cols, this.cellSize);
        }

        this.updateAgentList();
        this.draw();
        this.updateStats();
    }

    setMapType(type) {
        this.mapType = type;
        document.getElementById('gridMapBtn').classList.toggle('active', type === 'grid');
        document.getElementById('navmeshMapBtn').classList.toggle('active', type === 'navmesh');

        if (type === 'navmesh') {
            // Generate NavMesh from current obstacles
            this.navmesh = generateNavMesh(this.grid, this.rows, this.cols, this.cellSize);
            console.log('NavMesh generated:', this.navmesh.waypoints.length, 'waypoints,', this.navmesh.edges.length, 'edges');
        } else {
            this.navmesh = null;
        }

        this.draw();
    }

    setMode(mode) {
        this.mode = mode;
        document.getElementById('obstacleMode').classList.toggle('active', mode === 'obstacle');
        document.getElementById('setAgentMode').classList.toggle('active', mode === 'agent');

        if (mode === 'agent' && this.agents.length === 0) {
            alert('Please add an agent first!');
            this.setMode('obstacle');
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return;

        if (this.mode === 'obstacle') {
            this.toggleObstacle(row, col);
        } else if (this.mode === 'agent') {
            this.setAgentPosition(row, col);
        }

        this.draw();
        this.updateStats();
    }

    handleCanvasHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.hoverCol = Math.floor(x / this.cellSize);
        this.hoverRow = Math.floor(y / this.cellSize);
        this.draw();
    }

    toggleObstacle(row, col) {
        // Don't place obstacles on agent start/goal positions
        for (const agent of this.agents) {
            if ((agent.start && agent.start.row === row && agent.start.col === col) ||
                (agent.goal && agent.goal.row === row && agent.goal.col === col)) {
                return;
            }
        }

        this.grid[row][col].isObstacle = !this.grid[row][col].isObstacle;

        // Regenerate NavMesh if in NavMesh mode
        if (this.mapType === 'navmesh') {
            this.navmesh = generateNavMesh(this.grid, this.rows, this.cols, this.cellSize);
        }
    }

    setAgentPosition(row, col) {
        if (!this.selectedAgent) {
            alert('Please select an agent from the list first!');
            return;
        }

        // Don't place on obstacles
        if (this.grid[row][col].isObstacle) {
            alert('Cannot place agent on obstacle!');
            return;
        }

        const agent = this.selectedAgent;

        if (!agent.start) {
            // Setting start position
            agent.start = { row, col };
            agent.currentPos = { row, col };
            agent.status = 'Start set';
            this.updateAgentList();
        } else if (!agent.goal) {
            // Setting goal position
            agent.goal = { row, col };
            agent.status = 'Goal set - Ready';
            this.updateAgentList();
        } else {
            // Reset and set new start
            agent.start = { row, col };
            agent.currentPos = { row, col };
            agent.goal = null;
            agent.path = null;
            agent.status = 'Start set';
            this.updateAgentList();
        }
    }

    addAgent() {
        const agent = {
            id: this.nextAgentId++,
            color: this.agentColors[(this.agents.length) % this.agentColors.length],
            algorithm: 'astar',
            start: null,
            goal: null,
            currentPos: null,
            path: null,
            pathIndex: 0,
            status: 'Not configured',
            completed: false,
            metrics: null,
            exploredNodes: [],
            exploredVisibleCount: 0,
            revealPerStep: 1,
            // Animation properties
            interpolation: 0 // 0 to 1, progress between current and next cell
        };

        this.agents.push(agent);
        this.selectedAgent = agent;
        this.updateAgentList();
        this.setMode('agent');
        this.draw();
    }

    deleteAgent(agentId) {
        const index = this.agents.findIndex(a => a.id === agentId);
        if (index !== -1) {
            if (this.selectedAgent && this.selectedAgent.id === agentId) {
                this.selectedAgent = null;
            }
            this.agents.splice(index, 1);
            this.updateAgentList();
            this.draw();
            this.updateStats();
        }
    }

    updateAgentList() {
        const agentList = document.getElementById('agentList');
        agentList.innerHTML = '';

        this.agents.forEach(agent => {
            const agentDiv = document.createElement('div');
            agentDiv.className = 'agent-item';
            if (this.selectedAgent && this.selectedAgent.id === agent.id) {
                agentDiv.classList.add('selected');
            }

            let metricsHtml = '';
            if (agent.metrics) {
                metricsHtml = `
                    <div class="agent-metrics">
                        <div>Time: ${agent.metrics.computationTime}ms</div>
                        <div>Nodes: ${agent.metrics.nodesExplored}</div>
                        <div>Path: ${agent.metrics.pathCost} steps</div>
                    </div>
                `;
            }

            // Generate algorithm dropdown options based on map type
            let algorithmOptions = '';
            if (this.mapType === 'navmesh') {
                // NavMesh mode: Disable JPS and Theta* (they fall back to A*)
                algorithmOptions = `
                    <option value="astar" ${agent.algorithm === 'astar' ? 'selected' : ''}>A* Search</option>
                    <option value="dijkstra" ${agent.algorithm === 'dijkstra' ? 'selected' : ''}>Dijkstra</option>
                    <option value="greedy" ${agent.algorithm === 'greedy' ? 'selected' : ''}>Greedy Best-First</option>
                    <option value="rrt" ${agent.algorithm === 'rrt' ? 'selected' : ''}>RRT</option>
                `;
            } else {
                // Grid mode: All algorithms available
                algorithmOptions = `
                    <option value="astar" ${agent.algorithm === 'astar' ? 'selected' : ''}>A* Search</option>
                    <option value="jps" ${agent.algorithm === 'jps' ? 'selected' : ''}>JPS </option>
                    <option value="theta" ${agent.algorithm === 'theta' ? 'selected' : ''}>Theta* (Any-angle)</option>
                    <option value="dijkstra" ${agent.algorithm === 'dijkstra' ? 'selected' : ''}>Dijkstra</option>
                    <option value="greedy" ${agent.algorithm === 'greedy' ? 'selected' : ''}>Greedy Best-First</option>
                    <option value="rrt" ${agent.algorithm === 'rrt' ? 'selected' : ''}>RRT</option>
                `;
            }

            agentDiv.innerHTML = `
                <div class="agent-color" style="background-color: ${agent.color}"></div>
                <div class="agent-info">
                    <div><strong>Agent ${agent.id}</strong></div>
                    <select class="algorithm-select" data-agent-id="${agent.id}">
                        ${algorithmOptions}
                    </select>
                    <div class="agent-status">${agent.status}</div>
                </div>
                <button class="delete-agent" data-agent-id="${agent.id}">Delete</button>
            `;

            agentDiv.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-agent') &&
                    !e.target.classList.contains('algorithm-select')) {
                    this.selectedAgent = agent;
                    this.updateAgentList();
                }
            });

            const deleteBtn = agentDiv.querySelector('.delete-agent');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteAgent(agent.id);
            });

            const algorithmSelect = agentDiv.querySelector('.algorithm-select');
            algorithmSelect.addEventListener('change', (e) => {
                e.stopPropagation();
                agent.algorithm = e.target.value;
            });

            agentList.appendChild(agentDiv);
        });
    }

    clearObstacles() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].isObstacle = false;
            }
        }
        this.draw();
    }

    startSimulation() {
        // Calculate paths for all agents
        let allReady = true;
        for (const agent of this.agents) {
            if (!agent.start || !agent.goal) {
                alert(`Agent ${agent.id} is not configured with start and goal positions!`);
                allReady = false;
                break;
            }

            // Calculate path using selected algorithm
            let result;

            if (this.mapType === 'navmesh') {
                const { result: navResult, navmesh } = AlgorithmRunner.runNavmesh(
                    agent,
                    this.grid,
                    this.navmesh,
                    this.rows,
                    this.cols,
                    this.cellSize
                );
                this.navmesh = navmesh;
                result = navResult;
            } else {
                result = AlgorithmRunner.runGrid(agent, this.grid, this.rows, this.cols);
            }

            if (!result) {
                alert(`No path found for Agent ${agent.id}!`);
                agent.status = 'No path found';
                agent.metrics = null;
                agent.exploredNodes = [];
                agent.exploredVisibleCount = 0;
                agent.revealPerStep = 1;
                allReady = false;
            } else {
                agent.path = result.path;
                agent.metrics = result.metrics;
                agent.exploredNodes = result.exploredNodes || [];
                agent.exploredVisibleCount = 0;
                const stepCount = Math.max(1, (agent.path?.length || 1) - 1);
                const totalExplored = agent.exploredNodes.length;
                agent.revealPerStep = totalExplored > 0 ? Math.max(1, Math.ceil(totalExplored / stepCount)) : 0;
                agent.pathIndex = 0;
                agent.currentPos = { ...agent.start };
                agent.completed = false;
                agent.interpolation = 0;
                agent.status = 'Running';
            }
        }

        if (!allReady) {
            this.updateAgentList();
            return;
        }

        // Update metrics display
        this.updateMetricsComparison();

        this.isRunning = true;
        this.isPaused = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;

        this.animate();
    }

    pauseSimulation() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? 'Resume' : 'Pause';

        if (!this.isPaused) {
            this.animate();
        }
    }

    resetSimulation() {
        this.isRunning = false;
        this.isPaused = false;

        for (const agent of this.agents) {
            if (agent.start) {
                agent.currentPos = { ...agent.start };
                agent.pathIndex = 0;
                agent.completed = false;
                agent.interpolation = 0;
                agent.status = agent.goal ? 'Goal set - Ready' : 'Start set';
                agent.exploredNodes = [];
                agent.exploredVisibleCount = 0;
                agent.revealPerStep = 1;
            }
        }

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pause';

        this.updateAgentList();
        this.draw();
        this.updateStats();
    }

    animate() {
        if (!this.isRunning || this.isPaused) return;

        let allCompleted = true;

        // Smooth interpolation mode
        if (this.interpolationEnabled) {
            const baseSpeed = 0.08 * this.animationSpeed;

            for (const agent of this.agents) {
                if (agent.completed || !agent.path) continue;

                allCompleted = false;

                // Calculate distance between current and next waypoint
                if (agent.pathIndex + 1 < agent.path.length) {
                    const current = agent.path[agent.pathIndex];
                    const next = agent.path[agent.pathIndex + 1];
                    const dx = next.col - current.col;
                    const dy = next.row - current.row;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Adjust interpolation speed inversely proportional to distance
                    // This makes all agents move at same visual speed regardless of step size
                    const interpolationSpeed = baseSpeed / distance;

                    agent.interpolation += interpolationSpeed;
                } else {
                    agent.interpolation += baseSpeed;
                }

                if (agent.interpolation >= 1.0) {
                    agent.interpolation = 0;
                    agent.pathIndex++;
                    if (agent.exploredVisibleCount < agent.exploredNodes.length && agent.revealPerStep > 0) {
                        agent.exploredVisibleCount = Math.min(
                            agent.exploredNodes.length,
                            agent.exploredVisibleCount + agent.revealPerStep
                        );
                    }

                    if (agent.pathIndex >= agent.path.length - 1) {
                        agent.completed = true;
                        agent.interpolation = 1.0;
                        agent.exploredVisibleCount = agent.exploredNodes.length;
                        agent.status = 'Completed!';
                    }
                }
            }

            if (allCompleted) {
                this.isRunning = false;
                document.getElementById('startBtn').disabled = false;
                document.getElementById('pauseBtn').disabled = true;
                this.updateAgentList();
                this.updateStats();
            }
        } else {
            // Original discrete movement mode
            this.animationFrameCounter++;

            if (this.animationFrameCounter >= (11 - this.animationSpeed)) {
                this.animationFrameCounter = 0;

                for (const agent of this.agents) {
                    if (!agent.completed && agent.path) {
                        agent.pathIndex++;

                        if (agent.pathIndex < agent.path.length) {
                            agent.currentPos = { ...agent.path[agent.pathIndex] };
                            if (agent.exploredVisibleCount < agent.exploredNodes.length && agent.revealPerStep > 0) {
                                agent.exploredVisibleCount = Math.min(
                                    agent.exploredNodes.length,
                                    agent.exploredVisibleCount + agent.revealPerStep
                                );
                            }
                            allCompleted = false;
                        } else {
                            agent.completed = true;
                            agent.exploredVisibleCount = agent.exploredNodes.length;
                            agent.status = 'Completed!';
                        }
                    }
                }

                this.updateAgentList();
                this.updateStats();

                if (allCompleted) {
                    this.isRunning = false;
                    document.getElementById('startBtn').disabled = false;
                    document.getElementById('pauseBtn').disabled = true;
                }
            }
        }

        this.draw();

        if (this.isRunning && !this.isPaused) {
            requestAnimationFrame(() => this.animate());
        }
    }

    getAgentPosition(agent) {
        if (!agent.path || agent.pathIndex >= agent.path.length) {
            return agent.currentPos || agent.start;
        }

        if (this.interpolationEnabled && agent.pathIndex + 1 < agent.path.length) {
            const current = agent.path[agent.pathIndex];
            const next = agent.path[agent.pathIndex + 1];
            const t = agent.interpolation;

            return {
                row: current.row + (next.row - current.row) * t,
                col: current.col + (next.col - current.col) * t
            };
        } else {
            return agent.path[agent.pathIndex];
        }
    }

    updateStats() {
        const statsDiv = document.getElementById('stats');
        const totalAgents = this.agents.length;
        const completedAgents = this.agents.filter(a => a.completed).length;
        const runningAgents = this.agents.filter(a => !a.completed && a.path).length;

        let totalObstacles = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].isObstacle) totalObstacles++;
            }
        }

        statsDiv.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Agents:</span>
                <span class="stat-value">${totalAgents}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Running:</span>
                <span class="stat-value">${runningAgents}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Completed:</span>
                <span class="stat-value">${completedAgents}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Obstacles:</span>
                <span class="stat-value">${totalObstacles}</span>
            </div>
        `;
    }

    draw() {
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw different background based on map type
        if (this.mapType === 'navmesh') {
            // NavMesh mode: Draw cleaner background without grid lines
            ctx.fillStyle = '#F8F9FA';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw obstacles as solid blocks
            ctx.fillStyle = '#34495E';
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.grid[row][col].isObstacle) {
                        const x = col * this.cellSize;
                        const y = row * this.cellSize;
                        ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    }
                }
            }
        } else {
            // Grid mode: Draw traditional grid
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const x = col * this.cellSize;
                    const y = row * this.cellSize;

                    // Draw cell background
                    if (this.grid[row][col].isObstacle) {
                        ctx.fillStyle = '#2C3E50';
                        ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    } else {
                        ctx.fillStyle = '#FFFFFF'; // white background for walkable cells
                        ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    }

                    // Draw grid lines
                    ctx.strokeStyle = '#BDC3C7';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(x, y, this.cellSize, this.cellSize);

                    // Highlight hover cell
                    if (row === this.hoverRow && col === this.hoverCol) {
                        ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
                        ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    }
                }
            }
        }

        // Draw NavMesh if in NavMesh mode
        if (this.mapType === 'navmesh' && this.navmesh) {
            // Draw NavMesh waypoints (green dots only, no blue lines)
            ctx.fillStyle = '#2ECC71';
            for (const wp of this.navmesh.waypoints) {
                const x = wp.col * this.cellSize + this.cellSize / 2;
                const y = wp.row * this.cellSize + this.cellSize / 2;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw explored/expanded nodes using lighter agent color
        for (const agent of this.agents) {
            if (!agent.exploredNodes || agent.exploredNodes.length === 0) continue;

            const visible = agent.exploredVisibleCount || 0;
            if (visible === 0) continue;

            const lightColor = this.lightenColor(agent.color, 0.6);
            ctx.fillStyle = lightColor;
            ctx.globalAlpha = 0.35;

            if (this.mapType === 'navmesh') {
                // Draw small circles at explored waypoint positions
                for (let i = 0; i < visible; i++) {
                    const node = agent.exploredNodes[i];
                    const x = node.col * this.cellSize + this.cellSize / 2;
                    const y = node.row * this.cellSize + this.cellSize / 2;
                    ctx.beginPath();
                    ctx.arc(x, y, this.cellSize * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Grid cells: fill explored squares
                for (let i = 0; i < visible; i++) {
                    const node = agent.exploredNodes[i];
                    const x = node.col * this.cellSize;
                    const y = node.row * this.cellSize;
                    ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }
            }

            ctx.globalAlpha = 1;
        }

        // Draw agent paths
        for (const agent of this.agents) {
            if (agent.path) {
                ctx.strokeStyle = agent.color;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 3]);
                ctx.globalAlpha = 0.5;

                ctx.beginPath();
                for (let i = 0; i < agent.path.length; i++) {
                    const cell = agent.path[i];
                    const x = cell.col * this.cellSize + this.cellSize / 2;
                    const y = cell.row * this.cellSize + this.cellSize / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.globalAlpha = 1;
            }
        }

        // Draw agent start and goal positions
        for (const agent of this.agents) {
            // Draw start (square)
            if (agent.start) {
                const x = agent.start.col * this.cellSize;
                const y = agent.start.row * this.cellSize;
                ctx.fillStyle = agent.color;
                ctx.globalAlpha = 0.5;
                ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = agent.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            }

            // Draw goal (star)
            if (agent.goal) {
                const x = agent.goal.col * this.cellSize + this.cellSize / 2;
                const y = agent.goal.row * this.cellSize + this.cellSize / 2;
                this.drawStar(ctx, x, y, 5, this.cellSize * 0.4, this.cellSize * 0.2, agent.color);
            }
        }

        // Draw agents (circles) with smooth interpolation
        for (const agent of this.agents) {
            const pos = this.getAgentPosition(agent);
            if (pos) {
                const x = pos.col * this.cellSize + this.cellSize / 2;
                const y = pos.row * this.cellSize + this.cellSize / 2;

                // Draw shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(x + 1, y + 1, this.cellSize * 0.35, 0, Math.PI * 2);
                ctx.fill();

                // Draw agent
                ctx.fillStyle = agent.color;
                ctx.beginPath();
                ctx.arc(x, y, this.cellSize * 0.35, 0, Math.PI * 2);
                ctx.fill();

                // Draw border
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw agent ID
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(agent.id.toString(), x, y);
            }
        }
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    lightenColor(hex, factor = 0.5) {
        // Mix hex color with white by factor (0-1)
        const normalized = hex.replace('#', '');
        const num = parseInt(normalized, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;

        const mix = (channel) => Math.round(channel + (255 - channel) * factor);
        const lr = mix(r);
        const lg = mix(g);
        const lb = mix(b);

        const toHex = (v) => v.toString(16).padStart(2, '0');
        return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
    }
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new PathfindingApp();
});
