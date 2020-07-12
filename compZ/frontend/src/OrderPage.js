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

  async componentDidMount() {
    let jobName = this.state.jobName;

    await axios
      .get(
        `http://afternoon-taiga-86166.herokuapp.com/api/jobList?jobName=${jobName}`
      )
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
      })
      .catch((err) => {
        this.setState({
          loading: false,
          errorMsg: errMsg["5"],
        });
      });

    let partIdList = this.state.partsFromX;
    let jobparts = [];
    if (partIdList && partIdList.length) {
      let partId;
      for (partId of partIdList) {
        await axios
          .get(
            `http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/parts/${partId}`
          )
          .then((res) => {
            if (Object.keys(res).length !== 0) {
              let jobpartObj = this.state.jobparts.find(
                (c) => c.partId === partId
              );

              let partObj = res.data[0];

              jobpartObj.partName = partObj.partName;
              jobpartObj.avlQty = partObj.qoh;
              jobparts.push(jobpartObj);
            }
            this.setState({
              jobparts: jobparts,
              loading: false,
            });
          })
          .catch((err) => {
            this.setState({
              errorMsg: errMsg["4"],
              loading: false,
            });
          });
      }
    }
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
    let requestDetails = this.state.requestDetails;
    let selectedPartIdList = [];
    let requestObj = {};
    let jobList = this.state.jobparts;

    for (requestObj of jobList) {
      let obj = {
        jobName: requestObj.jobName,
        partId: requestObj.partId,
        qty: requestObj.reqQty,
        userId: this.state.userId,
        result: "Ordered",
      };
      requestDetails.push(obj);

      selectedPartIdList.push(requestObj.partId);
    }

    this.setState({
      requestDetails: requestDetails,
    });

    await axios
      .post("http://localhost:4000/api/updateOrder", requestDetails)
      .then((res) => {
        if (res.status === 200) {
          this.updateOrderDetailsinX((resx) => {
            if (resx === 1) {
              this.updateOrderDetailsinY((resy) => {
                console.log(resy);
                if (resy === 2) {
                  this.setState({
                    loading: false,
                    modalFlag: true,
                    modalMsg:
                      "The order has been successfully placed and updated in company X and Y",
                    modalRoute: "1",
                  });
                }
              });
            }
          });
        } else {
          this.setState({
            loading: false,
            modalFlag: true,
            modalMsg: "The system faced error while placing order. " + res.data,
            modalRoute: "2",
          });
        }
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 500) {
            this.setState({
              loading: false,
              modalFlag: true,
              modalMsg:
                "The system faced error while placing order." +
                err.response.data,
              modalRoute: "2",
            });
          }
        } else {
          this.setState({
            loading: false,
            errorMsg: err.data,
          });
        }
      });
  }

  async updateOrderDetailsinX(resx) {
    let requestDetails = this.state.requestDetails;
    let requestObj = {};
    for (requestObj of requestDetails) {
      await axios
        .post(
          "http://afternoon-taiga-86166.herokuapp.com/api/orders",
          //"http://localhost:5000/api/orders",
          requestObj
        )
        .then((res) => {
          if (res.status !== 200) {
            this.setState({
              errorMsg: errMsg["4"],
            });
            return;
          }
          resx(1);
        })
        .catch((err) => {
          if (err.response) {
            this.setState({
              errorMsg: err.response.data.error,
              loading: false,
            });
          }
        });
    }
  }

  async updateOrderDetailsinY(resy) {
    let requestDetails = this.state.requestDetails;
    let requestObj = {};
    for (requestObj of requestDetails) {
      await axios
        .post(
          "http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/order",
          requestObj
        )
        .then((res) => {
          if (res.status !== 200) {
            this.setState({
              errorMsg: errMsg["4"],
            });
            return;
          }
          resy(2);
        })
        .catch((err) => {
          console.log("err y");
        });
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
    let requestDetails = [];
    for (key of stateListKeys) {
      if (stateList[key]) {
        selectedList.push(key);
      }
    }

    if (selectedList && selectedList.length) {
      let partId;
      this.setState({
        selectedList: selectedList,
      });
      for (partId of selectedList) {
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
      //this.state.requestDetails = requestDetails;

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
