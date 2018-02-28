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
      isCompareOpen: false,
      captureDetails: undefined,
      selectedCaptureRows: [],
      isComparisonChartLoaded: true,
      comparisonIndex: -1,
      captures: [],
      selectedCaptureIds: [],
      isCompareDisabled: true,
      compareFreeableMemory: [],
      compareCpuUtilization: [],
      compareReadIOPS:[],
      compareWriteIOPS: [],
      freeableMemory: [],
      cpuUtilization: [],
      readIOPS:[],
      writeIOPS: [],
      showCaptureResultsLoading: true
    };

    // This binding is necessary to make `this` work in the callback
    this.fillComparisonData = this.fillComparisonData.bind(this);
    this.getComparisonData = this.getComparisonData.bind(this);
    this.onCompareClick = this.onCompareClick.bind(this);
    this.onCompareClose = this.onCompareClose.bind(this);
    this.onCaptureRowSelection = this.onCaptureRowSelection.bind(this);

    this.getMetricData = this.getMetricData.bind(this);
    this.getCaptureData = this.getCaptureData.bind(this);
    this.sendData = this.sendData.bind(this);
    this.onLogClose = this.onLogClose.bind(this);

    this.renderCaptureTable = this.renderCaptureTable.bind(this);
    this.renderReplayTable = this.renderReplayTable.bind(this);
    this.renderCaptureDetails = this.renderCaptureDetails.bind(this);
    this.renderCompare = this.renderCompare.bind(this);
  }

  componentDidMount() {
    var intervalGetAllCaptures = setInterval(this.getCaptureData, 1500);

    this.setState({intervalGetAllCaptures: intervalGetAllCaptures});
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalGetAllCaptures);
  }

  fillComparisonData(metricName, metric, comparisonArray) {
    var captureIndex = this.state.comparisonIndex;

    var newComparisonArray = comparisonArray;
    if (captureIndex === 0) {
      console.log(metric.length);
      for (var j = 0; j < metric.length; j++) {
        newComparisonArray.push(
        {
          'Timestamp': metric[j]['Timestamp'],
          'Capture1': metric[j][metricName]
        });
      }
    } else {
      console.log(metric.length);
      var newMetricName = "Capture" + (captureIndex + 1);
      var upperBound = newComparisonArray.length > metric.length ? metric.length : newComparisonArray.length;
      for (var k = 0; k < upperBound; k++) {
        var newValue = metric[k][metricName];
        newComparisonArray[k][newMetricName] = newValue;
      }
      //handling different lengths of metrics
      console.log("upper bound is: " + upperBound);
      console.log("current metric length is: " +metric.length);
      for (var l = upperBound - 1; l < metric.length; l++) {
        newComparisonArray.push(
        {
          'Timestamp': metric[l]['Timestamp']
        });
        newComparisonArray[l][newMetricName] = metric[l][metricName];
      }
    }
    console.log(newComparisonArray);
    return newComparisonArray;
  }

  getComparisonData() {
    this.setState(prevState => ({
      isComparisonChartLoaded: false,
      comparisonIndex: 0,
      compareFreeableMemory: [],
      compareCpuUtilization: [],
      compareReadIOPS:[],
      compareWriteIOPS: []
    }));

    this.getMetricData(this.state.selectedCaptureIds[0]);
  }

  onCompareClick() {
    this.getComparisonData();

    this.setState(prevState => ({
      isCompareOpen: true
    }))
  }

  onCompareClose() {
    this.setState(prevState => ({
      isCompareOpen: false
    }))
  }

  onCaptureRowSelection(rows) {
    console.log(rows);

    // check if compare button should be disabled or enabled
    var disabled = true;
    var selectedRows = [];

    if (rows === "all") {
      for (var i = 0; i < this.state.captures.length; i++) {
        selectedRows.push(i);
      }
    } else if (rows === "none") {
      for (var i = 0; i < this.state.captures.length; i++) {
        selectedRows.push(-1);
      }
      this.setState(prevState => ({
        isCompareDisabled: true,
        selectedCaptureRows: selectedRows
      }));
      return;
    } else {
      selectedRows = rows;
    }

    if (selectedRows.length > 1 && selectedRows.length <= 3) {
      disabled = false;
    } 
    this.setState(prevState => ({
      isCompareDisabled: disabled,
      selectedCaptureRows: selectedRows
    }));

    // get capture ids from row indexes
    var selectedCaptureIds = [];
    for (var i = 0; i < selectedRows.length; i++) {
      selectedCaptureIds.push(this.state.captures[selectedRows[i]].captureId);
    }
    this.setState(prevState => ({
      selectedCaptureIds: selectedCaptureIds
    }));
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
        component.setState(prevState => ({
          captures: json["userCaptures"],
          showCaptureResultsLoading: false
        }));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  getMetricData(captureId) {
    var parentContextState = this.props.parentContext.state;
    var component = this;
    console.log("getting metric data FOR CAPTURE ID: " + captureId);

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

        var i = this.state.comparisonIndex;
        console.log("comparison index is: " + i);
        //combine comparison data
        if (!this.state.isComparisonChartLoaded && i < this.state.selectedCaptureIds.length) {
          console.log("gettign comparison data")
          var fm = this.fillComparisonData('FreeableMemory', json["FreeableMemory"], this.state.compareFreeableMemory);
          var cu = this.fillComparisonData('CPUUtilization', json["CPUUtilization"], this.state.compareCpuUtilization);
          var ri = this.fillComparisonData('ReadIOPS', json["ReadIOPS"], this.state.compareReadIOPS);
          var wi = this.fillComparisonData('WriteIOPS', json["WriteIOPS"], this.state.compareWriteIOPS);

          component.setState(prevState => ({
            compareFreeableMemory: fm,
            compareCpuUtilization: cu,
            compareReadIOPS: ri,
            compareWriteIOPS: wi,
            comparisonIndex: i + 1
          }));

          if ((i + 1) < this.state.selectedCaptureIds.length) {
            this.getMetricData(this.state.selectedCaptureIds[i + 1]);
          } else {
              component.setState(prevState => ({
              isComparisonChartLoaded: true,
              comparisonIndex: -1
            }));
          }
        }
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
          onRowSelection={this.onCaptureRowSelection}
        >
          <TableHeader
            displaySelectAll={true}
            adjustForCheckbox={true}
            enableSelectAll={true}
          >
            <TableRow >
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
                <TableRow key={index} selected={this.state.selectedCaptureRows.indexOf(index) !== -1} >
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
          {this.state.showCaptureResultsLoading &&
            <div class="loading-capture-table">
            <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
              <h5>Loading...</h5>
            </div>
          }
          {!this.state.showCaptureResultsLoading && this.state.captures.length === 0 &&
            <div class="loading-capture-table">
              <h5>There are no capture results.</h5>
            </div>
          }
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

  renderCaptureDetails() {
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

    return (
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
          <h4>Status: 
            <div class= {this.state.captureDetails.captureStatus === COMPLETED ? "result-complete" : "result-fail"}>
            <h5>{this.state.captureDetails.captureStatus === COMPLETED ? "Completed Successfully" : "Terminated With Errors"}</h5>
            </div>
          </h4>
          <h4>RDS Instance: 
            <div>
            <h5>{this.state.captureDetails.rdsInstance}</h5>
            </div>
          </h4>
          <h4>Start Time: 
            <div>
            <h5>{this.state.captureDetails.startTime}</h5>
            </div>
          </h4>
          <h4>End Time: 
            <div>
            <h5>{this.state.captureDetails.endTime}</h5>
            </div>
          </h4>
          <h3>Freeable Memory</h3>
          <LineChart width={900} height={300} data={this.state.freeableMemory} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <XAxis dataKey="Timestamp"/>
             <YAxis label={{ value: "Megabytes", angle: -90, position: 'left' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="FreeableMemory" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
          </LineChart>
          <h3>CPU Utilization</h3>
          <LineChart width={900} height={300} data={this.state.cpuUtilization} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <XAxis dataKey="Timestamp"/>
             <YAxis label={{ value: "Percentage", angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="CPUUtilization" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
          </LineChart>
          <h3>Read IOPS</h3>
          <LineChart width={900} height={300} data={this.state.readIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <XAxis dataKey="Timestamp"/>
             <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="ReadIOPS" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
          </LineChart>
          <h3>Write IOPS</h3>
          <LineChart width={900} height={300} data={this.state.writeIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <XAxis dataKey="Timestamp"/>
             <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="WriteIOPS" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
          </LineChart>
        </div>
      </Dialog>
      );
  }

  renderCompare() {
    //TODO: more descriptive labels instead of Capture1, Capture2, etc.
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.onCompareClose}
      />
    ];

    return (
      <Dialog
        title={"Comparison"}
        actions={actions}
        modal={true}
        autoScrollBodyContent={true}
        contentStyle={{
          width: '100%',
          maxWidth: 'none',
        }}
        open={this.state.isCompareOpen}
      >
      {this.state.isComparisonChartLoaded &&
        <div>
          <h3>Freeable Memory</h3>
          <LineChart width={900} height={300} data={this.state.compareFreeableMemory} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <XAxis dataKey="Timestamp"/>
             <YAxis label={{ value: "Megabytes", angle: -90, position: 'left' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="Capture1" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
             <Line type="monotone" dataKey="Capture2" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
             {this.state.selectedCaptureIds.length === 3 &&
              <Line type="monotone" dataKey="Capture3" stroke="#333333" dot={false} activeDot={{r: 8}}/>
             }
          </LineChart>
          <h3>CPU Utilization</h3>
          <LineChart width={900} height={300} data={this.state.compareCpuUtilization} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <XAxis dataKey="Timestamp"/>
             <YAxis label={{ value: "Percentage", angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="Capture1" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
             <Line type="monotone" dataKey="Capture2" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
             {this.state.selectedCaptureIds.length === 3 &&
              <Line type="monotone" dataKey="Capture3" stroke="#333333" dot={false} activeDot={{r: 8}}/>
             }
          </LineChart>
          <h3>Read IOPS</h3>
          <LineChart width={900} height={300} data={this.state.compareReadIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <XAxis dataKey="Timestamp"/>
             <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="Capture1" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
             <Line type="monotone" dataKey="Capture2" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
             {this.state.selectedCaptureIds.length === 3 &&
              <Line type="monotone" dataKey="Capture3" stroke="#333333" dot={false} activeDot={{r: 8}}/>
             }
          </LineChart>
          <h3>Write IOPS</h3>
          <LineChart width={900} height={300} data={this.state.compareWriteIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <XAxis dataKey="Timestamp"/>
             <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey="Capture1" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
             <Line type="monotone" dataKey="Capture2" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
             {this.state.selectedCaptureIds.length === 3 &&
              <Line type="monotone" dataKey="Capture3" stroke="#333333" dot={false} activeDot={{r: 8}}/>
             }
          </LineChart>
        </div>
      }
      {!this.state.isComparisonChartLoaded &&
        <div>
          <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
              <h5>Loading...</h5>
        </div>
      }
      </Dialog>
      );
  }

  render() {
    return(
    <div class="ViewResults">
      <h2>View Results</h2>
      <h5 class="results-help-text">All (completed or failed) captures and replays are stored here.</h5>
         <div class="refresh-result-button">
            <Button 
              onClick={this.onCompareClick}
              content="Compare"
              isSubmit={false}
              isDisabled={this.state.isCompareDisabled}
            />
          </div>
        {this.renderCaptureTable()}
        {this.renderReplayTable()}
        {this.state.captureDetails &&
          <div>{this.renderCaptureDetails()}</div>
        }
        {this.renderCompare()}
      </div>
      );
  }
}

export default ViewResults;