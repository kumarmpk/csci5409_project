import React, { Component } from "react";
import axios from "axios";

class SearchHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchHistory: [],
    };
  }

  async componentDidMount() {
    await axios
      .get(`http://localhost:4000/api/searchHistory`)
      .then((res) => {
        console.log(res);
        this.setState({
          searchHistory: res.data,
        });
      })
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <div>
        <div>
          <div className="col-12 col-sm-12 pt-4">
            <table className="table table-hover">
              <thead className="thead">
                <tr>
                  <th>Jobname</th>
                </tr>
              </thead>
              <tbody>
                {this.state.jobparts.map((data) => {
                  return (
                    <tr key={Math.random()}>
                      <th>
                        <a href={`/login/${data.jobName}`}>{data.jobName}</a>
                      </th>
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
