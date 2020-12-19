import React, { Component } from "react";
import axios from "axios";
import errMsg from "./errormessages";
import CONST from "./constants";

class OrderedHistory extends Component {
  constructor(props) {
    super(props);

    let userId = localStorage.userId;

    if (!userId) {
      return this.props.history.push("/NotFound");
    }

    this.state = {
      orderedHistory: [],
      userId: userId,
    };
  }

  async componentDidMount() {
    let url = CONST.COMP_Z_URL + `getOrderedJobs?userId=${this.state.userId}`;

    await axios
      .get(url)
      .then((res) => {
        this.setState({
          orderedHistory: res.data,
        });
      })
      .catch((err) => {
        if (err && err.response && err.response.data) {
          this.setState({
            errorMsg: err.response.data,
          });
        } else {
          this.setState({
            errorMsg: errMsg["4"],
          });
        }
      });
  }

  render() {
    let list = this.state.orderedHistory;

    if (list && list.length) {
      let i;
      let len = list.length;
      for (i = 0; i < len; i++) {
        let obj = list[i];
        let dateStr = obj.date;
        let date = new Date(dateStr);
        date.setDate(date.getDate() + 1);
        let conv = date.toDateString();
        obj.date = conv;
      }
    }

    return (
      <div>
        <div>
          <p className="error-msg" style={{ color: "red" }}>
            {this.state.errorMsg ? this.state.errorMsg : null}
          </p>
          <div className="col-12 col-sm-12 pt-4">
            <table className="table table-hover">
              <thead className="thead">
                <tr>
                  <th>Job Name</th>
                  <th>Part Id</th>
                  <th>Quantity</th>
                  <th>Ordered Date</th>
                  <th>Ordered Time</th>
                </tr>
              </thead>
              <tbody>
                {list &&
                  list.map((data) => {
                    return (
                      <tr key={Math.random()}>
                        <th>{data.jobName}</th>
                        <td>{data.partId}</td>
                        <td>{data.qty}</td>
                        <td>{data.date}</td>
                        <td>{data.time}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderedHistory;
