from db.connection import get_db
import pandas as pd
import numpy as np

class RecipeModel:
    @staticmethod
    def clean_ingredients(ingredients_str):
        try:
            # thay thế dấu ngoặc vuông và nháy đơn 
            cleaned = ingredients_str.strip('[]').replace("'", "")
            return cleaned
        except:
            return ""

    @staticmethod
    def clean_numeric(value, as_int=False):
        try:
            if pd.isna(value) or value == "" or str(value).strip() == "":
                return 0
            val = str(value).replace(',', '.').strip()
            return int(float(val)) if as_int else float(val)
        except:
            return 0
    '''
    @staticmethod
    def import_recipes_from_csv():
        try:
            # đọc file csv
            df = pd.read_csv('menu/data/recipe_final.csv')
            
            # xử lý dữ liệu
            df['ingredients_list'] = df['ingredients_list'].apply(RecipeModel.clean_ingredients)
            numeric_columns = ['calories', 'fat', 'carbohydrates', 'protein', 
                             'cholesterol', 'sodium', 'fiber']
            
            for col in numeric_columns:
                df[col] = df[col].apply(RecipeModel.clean_numeric)

            conn = get_db()
            cursor = conn.cursor()

            # Xóa dữ liệu cũ trước khi Thêm
            cursor.execute("DELETE FROM recipes")
            
            # Thêm dữ liệu 
            for _, row in df.iterrows():
                cursor.execute("""
                    INSERT INTO recipes (
                        recipe_id, recipe_name, average_rating, image_url,
                        review_count, calories, fat, carbohydrates, protein,
                        cholesterol, sodium, fiber, ingredients
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    int(row['recipe_id']),
                    row['recipe_name'],
                    float(row['aver_rate']),
                    row['image_url'],
                    int(row['review_nums']),
                    int(row['calories']),
                    float(row['fat']),
                    float(row['carbohydrates']),
                    float(row['protein']),
                    float(row['cholesterol']),
                    float(row['sodium']),
                    float(row['fiber']),
                    row['ingredients_list']
                ))
            
            conn.commit()
            return {"message": "Thêm dữ liệu thành công"}
        except Exception as e:
            return {"error": str(e)}
    '''

    @staticmethod
    def import_recipes2_from_csv():
        try:
            # đọc file csv
            df = pd.read_csv('menu/data/recipe_final_ver3.csv')
            
            # xử lý dữ liệu
            df['ingredients_list'] = df['ingredients_list'].apply(RecipeModel.clean_ingredients)
            numeric_columns = ['calories', 'fat', 'carbohydrates', 'protein', 
                             'cholesterol', 'sodium', 'fiber','season']
            
            for col in numeric_columns:
                df[col] = df[col].apply(RecipeModel.clean_numeric)

            conn = get_db()
            cursor = conn.cursor()

            # Xóa dữ liệu cũ trước khi Thêm
            cursor.execute("DELETE FROM recipes2")
            
            # Thêm dữ liệu 
            for _, row in df.iterrows():
                cursor.execute("""
                    INSERT INTO recipes2 (
                        recipe_id, recipe_name, average_rating, image_url,
                        review_count, calories, fat, carbohydrates, protein,
                        cholesterol, sodium, fiber, ingredients,season
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
                """, (
                    int(row['recipe_id']),
                    row['recipe_name'],
                    float(row['aver_rate']),
                    row['image_url'],
                    int(row['review_nums']),
                    int(row['calories']),
                    float(row['fat']),
                    float(row['carbohydrates']),
                    float(row['protein']),
                    float(row['cholesterol']),
                    float(row['sodium']),
                    float(row['fiber']),
                    row['ingredients_list'],
                    row['season']
                ))
            
            conn.commit()
            return {"message": "Thêm dữ liệu thành công"}
        except Exception as e:
            return {"error": str(e)}



    

    @staticmethod
    def get_random_menu(count=3):
        try:
            conn = get_db()
            cursor = conn.cursor()
            
            # Hàm kiểm tra xem Menu đã có hay chưa?
            cursor.execute("""
                SELECT TOP (?) recipe_id, recipe_name, image_url, 
                       calories, protein, carbohydrates, fat, ingredients, season
                FROM recipes 
                WHERE calories BETWEEN 200 AND 800
                AND protein > 10
                ORDER BY NEWID()
            """, (count,))
            
            recipes = cursor.fetchall()
            
            menu = []
            for recipe in recipes:
                menu.append({
                    "recipe_id": recipe[0],
                    "name": recipe[1],
                    "image_url": recipe[2],
                    "calories": recipe[3],
                    "protein": recipe[4],
                    "carbs": recipe[5],
                    "fat": recipe[6],
                    "ingredients": recipe[7],
                    "season": recipe[8]
                })
            
            return menu
        except Exception as e:
            return {"error": str(e)}
        
if __name__ == '__main__':
    result = RecipeModel.import_recipes2_from_csv()
    print(result)
