from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import config
from auth.routes import auth_bp

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = config.JWT_SECRET_KEY
CORS(app)
jwt = JWTManager(app)


app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(debug=True)