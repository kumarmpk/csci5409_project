import React, { Component } from "react";
import jobparts from "./dummydata";

class GetAll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobparts: jobparts,
    };
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
                  <th>Partid</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {this.state.jobparts.map((data) => {
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
      </div>
    );
  }
}

export default GetAll;
