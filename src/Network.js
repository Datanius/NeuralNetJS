import { InputLayer, OutputLayer } from "./Layer.js";
import { InitialNeuron } from "./Neuron.js";

export class Network {
    constructor(layers) {
        this.layers = layers;
        this.target = 0;
        this.cost = 0;

        for (let i = 0; i < layers.length; i++) {
            if (i === layers.length - 1) return;
            layers[i].connect(layers[i+1]);
        }
    }

    loss() {
        return this.cost;
    }

    setTrainingSamples(samples) {
        this.samples = samples;
    }

    setTrainingSample(sample) {
        this.firstLayer().neurons.forEach((v, i) => v.inputs = [sample.input[i]]);
        this.target = sample.target;
    }

    weights() {
        return this.layers.map(l => l.neurons.map(n => [n.weights, n.bias]));
    }

    lastLayer() {
        return this.layers[this.layers.length - 1];
    }

    firstLayer() {
        return this.layers[0];
    }

    feedforward(sample) {
        this.setTrainingSample(sample)
        this.lastLayer().feedforward(sample.target);
    }

    train() {
        let totalDiff = 0;
        this.samples.forEach(v => {
            this.setTrainingSample(v);
            let diff = this.lastLayer().feedforward(v.target);
            totalDiff += diff ** 2;
            this.backpropagate(this.lastLayer().feedforward(v.target));
        })

        this.cost = totalDiff / (2 * this.samples.length);
        window.costLogger.push(this.cost);
    }

    loadWeights(weights) {
        console.log(weights);
        for (let layer = 0; layer < weights.length; layer++) {
            for (let k = 0; k < weights[layer].length; k++) {
                this.layers[layer].neurons[k].weights = weights[layer][k][0];
                this.layers[layer].neurons[k].bias = weights[layer][k][1];
            }
        }
    }

    backpropagate(costGradient) {
        let partialError = [];

        let learningRate = 0.001;

        let layers = [...this.layers];

        layers.reverse().forEach(layer => {

            if (layer instanceof InputLayer) {
                return;
            }

            partialError = layer instanceof OutputLayer
                ? layer.backpropagate(costGradient, learningRate)
                : layer.backpropagate(partialError, learningRate)
        })
    }
}