function RDSInstances(state = [], action) {
    switch(action.type) {
    case 'GET_USER_INSTANCES':
       return action.rdsInstances;
    default:
       return state;
    }
 }
 
 export default RDSInstances;