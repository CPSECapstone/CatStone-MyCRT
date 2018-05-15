function S3Buckets(state = [], action) {
    console.log("S3Buckets reducing action " + action.type);
    switch(action.type) {
    case 'GET_USER_BUCKETS':
       return action.buckets;
    default:
       return state;
    }
 }
 
 export default S3Buckets;
