function Capture(state = [], action) {
    switch(action.type) {
       case 'GET_CAPTURES':
          return action.captures;
       case 'ADD_CAPTURE':
          return state.concat(action.capture);
       default:
          return state;
    }
 }
 
 export default Capture;
