from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db.connection import get_db
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/users/register', methods=['POST'])
def register():
    print("Register called!", request.json)
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    display_name = data.get('display_name', username)  # Use username as display_name if not provided

    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    # Hash password
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, email, display_name, password_hash) VALUES (?, ?, ?, ?)",
                       (username, email, display_name, hashed_pw))
        conn.commit()
    except Exception as e:
        print("Registration error:", e)   
        return jsonify({"message": str(e)}), 500

    # Issue JWT for instant login (optional)
    access_token = create_access_token(identity=username)
    return jsonify({"token": access_token}), 201

@auth_bp.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    if not row:
        return jsonify({"message": "Invalid credentials"}), 401

    password_hash = row[0]
    if not bcrypt.checkpw(password.encode(), password_hash.encode()):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)
    return jsonify({"token": access_token}), 200

@auth_bp.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_me():
    username = get_jwt_identity()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username, email, display_name FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    if row:
        return jsonify({
            "username": row[0],
            "email": row[1],
            "displayName": row[2]
        })
    return jsonify({"message": "User not found"}), 404



@jwt_required()
def get_me():
    # ... (get current user info)
    pass