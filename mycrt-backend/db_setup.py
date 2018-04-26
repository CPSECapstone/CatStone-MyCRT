import fileinput
import getpass

def main():
    print("This script sets up the application database string in the config file.")
    print("This can also be set up manually in the file config.py if you have a complete connection string.")

    username = input("Database Username: ")
    password = getpass.getpass()
    hostname = input("Host: ")
    dbname = input("Database name: ")

    if username == '' or password == '' or hostname == '' or dbname == '':
        print('Field missing, connection string not set.')
        return

    for line in fileinput.input("config.py", inplace=True):
        if "SQLALCHEMY_DATABASE_URI = " in line:
            print(f"SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{username}:{password}@{hostname}/{dbname}'")
        else:
            print(line, end='')

    print ("Database string set.")

if __name__ == '__main__':
    main()
