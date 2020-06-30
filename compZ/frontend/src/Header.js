import React, { Component } from "react";
import { Navbar, Nav } from "react-bootstrap";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <div className="header">
          <Navbar className="navHeader bg-primary mt-3" expand="lg">
            <Navbar.Brand className="text-light font-weight-bold" href="/">
              Home
            </Navbar.Brand>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              className="text-light font-weight-bold"
            >
              Menu
            </Navbar.Toggle>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav>
                <Nav.Link
                  className="text-light font-weight-bold"
                  href="/search"
                >
                  Search
                </Nav.Link>
                <Nav.Link
                  className="text-light font-weight-bold"
                  href="/getAll"
                >
                  Get All Jobs
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>
    );
  }
}

export default Header;
