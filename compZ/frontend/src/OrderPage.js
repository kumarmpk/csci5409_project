import React, { Component } from "react";
import axios from "axios";
import errMsg from "./errormessages";
import { Modal, Button } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import CONST from "./constants";

class OrderPage extends Component {
  constructor(props) {
    super(props);

    let jobName = this.props.orderObj.jobName;
    let userId = this.props.orderObj.userId;

    this.state = {
      jobparts: [],
      jobName: jobName,
      selected: {},
      selectedList: [],
      errorMsg: "",
      userId: userId,
      loading: true,
      modalFlag: false,
      modalMsg: "",
      modalRoute: 0,
      partsFromX: [],
      requestDetails: [],
    };
  }

  async getJobDetails(jobRes) {
    let jobName = this.state.jobName;

    let compxURL = CONST.COMP_X_URL + `jobList?jobName=${jobName}`;

    await axios
      .get(compxURL)
      .then((res) => {
        let jobs = res.data.result;
        let obj = {};
        let partIdList = [];

        let jobparts = [];
        for (obj of jobs) {
          let jobpartObj = {};
          partIdList.push(obj.partId);
          jobpartObj.jobName = obj.jobName;
          jobpartObj.reqQty = obj.qty;
          jobpartObj.partId = obj.partId;
          jobparts.push(jobpartObj);
        }
        this.setState({
          partsFromX: partIdList,
          jobparts: jobparts,
        });
        return jobRes(1);
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response);

        this.setState({
          loading: false,
          errorMsg: errMsg["5"],
        });
      });
  }

  async getPartDetails() {
    let partIdList = this.state.partsFromX;
    let jobpartList = [];
    let jobparts = this.state.jobparts;

    if (partIdList && partIdList.length) {
      for (let partId of partIdList) {
        let compyURL = CONST.COMP_Y_URL + `parts/${partId}`;
        await axios
          .get(compyURL)
          .then((response) => {
            console.log("res y", response);

            let res = response.data;

            if (Object.keys(res[0]).length !== 0) {
              let jobpartObj = jobparts.find(
                (c) => c.partId === parseInt(partId)
              );
              let partObj = res[0];
              jobpartObj.partName = partObj.partName;
              jobpartObj.avlQty = partObj.qoh;
              jobpartList.push(jobpartObj);
            }
            this.setState({
              jobparts: jobpartList,
              loading: false,
            });
          })
          .catch((err) => {
            console.log(err);
            console.log(err.response);
            this.setState({
              errorMsg: errMsg["4"],
              loading: false,
              modalFlag: true,
              modalMsg: errMsg["4"],
            });
          });
      }
    }
  }

  async componentDidMount() {
    this.getJobDetails((jobRes) => {
      if (jobRes === 1) {
        this.getPartDetails();
      } else {
        this.errorRes("5");
      }
    });
  }

  handleCheckbox(partId) {
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[partId] = !this.state.selected[partId];
    this.setState({
      selected: newSelected,
      errorMsg: "",
    });
  }

  async prepareOrderDetails(ordRes) {
    let requestDetails = [];

    let requestObj = {};
    let jobList = this.state.jobparts;
    let selected = this.state.selected;

    for (requestObj of jobList) {
      if (selected[requestObj.partId]) {
        let obj = {
          jobName: requestObj.jobName,
          partId: requestObj.partId,
          qty: requestObj.reqQty,
          userId: this.state.userId,
          result: "Ordered",
        };

        requestDetails.push(obj);
      }
    }

    await this.setState({
      requestDetails: requestDetails,
    });

    ordRes(200);
  }

  async updateOrderDetailsinZ(requestDetails, resZ) {
    let compzURL = CONST.COMP_Z_URL + `updateOrderusing2pc`;

    await axios
      .post(compzURL, requestDetails)
      .then((res) => {
        if (res.status === 200) {
          return resZ(200);
        }
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          resZ(err.response.data);
        } else {
          resZ(5);
        }
      });
  }

  errorRes(input) {
    input = input && errMsg[input] ? errMsg[input] : input;
    this.setState({
      loading: false,
      modalFlag: true,
      modalMsg: "The system faced error while placing order. " + input,
      modalRoute: "2",
    });
  }

  async checkOrderUser(requestDetails, resCheck) {
    let compzURL = CONST.COMP_Z_URL + `getOrder`;

    await axios
      .post(compzURL, requestDetails)
      .then((res) => {
        console.log("res", res);
        if (res.data) {
          console.log("res data", res.data);
          resCheck(res.data.length === 0);
        } else {
          resCheck(false);
        }
      })
      .catch((err) => {
        resCheck(false);
      });
  }

  async orderBackendCall() {
    try {
      this.setState({ loading: true });

      this.prepareOrderDetails((ord) => {
        let requestDetails = this.state.requestDetails;
        if (ord === 200 && requestDetails && requestDetails.length) {
          this.checkOrderUser(requestDetails, (resCheck) => {
            if (resCheck) {
              this.updateOrderDetailsinZ(requestDetails, (resz) => {
                if (resz === 200) {
                  this.setState({
                    loading: false,
                    modalFlag: true,
                    modalMsg:
                      "The order has been successfully placed and updated in company X and Y",
                    modalRoute: "1",
                  });
                } else {
                  this.errorRes(resz);
                }
              });
            } else {
              this.errorRes("9");
            }
          });
        } else {
          this.errorRes("5");
        }
      });
    } catch (e) {
      this.errorRes("5");
    }
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

    this.setState({
      errorMsg: "",
      requestDetails: [],
      modalRoute: 0,
      modalFlag: false,
      modalMsg: "",
    });

    let selectedList = [];
    let stateList = this.state.selected;
    let stateListKeys = Object.keys(stateList);
    let key;
    for (key of stateListKeys) {
      if (stateList[key]) {
        selectedList.push(key);
      }
    }

    if (selectedList && selectedList.length) {
      this.setState({
        selectedList: selectedList,
      });
      for (let partId of selectedList) {
        let obj = this.state.jobparts.find(
          (c) => c.partId === parseInt(partId)
        );
        if (obj && Object.keys(obj).length !== 0)
          if (obj.avlQty < obj.reqQty) {
            this.setState({
              errorMsg: obj.partName + errMsg["6"],
            });
            return;
          }
      }

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
              {this.state.jobparts.length > 0 ? (
                <div>
                  <table className="table table-hover">
                    <thead className="thead">
                      <tr>
                        <th></th>
                        <th>Job Name</th>
                        <th>Part Id</th>
                        <th>Part Name</th>
                        <th>Required Quantity</th>
                        <th>Available Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.jobparts.map((data) => {
                        return (
                          <tr key={Math.random()}>
                            <td>
                              <input
                                name="checkbox"
                                type="checkbox"
                                onChange={() =>
                                  this.handleCheckbox(data.partId)
                                }
                                checked={
                                  this.state.selected[data.partId] === true
                                }
                              />
                            </td>
                            <td>{data.jobName}</td>
                            <td>{data.partId}</td>
                            <td>{data.partName}</td>
                            <td>{data.reqQty}</td>
                            <td>{data.avlQty}</td>
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
                </div>
              ) : (
                <p>
                  No parts for this job. Kindly contact company Y to add the
                  details.
                </p>
              )}
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
            <Modal.Title>Order Result</Modal.Title>
          </Modal.Header>
          <Modal.Body>{this.state.modalMsg}</Modal.Body>
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
