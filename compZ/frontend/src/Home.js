import React, { Component } from "react";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <div className="homebox">
          <div className="home">
            <p>This is the homepage</p>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
