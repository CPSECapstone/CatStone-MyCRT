# CatStone-MyCRT https://travis-ci.org/CPSECapstone/CatStone-MyCRT.svg?branch=master
The MySQL Capture and Replay Tool(MyCRT) allows users to capture transactions on a database and replay them in a different environment to see the effect on their systems.

#To run mycrt-backend
Requirements:
1. Have Python3(Version 3.2) Installed on your machine

Instructions:
1. Checkout the Project
2. Run the following command 'pip install flask flask_restful flask_cors flask_jsonpify flask_script flask_migrate'
3. Go to the mycrt-backend directory
4. Run the command python main.py
5. Open a web browser and navigate to localhost:5000/test/api
6. The resulting page should display a json object {'test': 'test'}
