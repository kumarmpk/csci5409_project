import React, { Component } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import errMsg from "./errormessages";
import CONST from "./constants";

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobpart: [],
      search: "",
      tableFlag: false,
      errorMsg: "",
      loading: false,
    };
  }

  handleLoadingClose = (e) => {
    this.setState({ loading: false });
  };

  onChange = (e) => {
    this.setState({
      errorMsg: "",
      [e.target.name]: e.target.value,
      validationErrorFlag: false,
    });
  };

  async apiCall(searchText) {
    this.setState({
      loading: true,
    });

    let url = CONST.COMP_X_URL + `jobList?jobName=${searchText}`;

    await axios
      .get(url)
      .then((res) => {
        let resList = {};
        if (res.data.result) {
          resList = res.data.result;

          if (resList && resList.length) {
            this.setState({
              jobpart: resList[0],
              tableFlag: true,
              errorMsg: "",
              loading: false,
            });
          } else {
            this.setState({
              errorMsg: errMsg["10"],
              loading: false,
              jobpart: [],
            });
          }
        } else if (res.data.statusCode === 204) {
          this.setState({
            errorMsg: res.data.message,
            loading: false,
          });
        } else {
          this.setState({
            errorMsg: errMsg["4"],
            loading: false,
          });
        }
      })
      .catch((err) => {
        if (err.response) {
          this.setState({
            tableFlag: false,
            errorMsg: err.response.data.error,
            loading: false,
          });
        } else {
          this.setState({
            tableFlag: false,
            errorMsg: errMsg["4"],
            loading: false,
          });
        }
      });

    let url2 = CONST.COMP_Z_URL + `jobs/${this.state.search}`;

    await axios
      .post(url2)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }

  onSearch = (e) => {
    e.preventDefault();
    let searchText = this.state.search;
    searchText = searchText.trim();

    if (searchText) {
      this.apiCall(searchText);
    } else {
      this.setState({
        errorMsg: errMsg["7"],
        tableFlag: false,
        loading: false,
      });
    }
  };

  searchResults() {
    const jobpart = this.state.jobpart;

    return (
      <div>
        {this.state.tableFlag ? (
          <div>
            <div className="col-12 col-sm-12 pt-4">
              <table className="table table-hover">
                <thead className="thead">
                  <tr>
                    <th>JobName</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.jobpart ? (
                    <tr key={Math.random()}>
                      <th>
                        <a href={`/login/${jobpart.jobName}`}>
                          {jobpart.jobName}
                        </a>
                      </th>
                    </tr>
                  ) : (
                    <tr key={Math.random()}>
                      <th>No Job matches the search.</th>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div></div>
        )}
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
