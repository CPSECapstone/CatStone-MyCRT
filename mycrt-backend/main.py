from src.server import create_app


application = create_app()

if __name__ == '__main__':
    print("Starting the application...")
    application.run(port=8080, host="0.0.0.0")
