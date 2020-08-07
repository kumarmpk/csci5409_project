import React, { Component } from "react";
import axios from "axios";
import errMsg from "./errormessages";
import CONST from "./constants";

class SearchHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchHistory: [],
    };
  }

  async componentDidMount() {
    let url = CONST.COMP_Z_URL + `searchhistory`;

    await axios
      .get(url)
      .then((res) => {
        this.setState({
          searchHistory: res.data,
        });
      })
      .catch((err) => {
        this.setState({
          errorMsg: errMsg["4"],
        });
      });
  }

  render() {
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
                  <th>Jobname</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {this.state.searchHistory.map((data) => {
                  return (
                    <tr key={Math.random()}>
                      <th>{data.jobName}</th>
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

export default SearchHistory;
