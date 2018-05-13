//TODO: replace sample User reducer

function User(state = {}, action) {
    console.log("Prss reducing action " + action.type);
    switch(action.type) {
    case 'LOG_IN':
       return {token: action.token};
    case 'LOG_OUT':
       return {}; // Clear user state
    default:
       return state;
    }
 }
 
 export default User;
