function RDSInstances(state = [], action) {
    console.log("RDSInstances reducing action " + action.type);
    switch(action.type) {
    case 'GET_USER_INSTANCES':
       return action.rdsInstances;
    default:
       return state;
    }
 }
 
 export default RDSInstances;