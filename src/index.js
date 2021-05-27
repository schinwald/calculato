import React from 'react';
import ReactDom from 'react-dom';
import './index.css';


class Calculator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            input: "",
            answer: ""
        }
    }

    clear() {
        this.setState({input: ""});
    }

    add(value) {
        this.setState({input: this.state.input.concat(value)})
    }

    remove() {
        this.setState({input: this.state.input.slice(0, -1)})
    }

    calculate() {
        /* TODO */
    }

    render() {
        return (
            <div>
                <div className="row">
                    <Input placeholder="0" value={this.state.input} onChange={(event) => this.setState({input: event.target.value})}/>
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
                    <Button label="=" onClick={() => this.calculate()}/>
                </div>
            </div>
        );
    }
}


class Input extends React.Component {
    render () {
        return (
            <input type="text" placeholder={this.props.placeholder} value={this.props.value} onChange={this.props.onChange}/>
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