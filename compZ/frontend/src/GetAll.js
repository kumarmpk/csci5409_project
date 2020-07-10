import React, { Component } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

class GetAll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobparts: [],
      loading: true,
      errorMsg: "",
    };
    console.log("get all const");
  }

  handleLoadingClose = (e) => {
    this.setState({ loading: false });
  };

  async componentDidMount() {
    console.log("get all componentDidMount");

    try {
      await axios
        .get(`http://localhost:5000/api/jobs`)
        .then((res) => {
          console.log("res", res);
          this.setState({
            loading: false,
            jobparts: res.data.result,
          });
        })
        .catch((err) => {
          console.log("err", err);
          this.setState({
            loading: false,
            errorMsg: err.data,
          });
        });
    } catch (err) {
      console.log("get all componentDidMount exception");
      this.setState({
        loading: false,
        errorMsg: err.data,
      });
    }
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
}

export default GetAll;
