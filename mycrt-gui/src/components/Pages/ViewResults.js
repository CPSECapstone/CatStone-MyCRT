import React, { Component } from 'react';

import './ViewResults.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';
import Button from './Button.js';
import $ from 'jquery';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SERVER_PATH = "http://localhost:5000";
var NOT_STARTED = 0;
var IN_PROGRESS = 1;
var COMPLETED = 2;
var ERROR = 3;

const styles = {
  propContainer: {
    width: 200,
    overflow: 'hidden',
    margin: '20px auto 0',
  },
  propToggleHeader: {
    margin: '20px auto 10px',
  },
};

class ViewResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      isLogOpen: false,
      rowNumberSelected: undefined,
      isOpenDetailsClicked: false,
      captureDetails: undefined,
      isChartLoaded: false,
      captures: [],
      freeableMemory: [],
      cpuUtilization: [],
      readIOPS:[],
      writeIOPS: []
    };

    // This binding is necessary to make `this` work in the callback
    this.getMetricData = this.getMetricData.bind(this);
    this.getCaptureData = this.getCaptureData.bind(this);
    this.sendData = this.sendData.bind(this);
    this.onLogClose = this.onLogClose.bind(this);

    this.renderCaptureTable = this.renderCaptureTable.bind(this);
    this.renderReplayTable = this.renderReplayTable.bind(this);
  }

  componentDidMount() {
    var intervalGetAllCaptures = setInterval(this.getCaptureData, 1500);

    this.setState({intervalGetAllCaptures: intervalGetAllCaptures});
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalGetAllCaptures);
  }

  getCaptureData() {
    var parentContextState = this.props.parentContext.state;
    var component = this;

    $.ajax({
      url: SERVER_PATH + "/users/captures",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'GET',
      success: function(json) {
        component.setState(prevState => ({captures: json["userCaptures"]}));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  getMetricData(captureId) {
    var parentContextState = this.props.parentContext.state;
    var component = this;

    $.ajax({
      url: SERVER_PATH + "/users/" + captureId + "/metrics",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'GET',
      success: function(json) {
        component.setState(prevState => ({
          freeableMemory: json["FreeableMemory"],
          cpuUtilization: json["CPUUtilization"],
          readIOPS: json["ReadIOPS"],
          writeIOPS: json["WriteIOPS"]
        }));
        console.log(this.state.freeableMemory);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  onLogClose() {
    this.setState(prevState => ({
      isLogOpen: false
    }));
  }

  onOpenDetailsClick(rowIndex, e) {
    this.setState(prevState => ({
      isLogOpen: true,
      captureDetails: this.state.captures[rowIndex]
    }));

    this.getMetricData(this.state.captures[rowIndex].captureId);
  }

  sendData(formDataValues) {
    console.log(formDataValues);
    $.ajax({
      url: 'http://localhost:5000/metrics',
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        this.setState({formData: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  renderCaptureTable() {
    return (
      <div>
      <h3>Capture Results</h3>
        <Table
          height={'100%'}
          fixedHeader={true}
          selectable={true}
          multiSelectable={true}
        >
          <TableHeader
            displaySelectAll={true}
            adjustForCheckbox={true}
            enableSelectAll={true}
          >
            <TableRow>
              <TableHeaderColumn tooltip="The Alias">Alias</TableHeaderColumn>
              <TableHeaderColumn tooltip="The Status">Status</TableHeaderColumn>
              <TableHeaderColumn tooltip="The RDS Instance Name">RDS Instance</TableHeaderColumn>
              <TableHeaderColumn tooltip="The Start Time">Start Time</TableHeaderColumn>
              <TableHeaderColumn tooltip="The End Time">End Time</TableHeaderColumn>
              <TableHeaderColumn tooltip="View Details">View Details</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={true}
            deselectOnClickaway={false}
            showRowHover={true}
            stripedRows={false}
          >
            {this.state.captures.map( (row, index) => {
              let boundItemClick = this.onOpenDetailsClick.bind(this, index);
              if (row.captureStatus === COMPLETED || row.captureStatus === ERROR) {
                return(
                <TableRow key={index} >
                  <TableRowColumn>{row.captureAlias}</TableRowColumn>
                  <TableRowColumn>
                    {(row.captureStatus === COMPLETED) ? <div class="result-complete glyphiconstyle glyphicon glyphicon-ok" /> : <div class="result-fail glyphiconstyle glyphicon glyphicon-remove" />}
                  </TableRowColumn>
                  <TableRowColumn>{row.rdsInstance}</TableRowColumn>
                  <TableRowColumn>{row.startTime}</TableRowColumn>
                  <TableRowColumn>{row.endTime}</TableRowColumn>
                  <TableRowColumn><a onClick={boundItemClick} class="open-log-link">Open Details</a></TableRowColumn>
                </TableRow>
                );
              }
              })}
          </TableBody>
        </Table>
        </div>
      );
  }

  renderReplayTable() {
    //TODO: add Replay table
    return (
      <div>
      <h3>Replay Results</h3>
        </div>
      );
  }  

  render() {
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.onLogClose}
      />,
      <FlatButton
        label="Download Log"
        primary={true}
        onClick={this.onLogClose}
      />,
    ];

    return(
    <div class="ViewResults">
      <h2>View Results</h2>
      <h5 class="results-help-text">All (completed or failed) captures and replays are stored here.</h5>
         <div class="refresh-result-button">
            <Button 
              onClick={this.getCaptureData}
              content="Refresh Results"
              isSubmit={false}
            />
          </div>
        {this.renderCaptureTable()}
        {this.renderReplayTable()}
        {this.state.captureDetails &&
          <Dialog
            title={"Capture: " + this.state.captureDetails.captureAlias}
            actions={actions}
            modal={true}
            autoScrollBodyContent={true}
            contentStyle={{
              width: '100%',
              maxWidth: 'none',
            }}
            open={this.state.isLogOpen}
          >
            <div>
              <h5>Status: 
                <div class= {this.state.captureDetails.captureStatus === COMPLETED ? "result-complete" : "result-fail"}>
                {this.state.captureDetails.captureStatus === COMPLETED ? "Completed Successfully" : "Terminated With Errors"}
                </div>
              </h5>
              <h3>Freeable Memory</h3>
              <LineChart width={900} height={300} data={this.state.freeableMemory} margin={{top: 5, right: 60, left: 80, bottom: 5}}>
                 <XAxis dataKey="Timestamp"/>
                 <YAxis label={{ value: "Bytes", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
                 <CartesianGrid strokeDasharray="3 3"/>
                 <Tooltip/>
                 <Legend />
                 <Line type="monotone" dataKey="FreeableMemory" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
              </LineChart>
              <h3>CPU Utilization</h3>
              <LineChart width={900} height={300} data={this.state.cpuUtilization} margin={{top: 5, right: 60, left: 80, bottom: 5}}>
                 <XAxis dataKey="Timestamp"/>
                 <YAxis label={{ value: "Percentage", angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
                 <CartesianGrid strokeDasharray="3 3"/>
                 <Tooltip/>
                 <Legend />
                 <Line type="monotone" dataKey="CPUUtilization" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
              </LineChart>
              <h3>Read IOPS</h3>
              <LineChart width={900} height={300} data={this.state.readIOPS} margin={{top: 5, right: 60, left: 80, bottom: 5}}>
                 <XAxis dataKey="Timestamp"/>
                 <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
                 <CartesianGrid strokeDasharray="3 3"/>
                 <Tooltip/>
                 <Legend />
                 <Line type="monotone" dataKey="ReadIOPS" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
              </LineChart>
              <h3>Write IOPS</h3>
              <LineChart width={900} height={300} data={this.state.writeIOPS} margin={{top: 5, right: 60, left: 80, bottom: 5}}>
                 <XAxis dataKey="Timestamp"/>
                 <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
                 <CartesianGrid strokeDasharray="3 3"/>
                 <Tooltip/>
                 <Legend />
                 <Line type="monotone" dataKey="WriteIOPS" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
              </LineChart>
            </div>
          </Dialog>
        }
      </div>
      );
  }
//TODO: remove
/*
  render() {
    return (
      <div className="ViewResults">
         <h2>View Results</h2>
         <div class="buttons">
            <Button 
              onClick={this.sendData}
              content="Refresh"
              isSubmit={false}
            />
          </div>
         <table class="table table-hover">
          <thead>
            <tr>
              <th>Alias</th>
              <th>Database IP</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ly's Database</td>
              <td>10.15.10.123</td>
              <td>10:00:00 AM Jan 1, 2017</td>
              <td>12:00:00 PM Jan 2, 2017</td>
              <td>
                <a href="https://www.google.com" target="_blank">Open Logs</a>
              </td>
            </tr>
            <tr>
              <td> {JSON.stringify(this.state.formData)} </td>
              <td> </td>
              <td> </td>
              <td> </td>
              <td> </td>
            </tr>
            <tr>
              <td> </td>
              <td> </td>
              <td> </td>
              <td> </td>
              <td> </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }*/
}

export default ViewResults;