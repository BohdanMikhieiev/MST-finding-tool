import { Node } from './Node.js';
import { Edge } from './Edge.js';
import { disableButtons, enableButtons, removeAllActiveButtons } from '../utils.js';

export class Graph {
    constructor() {
        this.nodesArr = [];
        this.edgesArr = [];
        this.nodeCount = 0;
        this.edgeCount = 0;
        this.selectedNode = null;
        this.chosenTool = null;
        this.iterations = 0;
    }
    addNode(x, y) {
        const node = new Node(this.nodeCount, x, y)
        this.nodeCount++;
        this.nodesArr.push(node);
        if (document.getElementById("showWeightMatrixTool").classList.contains("active")) {
            const matrixString = this.generateDivMatrixWeight();
            const weightMatrixDiv = document.getElementById('weightMatrix');
            weightMatrixDiv.innerHTML = `${matrixString}`;
        }
        return node;
    }

    removeNode(nodeId) {
        this.edgesArr = this.edgesArr.filter(edge => edge.node1 !== nodeId && edge.node2 !== nodeId);
        this.nodesArr = this.nodesArr.filter(node => node.id !== nodeId);
        this.reassignNodeIds();
        if (document.getElementById("showWeightMatrixTool").classList.contains("active")) {
            const matrixString = this.generateDivMatrixWeight();
            const weightMatrixDiv = document.getElementById('weightMatrix');
            weightMatrixDiv.innerHTML = `${matrixString}`;
        }
    }

    reassignNodeIds() {
        const originalIds = this.nodesArr.map((node) => node.id);
        this.nodesArr = this.insertionSort(this.nodesArr, (a, b) => a.id - b.id);
        this.nodesArr.forEach((node, index) => {
            node.id = index;
        });
        this.edgesArr.forEach((edge) => {
            const newNodeId1 = originalIds.indexOf(edge.node1);
            const newNodeId2 = originalIds.indexOf(edge.node2);

            if (newNodeId1 !== -1 && newNodeId2 !== -1) {
                edge.node1 = newNodeId1;
                edge.node2 = newNodeId2;
            }
        });
        this.nodeCount = this.nodesArr.length;
    }

    addEdge(node1Id, node2Id, weight) {
        if(node1Id === node2Id) {
            alert("Вершина не може бути з'єднаною сама з собою")
        }

        if (!this.findNodeById(node1Id) || !this.findNodeById(node2Id)) {
            alert("Не можливо додати ребро до несніуючої вершини");
            return null;
        }

        const existingEdge = this.edgesArr.find(edge => edge.node1 === node1Id
            && edge.node2 === node2Id);
        const existingEdgeInAnotherDirection = this.edgesArr.find(edge => edge.node2 === node1Id
            && edge.node1 === node2Id);

        if (existingEdge || existingEdgeInAnotherDirection) {
            alert("Це ребро вже існує");
            return null;
        }

        if (isNaN(weight) || weight === null) {
            alert("Некоректна вага для ребра");
            return null;
        }

        const edge = new Edge(this.edgeCount, node1Id, node2Id, weight);
        this.edgeCount++;
        this.edgesArr.push(edge);
        if (document.getElementById("showWeightMatrixTool").classList.contains("active")) {
            const matrixString = this.generateDivMatrixWeight();
            const weightMatrixDiv = document.getElementById('weightMatrix');
            weightMatrixDiv.innerHTML = `${matrixString}`;
        }
        return edge;
    }

    removeEdge(edgeId) {
        this.edgesArr = this.edgesArr.filter(edge => edge.id !== edgeId);
        this.reassignEdgeId();
        if (document.getElementById("showWeightMatrixTool").classList.contains("active")) {
            const matrixString = this.generateDivMatrixWeight();
            const weightMatrixDiv = document.getElementById('weightMatrix');
            weightMatrixDiv.innerHTML = `${matrixString}`;
        }
    }

    reassignEdgeId() {
        this.edgesArr.forEach((edge, index) => {
            edge.id = index;
        });
        this.edgeCount = this.edgesArr.length;
    }

    findNodeById(nodeId) {
        return this.nodesArr.find(node => node.id === nodeId);
    }

    renderGraph() {
        const graphContainer = document.getElementById("graphContainer");
        graphContainer.innerHTML = "";

        this.nodesArr.forEach(node => {
            const nodeElement = document.createElement("div");
            nodeElement.className = "node";
            nodeElement.style.left = `${node.x-15}px`
            nodeElement.style.top = `${node.y-15}px`
            nodeElement.innerText = `${node.id}`;
            nodeElement.dataset.id = node.id;

            graphContainer.appendChild(nodeElement);

            nodeElement.addEventListener("click", (event) => {
                event.stopPropagation();
                this.onNodeClick(node.id);
            })
        });

        this.edgesArr.forEach(edge => {
            const node1 = this.findNodeById(edge.node1);
            const node2 = this.findNodeById(edge.node2);

            if (!node1 || !node2) {
                return;
            }

            const deltaX = node2.x - node1.x;
            const deltaY = node2.y - node1.y;

            const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);

            const edgeElement = document.createElement("div");
            edgeElement.className = "edge";
            edgeElement.style.left = `${node1.x}px`;
            edgeElement.style.top = `${node1.y}px`;
            edgeElement.style.width = `${length}px`;
            edgeElement.style.transformOrigin = "left top";
            edgeElement.style.transform = `rotate(${angle}rad)`;

            graphContainer.appendChild(edgeElement);

            edgeElement.addEventListener("click", (event) => {
                event.stopPropagation();
                this.onEdgeClick(edge.id);
            })

            const weightElement = document.createElement("div");
            weightElement.className = "weight";
            weightElement.innerText = edge.weight;
            weightElement.style.position = "absolute";
            weightElement.style.left = `${node1.x + (deltaX / 2)-12}px`;
            weightElement.style.top = `${node1.y  + (deltaY / 2)-12}px`;

            graphContainer.appendChild(weightElement);

            weightElement.addEventListener("click", (event) => {
                event.stopPropagation();
                this.onEdgeClick(edge.id);
            })
        })
    }

    isGraphConnected() {
        const visited = new Set();
        let connectedComponents = 0;

        const dfs = (node) => {
            visited.add(node);

            const neighbors = this.edgesArr.filter(
                edge => edge.node1 === node || edge.node2 === node
            ).map(edge => (edge.node1 === node ? edge.node2 : edge.node1));

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor);
                }
            }
        };

        for (const node of this.nodesArr) {
            if (!visited.has(node.id)) {
                connectedComponents++;
                dfs(node.id);
            }
        }

        return connectedComponents === 1;
    }

    renderMST() {
        const mstContainer = document.getElementById("graphContainer");
        const edges = document.querySelectorAll('.mst-edge');

        disableButtons();
        this.chosenTool = "none";
        removeAllActiveButtons();

        edges.forEach(edge => edge.remove());
        this.mstEdges.forEach((edge, index) => {
            setTimeout(() => {
                const node1 = this.findNodeById(edge.node1);
                const node2 = this.findNodeById(edge.node2);


                const deltaX = node2.x - node1.x;
                const deltaY = node2.y - node1.y;

                const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const angle = Math.atan2(deltaY, deltaX);

                const mstEdgeElement = document.createElement("div");
                mstEdgeElement.className = "mst-edge";
                mstEdgeElement.style.left = `${node1.x}px`;
                mstEdgeElement.style.top = `${node1.y}px`;
                mstEdgeElement.style.width = `${length}px`;
                mstEdgeElement.style.transformOrigin = "left top";
                mstEdgeElement.style.transform = `rotate(${angle}rad)`;

                mstContainer.appendChild(mstEdgeElement);
            }, index * 1000);
        });

        setTimeout(() => {
            const allEdges = mstContainer.querySelectorAll(".mst-edge");
            allEdges.forEach(edge => {
                edge.style.backgroundColor = "orange";
            });
            enableButtons();
        }, this.mstEdges.length * 1000);
    }

    onNodeClick(nodeId) {
        switch (this.chosenTool) {
            case "removeNode":
                this.removeNode(nodeId);
                this.renderGraph();
                break;
            case "addEdge":
                if(this.selectedNode === null) {
                    this.selectedNode = nodeId;
                } else {
                    if (this.selectedNode !== nodeId) {
                        let weight;
                        let validInput = false;
                        while (!validInput) {
                            weight = prompt("Вага ребра (ціле число):");
                            if (weight === null) {
                                this.selectedNode = null;
                                return;
                            }
                            if (/^-?\d+$/.test(weight)) {
                                weight = parseInt(weight);
                                if (weight >= -1000 && weight <= 1000) {
                                    validInput = true;
                                } else {
                                    alert("Вага не може виходити за діапазон [-1000; 1000]");
                                }
                            } else {
                                alert("Введене значення не є цілим числом. Спробуйте ще раз.");
                            }
                        }

                        this.addEdge(this.selectedNode, nodeId, weight);
                        this.selectedNode = null;
                        this.renderGraph();
                    }
                }
                break;
            case "primAlgorithm":
                this.primMST(nodeId);
                this.renderMST();
                document.getElementById("timeComplexity").innerText =
                    `Кількість кроків алгоритму: ${this.iterations}`;
                break;
        }
    }

    onEdgeClick(edgeID) {
        switch (this.chosenTool) {
            case "removeEdge":
                this.removeEdge(edgeID);
                this.renderGraph();
                break;
            case "editEdge":
                const edge = this.edgesArr.find(edge => edge.id === edgeID);
                const newWeight = parseInt(prompt("Введіть нову вагу ребра:"));
                edge.weight = newWeight;
                this.renderGraph();
                break;
        }
    }

    chooseMSTAlgorithm(algorithm, output) {
        switch (algorithm) {
            case 'primAlgorithm':
                this.chosenTool = "primAlgorithm";
                output.innerText = "Вибрано інструмент побудови мінімального остовного дерева алгоритмом Прима" +
                    "\nВиберіть вершину для початку побудови";
                break;
            case 'kruskalAlgorithm':
                output.innerText = "Вибрано інструмент побудови мінімального остовного дерева алгоритмом Крускала";
                this.mstEdges = this.kruskalMST();
                this.renderMST(this.mstEdges);
                break;
            case 'boruvkaAlgorithm':
                output.innerText = "Вибрано інструмент побудови мінімального остовного дерева алгоритмом Борувки";
                this.mstEdges = this.boruvkaMST();
                this.renderMST(this.mstEdges);
                break;
            default:
                alert("Invalid algorithm selected");
                return;
        }

    }

    convertToMatrix() {
        let weightMatrix = Array.from({length: this.nodesArr.length},
            () => Array(this.nodesArr.length).fill(0));
        this.edgesArr.forEach(edge => {
            weightMatrix[edge.node1][edge.node2] = edge.weight;
            weightMatrix[edge.node2][edge.node1] = edge.weight;
        })
        return weightMatrix;
    }

    insertionSort(arr, compareFunction) {
        for (let i = 1; i < arr.length; i++) {
            let current = arr[i];
            let j = i - 1;

            while (j >= 0 && compareFunction(arr[j], current) > 0) {
                arr[j + 1] = arr[j];
                j--;
                this.iterations++;
            }
            arr[j + 1] = current;
            this.iterations++;
        }
        return arr;
    }

    findParent(parent, component)  {
        if (parent[component] === component) {
            return component;
        }
        return parent[component] = this.findParent(parent, parent[component]);
    }

    unionSet(parent, rank, u, v) {
        const node1 = this.findParent(parent, u);
        const node2 = this.findParent(parent, v);

        if (node1 !== node2) {
            if (rank[node1] > rank[node2]) {
                parent[node2] = node1;
            } else if (rank[node1] < rank[node2]) {
                parent[node1] = node2;
            } else {
                parent[node2] = node1;
                rank[node1]++;
            }
        }
    };

    primMST(choseNodeId)  {
        this.iterations = 0;
        if (this.edgesArr.length < 2) {
            alert("Неможливо побудувати мінімальне остовне дерево з менше ніш двома ребрами");
            return;
        }
        let weightMatrix = this.convertToMatrix();
        const mstEdges = [];
        const mstNodes = new Set();
        let edgeQueue = [];

        const startNode = this.nodesArr[choseNodeId];
        mstNodes.add(startNode.id);

        const addEdges = (nodeId) => {
            const connectedEdges = this.edgesArr.filter(
                (edge) => edge.node1 === nodeId || edge.node2 === nodeId
            );
            connectedEdges.forEach((edge) => {
                if(mstNodes.has(edge.node1) && mstNodes.has(edge.node2)) {
                    return
                }
                edgeQueue.push(edge);
                this.iterations++;
            });
        }

        addEdges(startNode.id);

        while (mstNodes.size < this.nodesArr.length) {
            edgeQueue = this.insertionSort(edgeQueue,
                (a, b) => weightMatrix[a.node1][a.node2] - weightMatrix[b.node1][b.node2]);
            const minEdge = edgeQueue.shift();
            this.iterations++;

            const inMST1 = mstNodes.has(minEdge.node1);
            const inMST2 = mstNodes.has(minEdge.node2);

            if (inMST1 && inMST2) {
                continue;
            }

            mstEdges.push(minEdge);

            const newNode = inMST1 ? minEdge.node2 : minEdge.node1;
            mstNodes.add(newNode);
            addEdges(newNode);
        }

        this.mstEdges = mstEdges;
        return mstEdges;
    }

    kruskalMST() {
        this.iterations = 0;
        this.edgesArr = this.insertionSort(this.edgesArr, (a, b) => a.weight - b.weight);
        const edges = [...this.edgesArr];

        const parent = [];
        const rank = [];

        for (let i = 0; i < this.nodesArr.length; i++) {
            parent[i] = i;
            rank[i] = 0;
            this.iterations++;
        }

        const mstEdges = [];

        for (const edge of edges) {
            const { node1, node2 } = edge;
            const root1 = this.findParent(parent, node1);
            const root2 = this.findParent(parent, node2);
            this.iterations++;

            if (root1 !== root2) {
                mstEdges.push(edge);
                this.unionSet(parent, rank, root1, root2);
                this.iterations++;
            }
        }
        this.mstEdges = mstEdges;
        return mstEdges
    }

    boruvkaMST() {
        this.iterations = 0;
        const parent = [];
        const rank = [];

        for (let i = 0; i < this.nodesArr.length; i++) {
            parent[i] = i;
            rank[i] = 0;
            this.iterations++;
        }

        let numTrees = this.nodesArr.length;
        const mstEdges = [];

        while (numTrees > 1) {
            const cheapest = new Array(this.nodesArr.length).fill(null);

            for (const edge of this.edgesArr) {
                const { node1, node2, weight } = edge;
                const root1 = this.findParent(parent, node1);
                const root2 = this.findParent(parent, node2);

                if (root1 !== root2) {
                    if (cheapest[root1] === null || cheapest[root1].weight > weight) {
                        cheapest[root1] = edge;
                        this.iterations++;
                    }
                    if (cheapest[root2] === null || cheapest[root2].weight > weight) {
                        cheapest[root2] = edge;
                        this.iterations++;
                    }
                }
            }

            for (let i = 0; i < cheapest.length; i++) {
                if (cheapest[i] !== null) {
                    const { node1, node2 } = cheapest[i];
                    const root1 = this.findParent(parent, node1);
                    const root2 = this.findParent(parent, node2);

                    if (root1 !== root2) {
                        mstEdges.push(cheapest[i]);
                        this.unionSet(parent, rank, root1, root2);
                        numTrees--;
                        this.iterations++;
                    }
                }
            }
        }

        this.mstEdges = mstEdges;
        return mstEdges;
    }
    generateDivMatrixWeight() {
        let weightMatrix = this.convertToMatrix();
        let matrixString = "<table border='0'>";
        for (let i = 0; i < weightMatrix.length; i++) {
            matrixString += "<tr>";
            for (let j = 0; j < weightMatrix.length; j++) {
                matrixString += `<td>${weightMatrix[i][j]}<td>`;
            }
            matrixString += "</tr>";
        }
        matrixString += "</table>"
        return matrixString
    }

    saveToFile() {
        if (!this.isGraphConnected()) {
            alert("Граф не є зв'язним");
            return;
        }
        if (this.edgesArr.length < 2) {
            alert("Неможливо побудувати мінімальне остовне дерево з менше ніж 2 ребрами");
            return;
        }
        this.boruvkaMST();
        let fileContent = "Матриця вагів:\n";
        let fileName = prompt("Назва файлу");
        if (fileName.length > 100) {
            alert("Назва файлу не може містити більше 100 символів");
            return;
        } else if(fileName.length === 0) {
            alert("Вкажіть назву файлу");
            return;
        }
        for (const row of this.convertToMatrix()) {
            fileContent += row + "\n";
        }

        fileContent += "\nМінімальне остовне дерево\n";
        this.mstEdges.forEach((edge) => {
            fileContent += `1-ша вершина: ${edge.node1},: 2-га вершина: ${edge.node2}. Вага: ${edge.weight}\n` + "\n";
        });
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}