import React from 'react';
import { fromEvent } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import Interpreter from './components/Interpreter.'
import Visitor from './components/Visitor';
import '../src/style.css';
const acorn = require('acorn');

class App extends React.Component {
    constructor(props) {
        super(props);

        this.consoleInput = React.createRef(this);
        this.state = {
            pos: 0,
            inputValue : '',
            history: [],
            recentValues: [],
            inputValuesHistory: []
        };
        this.keyDowns = fromEvent(document, 'keydown');
        this.keyUps = fromEvent(document, 'keyup');
    }

    onFormSubmit = (event) => {
        event.preventDefault();
    }

    setInputValue = (val) => {
        this.setState({ inputValue: val})
    }

    parseInput = () => {
        const value = this.state.inputValue;
        let outputValue = '';
        if (value) {
            if (!/(var|let|const)/.test(value)) {
                outputValue = `print(${value})`
            }
            const body = acorn.parse((outputValue || value), {ecmaVersion: 2020}).body;
            const jsInterpreter = new Interpreter(new Visitor());
            jsInterpreter.interpret(body);
            const calcResult = jsInterpreter.getValue();
            const result = calcResult ? ( '<.  ' + calcResult): value;
            if (calcResult) {
                this.setState({ history : [...this.state.history, value, result]});
            } else {
                this.setState({ history : [...this.state.history, result]});
            }
            this.setState({ inputValuesHistory : [...this.state.inputValuesHistory, value]});
            this.setState({ recentValues : [...this.state.inputValuesHistory, value] });
            this.setState({ pos: this.state.recentValues.length });
            this.setInputValue("");
        }
    }

    createKeyUpShiftEnter = fromEvent(document, "keyup").pipe(
        filter((e) => e.keyCode === 13 && !e.shiftKey)
      );


    createKeyUpWithCustomKey = (htmlTag, KEYBOARD_KEY) =>
      fromEvent(htmlTag, "keyup").pipe(filter((e) => 
       e.key === KEYBOARD_KEY));

    handleKeyPress = (e) => {
        console.log(this.keyPresses);
        if ( e.key === 'Enter' && e.target.value) {
            this.createKeyUpShiftEnter.subscribe((e) => {
                this.parseInput();
              })
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            let arrowDown = this.createKeyUpWithCustomKey(this.consoleInput, "ArrowDown");
            let arrowUp = this.createKeyUpWithCustomKey(this.consoleInput, "ArrowUp");

            arrowUp.pipe(
                take(1)
              ).subscribe(() => {
                debugger;
                if (this.state.recentValues.length > 0 && (this.state.pos >= 0)) {
                    this.setInputValue((this.state.recentValues[this.state.pos] ? 
                        this.state.recentValues[this.state.pos] : ""))
                    this.setState({ pos: this.state.pos - 1 });
                  }
            });

            arrowDown.pipe(
                take(1)
              ).subscribe(() => {
                if (this.state.recentValues.length > 0 && this.state.pos < this.state.recentValues.length) {
                    this.setInputValue((this.state.recentValues[this.state.pos] ? this.state.recentValues[this.state.pos] : ""))
                    this.setState({ pos: this.state.pos + 1 });
                  }
            }); 
        }
      }

    componentDidMount () {
        this.consoleInput.focus();
    }

    renderedData() {
        return this.state.history.map((val, index) => {
                return (
                    <div key={index} className="w-100 d-flex">
                        <span className="red">&#62;</span>
                        <input
                            type="text"
                            value={val}
                            readOnly={true}
                        />   
                    </div>
                );
        });
    }

    render () {
        return (
            <div className="container">
                {this.state.history && this.renderedData()}
                <div className="w-100">
                    <form className="d-flex" onSubmit={this.onFormSubmit}>
                            <span className="red">&#62;</span>
                            <input
                                type="text"
                                ref={(input) => { this.consoleInput = input; }}
                                value={this.state.inputValue}
                                onChange={e => this.setInputValue(e.target.value)}
                                onKeyPress={this.handleKeyPress}
                            />     
                    </form>
                </div>
            </div>
            );
    }
}

export default App;
