import React, { Component } from "react";
import axios from "axios";
import errMsg from "./errormessages";
import { Modal, Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";

class OrderPage extends Component {
  constructor(props) {
    super(props);

    let jobName = this.props.orderObj.jobName;
    let userId = this.props.orderObj.userId;

    this.state = {
      jobpart: [],
      jobName: jobName,
      selected: {},
      errorMsg: "",
      userId: userId,
      loading: true,
      modalFlag: false,
      modalMsg: "",
      modalRoute: 0,
    };
  }

  async componentDidMount() {
    let jobName = this.state.jobName;

    await axios
      .get(
        `https://company-x-ms.azurewebsites.net/api/jobList?jobName=${jobName}`
      )
      .then((res) => {
        console.log("orderpage jobs res", res);
        /* this.setState({
          jobpart: res.data,
        }); */
      })
      .catch((err) => console.log("orderpage jobs err", err));
  }

  handleCheckbox(partId) {
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[partId] = !this.state.selected[partId];
    this.setState({
      selected: newSelected,
      errorMsg: "",
    });
  }

  async orderBackendCall() {
    this.setState({ loading: true });
    let selectedList = this.state.selected;
    let selectedPartIdList = [];
    Object.keys(selectedList).forEach((key) => {
      selectedPartIdList.push(key);
    });
    let obj = {
      partId: selectedPartIdList,
      jobName: this.state.jobName,
      userId: this.state.userId,
    };
    console.log(obj);
    await axios
      .post("http://localhost:4000/api/updateOrder")
      .then((res) => {
        console.log("orderpage updateorder res", res);
        if (res.status === 200) {
          this.setState({
            loading: false,
            modalFlag: true,
            modalMsg: "The order is successfully placed.",
            modalRoute: "1",
          });
        } else {
          this.setState({
            loading: false,
            modalFlag: true,
            modalMsg: "The system faced error while placing order." + res.data,
            modalRoute: "2",
          });
        }
      })
      .catch((err) => {
        console.log("orderpage updateorder err", err);
        this.setState({
          loading: false,
          errorMsg: err.data,
        });
      });
  }

  handleModalClose = (e) => {
    this.setState({
      modalFlag: false,
    });
    if (this.state.modalRoute === "1") {
      this.props.history.push("/search");
    } else if (this.state.modalRoute === "2") {
      this.setState({
        errorMsg: this.state.modalMsg,
        modalMsg: "",
        modalRoute: 0,
        modalFlag: false,
      });
    }
  };

  onOrder = (e) => {
    e.preventDefault();

    let checkboxSelected = Object.keys(this.state.selected).length;
    if (checkboxSelected) {
      this.orderBackendCall();
    } else {
      this.setState({
        errorMsg: errMsg["3"],
      });
    }
  };

  handleLoadingClose = (e) => {
    this.setState({ loading: false });
  };

  render() {
    return (
      <div>
        <div>
          <div className="col-12 col-sm-12 pt-4">
            <form>
              <p className="error-msg" style={{ color: "red" }}>
                {this.state.errorMsg ? this.state.errorMsg : null}
              </p>
              <table className="table table-hover">
                <thead className="thead">
                  <tr>
                    <th></th>
                    <th>JobName</th>
                    <th>PartId</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.jobpart.map((data) => {
                    return (
                      <tr key={Math.random()}>
                        <td>
                          <input
                            name="checkbox"
                            type="checkbox"
                            onChange={() => this.handleCheckbox(data.partId)}
                            checked={this.state.selected[data.partId] === true}
                          />
                        </td>
                        <td>{data.jobName}</td>
                        <td>{data.partId}</td>
                        <td>{data.qty}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="form-group text-center">
                <button
                  onClick={this.onOrder}
                  type="submit"
                  className="btn btn-info btn-centre"
                >
                  Order
                </button>
              </div>
            </form>
          </div>
        </div>
        <Modal
          show={this.state.loading}
          onHide={this.handleLoadingClose}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Loading</Modal.Title>
          </Modal.Header>
          <Modal.Body>The details are loading please wait....</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleLoadingClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={this.state.modalFlag}
          onHide={this.handleModalClose}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Order Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>The order is placed successfully.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleModalClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default withRouter(OrderPage);
