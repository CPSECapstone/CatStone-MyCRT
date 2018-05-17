function Replays(state = [], action) {
    switch(action.type) {
    case 'GET_ALL_REPLAYS':
       return action.replays;
    case 'ADD_REPLAY':
       return state.concat(action.replay);
    default:
       return state;
    }
 }
 
 export default Replays;
