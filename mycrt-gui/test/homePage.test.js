import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import HomePage from '../src/components/Pages/HomePage.js';
/*import Button from '../src/components/Pages/Button.js';
import CaptureContainer from '../src/components/Pages/CaptureContainer.js';
import ReplayContainer from '../src/components/Pages/ReplayContainer.js';
import AddReplayForm from '../src/components/Forms/AddReplayForm.js';
import Callout from '../src/components/Pages/Callout.js';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import TimePicker from 'material-ui/TimePicker';
import DatePicker from 'material-ui/DatePicker';*/

const homePageTest = shallow(<HomePage parentContext={this}/>);

//TODO: integrate redux to mock API calls
describe('Homepage Renders', () => {
	it('renders Homepage', () => {
		expect(homePageTest).to.not.be.undefined;
	})

	it('renders CaptureContainer', () => {
		expect(homePageTest.find('CaptureContainer')).to.have.length(1);
	})

	it('renders ReplayContainer', () => {
		expect(homePageTest.find('ReplayContainer')).to.have.length(1);
	})

	it('renders Add Capture/Replay Buttons', () => {
		expect(homePageTest.find('Button')).to.have.length(2);
	})

	it('renders Forms', () => {
		expect(homePageTest.find('Dialog')).to.have.length(2);
	})
});


describe('Add Capture/Replay Form', () => {
	it('opens Add Capture Form onClick', () => {
		(homePageTest.find('Button').first()).simulate('click');

		const addCaptureForm = homePageTest.find('Dialog').at(0);
		expect(addCaptureForm).to.not.be.undefined;
		expect(addCaptureForm.props().title).to.equal('Add Capture');
		expect(addCaptureForm.props().open).to.equal(true);
	})

	//This test does not pass because we currently cannot mock parentContext for the API call.
	//TODO: remove api call in HomePage.js in getSuccessfulCaptures() and instead filter
	//		the most recent captures (from polling)
	/*
	it('opens Add Replay Form onClick', () => {
		console.log(homePageTest.find('Button').at(1).debug());
		(homePageTest.find('Button').at(1)).simulate('click');

		const addReplayForm = homePageTest.find('Dialog').at(0);
		expect(addReplayForm).to.not.be.undefined;
		expect(addReplayForm.props().title).to.equal('Add Replay');
		expect(addReplayForm.props().open).to.equal(true);
	})*/
});

