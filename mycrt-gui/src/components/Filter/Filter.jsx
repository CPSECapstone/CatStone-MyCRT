import React, { Component } from 'react';
import './Filter.css';

import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import Search from 'material-ui/svg-icons/action/search';


/**
 * Filter class to represent a component to filter a table
 * 
 * Expected Props:
 *    @param fields An array of objects containing field name, 
 *                  filter type, 
 *                  and options (depending on filter type)
 * 
 * <Filter fields=[{name: "captureAlias",
 *                  displayText: "Capture Alias",
 *                  type: "TextField"},
 *                 {name: "captureStatus",
 *                  displayText: "Capture Alias",
 *                  type: "SelectField",
 *                  options: ["Success", "Fail"}]
 */
 
class Filter extends Component {
    constructor(props) {
        super(props);

        this.state = {

        }

        this.createFilterComponents = this.createFilterComponents.bind(this);        
        this.createSubfilter = this.createSubFilter.bind(this);
        this.createMenuItems = this.createMenuItems.bind(this);

        this.handleSelectFieldChange = this.handleSelectFieldChange.bind(this);
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);

        this.createJSON = this.createJSON.bind(this);
    }

    createFilterComponents() {
        var fields = this.props.fields;
        
        var fieldComponents = fields.map(field => 
            this.createSubFilter(field["name"], field["displayText"], field["type"], field["options"])
        )

        return fieldComponents;
    }

    /**
     * Function that creates different components for filtering.
     * 
     * @param {String} filterName 
     * @param {String} displayText
     * @param {String} filterType 
     * @param {List} options 
     */
    createSubFilter(filterName, displayText, filterType, options, multiSelect) {
        if (filterType == "TextField") {
            return (
                <Paper>
                <Search className="search-icon-style"/>
                <TextField
                  className="text-field-style"
                  hintText={"Search " + displayText + "..."}
                  key={filterName + "Value"}
                  underlineShow={false}
                  onChange={(event) => this.handleTextFieldChange(filterName, event)}>
                </TextField>
                <Divider/>
                </Paper>
            );
        }
        else if (filterType === "SelectField" && multiSelect) {
            return (
                <SelectField
                  hintText={"Select a " + displayText}
                  multiple={true}
                  key={filterName + "Values"}
                  value={this.state[filterName + "Values"]}
                  onChange={(event, index, values) => this.handleSelectFieldChange(filterName, event, values)}>
                    {this.createMenuItems(filterName, options)}
                </SelectField>
            )
        }
        else if (filterType === "SelectField" && !multiSelect) {
            return (
                <SelectField
                  hintText={"Select a " + displayText}
                  multiple={false}
                  key={filterName + "Value"}
                  value={this.state[filterName + "Values"]}
                  onChange={(event, index, values) => this.handleSelectFieldChange(filterName, event, values)}>
                    {this.createMenuItems(filterName, options)}
                </SelectField>
            )
        }
    }

    createMenuItems(filterName, options) {
        return options.map((option) => 
            <MenuItem
              key={option}
              insetChildren={true}
              checked={this.state[filterName + "Values"] && this.state[filterName + "Values"].indexOf(option) > -1}
              value={option}
              primaryText={option}>
            </MenuItem>
        )
    }

    handleSelectFieldChange(filterName, event, values) {
        this.setState(prevState => this.createJSON(filterName + "Values", values))
    }

    handleTextFieldChange(filterName, event) {
        var textValue = event.target.value
        
        this.setState(prevState => this.createJSON(filterName + "Value", textValue))
        this.props.onFilterChange(filterName, textValue)
    }

    createJSON(jsonKey, jsonValue) {
        var jsonObj = {};
        jsonObj[jsonKey] = jsonValue;

        return jsonObj;
    }

    render() {
        return(
            <div class="filter-container">
                {this.createFilterComponents()}
            </div>
        );
    }
}


export default Filter;