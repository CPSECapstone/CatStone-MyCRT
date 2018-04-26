from src.server import create_app


if __name__ == '__main__':
    app = create_app()
    app.run(port=5000, threaded=True, ssl_context='adhoc')
