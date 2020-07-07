import React, { Component } from "react";
import jobparts from "./dummydata";

class OrderPage extends Component {
  constructor(props) {
    super(props);
    let { jobname } = this.props.match.params;

    let obj = {};
    obj = jobparts.filter((c) => c.jobname === jobname);
    this.state = {
      jobpart: obj,
      jobName: jobname,
      selected: {},
    };
  }

  handleCheckbox(partid) {
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[partid] = !this.state.selected[partid];
    this.setState({
      selected: newSelected,
    });
  }

  onOrder = (e) => {
    e.preventDefault();
    console.log(this.state);
  };

  render() {
    return (
      <div>
        <div>
          <div className="col-12 col-sm-12 pt-4">
            <form>
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
                            onChange={() => this.handleCheckbox(data.partid)}
                            checked={this.state.selected[data.partid] === true}
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
