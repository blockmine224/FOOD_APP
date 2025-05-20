from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from db.connection import get_db
import bcrypt
import os
import time
from flask import current_app, send_from_directory
from werkzeug.utils import secure_filename
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests
import traceback



auth_bp = Blueprint('auth', __name__)
translate_bp = Blueprint('translate', __name__)
preferences_bp = Blueprint('preferences', __name__)
user_menu_bp = Blueprint('user_menu', __name__)


UPLOAD_FOLDER = 'uploads/avatars'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

temp_registrations = {}

@translate_bp.route('/api/translate', methods=['POST'])
def proxy_translate():
    data = request.get_json()
    q = data.get('q', '')
    source = data.get('source', 'en')
    target = data.get('target', 'vi')
    if not q or not target:
        return jsonify({'error': 'error'}), 400
    if len(q) > 1000:
        return jsonify({'error': 'Chuỗi quá dài'}), 400
    try:
        print("Translating:", q)
        resp = requests.post(
            'https://libretranslate.com/translate',
            json={
                'q': q,
                'source': source,
                'target': target,
                'format': 'text'
            },
            timeout=8
        )
        print("Status code:", resp.status_code)
        print("Response text:", resp.text)
        resp.raise_for_status()
        result = resp.json()
        print("Result json:", result)
        return jsonify({'translatedText': result.get('translatedText', '')})
    except Exception as e:
        print("Translate error:", e)
        return jsonify({'error': str(e)}), 500
    
@auth_bp.route('/api/auth/google', methods=['POST'])
def google_login():
    data = request.json
    credential = data.get('credential')
    if not credential:
        return jsonify({"message": "Thiếu chứng chỉ google"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            current_app.config['GOOGLE_CLIENT_ID']
        )
        email = idinfo.get('email')
        display_name = idinfo.get('name') or email.split('@')[0]
        picture = idinfo.get('picture', None)

        if not email:
            return jsonify({"message": "Google account has no email!"}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT username, display_name FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if user:
            username = user[0]
        else:
            base_username = email.split('@')[0][:16]
            username = base_username
            cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
            i = 1
            while cursor.fetchone():
                username = f"{base_username}{i}"
                cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
                i += 1

            cursor.execute("""
                INSERT INTO users (username, email, display_name, password_hash, avatar_url)
                VALUES (?, ?, ?, ?, ?)
            """, (
                username,
                email,
                display_name,
                '',  
                picture if picture else None
            ))
            conn.commit()

        access_token = create_access_token(identity=username)
        return jsonify({"token": access_token}), 200

    except ValueError as e:
        return jsonify({"message": f"Xác thực Google không thành công: {str(e)}"}), 400
    except Exception as e:
        print("Google login error:", e)
        return jsonify({"message": "Internal server error"}), 500

@auth_bp.route('/api/users/check-username')
def check_username():
    username = request.args.get('username', '').strip()
    if not username:
        return jsonify({"error": "Không cung cấp đc tên người dùng"}), 400
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
    exists = cursor.fetchone() is not None
    return jsonify({"exists": exists})

@auth_bp.route('/api/users/check-email')
def check_email():
    email = request.args.get('email', '').strip()
    if not email:
        return jsonify({"error": "Không cung cấp đc email"}), 400
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM users WHERE email = ?", (email,))
    exists = cursor.fetchone() is not None
    return jsonify({"exists": exists})


@auth_bp.route('/api/users/register', methods=['POST'])
def register():
    print("Initial registration called!", request.json)
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"message": "Tất cả các trường không đc để trống."}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        return jsonify({"message": "Tên đăng nhập đã tồn tại."}), 409
    cursor.execute("SELECT 1 FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        return jsonify({"message": "Email đã được sử dụng."}), 409

    if username in temp_registrations:
        return jsonify({"message": "Tên đăng nhập đang chờ hoàn tất đăng ký."}), 409
    if any(info["email"] == email for info in temp_registrations.values()):
        return jsonify({"message": "Email đang chờ hoàn tất đăng ký."}), 409

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    temp_registrations[username] = {
        "email": email,
        "password_hash": hashed_pw,
        "display_name": username
    }
    
    access_token = create_access_token(identity=username)
    return jsonify({"token": access_token}), 201



@auth_bp.route('/api/users/complete-profile', methods=['POST'])
@jwt_required()
def complete_profile():
    username = get_jwt_identity()
    
    temp_data = temp_registrations.get(username)
    if not temp_data:
        return jsonify({"message": "Phiên đăng ký đã hết hạn hoặc không hợp lệ"}), 400
    
    data = request.json
    gender = data.get('gender')
    date_of_birth = data.get('dateOfBirth')
    height = data.get('height')
    weight = data.get('weight')
    
    if not all([gender, date_of_birth, height, weight]):
        return jsonify({"message": "Tất cả các trường không đc để trống."}), 400
        
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO users (
                username, email, display_name, password_hash, 
                gender, date_of_birth, height, weight
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            username, temp_data['email'], temp_data['display_name'],
            temp_data['password_hash'], gender, date_of_birth,
            height, weight
        ))
        
        conn.commit()
        
        del temp_registrations[username]
        
        return jsonify({"message": "đăng ký đã hoàn tất thành công"}), 200
        
    except Exception as e:
        print("Registration completion error:", e)
        return jsonify({"message": str(e)}), 500
    
@auth_bp.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Tên người dùng và mật khẩu là bắt buộc"}), 400

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
    cursor.execute("""
        SELECT display_name, email, gender, date_of_birth, height, weight, avatar_url
        FROM users
        WHERE username = ?
    """, (username,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_data = {
        "displayName": user[0],
        "email": user[1],
        "gender": user[2],
        "date_of_birth": user[3].isoformat() if user[3] else None,
        "height": float(user[4]) if user[4] is not None else None,
        "weight": float(user[5]) if user[5] is not None else None,
        "avatarUrl": user[6] if user[6] else None
    }
    return jsonify(user_data)

@auth_bp.route('/api/users/me', methods=['PUT'])
@jwt_required()
def update_me():
    username = get_jwt_identity()
    data = request.json

    display_name = data.get('displayName')
    email = data.get('email')
    gender = data.get('gender')
    date_of_birth = data.get('date_of_birth')
    height = data.get('height')
    weight = data.get('weight')
    avatar_url = data.get('avatarUrl')  

    if not display_name or not email:
        return jsonify({"message": "Tên hiển thị và email là bắt buộc."}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()
        if avatar_url:
            cursor.execute("""
                UPDATE users
                SET display_name = ?, email = ?, gender = ?, date_of_birth = ?, height = ?, weight = ?, avatar_url = ?
                WHERE username = ?
            """, (display_name, email, gender, date_of_birth, height, weight, avatar_url, username))
        else:
            cursor.execute("""
                UPDATE users
                SET display_name = ?, email = ?, gender = ?, date_of_birth = ?, height = ?, weight = ?
                WHERE username = ?
            """, (display_name, email, gender, date_of_birth, height, weight, username))
        conn.commit()
        return jsonify({"message": "Cập nhật thành công."}), 200
    except Exception as e:
        print("Update user error:", e)
        return jsonify({"message": "Lỗi cập nhật."}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@auth_bp.route('/api/users/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    username = get_jwt_identity()
    if 'avatar' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{username}_{int(time.time())}_{file.filename}")
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        avatar_url = f"/{UPLOAD_FOLDER}/{filename}"
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET avatar_url = ? WHERE username = ?", (avatar_url, username))
        conn.commit()
        return jsonify({'avatarUrl': avatar_url}), 200
    return jsonify({'message': 'File type not allowed'}), 400

@auth_bp.route('/uploads/avatars/<filename>')
def get_avatar(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@preferences_bp.route('/api/users/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    username = get_jwt_identity()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    if not row:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    user_id = row[0]
    cursor.execute("SELECT daily_calorie_target, daily_protein_target, daily_fat_target, daily_carb_target, preference_type, restriction_types, dietary_restrictions FROM user_preferences WHERE user_id = ?", (user_id,))
    pref = cursor.fetchone()
    if not pref:
        return jsonify({})
    return jsonify({
        'daily_calorie_target': pref[0],
        'daily_protein_target': pref[1],
        'daily_fat_target': pref[2],
        'daily_carb_target': pref[3],
        'preference_type': pref[4],
        'restriction_types': pref[5].split(',') if pref[5] else [],
        'dietary_restrictions': pref[6],
    })

@preferences_bp.route('/api/users/preferences', methods=['POST'])
@jwt_required()
def set_preferences():
    username = get_jwt_identity()
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    if not row:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    user_id = row[0]
    daily_calorie_target = data.get('daily_calorie_target')
    daily_protein_target = data.get('daily_protein_target')
    daily_fat_target = data.get('daily_fat_target')
    daily_carb_target = data.get('daily_carb_target')
    preference_type = data.get('preference_type')
    restriction_types = ','.join(data.get('restriction_types', []))
    dietary_restrictions = data.get('dietary_restrictions')
    cursor.execute("SELECT id FROM user_preferences WHERE user_id = ?", (user_id,))
    if cursor.fetchone():
        cursor.execute("""
            UPDATE user_preferences SET daily_calorie_target=?, daily_protein_target=?, daily_fat_target=?, daily_carb_target=?, preference_type=?, restriction_types=?, dietary_restrictions=?, updated_at=GETDATE()
            WHERE user_id=?
        """, (daily_calorie_target, daily_protein_target, daily_fat_target, daily_carb_target, preference_type, restriction_types, dietary_restrictions, user_id))
    else:
        cursor.execute("""
            INSERT INTO user_preferences (user_id, daily_calorie_target, daily_protein_target, daily_fat_target, daily_carb_target, preference_type, restriction_types, dietary_restrictions)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, daily_calorie_target, daily_protein_target, daily_fat_target, daily_carb_target, preference_type, restriction_types, dietary_restrictions))
    conn.commit()
    return jsonify({"message": "Preferences updated"})

@user_menu_bp.route('/api/user-menus', methods=['POST'])
@jwt_required()
def save_menu():
    user = get_jwt_identity()
    data = request.json
    menu_date = data.get('menu_date')
    meals = data.get('meals')
    bmi = data.get('bmi')             
    tdee = data.get('tdee')           
    analysis_json = data.get('analysis_json')  
    if not menu_date or not meals:
        return jsonify({'error': 'menu_date và bữa ăn bắt buộc'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username=?", (user,))
    row = cursor.fetchone()
    if not row:
        return jsonify({'error': 'User not found'}), 404
    user_id = row[0]

    cursor.execute("DELETE FROM user_menus WHERE user_id=? AND menu_date=?", (user_id, menu_date))

    cursor.execute("""
        INSERT INTO user_menus (user_id, menu_date, bmi, tdee, analysis_json)
        VALUES (?, ?, ?, ?, ?);
        SELECT SCOPE_IDENTITY();
    """, (user_id, menu_date, bmi, tdee, analysis_json))
    cursor.nextset()
    menu_id = cursor.fetchone()[0]

    if not menu_id:
        return jsonify({'error': 'Lưu menu thất bại'}), 500

    for meal in meals:
        cursor.execute(
            "INSERT INTO user_menu_dishes (menu_id, recipe_id, meal_type, quantity) VALUES (?, ?, ?, ?)",
            (menu_id, meal['recipe_id'], meal['meal_type'], meal.get('quantity', 1))
        )
    conn.commit()
    return jsonify({'message': 'Menu saved', 'menu_id': menu_id})

@user_menu_bp.route('/api/user-menus', methods=['GET'])
@jwt_required()
def list_menus():
    try:
        user = get_jwt_identity()
        menu_date = request.args.get('date')
        range_type = request.args.get('range')
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username=?", (user,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'Không tìm thấy người dùng'}), 404
        user_id = row[0]

        if range_type == 'week':
            cursor.execute("""
              SELECT * FROM user_menus WHERE user_id=? AND menu_date BETWEEN DATEADD(DAY, -7, GETDATE()) AND DATEADD(DAY, 1, GETDATE())
              ORDER BY menu_date DESC
            """, (user_id,))
        elif range_type == 'tomorrow':
            cursor.execute("SELECT * FROM user_menus WHERE user_id=? AND menu_date=DATEADD(DAY, 1, CAST(GETDATE() AS DATE))", (user_id,))
        elif menu_date:
            cursor.execute("SELECT * FROM user_menus WHERE user_id=? AND menu_date=?", (user_id, menu_date))
        else:
            cursor.execute("SELECT * FROM user_menus WHERE user_id=? AND menu_date=CAST(GETDATE() AS DATE)", (user_id,))
        menus = cursor.fetchall()
        result = []
        for menu in menus:
            menu_id = menu[0]
            menu_date_val = menu[2]
            created_at = menu[3]
            updated_at = menu[4]
            bmi = menu[5]
            tdee = menu[6]
            analysis_json = menu[7]
            cursor.execute("""
                SELECT d.id, d.recipe_id, d.meal_type, d.quantity, r.recipe_name, r.image_url
                FROM user_menu_dishes d
                JOIN recipes2 r ON d.recipe_id = r.recipe_id
                WHERE d.menu_id=?
            """, (menu_id,))
            dishes = [dict(zip(['id','recipe_id','meal_type','quantity','recipe_name','image_url'], d)) for d in cursor.fetchall()]
            result.append({
                'id': menu_id,
                'menu_date': menu_date_val.isoformat(),
                'created_at': created_at,
                'updated_at': updated_at,
                'bmi': float(bmi) if bmi is not None else None,
                'tdee': int(tdee) if tdee is not None else None,
                'analysis_json': analysis_json,
                'dishes': dishes
            })
        return jsonify(result)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print("ERROR in list_menus:", tb, flush=True)
        with open("flask_errors.log", "a") as f:
            f.write(tb + "\n")
        return jsonify({'error': str(e), 'traceback': tb}), 500
    
@user_menu_bp.route('/api/user-menus/<int:menu_id>', methods=['DELETE'])
@jwt_required()
def delete_menu(menu_id):
    user = get_jwt_identity()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username=?", (user,))
    row = cursor.fetchone()
    if not row:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    user_id = row[0]
    cursor.execute("DELETE FROM user_menus WHERE id=? AND user_id=?", (menu_id, user_id))
    conn.commit()
    return jsonify({'message': 'Menu deleted'})

@user_menu_bp.route('/api/user-menus/<int:menu_id>', methods=['PUT'])
@jwt_required()
def update_menu(menu_id):
    user = get_jwt_identity()
    data = request.json
    meals = data.get('meals')
    if not meals:
        return jsonify({'error': 'meals required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username=?", (user,))
    row = cursor.fetchone()
    if not row:
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404
    user_id = row[0]

    cursor.execute("SELECT id FROM user_menus WHERE id=? AND user_id=?", (menu_id, user_id))
    if not cursor.fetchone():
        return jsonify({'error': 'Không tìm thấy người dùng'}), 404

    cursor.execute("DELETE FROM user_menu_dishes WHERE menu_id=?", (menu_id,))
    for meal in meals:
        cursor.execute(
            "INSERT INTO user_menu_dishes (menu_id, recipe_id, meal_type, quantity) VALUES (?, ?, ?, ?)",
            (menu_id, meal['recipe_id'], meal['meal_type'], meal.get('quantity', 1))
        )
    cursor.execute("UPDATE user_menus SET updated_at=GETDATE() WHERE id=?", (menu_id,))
    conn.commit()
    return jsonify({'message': 'Menu updated'})
    

@jwt_required()
def get_me():
    pass