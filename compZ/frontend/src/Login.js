import React, { Component } from "react";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    const { id } = this.props.match.params;
    console.log("id", id);
  }

  render() {
    return (
      <div>
        <div className="login">Login page</div>
      </div>
    );
  }
}

export default Login;
