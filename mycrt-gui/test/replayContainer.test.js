import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';

import ReplayContainer from '../src/components/Pages/ReplayContainer';
import CaptureReplayItem from '../src/components/Pages/CaptureReplayItem';

const noCards = [];
const oneCard = [{
    replayAlias: 'test', 
    s3Bucket: 'testS3', 
    rdsInstance: 'rdsTest', 
    replayStatus: 2,
    loading: false}];
const twoCards = [{replayAlias: 'test', s3Bucket: 'testS3', rdsInstance: 'rdsTest', replayStatus: 2, loading: false},
                 {replayAlias: 'test2', s3Bucket: 'testS3', rdsInstance: 'rdsTest', replayStatus: 2, loading: false}];    

const noCardsContainer = shallow(<ReplayContainer cards={noCards} showLoadingContent={false}/>);
const noCardsContainerLoading = shallow(<ReplayContainer cards={noCards} showLoadingContent={true}/>);
const oneCardContainer = shallow(<ReplayContainer cards={oneCard} showLoadingContent={false}/>);
const twoCardContainer = shallow(<ReplayContainer cards={twoCards} showLoadingContent={false}/>);

describe('(Component) ReplayContainer with no Cards', () => {
  it('renders...', () => {
    expect(noCardsContainer).to.have.length(1);
  });

  it('contains...There are no current replays.', () => {
    expect(noCardsContainer.contains(<h5>There are no current replays.</h5>));
  });
});

describe('(Component) ReplayContainer with no Cards and is loading', () => {
    it('renders...', () => {
      expect(noCardsContainerLoading).to.have.length(1);
    });
  
    it('contains...shows that it is currently loading', () => {
      expect(noCardsContainerLoading.contains(<h5>Loading...</h5>));
    });

    it('contains...shows that it has the loading icon', () => {
      expect(noCardsContainerLoading.contains('glyphicon glyphicon-refresh glyphicon-refresh-animate'));
    });
});

describe('(Component) ReplayContainer with 1 Card', () => {
  it('renders...', () => {
      expect(oneCardContainer).to.have.length(1);
  });

  it('contains... One replay.', () => {
    expect(oneCardContainer.find(CaptureReplayItem)).to.have.length(1);
  });
});

describe('(Component) ReplayContainer with 2 Cards', () => {
    it('renders...', () => {
        expect(twoCardContainer).to.have.length(1);
    });
  
    it('contains... Two replay.', () => {
      expect(twoCardContainer.find(CaptureReplayItem)).to.have.length(2);
    });
});