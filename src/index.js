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
        const recoveries = this.states[this.current].recoveries;
        if (recoveries.length === 0) return -1;
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
            new State( 0,     null,         [  1,  2,  3,  4,  5],            [   ]),
            new State( 1,    /[(]/,         [  1,  2,  3,  4,  5],            [   ]),
            new State( 2,    /[-]/,                 [  3,  4,  5],            [   ]),
            new State( 3,    /[0]/,                 [  4,  8, 10],     [ 0,  8,  9]),
            new State( 4,    /[.]/,                         [  6],     [ 3,  6,  7]),
            new State( 5,  /[1-9]/,     [  1,  4,  7,  8,  9, 10],            [   ]),
            new State( 6,  /[0-9]/,         [  1,  6,  8,  9, 10],            [   ]),
            new State( 7,  /[0-9]/,     [  1,  4,  7,  8,  9, 10],            [   ]),
            new State( 8, /[%/x+]/,             [  1,  3,  4,  5],            [   ]),
            new State( 9,    /[-]/,             [  1,  3,  4,  5],            [   ]),
            new State(10,    /[)]/, [  1,  3,  4,  5,  8,  9, 10],            [   ])
        ];
        let start = 0;
        let accept = [ 3,  5,  6,  7, 10]
        this.machine = new StateMachine(states, start, accept);
        this.brackets = 0;
        this.input = "";
    }

    reset() {
        this.machine.reset();
        this.brackets = 0;
        this.input = "";
    }

    process(input) {
        this.reset();
        const array = [];
        for (let i = 0; i < input.length; i++) {
            let counter = 0;
            if (this.machine.forwardTransition(input[i]) === -1) {
                counter = this.machine.recover(input[i]);
                if (counter === -1) break;
            }
            for (let j = 0; j < counter; j++) {
                const character = array.pop();
                if (character === '(') this.brackets--;
                if (character === ')') this.brackets++;
            }
            if (input[i] === '(') this.brackets++;
            if (input[i] === ')') this.brackets--;
            if (this.brackets < 0) break;
            array.push(input[i]);
        }
        this.input = array.join('');
        return this.input;
    }

    isComplete() {
        return (this.machine.isAccepting() && this.brackets === 0);
    }

    generateArithmeticTree() {
        if (!this.isComplete()) return null;
        const characters = this.input;
        const a = this.machine.history.slice(1);
        const b = [this.machine.current];
        const states = a.concat(b);
        const operatorStates = [8, 9];
        const numberStates = [2, 3, 4, 5, 6, 7];
        const stack = [{
            root: null,
            operators: [],
            numbers: []
        }];
        let i = 0;
        while (i <= characters.length && i <= states.length) {
            // state is part of number
            if (numberStates.includes(states[i])) {
                // create number from states and characters
                const array = [];
                do {
                    array.push(characters[i]);
                    i++;
                } while (i <= characters.length && i <= states.length && numberStates.includes(states[i]));
                const number = array.join('');
                const top = stack[stack.length - 1];
                top.numbers.push(new ArithmeticNode("number", number));
                // avoid additional i++
                continue;
            // state is open bracket
            } else if (states[i] === 1) {
                // check for implicit multiplication (either previous was a number or closed bracket)
                if (i - 1 >= 0 && (numberStates.includes(states[i - 1]) || states[i - 1] === 10)) {
                    const top = stack[stack.length - 1];
                    top.operators.push(new ArithmeticNode("operator", "x"));
                    this.attachToTree(top);
                }
                stack.push({
                    root: null,
                    operators: [],
                    numbers: []
                });
            // state is operator
            } else if (operatorStates.includes(states[i])) {
                const operator = characters[i];
                const top = stack[stack.length - 1];
                top.operators.push(new ArithmeticNode("operator", operator));
                this.attachToTree(top);
            // state is closed bracket
            } else if (states[i] === 10) {
                const popped = stack.pop();
                const top = stack[stack.length - 1];
                // connect last number to operator if there is one
                if (popped.operators.length > 0) {
                    const current = popped.operators[popped.operators.length - 1];
                    current.right = popped.numbers[popped.numbers.length - 1];
                }
                // handle useless stack (useless brackets), which only hold a number
                if (popped.root === null && popped.numbers.length === 1) {
                    const number = popped.numbers[popped.numbers.length - 1];
                    top.numbers.push(number);
                // handle stack
                } else {
                    // not a number, but it does resolve to a number
                    const number = popped.root;
                    top.numbers.push(number);
                }
                // check for implicit multiplication (previous was closed bracket)
                if (i + 1 <= characters.length && i + 1 <= states.length && numberStates.includes(states[i + 1])) {
                    const top = stack[stack.length - 1];
                    top.operators.push(new ArithmeticNode("operator", "x"));
                    this.attachToTree(top);
                }
            }
            i++;
        }
        const top = stack[stack.length - 1];
        // connect last number to operator if there is one
        if (top.operators.length > 0) {
            const current = top.operators[top.operators.length - 1];
            current.right = top.numbers[top.numbers.length - 1];
        }
        // handle useless stack (useless brackets), which only hold a number
        // needs to be done for expressions with exterior/useless brackets
        if (top.root === null && top.numbers.length === 1) {
            const number = top.numbers.pop();
            top.root = number;
        }
        console.log(top);
        return top.root;
    }

    attachToTree(tree) {
        // check if there are two operators or more for precedence comparison
        if (tree.operators.length >= 2) {
            const current = tree.operators[tree.operators.length - 1];
            const previous = tree.operators[tree.operators.length - 2];
            const currentPrecedence = ArithmeticNode.calculatePrecedence(current.value);
            const previousPrecedence = ArithmeticNode.calculatePrecedence(previous.value);
            // extend tree downward (current has more precedence than previous)
            if (currentPrecedence > previousPrecedence) {
                current.left = tree.numbers[tree.numbers.length - 1];
                previous.right = current;
            // extend tree upward (current has less precedence than previous)
            } else {
                current.left = tree.root;
                previous.right = tree.numbers[tree.numbers.length - 1];
                tree.root = current;
            }
        } else {
            const current = tree.operators[tree.operators.length - 1];
            current.left = tree.numbers[tree.numbers.length - 1];
            tree.root = current;
        }
    }
}


class Calculator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [],
            input: "",
            placeholder: "0"
        }
    }

    clear() {
        this.setState({input: "", placeholder: "0"});
    }

    add(value) {
        const {input} = this.state;
        const updated = input.concat(value);
        this.handleInput(updated);
    }

    remove() {
        const {input} = this.state;
        let updated = input.slice(0, -1);
        this.handleInput(updated);
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
        const updated = inputHandler.process(value);
        this.setState({input: updated});
    }

    render() {
        const {history, input, placeholder} = this.state;
        let recentInput = " ";
        let recentAnswer = " ";
        let historyButton = (<></>);
        if (history.length > 0) {
            recentInput = history[history.length - 1].input;
            recentAnswer = "ANS=" + history[history.length - 1].answer;
        }
        if (history.length > 1 || true) {
            historyButton = (
                <span className="uk-link" onClick={() => {console.log("hi")}}>
                    <span uk-icon="icon: history"></span>
                </span>
            )
        }
        const recent = (
            <div className="recent uk-width-1-1 uk-margin-remove uk-text-right">
                <div>
                    {historyButton}
                    <span className="uk-width-1-1 uk-text-large uk-margin-remove preserve-characters">{recentInput}</span>
                </div>
                <div>
                    <span className="uk-text-small uk-margin-remove preserve-characters">{recentAnswer}</span>
                </div>
            </div>
        )
        return (
            <div className="uk-container uk-padding-large">
                <div className="calculator uk-card uk-card-default uk-card-body uk-align-center uk-width-1-3 uk-border-rounded">
                    <div className="display uk-width-1-1 uk-margin-bottom">
                        <div className="uk-width-1-1">
                            {recent}
                            {/* <History history={history} onClick={(index) => {
                                if (history[index] != null) {
                                    const character = input[input.length - 1];
                                    const operators = new RegExp(/[%/x+-]/);
                                    if (!operators.test(character)) {
                                        this.clear();
                                    }
                                    this.add(history[index].answer);
                                }
                            }}/> */}
                        </div>
                        <div className="uk-width-1-1">
                            <Input value={input} placeholder={placeholder} onChange={(event) => {this.handleInput(event.target.value);}}/>
                        </div>
                    </div>
                    <div className="numbers uk-width-1-1">
                        <div className="uk-grid uk-grid-small uk-child-width-1-4">
                            <Button value="(" onClick={() => {this.add("(");}}/>
                            <Button value=")" onClick={() => {this.add(")");}}/>
                            <Button value="+" onClick={() => {this.add("+");}}/>
                            <Button value="-" onClick={() => {this.add("-");}}/>
                        </div>
                        <div className="uk-grid uk-grid-small uk-child-width-1-4">
                            <Button value="7" onClick={() => {this.add("7");}}/>
                            <Button value="8" onClick={() => {this.add("8");}}/>
                            <Button value="9" onClick={() => {this.add("9");}}/>
                            <Button value="x" onClick={() => {this.add("x");}}/>
                        </div>
                        <div className="uk-grid uk-grid-small uk-child-width-1-4">
                            <Button value="4" onClick={() => {this.add("4");}}/>
                            <Button value="5" onClick={() => {this.add("5");}}/>
                            <Button value="6" onClick={() => {this.add("6");}}/>
                            <Button value="/" onClick={() => {this.add("/");}}/>
                        </div>
                        <div className="uk-grid uk-grid-small uk-child-width-1-4">
                            <Button value="1" onClick={() => {this.add("1");}}/>
                            <Button value="2" onClick={() => {this.add("2");}}/>
                            <Button value="3" onClick={() => {this.add("3");}}/>
                            <Button value="%" onClick={() => {this.add("%");}}/>
                        </div>
                        <div className="uk-grid uk-grid-small uk-child-width-1-4">
                            <Button value="0" onClick={() => {this.add("0");}}/>
                            <Button value="." onClick={() => {this.add(".");}}/>
                            <Button value="=" onClick={() => {
                                const {inputHandler} = this.props;
                                const tree = inputHandler.generateArithmeticTree();
                                if (tree === null) return;
                                const answer = this.calculate(tree).toString();
                                const recent = history.concat({input: input, answer: answer})
                                this.setState({history: recent, input: "", placeholder: answer});
                            }}/>
                            <Button value="DEL" onClick={() => {
                                this.remove();
                            }}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


function History(props) {
    const {history, onClick} = props;
    const list = history.map((element, index) => {
        const {input, answer} = element;
        return (
            <li key={index} className="history-item uk-text-right">
                <div onClick={() => {onClick(index);}}>
                    <p className="uk-text-large uk-margin-remove">{input}</p>
                    <p className="uk-text-small uk-margin-remove">ANS={answer}</p>
                </div>
            </li>
        )
    });
    return (
        <div className="uk-width-1-1">
            <ul className="history uk-list uk-width-1-1 uk-margin-remove">{list}</ul>
        </div>
    );
}


function Input(props) {
    const {value, placeholder, onChange, disabled} = props;
    return (
        <div className="uk-flex uk-flex-middle uk-width-1-1">
            <span className="uk-link" onClick={() => {console.log("hi")}}>AC</span>
            <input className="uk-width-1-1 uk-padding-remove uk-margin-remove uk-text-right uk-text-large" type="text" value={value} placeholder={placeholder} onChange={onChange} disabled={disabled}/>
        </div>
    )
}


function Button(props) {
    const {value, onClick} = props;
    return (
        <div>
            <input className="uk-button uk-button-default uk-text-center uk-text-large uk-padding-remove uk-width-1-1" type="button" value={value} onClick={onClick}/>
        </div>
    )
}


ReactDom.render(
    <Calculator inputHandler={new InputHandler()}/>,
    document.getElementById('root')
)