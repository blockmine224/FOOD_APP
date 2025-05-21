from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .analyzer import BMIAnalyzer
from db.connection import get_db
import random
import math
from datetime import datetime

menu_bp = Blueprint('menu', __name__)

# Hệ số TDEE dựa trên mức độ hoạt động
ACTIVITY_LEVELS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "high": 1.725,
    "very_high": 1.9
}

# Hệ số điều chỉnh TDEE dựa trên mục tiêu cân nặng và cường độ
GOAL_MAP = {
    "loss": {"light": 0.85, "safe": 0.71, "fast": 0.42},
    "gain": {"light": 1.15, "safe": 1.29, "fast": 1.58},
    "maintenance": {"safe": 1.0}
}

# Từ khóa để xác định món ăn đặc biệt dựa trên sở thích người dùng
SPECIAL_PREFS = {
    "more_vegetables": ["rau", "lá"],
    "less_vegetables": ["rau", "lá"],
    "soup": [""],
    "fried": ["dầu ăn"],
    "spicy": ["ớt"]
}

def get_current_season():
    month = datetime.now().month
    if month in [3, 4, 5]:
        return 1  # xuân 
    elif month in [6, 7, 8]:
        return 2  # hè
    elif month in [9, 10, 11]:
        return 3  # thu
    else:
        return 4  # đông

# hàm đặt số lượng gạo bữa trưa và tối
def required_rice_dishes(meal_name, goal_type, goal_intensity, activity_level):
    lunch = 1
    dinner = 2
    if goal_type == "loss":
        dinner = 1
    if goal_type == "gain":
        lunch = 2
        dinner = 2
        if goal_intensity == "fast":
            dinner = 2
    if activity_level in ["moderate", "high"]:
        lunch += 1
        dinner += 1
    elif activity_level == "very_high":
        lunch += 1
        dinner += 1
    if meal_name == "Bữa trưa":
        return lunch
    elif meal_name == "Bữa tối":
        return dinner
    else:
        return 0

# trả về loại gạo cho bữa trưa và tối
def get_rice_dishes(cursor, season):
    rice_types = ["gạo trắng", "gạo lứt"]
    chosen_type = random.choice(rice_types)
    sql = f"""
        SELECT TOP 100
            recipe_id, recipe_name, image_url, calories, protein, carbohydrates, fat,
            ingredients, cholesterol, sodium, fiber, season
        FROM recipes2
        WHERE (season = 0 OR season = ?)
          AND (recipe_name LIKE N'%{chosen_type}%')
        ORDER BY NEWID()
    """
    cursor.execute(sql, (season,))
    r = cursor.fetchone()
    if r:
        return {
            "recipe_id": r[0],
            "name": r[1],
            "image_url": r[2],
            "calories": float(r[3]),
            "protein": float(r[4]) if r[4] is not None else 0.0,
            "carbs": float(r[5]) if r[5] is not None else 0.0,
            "fat": float(r[6]) if r[6] is not None else 0.0,
            "ingredients": r[7],
            "cholesterol": float(r[8]) if r[8] is not None else 0.0,
            "sodium": float(r[9]) if r[9] is not None else 0.0,
            "fiber": float(r[10]) if r[10] is not None else 0.0
        }
    return None

# bắt buộc có thịt trong bữa trưa và tối
def get_meat_dish(cursor, season, used_ids):
    sql = """
        SELECT TOP 100 recipe_id, recipe_name, image_url, calories, protein, carbohydrates, fat,
            ingredients, cholesterol, sodium, fiber, season
        FROM recipes2
        WHERE (season = 0 OR season = ?)
          AND (recipe_name LIKE N'%thịt%')
        ORDER BY NEWID()
    """
    cursor.execute(sql, (season,))
    meat = cursor.fetchone()
    if not meat or meat[0] in used_ids:
        return None
    return {
        "recipe_id": meat[0],
        "name": meat[1],
        "image_url": meat[2],
        "calories": float(meat[3]),
        "protein": float(meat[4]) if meat[4] is not None else 0.0,
        "carbs": float(meat[5]) if meat[5] is not None else 0.0,
        "fat": float(meat[6]) if meat[6] is not None else 0.0,
        "ingredients": meat[7],
        "cholesterol": float(meat[8]) if meat[8] is not None else 0.0,
        "sodium": float(meat[9]) if meat[9] is not None else 0.0,
        "fiber": float(meat[10]) if meat[10] is not None else 0.0
    }

@menu_bp.route('/api/menu/recommendations', methods=['POST'])
@jwt_required()
def get_menu_recommendations():
    try:
        username = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, height, weight, gender, date_of_birth FROM users WHERE username = ?", (username,))
        user_data = cursor.fetchone()
        if not user_data:
            return jsonify({"error": "không tìm thấy user"}), 404
        # lấy dữ liệu người dùng
        user_id, height, weight, gender, dob = user_data
        height = float(height)
        weight = float(weight)
        age = (datetime.now().date() - dob).days // 365

        # lấy sở thích + hạn chế
        cursor.execute("SELECT preference_type, restriction_types FROM user_preferences WHERE user_id = ?", (user_id,))
        pref_row = cursor.fetchone()
        preference = pref_row[0] if pref_row else None
        restrictions = pref_row[1].split(",") if pref_row and pref_row[1] else []

        # thông tin gửi về từ người dùng
        data = request.get_json()
        activity_level = data.get("activity_level", "sedentary")
        goal_type = data.get("goal_type", "maintenance")
        goal_intensity = data.get("goal_intensity", "safe")
        
        #lấy bmi dựa trên file phân tích 
        bmi_analyzer = BMIAnalyzer()
        bmi = bmi_analyzer.calculate_bmi(weight, height)
        bmi_category = bmi_analyzer.get_bmi_category(bmi)

        # Tính BMR (Mifflin-St Jeor)
        if gender.lower() == 'male':
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
        else:
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161

        # Tính TDEE dựa theo thông tin người dùng 
        tdee = bmr * ACTIVITY_LEVELS.get(activity_level, 1.2)
        goal_factor = GOAL_MAP.get(goal_type, {}).get(goal_intensity, 1.0)
        user_goal_tdee = tdee * goal_factor

        # Các biến để xác định, hiển thị thông tin Menu và đưa ra khuyến nghị 
        show_recommended = False
        recommended_tdee = None
        recommended_message = None
        user_message = None
        user_choice_recommended = False

         # điều chỉnh TDEE và đưa ra khuyến nghị 
        if bmi_category == "overweight":
            if goal_type in ["maintenance", "gain"]:
                show_recommended = True
                recommended_tdee, recommended_message = BMIAnalyzer.tdee_bmi_adjustment(bmi_category, tdee)
                user_message = "Bạn đang thừa cân. Hãy sử dụng menu theo khuyến nghị của chúng tôi!"
            elif goal_type == "loss":
                user_message = "Bạn đang đi đúng hướng, hãy cải thiện cân nặng nhé!"
                user_choice_recommended = True
        elif bmi_category == "underweight":
            if goal_type in ["maintenance", "loss"]:
                show_recommended = True
                recommended_tdee, recommended_message = BMIAnalyzer.tdee_bmi_adjustment(bmi_category, tdee)
                user_message = "Bạn đang thiếu cân. Hãy sử dụng menu theo khuyến nghị của chúng tôi!"
            elif goal_type == "gain":
                user_message = "Bạn đang đi đúng hướng, hãy cải thiện cân nặng nhé!"
                user_choice_recommended = True
        else:
            user_message = "Bạn đang ở cân nặng hợp lý. Hãy duy trì chế độ ăn lành mạnh!"
            user_choice_recommended = True

        # TDDE cuối cùng
        user_final_tdee = int(user_goal_tdee)
        recommended_final_tdee = int(recommended_tdee) if show_recommended and recommended_tdee else None

        # Tính micronutrient dựa trên thông tin người dùng
        micronutrient_targets = BMIAnalyzer.micronutrient_targets(age, gender)

        #hàm xây dựng thực đơn 

        def build_meal(cursor, kcal_target, meal_name, season, goal_type, goal_intensity, activity_level, is_extra=False):
            # trả về món ăn đặc biệt
            menu_special_count = {"count": 0}
            if preference == "less_vegetables":
                max_special = 1
            elif preference in ["spicy", "soup", "fried", "more_vegetables"]:
                max_special = 3
            else:
                max_special = None

            def is_special_dish(dish_name):
                if not preference or preference not in SPECIAL_PREFS:
                    return False
                keywords = SPECIAL_PREFS[preference]
                return any(kw.lower() in dish_name.lower() for kw in keywords if kw)

            base_query = (
                "SELECT TOP 100 recipe_id, recipe_name, image_url, calories, protein, carbohydrates, fat, ingredients, cholesterol, sodium, fiber, season "
                "FROM recipes2 WHERE (season=0 OR season=?) "
            )
            params = [season]
            if is_extra:
                base_query += "AND (recipe_name LIKE N'%quả%' OR recipe_name LIKE N'%sữa%') " # nếu là bữa phụ, thêm các từ khóa như quả, sữa...
            base_query += "ORDER BY NEWID()"
            cursor.execute(base_query, tuple(params))
            all_recipes = cursor.fetchall()

            # Thêm điều kiện cho các bữa 
            recipes = []
            for r in all_recipes:
                name = r[1].lower()
                if meal_name == "Bữa sáng":
                    if any(passre in name for passre in ["quả", "củ", "gạo", "rau", "canh"]):
                        continue
                if meal_name == "Bữa tối" and "bánh" in name:
                    continue
                if meal_name == "Bữa trưa" and "bánh" in name:
                    continue
                if preference == "less_vegetables" and is_special_dish(name):
                    continue
                recipes.append({
                    "recipe_id": r[0],
                    "name": r[1],
                    "image_url": r[2],
                    "calories": float(r[3]),
                    "protein": float(r[4]) if r[4] is not None else 0.0,
                    "carbs": float(r[5]) if r[5] is not None else 0.0,
                    "fat": float(r[6]) if r[6] is not None else 0.0,
                    "ingredients": r[7],
                    "cholesterol": float(r[8]) if r[8] is not None else 0.0,
                    "sodium": float(r[9]) if r[9] is not None else 0.0,
                    "fiber": float(r[10]) if r[10] is not None else 0.0
                })

            meal = []
            total = 0
            used_ids = set()

            # Thêm ít nhất 1 món ăn đặc biệt
            if preference in ["more_vegetables", "spicy", "fried", "soup"]:
                special_dishes = [dish for dish in recipes if is_special_dish(dish["name"])]
                if special_dishes and (max_special is None or menu_special_count["count"] < max_special):
                    dish = random.choice(special_dishes)
                    meal.append({
                        **dish,
                        "quantity": 1,
                        "total_kcal": dish["calories"]
                    })
                    used_ids.add(dish["recipe_id"])
                    total += dish["calories"]
                    menu_special_count["count"] += 1

            if meal_name == "Bữa sáng":
                found_special = False
                for dish in recipes:
                    n = dish["name"].lower()
                    if any(x in n for x in ["bánh", "phở", "cháo", "bún", "xôi"]):
                        meal.append({**dish, "quantity": 1, "total_kcal": dish["calories"]})
                        used_ids.add(dish["recipe_id"])
                        total += dish["calories"]
                        found_special = True
                        break
                if not found_special:
                    cursor.execute(
                        "SELECT TOP 100 recipe_id, recipe_name, image_url, calories, protein, carbohydrates, fat, ingredients, cholesterol, sodium, fiber, season "
                        "FROM recipes2 WHERE (season=0 OR season=?) AND (recipe_name LIKE N'%bánh%' OR recipe_name LIKE N'%phở%' OR recipe_name LIKE N'%cháo%' OR recipe_name LIKE N'%bún%')",
                        (season,))
                    special = cursor.fetchone()
                    if special:
                        d = {
                            "recipe_id": special[0],
                            "name": special[1],
                            "image_url": special[2],
                            "calories": float(special[3]),
                            "protein": float(special[4]) if special[4] is not None else 0.0,
                            "carbs": float(special[5]) if special[5] is not None else 0.0,
                            "fat": float(special[6]) if special[6] is not None else 0.0,
                            "ingredients": special[7],
                            "cholesterol": float(special[8]) if special[8] is not None else 0.0,
                            "sodium": float(special[9]) if special[9] is not None else 0.0,
                            "fiber": float(special[10]) if special[10] is not None else 0.0
                        }
                        meal.append({**d, "quantity": 1, "total_kcal": d["calories"]})
                        used_ids.add(d["recipe_id"])
                        total += d["calories"]
            elif meal_name in ["Bữa trưa", "Bữa tối"]:
                rice_count = required_rice_dishes(meal_name, goal_type, goal_intensity, activity_level)
                rice_dish = get_rice_dishes(cursor, season)
                if rice_dish and "bánh" not in rice_dish["name"].lower():
                    meal.append({
                        **rice_dish,
                        "quantity": rice_count,
                        "total_kcal": rice_dish["calories"] * rice_count
                    })
                    used_ids.add(rice_dish["recipe_id"])
                    total += rice_dish["calories"] * rice_count

                # món ăn có ít nhất thịt
                has_meat = any("thịt" in d["name"].lower() for d in meal)
                if not has_meat:
                    meat_dish = get_meat_dish(cursor, season, used_ids)
                    if meat_dish and "bánh" not in meat_dish["name"].lower():
                        meal.append({**meat_dish, "quantity": 1, "total_kcal": meat_dish["calories"]})
                        used_ids.add(meat_dish["recipe_id"])
                        total += meat_dish["calories"]

            tries = 0
            while total < kcal_target and tries < 50 and recipes:
                for dish in recipes:
                    if dish["recipe_id"] in used_ids:
                        continue
                    # kiểm tra lại max special
                    special_flag = is_special_dish(dish["name"])
                    if special_flag:
                        if max_special is not None and menu_special_count["count"] >= max_special:
                            continue
                    name_lower = dish["name"].lower()
                    if meal_name == "Bữa sáng" and ("quả" in name_lower or "củ" in name_lower or "gạo" in name_lower or "rau" in name_lower or "canh" in name_lower):
                        continue
                    if meal_name in ["Bữa trưa", "Bữa tối"]:
                        if "bánh" in name_lower:
                            continue
                        if "gạo nếp cái" in name_lower or "gạo tẻ" in name_lower:
                            continue
                        if "thịt" in name_lower and any("thịt" in d["name"].lower() for d in meal):
                            continue
                    max_qty = min(3, int((kcal_target - total) // dish["calories"])) if dish["calories"] > 0 else 0
                    if max_qty <= 0:
                        continue
                    qty = random.randint(1, max_qty)
                    dish_total_kcal = dish["calories"] * qty
                    meal.append({
                        **dish,
                        "quantity": qty,
                        "total_kcal": dish_total_kcal
                    })
                    total += dish_total_kcal
                    used_ids.add(dish["recipe_id"])
                    if special_flag:
                        menu_special_count["count"] += 1
                    if total >= kcal_target:
                        break
                tries += 1
            # nếu không chọn được món nào(quá nhiều calo) - thêm tạm món ăn đầu, kiểm tra số lượng món ăn chỉ định 
            if not meal and recipes:
                dish = recipes[0]
                special_flag = is_special_dish(dish["name"])
                meal.append({
                    **dish,
                    "quantity": 1,
                    "total_kcal": dish["calories"]
                })
                total += dish["calories"]
                if special_flag:
                    menu_special_count["count"] += 1
            return meal, int(total)
        
        #Hàm chia % TDEE của một ngày và thành phần macro(dinh dưỡng 3)
        def build_menu_for_tdee(final_tdee):
            def percent(val, pct): return int(val * pct / 100)
            meals_percent = {
                "Bữa sáng": (10, 25),
                "Bữa trưa": (30, 35),
                "Bữa tối": (35, 40),
                "Bữa phụ": (5, 10),
            }
            meal_splits = {
                "Bữa sáng": 0.225,
                "Bữa trưa": 0.375,
                "Bữa tối": 0.275,
                "Bữa phụ": 0.125,
            }
            macro_targets = BMIAnalyzer.macronutrient_targets(final_tdee)
            meal_macros = {}
            for meal_name, meal_pct in meal_splits.items():
                meal_macros[meal_name] = {
                    "protein_g": round(macro_targets["protein_g"] * meal_pct, 1),
                    "fat_g": round(macro_targets["fat_g"] * meal_pct, 1),
                    "carb_g": round(macro_targets["carb_g"] * meal_pct, 1),
                }
            meal_targets = {}
            remain = final_tdee
            for meal, (min_pct, max_pct) in meals_percent.items():
                if meal != "Bữa phụ":
                    kcal = random.randint(percent(final_tdee, min_pct), percent(final_tdee, max_pct))
                    meal_targets[meal] = kcal
                    remain -= kcal
            meal_targets["Bữa phụ"] = max(remain, percent(final_tdee, 10))

             # Tiếp tục tạo ra thực đơn hoàn chỉnh với macronutrients, season, tối đa 10 lần và trả về thực đơn tối ưu nhất  
            season = get_current_season()
            MAX_ATTEMPTS = 10
            best_menu = None
            best_macro_diff = math.inf

            for attempt in range(MAX_ATTEMPTS):
                meals = []
                meals_total_kcal = 0
                total_protein = 0
                total_fat = 0
                total_carb = 0
                cholesterol = 0
                sodium = 0
                fiber = 0
                for meal_name, kcal_target in meal_targets.items():
                    is_extra = meal_name == "Bữa phụ"
                    meal_dishes, meal_total = build_meal(
                        cursor, kcal_target, meal_name, season, goal_type, goal_intensity, activity_level, is_extra
                    )
                    meals.append({
                        "meal": meal_name,
                        "dishes": meal_dishes,
                        "meal_total_kcal": meal_total,
                        "meal_kcal_target": kcal_target,
                        "meal_macros_target": meal_macros[meal_name]
                    })
                    meals_total_kcal += meal_total
                    # cộng tổng dinh dưỡng của món ăn(công thức), nhân với số lượng 
                    for dish in meal_dishes:
                        qty = dish.get("quantity", 1)
                        total_protein += (dish.get("protein", 0) or 0) * qty
                        total_fat    += (dish.get("fat", 0) or 0) * qty
                        total_carb   += (dish.get("carbs", 0) or 0) * qty
                        cholesterol += (dish.get("cholesterol", 0) or 0) * qty
                        sodium += ((dish.get("sodium", 0) or 0) ) * qty
                        fiber += (dish.get("fiber", 0) or 0) * qty

                # tính điểm thực đơn dựa trên lượng chênh lệch giữa macronutrients của menu hiện tại và macronutrients mục tiêu
                def diff_score(target, actual):
                    return abs(target - actual) / (target + 1e-6)
                score = (
                    diff_score(macro_targets["protein_g"], total_protein) +
                    diff_score(macro_targets["fat_g"], total_fat) +
                    diff_score(macro_targets["carb_g"], total_carb)
                )

                 # nếu điểm của lần tạo này là tốt nhất (chênh lệnh nhỏ nhất) trả về thực đơn tối ưu 
                if score < best_macro_diff:
                    best_macro_diff = score
                    best_menu = (meals, meals_total_kcal, total_protein, total_fat, total_carb, cholesterol, sodium, fiber)
                # nếu chênh lệch macronutrients < 10%, lấy thực đơn     
                if (
                    abs(total_protein - macro_targets["protein_g"]) / (macro_targets["protein_g"] + 1e-6) < 0.10 and
                    abs(total_fat - macro_targets["fat_g"]) / (macro_targets["fat_g"] + 1e-6) < 0.10 and
                    abs(total_carb - macro_targets["carb_g"]) / (macro_targets["carb_g"] + 1e-6) < 0.10
                ):
                    break
            # lấy thông tin từ thực đơn tối ưu 
            meals, meals_total_kcal, total_protein, total_fat, total_carb, cholesterol, sodium, fiber = best_menu
            # định dạng lại thông tin thực tế 

            actual_macro_targets = {
                "protein_g": round(total_protein, 1),
                "fat_g": round(total_fat, 1),
                "carb_g": round(total_carb, 1),
                "protein_percent": macro_targets["protein_percent"],
                "fat_percent": macro_targets["fat_percent"],
                "carb_percent": macro_targets["carb_percent"],
            }
            micronutrients = {
                "cholesterol_mg": round(cholesterol, 1),
                "sodium_mg": round(sodium, 1),
                "fiber_g": round(fiber, 1)
            }

            # kiểm tra trình trạng sức khỏe với giới hạn của từng loại bệnh, đưa ra cảnh báo
            restriction_warnings = []
            if "hypertension" in restrictions:
                sodium_limit = 1500
                fiber_limit = 28 if gender.lower() == 'female' else 38
                if micronutrients["sodium_mg"] > sodium_limit:
                    restriction_warnings.append("Lượng natri vượt mức khuyến nghị cho tăng huyết áp.")
                if micronutrients["fiber_g"] < fiber_limit:
                    restriction_warnings.append("Chất xơ chưa đạt mức khuyến nghị cho tăng huyết áp.")
            if "cardio" in restrictions or "atherosclerosis" in restrictions:
                if micronutrients["cholesterol_mg"] > 200:
                    restriction_warnings.append("Cholesterol vượt mức cho bệnh tim mạch/xơ vữa động mạch.")
            if "diabetes" in restrictions:
                if not (200 <= micronutrients["cholesterol_mg"] <= 300):
                    restriction_warnings.append("Cholesterol không nằm trong khoảng cho tiểu đường.")
            if "obesity" in restrictions:
                pass

            # trả về thông tin cuối cùng 
            return {
                "meals": meals, #danh sách bữa ăn, công thức
                "meals_total_kcal": meals_total_kcal,
                "macro_targets": macro_targets,
                "actual_macro_targets": actual_macro_targets,
                "meal_macros": meal_macros,
                "micronutrients": micronutrients,
                "restriction_warnings": restriction_warnings
            }
        # Tạo thực đơn dựa trên TDEE người dùng chọn 
        user_menu = build_menu_for_tdee(user_final_tdee)
        # Nếu người dùng chọn TDEE không hợp lý, đưa ra thực đơn khuyến nghị 
        recommended_menu = build_menu_for_tdee(recommended_final_tdee) if show_recommended and recommended_final_tdee else None

        # trả kết quả về giao diện 
        return jsonify({
            # thông tin chung 
            "bmi": bmi,
            "bmi_category": bmi_category,
            "user_message": user_message,
            "user_choice_recommended": user_choice_recommended,
            "recommended_message": recommended_message,
            "tdee_user": user_final_tdee,
            "tdee_recommended": recommended_final_tdee,
            "show_recommended": show_recommended, # kiểm tra khuyến nghị 

            #dữ liệu thực đơn người dùng chọn 
            "meals_user": user_menu["meals"],
            "meals_total_kcal_user": user_menu["meals_total_kcal"],
            "macro_targets_user": user_menu["macro_targets"],
            "actual_macro_targets_user": user_menu["actual_macro_targets"],
            "meal_macros_user": user_menu["meal_macros"],
            "micronutrients_user": user_menu["micronutrients"],
            "micronutrient_targets_user": micronutrient_targets,
            "restriction_warnings_user": user_menu.get("restriction_warnings"),

            # dữ liệu khuyến nghị 
            "meals_recommended": recommended_menu["meals"] if recommended_menu else None,
            "meals_total_kcal_recommended": recommended_menu["meals_total_kcal"] if recommended_menu else None,
            "macro_targets_recommended": recommended_menu["macro_targets"] if recommended_menu else None,
            "actual_macro_targets_recommended": recommended_menu["actual_macro_targets"] if recommended_menu else None,
            "meal_macros_recommended": recommended_menu["meal_macros"] if recommended_menu else None,
            "micronutrients_recommended": recommended_menu["micronutrients"] if recommended_menu else None,
            "micronutrient_targets_recommended": micronutrient_targets if recommended_menu else None,
            "restriction_warnings_recommended": recommended_menu.get("restriction_warnings") if recommended_menu else None,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500