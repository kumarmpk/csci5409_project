import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./Home";

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="centerContent">
          <Switch>
            <Route exact path="/" component={Home} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
