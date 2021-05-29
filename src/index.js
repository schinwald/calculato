import React from 'react';
import ReactDom from 'react-dom';
import './index.css';



class ArithmeticNode {

    constructor(type, value) {
        this.type = type;
        this.value = value;
        this.left = null;
        this.right = null;
    }

    static calculatePrecedence(operator) {
        if (operator === "+" || operator === "-") return 0;
        if (operator === "%" || operator === "/" || operator === "x") return 1;
        return -1;
    }
}


class Calculator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            input: "0",
            answer: ""
        }
    }

    clear() {
        this.setState({input: "0"});
    }

    add(value) {
        const input = this.state.input.concat(value);
        this.handleInput(input);
    }

    remove() {
        const input = this.state.input.slice(0, -1);
        this.handleInput(input);
    }

    generateTree() {
        const {input} = this.state;
        const operatorRegex = /[%/x+-]/;
        const numberRegex = /[0-9]*[.]?[0-9]*/;
        const numbers = input.split(operatorRegex);
        const operators = input.split(numberRegex).slice(1,-1);
        let root, current, previous = null;
        // cycle through each index in operators to generate each fork in the tree
        for (let index in operators) {
            previous = current;
            let operator = operators[index];
            current = new ArithmeticNode("operator", operator);
            // handle special case of first arithmetic node
            if (previous != null) {
                const precedence = ArithmeticNode.calculatePrecedence(previous.data);
                // extend tree downward (current has more precedence than previous)
                // previous is not resolved (not until current is resolved)
                if (precedence < ArithmeticNode.calculatePrecedence(current.data)) {
                    const left = numbers[index];
                    current.left = new ArithmeticNode("number", left);
                    previous.right = current;
                // extend tree upward (current has less precedence than previous)
                // previous can be resolved (therefore number is attached to right side)
                } else {
                    current.left = root;
                    const right = numbers[index];
                    previous.right = new ArithmeticNode("number", right);
                    // change root pointer of tree
                    root = current;
                }
            // prepend number to first node (this always happens for the first node)
            } else {
                const left = numbers[index];
                current.left = new ArithmeticNode("number", left);
                // initialize root pointer of tree
                root = current;
            }        
        }
        // append number to last node (this always happens to the last node)
        if (numbers.length !== 0) {
            const index = numbers.length - 1;
            if (current != null) {
                const right = numbers[index];
                current.right = new ArithmeticNode("number", right);
            } else {
                const number = numbers[index];
                root = new ArithmeticNode("number", number);
            }
        }
        return root;
    }

    calculate(tree) {
        if (tree == null) return 0;
        if (tree.type === "number") return parseFloat(tree.value);
        if (tree.type === "operator") {
            let left, right = 0;
            if (tree.left != null) left = this.calculate(tree.left);
            if (tree.right != null) right = this.calculate(tree.right);
            // compute arithmetic expression with left and right numbers
            if (tree.value === "%") {
                return left % right;
            } else if (tree.value === "/") {
                return left / right;
            } else if (tree.value === "x") {
                return left * right;
            } else if (tree.value === "+") {
                return left + right;
            } else if (tree.value === "-") {
                return left - right;
            }
        }
        return 0;
    }

    handleInput(input) {
        // creating regular expressions for handling input
        const validator = new RegExp(/^(([.][0-9]+|[.]$|[0-9]+[.][0-9]+|[0-9]+[.]|[0-9]+)([%/x+-]|$))+$/);
        const empty = new RegExp(/^$/);
        const leadingZeros = new RegExp(/([%/x+-]|^)[0]+([0][.][0-9]*|[1-9]+)/);
        // mutate string to be formatted correctly
        let value = input;
        value = value.replace(empty, "0");
        value = value.replace(leadingZeros, "$1$2");
        // validate value and change input state
        if (validator.test(value)) {
            this.setState({input: value});
        }
    }

    render() {
        return (
            <div>
                <div className="row">
                    <Input value={this.state.input} onChange={(event) => this.handleInput(event.target.value)}/>
                </div>
                <div className="row">
                    <Button label="C" onClick={() => this.clear()}/>
                    <Button label="Del" onClick={() => this.remove()}/>
                    <Button label="%" onClick={() => this.add("%")}/>
                    <Button label="/" onClick={() => this.add("/")}/>
                </div>
                <div className="row">
                    <Button label="7" onClick={() => this.add("7")}/>
                    <Button label="8" onClick={() => this.add("8")}/>
                    <Button label="9" onClick={() => this.add("9")}/>
                    <Button label="x" onClick={() => this.add("x")}/>
                </div>
                <div className="row">
                    <Button label="4" onClick={() => this.add("4")}/>
                    <Button label="5" onClick={() => this.add("5")}/>
                    <Button label="6" onClick={() => this.add("6")}/>
                    <Button label="-" onClick={() => this.add("-")}/>
                </div>
                <div className="row">
                    <Button label="1" onClick={() => this.add("1")}/>
                    <Button label="2" onClick={() => this.add("2")}/>
                    <Button label="3" onClick={() => this.add("3")}/>
                    <Button label="+" onClick={() => this.add("+")}/>
                </div>
                <div className="row">
                    <Button label="0" onClick={() => this.add("0")}/>
                    <Button label="." onClick={() => this.add(".")}/>
                    <Button label="ANS" onClick={() => this.add(this.state.answer)}/>
                    <Button label="=" onClick={() => {
                        const tree = this.generateTree();
                        const value = this.calculate(tree).toString();
                        this.setState({input: value, answer: value});
                    }}/>
                </div>
            </div>
        );
    }
}


class Input extends React.Component {
    render () {
        return (
            <input type="text" value={this.props.value} onChange={this.props.onChange}/>
        );
    }
}


class Button extends React.Component {
    render() {
        return (
            <input type="button" value={this.props.label} onClick={this.props.onClick}/>
        )
    }
}


ReactDom.render(
    <Calculator/>,
    document.getElementById('root')
)