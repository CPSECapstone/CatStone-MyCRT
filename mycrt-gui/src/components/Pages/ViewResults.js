import React, { Component } from 'react';

import './ViewResults.css';
import '../../bootstrap-3.3.7-dist/css/bootstrap.min.css';

class ViewResults extends Component {

  render() {
    return (
      <div className="ViewResults">
         <h1>View Results</h1>
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
              <td> </td>
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
  }
}

export default ViewResults;