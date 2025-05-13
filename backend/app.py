from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import config
from auth.routes import auth_bp
from menu.routes import menu_bp
from auth.routes import translate_bp
from auth.routes import preferences_bp
from auth.routes import user_menu_bp


app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = config.JWT_SECRET_KEY
app.config['GOOGLE_CLIENT_ID'] = config.GOOGLE_CLIENT_ID
CORS(app)
jwt = JWTManager(app)


app.register_blueprint(auth_bp)
app.register_blueprint(menu_bp)
app.register_blueprint(translate_bp)
app.register_blueprint(preferences_bp)
app.register_blueprint(user_menu_bp)



if __name__ == '__main__':
    app.run(debug=True)