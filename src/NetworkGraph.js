import { InitialNeuron, OutputNeuron } from "./Neuron.js";

export class NetworkGraph {
    constructor (network) {
        this.network = network;
        this.graph = {};
    }

    neuronToSVG(neuron, x, y, width, height) {

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        let strokeWidth = 2

        let radius = Math.min(25, (Math.min(height, width) / 2) - strokeWidth);
        let fontSize = radius / 2;
        let errorFontSize = fontSize / 1.5;

        const circleAttributes = {
            "r": radius,
            "cx": x + (width / 2),
            "cy": y + (height / 2),
            "stroke-width": strokeWidth,
            "stroke": "currentColor",
            "fill": "transparent",
            "data-weights": neuron.weights.map(v => v.toFixed(2)).join(" | "),
            "data-inputs": neuron.inputs.join(","),
            "data-bias": neuron.bias.toFixed(2),
            "data-sum": neuron.sum().toFixed(2),
            "data-id": neuron.id
        };

        let error;

        if (neuron instanceof OutputNeuron) {
            let cost = 0.5 * (neuron.value() - this.network.target) ** 2;
            error = neuron.value() - this.network.target;
            
            circleAttributes["data-cost"] = cost.toFixed(2);
            circleAttributes["data-error"] = error.toFixed(2);
        }

        for (const [attr, value] of Object.entries(circleAttributes)) {
            circle.setAttribute(attr, value);
        }

        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x + (width / 2));
        text.setAttribute("y", y + (height / 2));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.setAttribute("fill", "currentColor");
        text.setAttribute("font-size", `${fontSize}px`);
        text.setAttribute("font-weight", "bold");
        text.setAttribute("font-family", "monospace");
        text.setAttribute("pointer-events", "none");
        text.innerHTML = neuron.value().toFixed(1);

        if (neuron instanceof OutputNeuron) {
            let errorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            errorText.setAttribute("x", x + (width / 2));
            errorText.setAttribute("y", y + (height / 2) + fontSize);
            errorText.setAttribute("text-anchor", "middle");
            errorText.setAttribute("dominant-baseline", "central");
            errorText.setAttribute("fill", "red");
            errorText.setAttribute("font-size", `${errorFontSize}px`);
            errorText.setAttribute("font-weight", "bold");
            errorText.setAttribute("font-family", "monospace");
            errorText.setAttribute("pointer-events", "none");
            errorText.classList.add("error");
            errorText.innerHTML = error.toFixed(2);

            group.appendChild(errorText);
        }

        group.appendChild(circle);
        group.appendChild(text);

        this.graph[neuron.id] = {
            x: x, 
            y: y, 
            height: height, 
            width: width,
            radius: radius,
        };

        return group;
    }

    layerToSVG(layer, x, y, width, height) {

        let neurons = layer.neurons.map((neuron, key) => {
            return this.neuronToSVG(neuron, x, y + (height / layer.neurons.length * key), width, height / layer.neurons.length);
        });

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        neurons.forEach(neuron =>group.appendChild(neuron));

        return group;
    }

    toSVG(x, y, width, height) {

        let layers = this.network.layers.map((layer, layerKey) => {
            let layerWidth = width / this.network.layers.length;
            return this.layerToSVG(layer, x + (layerKey * layerWidth), y, layerWidth, height);
        });

        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        layers.forEach(layer => group.appendChild(layer));

        return group;

    }

    getConnections() {
        let group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        this.network.layers.toReversed().forEach(layer => {
            layer.neurons.forEach(neuron => {

                if (neuron instanceof InitialNeuron) {
                    return;
                }

                let inputs = neuron.inputs;

                let neuronGraphData = this.graph[neuron.id];

                let neuronCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                neuronCircle.setAttribute("cx", neuronGraphData.x + (neuronGraphData.width - neuronGraphData.radius * 2) / 2);
                neuronCircle.setAttribute("cy", neuronGraphData.y + (neuronGraphData.height / 2));
                neuronCircle.setAttribute("r", 2);
                neuronCircle.setAttribute("fill", "#fff");

                group.appendChild(neuronCircle);
                
                inputs.forEach(input => {

                    if (typeof input === InitialNeuron) {
                        return;
                    }

                    let inputGraphData = this.graph[input.id];

                    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

                    line.setAttribute("x1", neuronGraphData.x + (neuronGraphData.width - neuronGraphData.radius * 2) / 2);
                    line.setAttribute("y1", neuronGraphData.y + (neuronGraphData.height / 2));
                    line.setAttribute("x2", inputGraphData.x + (inputGraphData.width - ((inputGraphData.width - inputGraphData.radius * 2) / 2)));
                    line.setAttribute("y2", inputGraphData.y + (inputGraphData.height / 2));
                    line.setAttribute("stroke", "#fff");

                    let inputCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    inputCircle.setAttribute("cx", inputGraphData.x + (inputGraphData.width - ((inputGraphData.width - inputGraphData.radius * 2) / 2)));
                    inputCircle.setAttribute("cy", inputGraphData.y + (inputGraphData.height / 2));
                    inputCircle.setAttribute("r", 2);
                    inputCircle.setAttribute("fill", "#fff");

                    group.appendChild(line);
                    group.appendChild(inputCircle);
                })
            });
        });

        return group;
    }
}