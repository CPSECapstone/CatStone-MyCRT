import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import ReplayContainer from '../src/components/Pages/ReplayContainer'

const noCards = [];
const wrapper = shallow(<ReplayContainer cards={noCards}/>);

describe('(Component) ReplayContainer', () => {
  it('renders...', () => {
    expect(wrapper).to.have.length(1);
  });
});