import { combineReducers } from 'redux';

//combines reducers
//TODO: replace sample User reducer
import User from './User';
import Capture from './Capture';
import Replays from './Replays';
import RDSInstances from './RDSInstances';
import S3Buckets from './S3Buckets';

const rootReducer = combineReducers({User, Capture, Replays, S3Buckets, RDSInstances});

export default rootReducer;