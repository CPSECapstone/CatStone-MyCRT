//TODO: replace sample User reducer

function User(state = {}, action) {
    console.log("Prss reducing action " + action.type);
    switch(action.type) {
    case 'SIGN_IN':
       return action.user;
    case 'SIGN_OUT':
       return {}; // Clear user state
    default:
       return state;
    }
 }
 
 export default User;
