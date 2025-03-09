import styles from './styles.css';

class PolygonCreator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {
            points: [],
            polygonDrawn: false,
            selectedFirst: null,
            selectedSecond: null,
            clockwise: true,
            creatingPoints: false,
            selectingFirst: false,
            selectingSecond: false
        };
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
                    <style>${styles}</style>
                    <div class="app">
                        <div class="workspace"></div>
                        <div class="panel">
                            <button id="createPoints">✨ Create points</button>
                            <div id="pointCount" class="point-count">Points: 0</div>
                            <button id="drawPolygon" disabled>🖌️ Draw polygon</button>
                            <div class="button-container">
                                <button id="firstPoint" disabled>📍 First point</button>
                                <span id="firstPointLabel" class="selected-point-cell"></span>
                            </div>
                            <div class="button-container">
                                <button id="secondPoint" disabled>🎯 Second point</button>
                                <span id="secondPointLabel" class="selected-point-cell"></span>
                            </div>
                            <button id="toggleDirection" disabled>🔄 Clockwise</button>
                            <button id="clear">🧹 Clear</button>
                            <div id="pathInfo" class="path-info"></div>
                        </div>
                    </div>
                    `;

        this.initElements();
        this.setupEventListeners();
        this.loadState();
        this.updateUI();
    }

    initElements() {
        this.workspace = this.shadowRoot.querySelector('.workspace');
        this.createPointsBtn = this.shadowRoot.getElementById('createPoints');
        this.drawPolygonBtn = this.shadowRoot.getElementById('drawPolygon');
        this.firstPointBtn = this.shadowRoot.getElementById('firstPoint');
        this.secondPointBtn = this.shadowRoot.getElementById('secondPoint');
        this.toggleDirectionBtn = this.shadowRoot.getElementById('toggleDirection');
        this.clearBtn = this.shadowRoot.getElementById('clear');
        this.pointCountDiv = this.shadowRoot.getElementById('pointCount');
        this.firstPointLabel = this.shadowRoot.getElementById('firstPointLabel');
        this.secondPointLabel = this.shadowRoot.getElementById('secondPointLabel');
        this.pathInfoDiv = this.shadowRoot.getElementById('pathInfo');
    }

    setupEventListeners() {
        this.createPointsBtn.addEventListener('click', () => this.startCreatingPoints());
        this.drawPolygonBtn.addEventListener('click', () => this.drawPolygon());
        this.firstPointBtn.addEventListener('click', () => this.startSelectingFirst());
        this.secondPointBtn.addEventListener('click', () => this.startSelectingSecond());
        this.toggleDirectionBtn.addEventListener('click', () => this.toggleDirection());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.workspace.addEventListener('click', (e) => this.handleWorkspaceClick(e));
    }

    handleWorkspaceClick(e) {
        if (this.state.creatingPoints && !this.state.polygonDrawn) {
            const rect = this.workspace.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.addPoint(x, y);
        } else if (this.state.selectingFirst || this.state.selectingSecond) {
            let target = e.target;
            while (target && target !== this.workspace) {
                if (target.classList.contains('point')) {
                    const index = parseInt(target.dataset.index);
                    if (this.state.selectingFirst) {
                        this.state.selectedFirst = index;
                        this.state.selectingFirst = false;
                    } else {
                        this.state.selectedSecond = index;
                        this.state.selectingSecond = false;
                    }
                    this.updateSelectedPoints();
                    this.drawPath();
                    break;
                }
                target = target.parentElement;
            }
        }
    }

    renderPoint(point) {
        const pointElement = document.createElement('div');
        pointElement.className = 'point';
        pointElement.style.left = `${point.x}px`;
        pointElement.style.top = `${point.y}px`;
        pointElement.dataset.index = point.index;
        pointElement.textContent = point.index + 1;
        this.workspace.appendChild(pointElement);
    }

    updatePointCount() {
        const count = this.state.points.length;
        this.pointCountDiv.textContent = `Points: ${count}`;
        this.pointCountDiv.style.color = (count < 3 || count > 15) ? 'red' : 'green';
    }

    createSVG() {
        let svg = this.workspace.querySelector('svg');
        if (!svg) {
            svg = this.createSVGElement('svg', {
                width: '100%',
                height: '100%'
            });
            this.workspace.appendChild(svg);
        }
        return svg;
    }

    createSVGElement(type, attributes) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', type);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    startSelectingFirst() {
        this.state.selectingFirst = true;
        this.state.selectingSecond = false;
        this.firstPointBtn.textContent = 'Selecting...';
        this.secondPointBtn.textContent = '🎯 Second point';
    }

    startSelectingSecond() {
        this.state.selectingSecond = true;
        this.state.selectingFirst = false;
        this.secondPointBtn.textContent = 'Selecting...';
        this.firstPointBtn.textContent = '📍 First point';
    }

    drawPath() {
        if (this.state.selectedFirst === null || this.state.selectedSecond === null) return;

        const svg = this.createSVG();
        let path = svg.querySelector('.path');
        if (path) path.remove();

        const points = this.calculatePathPoints();
        if (points.length === 0) return;

        path = this.createSVGElement('polyline', {
            class: 'path',
            fill: 'none',
            stroke: 'blue',
            'stroke-width': '2'
        });

        path.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
        svg.appendChild(path);
        this.updatePathInfo(points);
    }

    calculatePathPoints() {
        const {points, selectedFirst, selectedSecond, clockwise} = this.state;
        if (selectedFirst === selectedSecond) return [];

        const n = points.length;
        const pathPoints = [];
        let current = selectedFirst;

        while (current !== selectedSecond) {
            pathPoints.push(points[current]);
            current = clockwise ?
                (current + 1) % n :
                (current - 1 + n) % n;
        }
        pathPoints.push(points[selectedSecond]);

        return pathPoints;
    }

    updatePathInfo(points) {
        const pathStr = points.map(p => `Point ${p.index + 1}`).join(' → ');
        this.pathInfoDiv.textContent = `Path: ${pathStr}`;
    }

    startCreatingPoints() {
        if (!this.state.polygonDrawn) {
            this.state.creatingPoints = true;
            this.updateUI();
        }
    }

    updateUI() {
        this.drawPolygonBtn.disabled = !(
            this.state.points.length >= 3 &&
            this.state.points.length <= 15 &&
            !this.state.polygonDrawn
        );

        this.firstPointBtn.disabled = !this.state.polygonDrawn;
        this.secondPointBtn.disabled = !this.state.polygonDrawn;
        this.toggleDirectionBtn.disabled = !(
            this.state.selectedFirst !== null &&
            this.state.selectedSecond !== null
        );
    }

    saveState() {
        const state = {
            points: this.state.points,
            polygonDrawn: this.state.polygonDrawn,
            selectedFirst: this.state.selectedFirst,
            selectedSecond: this.state.selectedSecond,
            clockwise: this.state.clockwise
        };
        localStorage.setItem('polygonState', JSON.stringify(state));
    }

    loadState() {
        const savedState = localStorage.getItem('polygonState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.state.points = state.points;
                this.state.polygonDrawn = state.polygonDrawn;
                this.state.selectedFirst = state.selectedFirst;
                this.state.selectedSecond = state.selectedSecond;
                this.state.clockwise = state.clockwise;
                this.state.points.forEach(point => this.renderPoint(point));

                if (this.state.polygonDrawn) {
                    this.drawPolygon();
                }

                if (this.state.selectedFirst !== null &&
                    this.state.selectedSecond !== null) {
                    this.drawPath();
                }

                this.updateSelectedPoints();
                this.toggleDirectionBtn.textContent =
                    this.state.clockwise ? '🔄 Clockwise' : '🔄 Counterclockwise';
            } catch (e) {
                console.error('Error loading state:', e);
                this.clearStorage();
            }
        }
    }

    clearStorage() {
        localStorage.removeItem('polygonState');
    }

    clear() {
        this.state = {
            points: [],
            polygonDrawn: false,
            selectedFirst: null,
            selectedSecond: null,
            clockwise: true,
            creatingPoints: false,
            selectingFirst: false,
            selectingSecond: false
        };
        this.workspace.innerHTML = '';
        this.updatePointCount();
        this.firstPointLabel.textContent = '';
        this.secondPointLabel.textContent = '';
        this.pathInfoDiv.textContent = '';
        this.updateUI();
        this.clearStorage();
    }

    addPoint(x, y) {
        if (this.state.points.length >= 15) return;
        const point = { x, y, index: this.state.points.length };
        this.state.points.push(point);
        this.renderPoint(point);
        this.updatePointCount();
        this.drawPolygonBtn.disabled = this.state.points.length < 3 || this.state.points.length > 15;
        this.saveState();
    }

    drawPolygon() {
        const svg = this.createSVG();
        const pointsStr = this.state.points.map(p => `${p.x},${p.y}`).join(' ');
        const polygon = this.createSVGElement('polygon', {
            points: pointsStr,
            fill: 'none',
            stroke: 'grey'
        });
        svg.innerHTML = '';
        svg.appendChild(polygon);
        this.state.polygonDrawn = true;
        this.state.creatingPoints = false;
        this.updateUI();
        this.saveState();
    }

    updateSelectedPoints() {
        this.firstPointLabel.textContent = this.state.selectedFirst !== null ?
            `P: ${this.state.selectedFirst + 1}` : '';
        this.secondPointLabel.textContent = this.state.selectedSecond !== null ?
            `P: ${this.state.selectedSecond + 1}` : '';
        this.updateUI();
        this.saveState();
    }

    toggleDirection() {
        this.state.clockwise = !this.state.clockwise;
        this.toggleDirectionBtn.textContent = this.state.clockwise ? '🔄 Clockwise' : '🔄 Counterclockwise';
        this.drawPath();
        this.saveState();
    }
}

customElements.define('polygon-creator', PolygonCreator);