import { combineReducers } from 'redux';

//combines reducers
//TODO: replace sample User reducer
import User from './User';
import Capture from './Capture';
import Replays from './Replays';
import RDSInstances from './RDSInstances';
import S3Buckets from './S3Buckets';

const appReducer = combineReducers({User, Capture, Replays, S3Buckets, RDSInstances});
const rootReducer = (state, action) => {
    if (action.type == 'LOG_OUT') {
        state = undefined
    }

    return appReducer(state, action);
};

export default rootReducer;