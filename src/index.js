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


class State {
    
    constructor(id, regex, transitions, recoveries) {
        this.id = id;
        this.regex = regex;
        this.transitions = transitions;
        this.recoveries = recoveries;
    }
}


class StateMachine {

    constructor(states, start, accept) {
        this.history = [];
        this.states = states;
        this.start = start;
        this.accept = accept;
        this.current = start;
    }

    reset() {
        this.current = this.start;
        this.history = [];
    }

    backwardTransition() {
        if (this.history.length === 0) return -1;
        this.current = this.history.pop();
        return 1;
    }

    forwardTransition(input) {
        for (const index of this.states[this.current].transitions) {
            let regex = this.states[index].regex;
            if (index < this.states.length && regex.test(input)) {
                this.history.push(this.current);
                this.current = index;
                return 1;
            }
        }
        return -1;
    }

    recover(input) {
        let counter = 0;
        let recoveries = this.states[this.current].recoveries;
        while (this.backwardTransition() !== -1) {
            counter++;
            if (recoveries.includes(this.current)) {
                if (this.forwardTransition(input) !== -1) return counter;
                break;
            }
        }
        return -1;
    }

    isAccepting() {
        return this.accept.includes(this.current);
    }
}


class InputHandler {

    constructor() {
        let states = [
            new State( 0,     null,     [  1,  2,  3,  4,  5],            [   ]),
            new State( 1,    /[(]/,     [  1,  2,  3,  4,  5],            [   ]),
            new State( 2,    /[-]/,             [  3,  4,  5],            [   ]),
            new State( 3,    /[0]/,             [  4,  8, 10],     [ 0,  8,  9]),
            new State( 4,    /[.]/,                     [  6],     [ 3,  6,  7]),
            new State( 5,  /[1-9]/,     [  4,  7,  8,  9, 10],            [   ]),
            new State( 6,  /[0-9]/,         [  6,  8,  9, 10],            [   ]),
            new State( 7,  /[0-9]/,     [  4,  7,  8,  9, 10],            [   ]),
            new State( 8, /[%/x+]/,     [  1,  2,  3,  4,  5],            [   ]),
            new State( 9,    /[-]/,         [  1,  3,  4,  5],            [   ]),
            new State(10,    /[)]/, [  1,  2,  3,  4,  5,  8],            [   ])
        ];
        let start = 0;
        let accept = [3, 5, 7, 8, 11]
        this.brackets = 0;
        this.machine = new StateMachine(states, start, accept);
    }

    reset() {
        this.machine.reset();
        this.brackets = 0;
    }

    backwardTransition() {
        const current = this.machine.current;
        let ret = this.machine.backwardTransition();
        if (ret > 0) {
            if (current === 1) this.brackets--;
            if (current === 11) this.brackets++;
        }
        return ret;
    }

    forwardTransition(input) {
        const current = this.machine.current;
        let ret = this.machine.forwardTransition(input);
        if (ret > 0) {
            if (current === 1) this.brackets++;
            if (current === 11) this.brackets--;
        }
        return ret;
    }

    process(input) {
        let counter = 0;
        let ret = this.forwardTransition(input);
        if (ret === -1) counter = this.machine.recover(input);
        console.log("counter: ", counter);
        return counter;
    }

    isComplete() {
        return (this.machine.isAccepting() && this.brackets === 0);
    }
}


class Calculator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [],
            input: "0"
        }
    }

    clear() {
        this.setState({input: "0"});
    }

    add(value) {
        const {input} = this.state;
        const updated = input.concat(value);
        this.handleInput(updated);
    }

    remove() {
        const {input} = this.state;
        let updated = null;
        if (input.length === 1) {
            this.clear();
        } else {
            updated = input.slice(0, -1);
        }
        this.handleInput(updated);
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
            // calculate left and right side of operator
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

    handleInput(value) {
        const {inputHandler} = this.props;
        const array = []; 
        inputHandler.reset();
        for (let i = 0; i < value.length; i++) {
            let counter = inputHandler.process(value[i]);
            if (counter === -1) break;
            for (let j = 0; j < counter; j++) {
                array.pop();
            }
            array.push(value[i]);
        }
        let updated = array.join('');
        this.setState({input: updated});
    }

    render() {
        const {history, input} = this.state;
        return (
            <div>
                <div className="top">
                    <div className="row">
                        <History history={history} onClick={(index) => {
                            if (history[index] != null) {
                                const character = input[input.length - 1];
                                const operators = new RegExp(/[%/x+-]/);
                                if (!operators.test(character)) {
                                    this.clear();
                                }
                                this.add(history[index].answer);
                            }
                        }}/>
                    </div>
                    <div className="row">
                        <Input value={input} onChange={(event) => {this.handleInput(event.target.value);}}/>
                    </div>
                </div>
                <div className="bottom">
                    <div className="row">
                        {/* <Button value="C" onClick={() => {this.clear();}}/>
                        <Button value="Del" onClick={() => {this.remove();}}/> */}
                        <Button value="(" onClick={() => {this.add("(");}}/>
                        <Button value=")" onClick={() => {this.add(")");}}/>
                        <Button value="+" onClick={() => {this.add("+");}}/>
                        <Button value="-" onClick={() => {this.add("-");}}/>
                    </div>
                    <div className="row">
                        <Button value="7" onClick={() => {this.add("7");}}/>
                        <Button value="8" onClick={() => {this.add("8");}}/>
                        <Button value="9" onClick={() => {this.add("9");}}/>
                        <Button value="x" onClick={() => {this.add("x");}}/>
                    </div>
                    <div className="row">
                        <Button value="4" onClick={() => {this.add("4");}}/>
                        <Button value="5" onClick={() => {this.add("5");}}/>
                        <Button value="6" onClick={() => {this.add("6");}}/>
                        <Button value="/" onClick={() => {this.add("/");}}/>
                    </div>
                    <div className="row">
                        <Button value="1" onClick={() => {this.add("1");}}/>
                        <Button value="2" onClick={() => {this.add("2");}}/>
                        <Button value="3" onClick={() => {this.add("3");}}/>
                        <Button value="%" onClick={() => {this.add("%");}}/>
                    </div>
                    <div className="row">
                        <Button value="0" onClick={() => {this.add("0");}}/>
                        <Button value="." onClick={() => {this.add(".");}}/>
                        <Button value="=" onClick={() => {
                            const tree = this.generateTree();
                            const answer = this.calculate(tree).toString();
                            const recent = history.concat({input: input, answer: answer})
                            this.setState({history: recent, input: answer});
                        }}/>
                        <Button value="ANS" onClick={() => {
                            this.add()
                        }}/>
                    </div>
                </div>
            </div>
        );
    }
}


function History(props) {
    const {history, onClick} = props;
    const list = history.map((element, index) => {
        const input = element.input;
        return (
            <li key={index} className="history-item">
                <Button value={input} onClick={() => {onClick(index);}}></Button>
            </li>
        )
    });
    return (
        <ol className="history">{list}</ol>
    );
}


function Input(props) {
    const {value, onChange, disabled} = props;
    return (
        <input className="input" type="text" value={value} onChange={onChange} disabled={disabled}/>
    )
}


function Button(props) {
    const {value, onClick} = props;
    return (
        <input type="button" value={value} onClick={onClick}/>
    )
}


ReactDom.render(
    <Calculator inputHandler={new InputHandler()}/>,
    document.getElementById('root')
)