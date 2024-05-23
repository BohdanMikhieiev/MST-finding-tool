import { Graph } from "./models/Graph.js";
import {removeAllActiveButtons} from "./utils.js";

document.addEventListener('DOMContentLoaded', () => {
    const graph = new Graph();
    const graphContainer = document.getElementById("graphContainer");
    const output = document.getElementById("historyLog");

    document.getElementById("addNodeTool").addEventListener("click", () => {
        removeAllActiveButtons()
        graph.chosenTool = "addNode";
        output.innerText = "Вибрано інструмент створення вершин";
        document.getElementById("addNodeTool").classList.toggle("active");
    });

    document.getElementById("removeNodeTool").addEventListener("click", () => {
        removeAllActiveButtons()
        graph.chosenTool = "removeNode";
        output.innerText = "Вибрано інструмент видалення вершин"
            document.getElementById("removeNodeTool").classList.toggle("active");
    });

    document.getElementById("addEdgeTool").addEventListener("click", () => {
        removeAllActiveButtons()
        graph.chosenTool = "addEdge";
        output.innerText = "Вибрано інструмент додавання ребер"
        document.getElementById("addEdgeTool").classList.toggle("active");
    })

    document.getElementById("removeEdgeTool").addEventListener("click", () => {
        removeAllActiveButtons()
        graph.chosenTool = "removeEdge";
        output.innerText = "Вибрано інструмент видалення ребер";
        document.getElementById("removeEdgeTool").classList.toggle("active");
    })

    document.getElementById("editEdgeTool").addEventListener("click", () => {
        removeAllActiveButtons()
        graph.chosenTool = "editEdge";
        output.innerText = "Вибрано інструмент редагування ребер";
        document.getElementById("editEdgeTool").classList.toggle("active");
    });

    document.getElementById("findMSTTool").addEventListener("click", () => {
        if (!graph.isGraphConnected()) {
            alert("Граф не є зв'язним. Неможливо побудувати мінімальне остовне дерево.");
            return;
        }
        removeAllActiveButtons()
        document.getElementById("findMSTTool").classList.toggle("active");
        graph.renderGraph();
        const algorithm = document.getElementById("algorithmSelectorTool").value;
        graph.chooseMSTAlgorithm(algorithm, output);
        document.getElementById("timeComplexity").innerText =
            `Кількість кроків алгоритму: ${graph.iterations}`;
    });

    const timeComplexityTool = document.getElementById("showTimeComplexityTool");
    timeComplexityTool.addEventListener("click", () => {
        output.innerText = "Вибрано інструмент показу часової складності"
        document.getElementById("timeComplexity").innerText =
            `Кількість кроків алгоритму: ${graph.iterations}`;


        document.getElementById("weightMatrix").style.display = "none";
        weightMatrixTool.classList.remove("active");

        if(document.getElementById("timeComplexity").style.display === "block") {
            document.getElementById("timeComplexity").style.display = "none";
            timeComplexityTool.classList.remove("active");
        } else {
            document.getElementById("timeComplexity").style.display = "block";
            timeComplexityTool.classList.add("active");
        }

    });

    const weightMatrixTool = document.getElementById("showWeightMatrixTool");
    weightMatrixTool.addEventListener("click", () => {
        let matrixString = graph.generateDivMatrixWeight();

        const weightMatrixDiv = document.getElementById('weightMatrix');
        weightMatrixDiv.innerHTML = `${matrixString}`;

        document.getElementById("timeComplexity").style.display = "none";
        timeComplexityTool.classList.remove("active");

        if (weightMatrixDiv.textContent.trim().length === 0) {
            weightMatrixDiv.innerHTML = `Поки немає ребер для побудови матриці ваг`;
        }
        if (weightMatrixDiv.style.display === "block") {
            weightMatrixDiv.style.display = "none";
            weightMatrixTool.classList.remove("active");
        } else if (weightMatrixDiv.textContent.trim().length > 0) {
            weightMatrixDiv.style.display = "block";
            weightMatrixTool.classList.add("active");
        }
    });

    const saveFileTool = document.getElementById("saveFileTool");
    saveFileTool.addEventListener("click", () => {
        removeAllActiveButtons();
        output.innerText = "Вибрано інструмент збереження графу в файл"
        graph.saveToFile();
    });

    graphContainer.addEventListener("click", (event) => {
        if(graph.chosenTool === "addNode") {
            const x = event.offsetX;
            const y = event.offsetY;

            graph.addNode(x, y);
            graph.renderGraph();
            output.innerText = `Створено вершину на координатах (${x}, ${y})`;
        }
    });
});