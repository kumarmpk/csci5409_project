import React, { Component } from "react";
import { Tabs, Tab } from "react-bootstrap";
import OrderPage from "./OrderPage";
import SearchHistory from "./SearchHistory";

class HomePage extends Component {
  constructor(props) {
    super(props);
    let jobName = this.props.location.state.jobName;
    let userId = this.props.location.state.userId;

    this.state = {
      jobName: jobName,
      userId: userId,
    };
  }

  componentDidMount() {}

  render() {
    const orderObj = {
      jobName: this.state.jobName,
      userId: this.state.userId,
    };

    return (
      <div>
        <Tabs defaultActiveKey="orderPage" id="uncontrolled-tab-example">
          <Tab eventKey="orderPage" title="Order Page">
            <OrderPage orderObj={orderObj} />
          </Tab>
          <Tab eventKey="searchHistory" title="Search History">
            <SearchHistory userId={this.state.userId} />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default HomePage;
