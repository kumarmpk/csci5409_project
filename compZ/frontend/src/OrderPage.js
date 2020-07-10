import React, { Component } from "react";
import axios from "axios";
import errMsg from "./errormessages";

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
    };
  }

  async componentDidMount() {
    let jobName = this.state.jobName;

    await axios
      .get(`http://localhost:4000/api/parts/${jobName}`)
      .then((res) => {
        this.setState({
          jobpart: res.data,
        });
      })
      .catch((err) => console.log(err));
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
    //await axios.post("http://localhost:4000/api/updateOrder").then();
  }

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
      </div>
    );
  }
}

export default OrderPage;
