import React from 'react';
import ReactDom from 'react-dom';
import './index.css';


class Calculator extends React.Component {
    render() {
        return (
            <div>
                <div className="row">
                    <Input placeholder="0"/>
                </div>
                <div className="row">
                    <Button label="C"/>
                    <Button label="Del"/>
                    <Button label="%"/>
                    <Button label="/"/>
                </div>
                <div className="row">
                    <Button label="7"/>
                    <Button label="8"/>
                    <Button label="9"/>
                    <Button label="x"/>
                </div>
                <div className="row">
                    <Button label="4"/>
                    <Button label="5"/>
                    <Button label="6"/>
                    <Button label="-"/>
                </div>
                <div className="row">
                    <Button label="1"/>
                    <Button label="2"/>
                    <Button label="3"/>
                    <Button label="+"/>
                </div>
                <div className="row">
                    <Button label="0"/>
                    <Button label="."/>
                    <Button label="ANS"/>
                    <Button label="="/>
                </div>
            </div>
        );
    }
}


class Input extends React.Component {
    render () {
        return (
            <input type="text" placeholder={this.props.placeholder}/>
        );
    }
}


class Button extends React.Component {
    render() {
        return (
            <input type="button" value={this.props.label}/>
        )
    }
}


ReactDom.render(
    <Calculator/>,
    document.getElementById('root')
)