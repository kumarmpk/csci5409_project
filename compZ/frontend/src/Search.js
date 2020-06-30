import React, { Component } from "react";
import jobparts from "./dummydata";
import { Button } from "react-bootstrap";

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobparts: jobparts,
      jobpart: [],
      search: "",
      tableFlag: false,
    };
  }

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      validationErrorFlag: false,
    });
  };

  onSearch = (e) => {
    e.preventDefault();
    let obj = {};
    obj = jobparts.filter((c) =>
      c.jobname.toLowerCase().includes(this.state.search.toLowerCase())
    );
    this.setState({
      jobpart: obj,
      tableFlag: true,
    });
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
                    <th>Partid</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.jobpart.map((data) => {
                    return (
                      <tr key={Math.random()}>
                        <th>
                          <a href={`/login/${data.jobname}`}>{data.jobname}</a>
                        </th>
                        <td>{data.partid}</td>
                        <td>{data.quantity}</td>
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
