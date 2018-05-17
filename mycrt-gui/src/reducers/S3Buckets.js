function S3Buckets(state = [], action) {
    switch(action.type) {
    case 'GET_USER_BUCKETS':
       return action.buckets;
    default:
       return state;
    }
 }
 
 export default S3Buckets;
