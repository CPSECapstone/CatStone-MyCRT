function User(state = {}, action) {
    switch(action.type) {
    case 'LOG_IN':
       return {token: action.token};
    default:
       return state;
    }
 }
 
 export default User;
