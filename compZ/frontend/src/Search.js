import React, { Component } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobpart: [],
      search: "",
      tableFlag: false,
      errorMsg: "",
    };
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      validationErrorFlag: false,
    });
  };

  async apiCall() {
    var config = {
      headers: { "Content-Type": "application/json" },
    };
    const url = `http://localhost:4000/api/jobs/${this.state.search}`;
    console.log(url);
    await axios
      .get(`http://localhost:4000/api/jobs/${this.state.search}`)
      .then((res) => {
        let obj = {};
        obj = res.data;
        this.setState({
          jobpart: obj,
          tableFlag: true,
          errorMsg: "",
        });
      })
      .catch((err) => {
        this.setState({
          tableFlag: false,
          errorMsg: err.response.data,
        });
      });
  }

  onSearch = (e) => {
    e.preventDefault();
    if (this.state.search) {
      this.apiCall();
    }
  };

  placeOrder(data) {
    console.log("data", data);
  }

  searchResults() {
    return (
      <div>
        {this.state.tableFlag ? (
          <div>
            <div className="col-12 col-sm-12 pt-4">
              <table className="table table-hover">
                <thead className="thead">
                  <tr>
                    <th>Jobname</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.jobpart.map((data) => {
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
        ) : (
          <div></div>
        )}
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="search pt-3 ml-3">
          <p className="error-msg" style={{ color: "red" }}>
            {this.state.errorMsg ? this.state.errorMsg : null}
          </p>
          <h4
            className="search pt-3 ml-3 text-dark font-weight-bold"
            style={{ fontFamily: "Sans" }}
          >
            Search page
          </h4>
          <div className="border rounded pt-1 ml-3" style={{ width: "20%" }}>
            <form>
              <input
                type="text"
                placeholder="Search"
                className="mr-sm-2"
                name="search"
                value={this.state.search}
                onChange={this.onChange}
                style={{
                  border: "2px solid red",
                  borderRadius: "4px",
                }}
              />
              <Button
                type="submit"
                variant="outline-success"
                onClick={this.onSearch}
              >
                Search
              </Button>
            </form>
          </div>
          {this.searchResults()}
        </div>
      </div>
    );
  }
}

export default Search;
