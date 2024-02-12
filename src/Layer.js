import { InitialNeuron, Neuron } from "./Neuron.js";

export class Layer {
    constructor(numNeurons) {
        this.neurons = Array.from({length: numNeurons}).map(v => new Neuron([]));
        this.cost = null;
    }

    connect(nextLayer) {
        nextLayer.neurons.forEach(neuron => {
            neuron.inputs = this.neurons;
            neuron.weights = this.neurons.map(() => Math.random() - 0.5);
        })
    }

    backpropagate(errorNextLayer, learningRate) {
        errorNextLayer = errorNextLayer.map(
            value => value * 1 // TODO: allow for activation functions
        )

        // errorNextLayer is shape (this.neurons.length, 1)

        let weightMatrix = []; // shape is (this.neurons.length, inputs.length)

        for (let j = 0; j < this.neurons.length; j++) {
            weightMatrix[j] = this.neurons[j].weights;
        }

        let transposedWeightMatrix = []; // shape is (inputs.length, this.neurons.length)

        for (let i = 0; i < weightMatrix[0].length; i++) {
            transposedWeightMatrix[i] = [];
            for (let j = 0; j < weightMatrix.length; j++) {
                transposedWeightMatrix[i][j] = weightMatrix[j][i];
            }
        }

        let partialError = []; // shape should be (inputs.length, 1)

        for (let i = 0; i < transposedWeightMatrix.length; i++) {
            partialError[i] = transposedWeightMatrix[i]
            .map((v, i) => v * errorNextLayer[i])
            .reduce((partialSum, a) => partialSum + a, 0);
        }

        for (let j = 0; j < this.neurons.length; j++) {
            this.neurons[j].bias -= errorNextLayer[j] * learningRate;
            // console.log(`reduce bias by ${errorNextLayer[j] * learningRate}`);
            for (let k = 0; k < this.neurons[j].weights.length; k++) {

                let partialDerivative = this.neurons[j].inputs[k].value() * errorNextLayer[j];
                this.neurons[j].weights[k] -= partialDerivative * learningRate;
                // console.log(`reduce weight ${k} by ${partialDerivative * learningRate}`);
            }
        }

        return partialError;
    }
}

export class OutputLayer extends Layer {

    feedforward(target) {
        let outputNeuron = this.neurons[0];
        let z = outputNeuron.sum();

        return z - target;
    }

    backpropagate(error, learningRate) {
        let outputNeuron = this.neurons[0];

        error = [error];

        let weights = outputNeuron.weights;

        let partialError = [];

        for (let i = 0; i < weights.length; i++) {
            partialError.push(weights[i] * error[0]);
        }

        outputNeuron.bias -= learningRate * error[0];
        // console.log(`reduce bias by ${learningRate * error[0]}`);
        
        for (let i = 0; i < this.neurons[0].weights.length; i++) {
            let partialDerivative = this.neurons[0].inputs[i].value() * error[0];
            this.neurons[0].weights[i] -= partialDerivative * learningRate;
            // console.log(`reduce weight ${i} by ${partialDerivative * learningRate}`);
        }

        return partialError;
    }
}

export class InputLayer extends Layer {
    constructor(numNeurons) {
        super(numNeurons);
        this.neurons = Array.from({length: numNeurons}).map(v => new InitialNeuron(0));
    }
    backpropagate() {
        return [];
    }
}