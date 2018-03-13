class User():
    __tablename__ = 'user'
    id = -1
    username = ''
    password = ''
    email = ''
    access_key= ''
    secret_key = ''
    notificationLife = -1

    def __init__(self, userDict):
        id = userDict["id"]
        username = userDict["username"]
        password = userDict["password"]
        email = userDict["email"]
        access_key = userDict["access_key"]
        secret_key = userDict["secret_key"]
        notificationLife = userDict["notificationLife"]
