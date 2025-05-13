import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, Stack, Chip, Avatar, Button, Divider, Fade, Paper,
  Table, TableContainer, TableBody, TableCell, TableHead, TableRow, LinearProgress, Tooltip, IconButton, Collapse, useTheme
} from "@mui/material";
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import GTranslateIcon from '@mui/icons-material/GTranslate'; 
import MacroPieChart from "./MacroPieChart";
import { SaveAs as SaveIcon} from "@mui/icons-material"; 
import { translateText } from '../utils/translate';
import { saveMenu } from "../api/userMenus";
import { Snackbar, Alert } from "@mui/material";

const getMealBg = (idx) => [
  "linear-gradient(135deg, #e3ffe8 0%, #f3faff 100%)",
  "linear-gradient(135deg, #fffde3 0%, #fffaf3 100%)",
  "linear-gradient(135deg, #ffe3e5 0%, #fff3f6 100%)",
][idx % 3];


export default function ModernMenuSection({
  recommendations,
  showRecommendedMenu,
  onToggleMenuType,
  translateBMICategory,
  isLoadingMenu,
  onRegenerateMenu,
  lastMenuParams,
  onShowOtherUserMenu,
  
}) {
  const theme = useTheme();
  const [openNutrition, setOpenNutrition] = useState({});
  const [openIngredients, setOpenIngredients] = useState({});
  const [dishLang, setDishLang] = useState({}); 
  const [viNames, setViNames] = useState({});
  const [viIngredients, setViIngredients] = useState({});
  const [translating, setTranslating] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const getToken = () => localStorage.getItem('token');
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  if (!recommendations) return null;

  const isShowRecommended = recommendations.show_recommended && showRecommendedMenu;
  const meals = isShowRecommended
    ? recommendations.meals_recommended
    : recommendations.meals_user;

  const macroTargets = isShowRecommended
    ? recommendations.macro_targets_recommended
    : recommendations.macro_targets_user;

  const actualMacroTargets = isShowRecommended
    ? recommendations.actual_macro_targets_recommended
    : recommendations.actual_macro_targets_user;

  const mealsTotalKcal = isShowRecommended
    ? recommendations.meals_total_kcal_recommended
    : recommendations.meals_total_kcal_user;

  const tdeeValue = isShowRecommended
    ? recommendations.tdee_recommended
    : recommendations.tdee_user;

  const message = isShowRecommended
    ? recommendations.recommended_message
    : recommendations.user_message;

  const isGoodMenu = isShowRecommended || recommendations.user_choice_recommended;
  const cardBg = isGoodMenu
    ? "linear-gradient(120deg, #e0ffe3 0%, #e0e7ff 100%)"
    : "linear-gradient(120deg, #ffe3e3 0%, #e0e7ff 100%)";
  const chipColor = isGoodMenu ? "success" : "error";
  const avatarColor = isGoodMenu ? theme.palette.success.main : theme.palette.error.main;

  const toggleNutrition = (dishId) => {
    setOpenNutrition((prev) => ({ ...prev, [dishId]: !prev[dishId] }));
  };
  const toggleIngredients = (dishId) => {
    setOpenIngredients((prev) => ({ ...prev, [dishId]: !prev[dishId] }));
  };


  const handleToggleLang = async (dish) => {
  const recipe_id = dish.recipe_id;
  const currentLang = dishLang[recipe_id] || "en";
  if (currentLang === "en") {
    setTranslating((prev) => ({ ...prev, [recipe_id]: true }));
    try {
      if (!viNames[recipe_id]) {
        const viName = await translateText(dish.name, "vi");
        setViNames((prev) => ({ ...prev, [recipe_id]: viName }));
      }
      if (!viIngredients[recipe_id]) {
        const viIng = await translateText(dish.ingredients, "vi");
        setViIngredients((prev) => ({ ...prev, [recipe_id]: viIng }));
      }
      setDishLang((prev) => ({ ...prev, [recipe_id]: "vi" }));
    } catch (err) {
      alert("Lỗi dịch tự động: " + err.message);
    }
    setTranslating((prev) => ({ ...prev, [recipe_id]: false }));
  } else {
    setDishLang((prev) => ({ ...prev, [recipe_id]: "en" }));
  }
};

function getCurrentAnalysis() {
  if (isShowRecommended) {
    return {
      ...recommendations,
      meals_user: recommendations.meals_recommended,
      macro_targets_user: recommendations.macro_targets_recommended,
      micronutrients_user: recommendations.micronutrients_recommended,
      micronutrient_targets_user: recommendations.micronutrient_targets_recommended,
      meals_total_kcal_user: recommendations.meals_total_kcal_recommended,
      actual_macro_targets_user: recommendations.actual_macro_targets_recommended,
      tdee_user: recommendations.tdee_recommended,
      user_message: recommendations.recommended_message,
    };
  } else {
    return { ...recommendations };
  }
}


 const handleSaveMenu = async (menuDate) => {
  const token = getToken();
  if (!token) {
    setSnackbar({ open: true, message: "Cần đăng nhập để lưu thực đơn!", severity: "warning" });
    return;
  }
  setSaveLoading(true);
  try {
    const menuMeals = meals || [];
    const saveMeals = menuMeals.flatMap(meal =>
      meal.dishes.map(dish => ({
        meal_type: meal.meal,
        recipe_id: dish.recipe_id,
        quantity: dish.quantity || 1,
      }))
    );
    const analysis = getCurrentAnalysis();
    await saveMenu(menuDate, saveMeals, analysis);
    setSnackbar({
  open: true,
  message: menuDate === new Date().toISOString().slice(0, 10)
    ? "Đã lưu thực đơn cho hôm nay!"
    : "Đã lưu thực đơn cho ngày mai!",
  severity: "success"
});
  } catch (e) {
    alert("Lưu thực đơn thất bại: " + e.message);
  }
  setSaveLoading(false);
};

  return (
     <React.Fragment>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000} 
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} 
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    <Fade in timeout={500}>
      
      <Box>
        <Card sx={{ mb: 3, background: cardBg, boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: avatarColor, width: 64, height: 64, fontSize: 28, boxShadow: 2 }}>
                <RestaurantIcon fontSize="inherit" />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                  BMI: {recommendations.bmi} ({translateBMICategory(recommendations.bmi_category)})
                </Typography>
                <Typography variant="body1" color="secondary">{message}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <b>TDEE lựa chọn:</b> {recommendations.tdee_user} kcal/ngày
                  {recommendations.show_recommended && (
                    <>
                      {" | "}
                      <b>TDEE khuyến nghị:</b> {recommendations.tdee_recommended} kcal/ngày
                    </>
                  )}
                </Typography>
                <Chip
                  label={`Tổng năng lượng: ${mealsTotalKcal} kcal`}
                  color={chipColor}
                  sx={{ mt: 1, fontWeight: 700, fontSize: 16 }}
                  icon={<LocalDiningIcon />}
                  variant="outlined"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
        {macroTargets && (
          <Card sx={{ mb: 3, background: "linear-gradient(120deg, #e0f7fa 0%, #fffde7 100%)", borderRadius: 3, boxShadow: 2, p: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} color="primary" mb={1}>
                Phân bổ năng lượng theo ngày:
              </Typography>
              <MacroPieChart
                macroTargets={macroTargets}
                microTotals={isShowRecommended ? recommendations.micronutrients_recommended : recommendations.micronutrients_user}
                microTargets={isShowRecommended ? recommendations.micronutrient_targets_recommended : recommendations.micronutrient_targets_user}
              />
              
            </CardContent>
          </Card>
        )}
        {recommendations.show_recommended && (
          <Box mb={2}>
            <Button
              variant="outlined"
              color={isShowRecommended ? "error" : "success"}
              onClick={onToggleMenuType}
            >
              {isShowRecommended
                ? "Xem menu KHÔNG khuyến nghị (theo chỉ số bạn chọn)"
                : "Xem menu KHUYẾN NGHỊ (theo chỉ số BMI)"}
            </Button>
          </Box>
        )}

        <Box>
          {meals && meals.map((meal, idx) => (
            <Fade in key={meal.meal} timeout={400 + idx * 100}>
              <Paper
                elevation={3}
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  background: getMealBg(idx),
                  p: 3,
                  boxShadow: 8,
                  overflow: "hidden",
                }}
              >
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: theme.palette.primary.light,
                      boxShadow: 2,
                      mr: 2,
                    }}
                  >
                    <LocalDiningIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="primary" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                      {meal.meal}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mục tiêu: {meal.meal_kcal_target} kcal
                    </Typography>
                    {meal.meal_macros_target && (
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <Chip label={`P: ${meal.meal_macros_target.protein_g}g`} color="primary" size="small" sx={{ fontSize: 13 }} />
                        <Chip label={`F: ${meal.meal_macros_target.fat_g}g`} color="secondary" size="small" sx={{ fontSize: 13 }} />
                        <Chip label={`C: ${meal.meal_macros_target.carb_g}g`} color="success" size="small" sx={{ fontSize: 13 }} />
                      </Stack>
                    )}
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (meal.meal_total_kcal / meal.meal_kcal_target) * 100)}
                  sx={{
                    my: 2,
                    height: 8,
                    borderRadius: 2,
                    background: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      background: meal.meal_total_kcal > meal.meal_kcal_target
                        ? theme.palette.error.main
                        : theme.palette.success.main,
                    },
                  }}
                />
                <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 3, boxShadow: "0 2px 8px #0001" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: "linear-gradient(90deg, #dbeafe 0%, #f1f5f9 100%)" }}>
                        <TableCell sx={{ fontWeight: 600, minWidth: 110 }}>Tên món</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 64 }}>Ảnh</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 60 }}>Calories/SL</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 38 }}>SL</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 90 }}>Tổng Calories</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 120 }}>Thành phần dinh dưỡng</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 120 }}>Nguyên liệu</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {meal.dishes.map((dish) => {
                        const lang = dishLang[dish.recipe_id] || "en";
                        return (
                          <React.Fragment key={dish.recipe_id}>
                            <TableRow
                              sx={{
                                backgroundColor: "#f8fafc",
                                transition: "background 0.3s",
                                "&:hover": { backgroundColor: "#e3f6fd" },
                              }}
                            >
                              <TableCell sx={{ fontWeight: 500 }}>
                                {lang === "vi"
                                  ? (viNames[dish.recipe_id] || dish.name)
                                  : dish.name}
                                <Tooltip title={lang === "vi" ? "Xem tiếng Anh" : "Dịch sang Tiếng Việt"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleToggleLang(dish)}
                                    disabled={!!translating[dish.recipe_id]}
                                    sx={{ ml: 0.5 }}
                                  >
                                    <GTranslateIcon fontSize="inherit" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Avatar
                                  src={dish.image_url}
                                  variant="rounded"
                                  alt={dish.name}
                                  sx={{
                                    width: 44, height: 44, boxShadow: 2,
                                    transition: "transform 0.2s",
                                    "&:hover": { transform: "scale(1.1)" }
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">{dish.calories}</TableCell>
                              <TableCell align="center">{dish.quantity}</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 700 }}>{dish.total_kcal}</TableCell>
                              <TableCell align="center">
                                <IconButton size="small" onClick={() => toggleNutrition(dish.recipe_id)}>
                                  {openNutrition[dish.recipe_id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton size="small" onClick={() => toggleIngredients(dish.recipe_id)}>
                                  {openIngredients[dish.recipe_id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                </IconButton>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                <Collapse in={openNutrition[dish.recipe_id]} timeout="auto" unmountOnExit>
                                  <Box margin={1} sx={{ background: "#ecf6f7", borderRadius: 2, p: 1.5 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                      <Chip label={`Protein: ${dish.protein ?? 0}g`} color="primary" size="small" />
                                      <Chip label={`Béo: ${dish.fat ?? 0}g`} color="secondary" size="small" />
                                      <Chip label={`Carb: ${dish.carbs ?? 0}g`} color="success" size="small" />
                                      <Chip label={`Cholesterol: ${dish.cholesterol ?? 0}mg`} sx={{ bgcolor: "#d7263d", color: "#fff" }} size="small" />
                                      <Chip label={`Natri: ${(dish.sodium ?? 0) * 10}mg`} sx={{ bgcolor: "#f7b801" }} size="small" />
                                      <Chip label={`Chất xơ: ${dish.fiber ?? 0}g`} sx={{ bgcolor: "#1f8a70", color: "#fff" }} size="small" />
                                    </Stack>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                <Collapse in={openIngredients[dish.recipe_id]} timeout="auto" unmountOnExit>
                                  <Box margin={1} sx={{ background: "#fcf5e7", borderRadius: 2, p: 1.5 }}>
                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                      {lang === "vi"
                                        ? (viIngredients[dish.recipe_id] || dish.ingredients)
                                        : dish.ingredients}
                                    </Typography>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                      <TableRow>
                        <TableCell colSpan={6} align="right" sx={{ fontWeight: 700 }}>
                          Tổng năng lượng bữa này
                        </TableCell>
                        <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                          {meal.meal_total_kcal} kcal
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Fade>
          ))}
        </Box>
        <Divider sx={{ my: 3 }} />

        

        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mt: 2 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
    
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                size="large"
                sx={{ borderRadius: 3, boxShadow: 2 }}
                onClick={() => handleSaveMenu(new Date().toISOString().slice(0, 10))}
                disabled={!recommendations || saveLoading}
              >
                Lưu thực đơn cho hôm nay
              </Button>
    
    
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                size="large"
                sx={{ borderRadius: 3, boxShadow: 2 }}
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  handleSaveMenu(tomorrow.toISOString().slice(0, 10));
                }}
                disabled={!recommendations || saveLoading}
              >
                Lưu thực đơn cho ngày mai
              </Button>
    
            {typeof onRegenerateMenu === "function" && (
              <Tooltip title="Tạo lại thực đơn với thông số cũ">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AutorenewIcon />}
                  size="large"
                  sx={{ borderRadius: 3 }}
                  onClick={() => {
                  if (lastMenuParams) {
                      onRegenerateMenu(lastMenuParams, true);
                    }
                  }}
                  disabled={isLoadingMenu || !lastMenuParams}
                >
                  Tạo lại
                </Button>
              </Tooltip>
            )}
          </Stack>
        </Paper>
      </Box>
    </Fade>
    </React.Fragment> 
  );
}