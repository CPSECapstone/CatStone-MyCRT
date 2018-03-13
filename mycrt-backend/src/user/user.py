class User():

    def __init__(self, userDict):
        self.id = userDict["id"]
        self.username = userDict["username"]
        self.password = userDict["password"]
        self.email = userDict["email"]
        self.access_key = userDict["access_key"]
        self.secret_key = userDict["secret_key"]
        self.notificationLife = userDict["notificationLife"]
