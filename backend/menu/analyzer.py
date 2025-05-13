class BMIAnalyzer:
    @staticmethod
    def calculate_bmi(weight, height):
        # công thức tính bmi
        try:
            height_m = height / 100
            bmi = weight / (height_m * height_m)
            return round(bmi, 2)
        except Exception as e:
            print(f"Lỗi khi tính BMI: {str(e)}")
            raise ValueError(f"Lỗi khi tính BMI: {str(e)}")

    @staticmethod
    def get_bmi_category(bmi):
        # trả về tình trạng 
        try:
            if bmi < 18:
                return "underweight"
            elif 18.5 <= bmi <= 22.9:
                return "normal"
            elif bmi >= 23:
                return "overweight"
            else:
                return "unknown"
        except Exception as e:
            print(f"Lỗi khi xác định danh mục BMI: {str(e)}")
            raise ValueError(f"Lỗi khi xác định danh mục BMI: {str(e)}")

    @staticmethod
    def tdee_bmi_adjustment(bmi_category, tdee):
        # đưa ra lời khuyên và điều chỉnh TDEE 
        if bmi_category == "underweight":
            return int(tdee * 1.15), "Bạn đang thiếu cân. Hãy tăng lượng calo để tăng cân khỏe mạnh."
        elif bmi_category == "overweight":
            return int(tdee * 0.85), "Bạn đang thừa cân. Hãy giảm lượng calo để giảm cân an toàn."
        elif bmi_category == "normal":
            return int(tdee), "Chỉ số BMI của bạn bình thường. Hãy duy trì chế độ ăn lành mạnh!"
        else:
            return int(tdee), "Không xác định được BMI."
        
    @staticmethod
    def macronutrient_targets(tdee, protein_percent=0.15, fat_percent=0.25, carb_percent=0.60):
        # tính macronutrients
        protein_kcal = tdee * protein_percent
        fat_kcal = tdee * fat_percent
        carb_kcal = tdee * carb_percent
        protein_g = round(protein_kcal / 4, 1)
        fat_g = round(fat_kcal / 9, 1)
        carb_g = round(carb_kcal / 4, 1)
        return {
            "protein_g": protein_g,
            "fat_g": fat_g,
            "carb_g": carb_g,
            "protein_percent": protein_percent,
            "fat_percent": fat_percent,
            "carb_percent": carb_percent,
        }  

    @staticmethod
    def micronutrient_targets(age, gender):
        
        # Trả về: cholesterol (mg), sodium (mg), fiber (g)
        cholesterol = 300
        sodium = 2300
        sodium_preferred = 1500
        if age >= 12 and age <= 30:
            fiber = 38 if gender.lower() == 'male' else 25
        elif age <= 50:
            fiber = 38 if gender.lower() == 'male' else 25
        else:  # >= 51
            fiber = 30 if gender.lower() == 'male' else 21
        return {
            "cholesterol_mg": cholesterol,
            "sodium_mg": sodium,
            "sodium_preferred_mg": sodium_preferred,
            "fiber_g": fiber
        }