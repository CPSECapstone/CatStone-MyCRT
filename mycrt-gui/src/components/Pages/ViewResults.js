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
      isReplayLogOpen: false,
      rowNumberSelected: undefined,
      isCompareOpen: false,
      captureDetails: undefined,
      replayDetails: undefined,
      captureDetailsLoading: true,
      replayDetailsLoading: true,
      selectedCaptureRows: [],
      selectedReplayRows: [],
      isComparisonChartLoaded: true,
      comparisonIndex: -1,
      captures: [],
      replays: [],
      selectedCaptureIds: [],
      selectedReplayIds: [],
      isCompareDisabled: true,
      compareFreeableMemory: [],
      compareCpuUtilization: [],
      compareReadIOPS:[],
      compareWriteIOPS: [],
      freeableMemory: [],
      cpuUtilization: [],
      readIOPS:[],
      writeIOPS: [],
      comparisonAliases: [],
      relatedCaptureId: -1,
      showCaptureResultsLoading: true,
      showReplayResultsLoading: true
    };

    // This binding is necessary to make `this` work in the callback
    this.fillComparisonData = this.fillComparisonData.bind(this);
    this.getComparisonData = this.getComparisonData.bind(this);
    this.onCompareClick = this.onCompareClick.bind(this);
    this.onCompareClose = this.onCompareClose.bind(this);
    this.onCaptureRowSelection = this.onCaptureRowSelection.bind(this);
    this.onReplayRowSelection = this.onReplayRowSelection.bind(this);

    this.getCaptureMetricData = this.getCaptureMetricData.bind(this);
    this.getReplayMetricData = this.getReplayMetricData.bind(this);
    this.getCaptureData = this.getCaptureData.bind(this);
    this.getReplayData = this.getReplayData.bind(this);
    this.sendData = this.sendData.bind(this);
    this.onLogClose = this.onLogClose.bind(this);
    this.onReplayLogClose = this.onReplayLogClose.bind(this);

    this.renderCaptureTable = this.renderCaptureTable.bind(this);
    this.renderReplayTable = this.renderReplayTable.bind(this);
    this.renderCaptureDetails = this.renderCaptureDetails.bind(this);
    this.renderReplayDetails = this.renderReplayDetails.bind(this);
    this.renderCompare = this.renderCompare.bind(this);

    this.isRelatedReplayOrCapture = this.isRelatedReplayOrCapture.bind(this);
  }

  componentDidMount() {
    var intervalGetAllCaptures = setInterval(this.getCaptureData, 1500);
    var intervalGetAllReplays = setInterval(this.getReplayData, 1500);

    this.setState({intervalGetAllCaptures: intervalGetAllCaptures,
                   intervalGetAllReplays: intervalGetAllReplays});
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalGetAllCaptures);
    clearInterval(this.state.intervalGetAllReplays);
  }

  fillComparisonData(metricName, metric, comparisonArray, alias) {
    var captureIndex = this.state.comparisonIndex;
    var newComparisonArray = comparisonArray;

    if (captureIndex === 0) {
      for (var j = 0; j < metric.length; j++) {
        newComparisonArray.push(
        {
          'Timestamp': metric[j]['Timestamp'],
        });

        newComparisonArray[j][alias] = metric[j][metricName];
      }
    } else {
      var newMetricName = alias;
      var upperBound = newComparisonArray.length > metric.length ? metric.length : newComparisonArray.length;
      for (var k = 0; k < upperBound; k++) {
        var newValue = metric[k][metricName];
        newComparisonArray[k][newMetricName] = newValue;
      }
      //handling different lengths of metrics
      for (var l = upperBound - 1; l < metric.length; l++) {
        if (metric[l] !== undefined) {
          newComparisonArray.push(
          {
            'Timestamp': metric[l]['Timestamp']
          });
          newComparisonArray[l][newMetricName] = metric[l][metricName];
        }
      }
    }
    return newComparisonArray;
  }

  getComparisonData() {
    this.setState(prevState => ({
      isComparisonChartLoaded: false,
      comparisonIndex: 0,
      compareFreeableMemory: [],
      compareCpuUtilization: [],
      compareReadIOPS:[],
      compareWriteIOPS: [],
      comparisonAliases: []
    }));

    if (this.state.selectedCaptureIds[0] === undefined) {
       this.getReplayMetricData(this.state.selectedReplayIds[0]);
    }
    else {
       this.getCaptureMetricData(this.state.selectedCaptureIds[0]);
    }
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
    // check if compare button should be disabled or enabled
    var disabled = true;
    var selectedRows = [];
    var relatedCaptureId = -1;


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
        selectedCaptureRows: selectedRows,
        relatedCaptureId: relatedCaptureId
      }));
      return;
    } else {
      selectedRows = rows;
    }


    if (selectedRows.length + this.state.selectedReplayRows.length > 1 && selectedRows.length + this.state.selectedReplayRows.length <= 3) {
      disabled = false;
    }
    this.setState(prevState => ({
      isCompareDisabled: disabled,
      selectedCaptureRows: selectedRows
    }));

    // get capture ids from row indexes
    var selectedCaptureIds = [];

    
    for (var i = 0; i < selectedRows.length; i++) {
      var visibleCaptures = this.state.relatedCaptureId === -1 ? this.state.captures :
         this.state.captures.filter(c => c.captureId === this.state.relatedCaptureId);

      selectedCaptureIds.push(visibleCaptures[selectedRows[i]].captureId);
      relatedCaptureId = visibleCaptures[selectedRows[i]].captureId;
    }
    this.setState(prevState => ({
      selectedCaptureIds: selectedCaptureIds,
      relatedCaptureId: relatedCaptureId 
    }));

    if (rows.length === 0) {
      this.setState({selectedReplayIds: [], selectedReplayRows: [], isCompareDisabled: true})
    }
  }

  onReplayRowSelection(rows) {
    // check if compare button should be disabled or enabled
    var disabled = true;
    var selectedRows = [];
    var relatedCaptureId = -1;

    if (rows === "all") {
      for (var i = 0; i < this.state.replays.length; i++) {
        selectedRows.push(i);
      }
    } else if (rows === "none" || rows.length === 0) {
      for (var i = 0; i < this.state.replays.length; i++) {
        selectedRows.push(-1);
      }
      this.setState(prevState => ({
        isCompareDisabled: true,
        selectedReplayRows: selectedRows,
        selectedReplayIds: [],
        relatedCaptureId: this.state.relatedCaptureId        
      }));
      return;
    } else {
      selectedRows = rows;
    }

    if (selectedRows.length + this.state.selectedCaptureRows.length > 1 && selectedRows.length + this.state.selectedCaptureRows.length <= 3) {
      disabled = false;
    }
    this.setState(prevState => ({
      isCompareDisabled: disabled,
      selectedReplayRows: selectedRows
    }));

    // get capture ids from row indexes
    var selectedReplayIds = [];
    var visibleReplays = this.state.relatedCaptureId === -1 ? 
     this.state.replays : 
     this.state.replays.filter(r => r.captureId === this.state.relatedCaptureId);

    for (var i = 0; i < selectedRows.length; i++) {
      selectedReplayIds.push(visibleReplays[selectedRows[i]].replayId);
      relatedCaptureId = visibleReplays[selectedRows[i]].captureId;
    }
    this.setState(prevState => ({
      selectedReplayIds: selectedReplayIds,
      relatedCaptureId: relatedCaptureId   
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
          captures: json["userCaptures"].filter(capture => capture.captureStatus > IN_PROGRESS),
          showCaptureResultsLoading: false
        }));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  getReplayData() {
    var parentContextState = this.props.parentContext.state;
    var component = this;

    $.ajax({
      url: SERVER_PATH + "/users/replays",
      dataType: 'json',
      headers: {'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(parentContextState.token + ":")},
      type: 'GET',
      success: function(json) {
        component.setState(prevState => ({
          replays: json["userReplays"].filter(replay => replay.replayStatus > IN_PROGRESS),
          showReplayResultsLoading: false
        }));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }
  
  getCaptureMetricData(captureId) {
    var parentContextState = this.props.parentContext.state;
    var component = this;
    console.log("getting metric data FOR CAPTURE ID: " + captureId);

    $.ajax({
      url: SERVER_PATH + "/users/captures/" + captureId + "/metrics",
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
        console.log("The selected items to compare " + (this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length));        
        //combine comparison data
        if (!this.state.isComparisonChartLoaded && i < this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length) {
          console.log("gettign comparison data")
          var captureAlias = component.state.captures.filter(c => c.captureId === captureId)[0].captureAlias;
          var fm = this.fillComparisonData('FreeableMemory', json["FreeableMemory"], this.state.compareFreeableMemory, captureAlias);
          var cu = this.fillComparisonData('CPUUtilization', json["CPUUtilization"], this.state.compareCpuUtilization, captureAlias);
          var ri = this.fillComparisonData('ReadIOPS', json["ReadIOPS"], this.state.compareReadIOPS, captureAlias);
          var wi = this.fillComparisonData('WriteIOPS', json["WriteIOPS"], this.state.compareWriteIOPS, captureAlias);

          console.log(component.state.comparsionAliases);          
          component.setState(prevState => ({
            compareFreeableMemory: fm,
            compareCpuUtilization: cu,
            compareReadIOPS: ri,
            compareWriteIOPS: wi,
            comparsionAliases: component.state.comparisonAliases.push(captureAlias),
            comparisonIndex: i + 1
          }));

          if ((i + 1) < this.state.selectedCaptureIds.length) {
            this.getCaptureMetricData(this.state.selectedCaptureIds[i + 1]);
          }
          else if ((i + 1) < this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length) {
            this.getReplayMetricData(this.state.selectedReplayIds[0]);
          } 
          else {
              component.setState(prevState => ({
              isComparisonChartLoaded: true,
              comparisonIndex: -1
            }));
          }
        }
        this.setState({captureDetailsLoading: false});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  getReplayMetricData(replayId) {
    var parentContextState = this.props.parentContext.state;
    var component = this;
    console.log("getting metric data FOR Replay ID: " + replayId);

    $.ajax({
      url: SERVER_PATH + "/users/replays/" + replayId + "/metrics",
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

        var i = this.state.comparisonIndex - this.state.selectedCaptureIds.length;
        var comparisonIndex = this.state.comparisonIndex;
        console.log("comparison index is: " + comparisonIndex);
        console.log("The selected items to compare " + (this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length));
        //combine comparison data
        if (!this.state.isComparisonChartLoaded && comparisonIndex < this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length) {
          console.log("gettign comparison data")
          var replayAlias = component.state.replays.filter(r => r.replayId === replayId)[0].replayAlias;
          var fm = this.fillComparisonData('FreeableMemory', json["FreeableMemory"], this.state.compareFreeableMemory, replayAlias);
          var cu = this.fillComparisonData('CPUUtilization', json["CPUUtilization"], this.state.compareCpuUtilization, replayAlias);
          var ri = this.fillComparisonData('ReadIOPS', json["ReadIOPS"], this.state.compareReadIOPS, replayAlias);
          var wi = this.fillComparisonData('WriteIOPS', json["WriteIOPS"], this.state.compareWriteIOPS, replayAlias);

          console.log(component.state.comparsionAliases);
          component.setState(prevState => ({
            compareFreeableMemory: fm,
            compareCpuUtilization: cu,
            compareReadIOPS: ri,
            compareWriteIOPS: wi,
            comparsionAliases: component.state.comparisonAliases.push(replayAlias),
            comparisonIndex: comparisonIndex + 1
          }));

          if ((i + 1) < this.state.selectedReplayIds.length) {
            this.getReplayMetricData(this.state.selectedReplayIds[i + 1]);
          } else {
              component.setState(prevState => ({
              isComparisonChartLoaded: true,
              comparisonIndex: -1
            }));
          }
        }
        this.setState({replayDetailsLoading: false});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }

  onLogClose() {
    this.setState(prevState => ({
      isLogOpen: false,
      freeableMemory: [],
      cpuUtilization: [],
      readIOPS:[],
      writeIOPS: []
    }));
  }

  onReplayLogClose() {
    this.setState(prevState => ({
      isReplayLogOpen: false,
      freeableMemory: [],
      cpuUtilization: [],
      readIOPS:[],
      writeIOPS: [],
    }));
  }

  onOpenCaptureDetailsClick(rowIndex, e) {
    this.setState(prevState => ({
      isLogOpen: true,
      captureDetailsLoading: true,
      captureDetails: this.state.captures[rowIndex]
    }));

    this.getCaptureMetricData(this.state.captures[rowIndex].captureId);
  }

  onOpenReplayDetailsClick(rowIndex, e) {
    this.setState(prevState => ({
      isReplayLogOpen: true,
      replayDetailsLoading: true,
      replayDetails: this.state.replays[rowIndex]
    }));

    this.getReplayMetricData(this.state.replays[rowIndex].replayId);
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

  isRelatedReplayOrCapture(captureId) {
    return (this.state.selectedCaptureRows.length > 0 && (this.state.relatedCaptureId === captureId)) ||
      (this.state.selectedReplayRows.length > 0 && (this.state.relatedCaptureId === captureId)) ||
      (this.state.relatedCaptureId === -1);
  }

  renderCaptureTable() {
    var that = this;
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
            enableSelectAll={false}
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
              let boundItemClick = this.onOpenCaptureDetailsClick.bind(this, index);
              if ((row.captureStatus === COMPLETED || row.captureStatus === ERROR) && that.isRelatedReplayOrCapture(row.captureId)) {
                return(
                <TableRow key={row.captureId} selected={this.state.selectedCaptureIds.indexOf(row.captureId) !== -1} >
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
    var that = this;
    return (
      <div>
      <h3>Replay Results</h3>
      <Table
          height={'100%'}
          fixedHeader={true}
          selectable={true}
          multiSelectable={true}
          onRowSelection={this.onReplayRowSelection}
        >
          <TableHeader
            displaySelectAll={true}
            adjustForCheckbox={true}
            enableSelectAll={false}
          >
            <TableRow >
              <TableHeaderColumn tooltip="The Alias">Alias</TableHeaderColumn>
              <TableHeaderColumn tooltip="The Status">Status</TableHeaderColumn>
              <TableHeaderColumn tooltip="The RDS Instance Name">RDS Instance</TableHeaderColumn>
              <TableHeaderColumn tooltip="The Start Time">Start Time</TableHeaderColumn>
              <TableHeaderColumn tooltip="The End Time">Fast Replay</TableHeaderColumn>
              <TableHeaderColumn tooltip="View Details">View Details</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={true}
            deselectOnClickaway={false}
            showRowHover={true}
            stripedRows={false}
          >
            {this.state.replays.map( (row, index) => {
              let boundItemClick = this.onOpenReplayDetailsClick.bind(this, index);
              if ((row.replayStatus === COMPLETED || row.replayStatus === ERROR) && that.isRelatedReplayOrCapture(row.captureId)) {
                return(
                <TableRow key={index} selected={this.state.selectedReplayIds.indexOf(row.replayId) !== -1} >
                  <TableRowColumn>{row.replayAlias}</TableRowColumn>
                  <TableRowColumn>
                    {(row.replayStatus === COMPLETED) ? <div class="result-complete glyphiconstyle glyphicon glyphicon-ok" /> : <div class="result-fail glyphiconstyle glyphicon glyphicon-remove" />}
                  </TableRowColumn>
                  <TableRowColumn>{row.rdsInstance}</TableRowColumn>
                  <TableRowColumn>{row.isFast ? '-' : row.startTime}</TableRowColumn>
                  <TableRowColumn>{row.isFast ? <div class="result-complete glyphiconstyle glyphicon glyphicon-ok" /> : <div class="result-fail glyphiconstyle glyphicon glyphicon-remove" />}</TableRowColumn>
                  <TableRowColumn><a onClick={boundItemClick} class="open-log-link">Open Details</a></TableRowColumn>
                </TableRow>
                );
              }
              })}
          </TableBody>
        </Table>
          {this.state.showReplayResultsLoading &&
            <div class="loading-capture-table">
            <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
              <h5>Loading...</h5>
            </div>
          }
          {!this.state.showReplayResultsLoading && this.state.replays.length === 0 &&
            <div class="loading-capture-table">
              <h5>There are no replay results.</h5>
            </div>
          }
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
          {this.state.captureDetailsLoading &&
            <div>
              <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
                  <h5>Loading Graphs...</h5>
            </div>
          }
          {!this.state.captureDetailsLoading &&
            <div>
            <h3>Freeable Memory</h3>
            {this.state.freeableMemory.length == 0 ?
              (<div class="metric-error">
                Not enough data points to draw graph.
              </div>)
            :
            (<LineChart width={900} height={300} data={this.state.freeableMemory} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
               <XAxis dataKey="Timestamp"/>
               <YAxis label={{ value: "Megabytes", angle: -90, position: 'left' }} domain={['dataMin', 'dataMax']}/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="FreeableMemory" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
            </LineChart>)
            }
            <h3>CPU Utilization</h3>
            {this.state.cpuUtilization.length == 0 ?
              (<div class="metric-error">
                Not enough data points to draw graph.
              </div>)
            :
            (<LineChart width={900} height={300} data={this.state.cpuUtilization} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
               <XAxis dataKey="Timestamp"/>
               <YAxis label={{ value: "Percentage", angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="CPUUtilization" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
            </LineChart>)
            }
            <h3>Read IOPS</h3>
            {this.state.readIOPS.length == 0 ?
              (<div class="metric-error">
                Not enough data points to draw graph.
              </div>)
            :
            (<LineChart width={900} height={300} data={this.state.readIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
               <XAxis dataKey="Timestamp"/>
               <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="ReadIOPS" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
            </LineChart>)
            }
            <h3>Write IOPS</h3>
            {this.state.writeIOPS.length == 0 ?
              (<div class="metric-error">
                Not enough data points to draw graph.
              </div>)
            :
            (<LineChart width={900} height={300} data={this.state.writeIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
               <XAxis dataKey="Timestamp"/>
               <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="WriteIOPS" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
            </LineChart>)
          }
          </div>
        }
        </div>
      </Dialog>
      );
  }

  renderReplayDetails() {
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.onReplayLogClose}
      />,
      <FlatButton
        label="Download Log"
        primary={true}
        onClick={this.onReplayLogClose}
      />,
    ];

    return (
      <Dialog
        title={"Replay: " + this.state.replayDetails.replayAlias}
        actions={actions}
        modal={true}
        autoScrollBodyContent={true}
        contentStyle={{
          width: '100%',
          maxWidth: 'none',
        }}
        open={this.state.isReplayLogOpen}
      >
        <div>
          <h4>Status:
            <div class= {this.state.replayDetails.replayStatus === COMPLETED ? "result-complete" : "result-fail"}>
            <h5>{this.state.replayDetails.replayStatus === COMPLETED ? "Completed Successfully" : "Terminated With Errors"}</h5>
            </div>
          </h4>
          <h4>RDS Instance:
            <div>
            <h5>{this.state.replayDetails.rdsInstance}</h5>
            </div>
          </h4>
          <h4>Start Time:
            <div>
            <h5>{this.state.replayDetails.isFast ? '-' : this.state.replayDetails.startTime}</h5>
            </div>
          </h4>
          <h4>Fast Replay:
            <div>
            <h5>{this.state.replayDetails.isFast}</h5>
            </div>
          </h4>

          {this.state.replayDetailsLoading &&
            <div>
              <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
                  <h5>Loading Graphs...</h5>
            </div>
          }
          {!this.state.replayDetailsLoading &&
            <div>
            <h3>Freeable Memory</h3>
            {this.state.freeableMemory.length == 0 ?
              (<div class="metric-error">
                Not enough data points to draw graph.
              </div>)
            :
            (<LineChart width={900} height={300} data={this.state.freeableMemory} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
               <XAxis dataKey="Timestamp"/>
               <YAxis label={{ value: "Megabytes", angle: -90, position: 'left' }} domain={['dataMin', 'dataMax']}/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="FreeableMemory" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
            </LineChart>)
            }
            <h3>CPU Utilization</h3>
            {this.state.cpuUtilization.length == 0 ?
              (<div class="metric-error">
                Not enough data points to draw graph.
              </div>)
            :
            (<LineChart width={900} height={300} data={this.state.cpuUtilization} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
               <XAxis dataKey="Timestamp"/>
               <YAxis label={{ value: "Percentage", angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="CPUUtilization" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
            </LineChart>)
            }
            <h3>Read IOPS</h3>
            {this.state.readIOPS.length == 0 ?
              (<div class="metric-error">
                Not enough data points to draw graph.
              </div>)
            :
            (<LineChart width={900} height={300} data={this.state.readIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
               <XAxis dataKey="Timestamp"/>
               <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="ReadIOPS" stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
            </LineChart>)
            }
            <h3>Write IOPS</h3>
            {this.state.writeIOPS.length == 0 ?
              (<div class="metric-error">
                Not enough data points to draw graph.
              </div>)
            :
            (<LineChart width={900} height={300} data={this.state.writeIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
               <XAxis dataKey="Timestamp"/>
               <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
               <CartesianGrid strokeDasharray="3 3"/>
               <Tooltip/>
               <Legend />
               <Line type="monotone" dataKey="WriteIOPS" stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
            </LineChart>)
          }
          </div>
        }
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

    var aliases = this.state.comparisonAliases;

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
          {(this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length >
            (this.state.compareFreeableMemory.length && (Object.keys(this.state.compareFreeableMemory[0]).length - 1))) &&
            <div class="metric-error">
            {this.state.compareFreeableMemory.length}
            Some datapoints may be missing as metrics are unavailable for a series in this graph.
            </div>
          }
          <LineChart width={900} height={300} data={this.state.compareFreeableMemory} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <YAxis label={{ value: "Megabytes", angle: -90, position: 'left' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey={aliases[0]} stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
             <Line type="monotone" dataKey={aliases[1]} stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
             {this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length === 3 &&
              <Line type="monotone" dataKey={aliases[2]} stroke="#333333" dot={false} activeDot={{r: 8}}/>
             }
          </LineChart>
          <h3>CPU Utilization</h3>
          {(this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length >
            (this.state.compareCpuUtilization.length > 0 && Object.keys(this.state.compareCpuUtilization[0]).length - 1)) &&
            <div class="metric-error">
            Some datapoints may be missing as metrics are unavailable for a series in this graph.
            </div>
          }
          <LineChart width={900} height={300} data={this.state.compareCpuUtilization} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <YAxis label={{ value: "Percentage", angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey={aliases[0]} stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
             <Line type="monotone" dataKey={aliases[1]} stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
             {this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length === 3 &&
              <Line type="monotone" dataKey={aliases[2]}  stroke="#333333" dot={false} activeDot={{r: 8}}/>
             }
          </LineChart>
          <h3>Read IOPS</h3>
          {(this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length >
            (this.state.compareReadIOPS.length > 0 && Object.keys(this.state.compareReadIOPS[0]).length - 1)) &&
            <div class="metric-error">
            Some datapoints may be missing as metrics are unavailable for a series in this graph.
            </div>
          }
          <LineChart width={900} height={300} data={this.state.compareReadIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey={aliases[0]} stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
             <Line type="monotone" dataKey={aliases[1]} stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
             {this.state.selectedCaptureIds.length === 3 &&
              <Line type="monotone" dataKey={aliases[2]}  stroke="#333333" dot={false} activeDot={{r: 8}}/>
             }
          </LineChart>
          <h3>Write IOPS</h3>
          {(this.state.selectedCaptureIds.length + this.state.selectedReplayIds.length >
            (this.state.compareWriteIOPS.length > 0 && Object.keys(this.state.compareWriteIOPS[0]).length - 1)) &&
            <div class="metric-error">
            Some datapoints may be missing as metrics are unavailable for a series in this graph.
            </div>
          }
          <LineChart width={900} height={300} data={this.state.compareWriteIOPS} margin={{top: 5, right: 60, left: 60, bottom: 5}}>
             <YAxis label={{ value: "Count/Second", angle: -90, position: 'insideLeft' }} domain={['dataMin', 'dataMax']}/>
             <CartesianGrid strokeDasharray="3 3"/>
             <Tooltip/>
             <Legend />
             <Line type="monotone" dataKey={aliases[0]} stroke="#00bcd4" dot={false} activeDot={{r: 8}}/>
             <Line type="monotone" dataKey={aliases[1]} stroke="#8884d8" dot={false} activeDot={{r: 8}}/>
             {this.state.selectedCaptureIds.length === 3 &&
              <Line type="monotone" dataKey={aliases[2]}  stroke="#333333" dot={false} activeDot={{r: 8}}/>
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
        {this.state.captureDetails && this.state.isLogOpen &&
          <div>{this.renderCaptureDetails()}</div>
        }
        {this.state.replayDetails && this.state.isReplayLogOpen &&
          <div>{this.renderReplayDetails()}</div>
        }
        {this.state.isCompareOpen && 
          <div>{this.renderCompare()}</div>
        }
      </div>
      );
  }
}

export default ViewResults;
