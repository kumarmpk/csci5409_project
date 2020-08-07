import React, { Component } from "react";
import TableItem from "./components/TableItem";
import Form from "./components/Form";
import axios from "axios";
import "./App.css";
import OrderDetail from "./components/OrderDetail";

class App extends Component {
  state = {
    parts: [],
    orders: [],
    search: "",
    partsTab: true,
    ordersTab: false,
  };

  componentDidMount() {
    this.getAllParts();
    this.getOrderDetail();
  }

  handleSearch = (e) => {
    e.preventDefault();
    if (this.state.search === "") {
      return this.getOrderDetail();
    }
    this.setState({
      orders: this.state.orders.filter(
        (order) => order.jobName === this.state.search
      ),
    });
  };

  handleChange = (e) => {
    this.setState({ search: e.target.value });
  };

  getAllParts = async () => {
    await axios
      .get(
        "https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/parts"
      )
      .then((res) => {
        this.setState({
          parts: res.data,
        });
      });
  };

  getOrderDetail = async () => {
    await axios
      .get(
        "https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/order"
      )
      .then((res) => {
        this.setState({
          orders: res.data,
        });
      });
  };

  renderList = () => {
    return this.state.parts.map((item) => (
      <TableItem key={item.partId} item={item} />
    ));
  };

  orderDetail = () => {
    return this.state.orders.map((item, index) => (
      <OrderDetail key={index} item={item} />
    ));
  };

  changePartsTab = () => {
    this.setState({
      partsTab: true,
      ordersTab: false,
    });
    this.getAllParts();
  };

  changeOrdersTab = () => {
    this.setState({
      partsTab: false,
      ordersTab: true,
    });
    this.getOrderDetail();
  };

  render() {
    const { partsTab, ordersTab } = this.state;
    return (
      <div className="ui container">
        <h1 className="ui header">Company Y</h1>
        <div className="ui section divider"></div>
        <div className="ui grid">
          <div className="row">
            <div className="twelve wide column">
              <div className="ui top attached tabular menu">
                <span
                  onClick={this.changePartsTab}
                  className={partsTab ? "item active" : "item"}
                  data-tab="first"
                >
                  Parts
                </span>
                <span
                  onClick={this.changeOrdersTab}
                  className={ordersTab ? "item active" : "item"}
                  data-tab="second"
                >
                  PartsOrders
                </span>
              </div>
              <div
                className={
                  partsTab
                    ? "ui bottom attached tab segment active"
                    : "ui bottom attached tab segment"
                }
                data-tab="first"
              >
                <table className="ui single line table">
                  <thead>
                    <tr>
                      <th>Part Id</th>
                      <th>Part Name</th>
                      <th>Quantity On Hand</th>
                    </tr>
                  </thead>
                  <tbody>{this.renderList()}</tbody>
                </table>
              </div>
              <div
                className={
                  ordersTab
                    ? "ui bottom attached tab segment active"
                    : "ui bottom attached tab segment"
                }
                data-tab="second"
              >
                <form onSubmit={(e) => this.handleSearch(e)}>
                  <div className="ui search">
                    <div className="ui icon input">
                      <input
                        className="prompt searchbar"
                        name="search"
                        type="text"
                        value={this.state.search}
                        onChange={(e) => this.handleChange(e)}
                        placeholder="Typing job name for searching order"
                      />
                      <input type="submit" value="Search" />
                      <i className="search icon"></i>
                    </div>
                    <input
                      className="ui button"
                      type="button"
                      value="All Order"
                      onClick={() => this.getOrderDetail()}
                    />
                  </div>
                </form>

                <table className="ui single line table">
                  <thead>
                    <tr>
                      <th>Part Id</th>
                      <th>Job Name</th>
                      <th>User Id</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>{this.orderDetail()}</tbody>
                </table>
              </div>
            </div>
            <div className="four wide column">
              <Form getAllParts={this.getAllParts} usage="create" />
              <div className="ui section divider"></div>
              <Form getAllParts={this.getAllParts} usage="update" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
