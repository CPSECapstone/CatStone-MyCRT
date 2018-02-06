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

const tableData = [
  {
    alias: 'Test Alias 1',
    complete: true,
    ip: '10.15.10.123',
    start: '10:00 AM Jan 1, 2017',
    end: '12:00 AM Jan 1, 2017'
  },
  {
    alias: 'Test Alias 2',
    complete: true,
    ip: '10.15.10.123',
    start: '10:00 AM Jan 1, 2017',
    end: '12:00 AM Jan 1, 2017'
  },
  {
    alias: 'Test Alias 3',
    complete: false,
    ip: '10.15.10.123',
    start: '10:00:00 AM Jan 1, 2017',
    end: '12:00:00 AM Jan 1, 2017'
  },
  {
    alias: 'Test Alias 4',
    complete: true,
    ip: '10.15.10.123',
    start: '10:00:00 AM Jan 1, 2017',
    end: '12:00:00 AM Jan 1, 2017'
  }
];

class ViewResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      isLogOpen: false
    };

    // This binding is necessary to make `this` work in the callback
    this.sendData = this.sendData.bind(this);
    this.onLogOpen = this.onLogOpen.bind(this);
    this.onLogClose = this.onLogClose.bind(this);

    this.renderCaptureTable = this.renderCaptureTable.bind(this);
    this.renderReplayTable = this.renderReplayTable.bind(this);
  }

  onLogOpen() {
    this.setState(prevState => ({
      isLogOpen: true
    }));
  }

  onLogClose() {
    this.setState(prevState => ({
      isLogOpen: false
    }));
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
              <TableHeaderColumn tooltip="The Database IP">Database IP</TableHeaderColumn>
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
            {tableData.map( (row, index) => (
              <TableRow key={index}>
                <TableRowColumn>{row.alias}</TableRowColumn>
                <TableRowColumn>
                  {row.complete ? <div class="result-complete glyphiconstyle glyphicon glyphicon-ok" /> : <div class="result-fail glyphiconstyle glyphicon glyphicon-remove" />}
                </TableRowColumn>
                <TableRowColumn>{row.ip}</TableRowColumn>
                <TableRowColumn>{row.start}</TableRowColumn>
                <TableRowColumn>{row.end}</TableRowColumn>
                <TableRowColumn><a onClick={this.onLogOpen} class="open-log-link">Open Details</a></TableRowColumn>
              </TableRow>
              ))}
          </TableBody>
        </Table>
        </div>
      );
  }

  renderReplayTable() {
    return (
      <div>
      <h3>Replay Results</h3>
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
              <TableHeaderColumn tooltip="The Database IP">Database IP</TableHeaderColumn>
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
            {tableData.map( (row, index) => (
              <TableRow key={index}>
                <TableRowColumn>{row.alias}</TableRowColumn>
                <TableRowColumn>
                  {row.complete ? <div class="result-complete glyphiconstyle glyphicon glyphicon-ok" /> : <div class="result-fail glyphiconstyle glyphicon glyphicon-remove" />}
                </TableRowColumn>
                <TableRowColumn>{row.ip}</TableRowColumn>
                <TableRowColumn>{row.start}</TableRowColumn>
                <TableRowColumn>{row.end}</TableRowColumn>
                <TableRowColumn><a onClick={this.onLogOpen} class="open-log-link">Open Details</a></TableRowColumn>
              </TableRow>
              ))}
          </TableBody>
        </Table>
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
              onClick={this.sendData}
              content="Refresh Results"
              isSubmit={false}
            />
          </div>
        {this.renderCaptureTable()}
        {this.renderReplayTable()}
        <Dialog
          title="Test Alias"
          actions={actions}
          modal={true}
          autoScrollBodyContent={true}
          contentStyle={{
            width: '100%',
            maxWidth: 'none',
          }}
          open={this.state.isLogOpen}
        >
          This dialog spans the entire width of the screen.
        </Dialog>
      </div>
      );
  }
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