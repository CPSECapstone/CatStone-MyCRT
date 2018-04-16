# CatStone-MyCRT [![Build Status](https://travis-ci.org/CPSECapstone/CatStone-MyCRT.svg?branch=master)](https://travis-ci.org/CPSECapstone/CatStone-MyCRT)
The MySQL Capture and Replay Tool(MyCRT) allows users to capture transactions on a database and replay them in a different environment to see the effect on their systems.

---
<h3>Installation and running MyCRT locally</h3>
<h4>Requirements:</h4>
1. Python3 >=3.5.2 
2. pip
3. npm >=5.8.0
4. mysql >=5.6

<h4>Instructions:</h4>
1. Clone repository
2. Set up a database in mysql, keep the database name, username, and password.
3. Install front end:  
    From within the mycrt-gui direcory, run `npm install`
4. Install back end dependencies:  
    Use an enviroment manager if desired.  
    Run `pip install mycrt-backend/requirements.txt`  
5. Set up the connection to the application database:  
    Run db_setup.py and enter the database name, username, and password from step 2.
6. Start the back end and the front end:  
    Run "start_mycrt.sh" to start the back end and front end.  
    OR  
    start the back end and front end separately:  
        `python3 mycrt-backend/server.py`  
        `npm start --prefix mycrt-gui/`  
