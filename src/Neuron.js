export class Neuron {
    constructor(inputs, weights, bias) {

        if (typeof weights === "undefined") {
            weights = inputs.map(() => Math.random());
        }

        if (typeof bias === "undefined") {
            bias = Math.random();
        }

        this.weights = weights;
        this.bias = bias;
        this.inputs = inputs;
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    value() {
        return this.sum();
    }

    sum() {
        return this.bias + this.inputs
            .map((item, key) => item.value() * this.weights[key])
            .reduce((carry, value) => carry + value, 0);;
    }
}

export class InitialNeuron extends Neuron {
    constructor(input) {
        super([input], [1], 0);
    }

    value() {
        return this.inputs[0];
    }

    sum() {
        return this.value();
    }
}

InitialNeuron.prototype.toString = function () {
    return `${this.constructor.name}(${this.inputs[0]})`;
}
