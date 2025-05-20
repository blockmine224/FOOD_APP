import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, Stack, Chip, Avatar, Button, Divider, Fade, Paper,
  Table, TableContainer, TableBody, TableCell, TableHead, TableRow, LinearProgress, Tooltip, IconButton, Collapse, useTheme, Popover, Grid
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import backgroundImage from '../images/food1.jpg';
import { keyframes } from '@mui/system';
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

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
  const bmiColor =
    recommendations.bmi >= 18.5 && recommendations.bmi <= 22.9 ? theme.palette.success.main : theme.palette.error.main;

  const [openHowItWorksDialog, setOpenHowItWorksDialog] = useState(false);

  const getToken = () => localStorage.getItem('token');
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [bmiInfoAnchorEl, setBmiInfoAnchorEl] = React.useState(null);
  const handleOpenBmiInfo = (event) => {
    setBmiInfoAnchorEl(event.currentTarget);
  };
  const handleCloseBmiInfo = () => {
    setBmiInfoAnchorEl(null);
  };
  const openBmiInfo = Boolean(bmiInfoAnchorEl);
  const bmiInfoId = openBmiInfo ? 'bmi-info-popover' : undefined;

  const [tdeeInfoAnchorEl, setTdeeInfoAnchorEl] = React.useState(null);
  const handleOpenTdeeInfo = (event) => {
    setTdeeInfoAnchorEl(event.currentTarget);
  };
  const handleCloseTdeeInfo = () => {
    setTdeeInfoAnchorEl(null);
  };
  const openTdeeInfo = Boolean(tdeeInfoAnchorEl);
  const tdeeInfoId = openTdeeInfo ? 'tdee-info-popover' : undefined;


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
    : `Đã lưu thực đơn cho ngày ${menuDate.split('-').reverse().join('/')}!`,
  severity: "success"
});
  } catch (e) {
    setSnackbar({ open: true, message: "Lưu thực đơn thất bại: " + e.message, severity: "error" });
  }
  setSaveLoading(false);
};

  const bmiVal = recommendations.bmi;
  const bmiMin = 15, bmiMax = 35; 
  const bmiNormMin = 18.5, bmiNormMax = 22.9;
  const tdeeUser = recommendations.tdee_user;
  const tdeeRecommended = recommendations.tdee_recommended;

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
        <Card
          sx={{
            mb: 3,
            background: `linear-gradient(rgba(255,255,255,0.6),rgba(255,255,255,0.6)), url(${backgroundImage}) center/cover no-repeat`,
            boxShadow: 4,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent>
            <Grid container spacing={2} alignItems="stretch">
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: 1,
                    height: "100%"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: bmiColor, width: 52, height: 52, fontSize: 24 }}>
                      {bmiVal >= bmiNormMin && bmiVal <= bmiNormMax ? "✔️" : "⚠️"}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h5" fontWeight={700} color="#323232" mb={0.5} fontFamily="Roboto slab" >Chỉ số BMI
                        <Tooltip arrow title="Giải thích BMI" placement="top">
                          <IconButton
                            aria-describedby={bmiInfoId}
                              size="small"
                              onClick={handleOpenBmiInfo}
                              sx={{
                                ml: 1,
                                color: "#00A9FE",
                                animation: `${pulse} 2s infinite ease-in-out`
                              }}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                      
                      <Stack direction="row" alignItems="center">
                        
                        <Typography variant="h4" fontWeight={700} sx={{ color: bmiColor }}>
                          {bmiVal}
                        </Typography>
                        <Chip
                          label={translateBMICategory(recommendations.bmi_category)}
                          color={bmiVal >= bmiNormMin && bmiVal <= bmiNormMax ? 'success' : 'error'}
                          size="small"
                          sx={{ ml: 1, fontWeight: 600 }}
                          icon={<InfoOutlinedIcon />}
                        />
                        
                      </Stack>
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, ((bmiVal - bmiMin) / (bmiMax - bmiMin)) * 100))}
                          sx={{
                            height: 12,
                            borderRadius: 2,
                            background: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              background: bmiColor,
                            },
                          }}
                        />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption">15</Typography>
                          <Typography variant="caption" color="success.main">Bình thường</Typography>
                          <Typography variant="caption">35</Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </Stack>
                  <Popover
                    id={bmiInfoId}
                    open={openBmiInfo}
                    anchorEl={bmiInfoAnchorEl}
                    onClose={handleCloseBmiInfo}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    PaperProps={{
                      elevation: 3,
                      sx: { borderRadius: 2 }
                    }}
                  >
                    <Box sx={{ p: 2, maxWidth: 500 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                        BMI là gì?
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>BMI (Body Mass Index)</strong> là Chỉ số Khối Cơ thể, được tính bằng cách chia cân nặng (kg) cho bình phương chiều cao (mét).
                      </Typography>
                      <Typography variant="body2" paragraph>
                        BMI giúp đánh giá sơ bộ liệu một người có cân nặng bình thường, thiếu cân, thừa cân hay béo phì.
                      </Typography>
                      <Typography variant="caption" component="p" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}>
                        Lưu ý: BMI không phân biệt khối lượng cơ và mỡ, nên có thể không hoàn toàn chính xác với vận động viên hoặc người có nhiều cơ bắp.
                      </Typography>
                    </Box>
                  </Popover>
                  <Typography variant="subtitle1" sx={{ color: bmiColor, fontWeight: 500, mt: 1 }}>
                    {message}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: 1,
                    height: "100%"
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: "#4A628A", width: 52, height: 52 }}>
                      <LocalDiningIcon color="#fff" fontSize="large" />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h5" fontWeight={700} color="#323232" mb={0.5} fontFamily="Roboto slab">
                        Tổng năng lượng tiêu hao (TDEE)

                        <Tooltip arrow title="Giải thích TDEE" placement="top">
                          <IconButton
                            aria-describedby={tdeeInfoId}
                              size="small"
                              onClick={handleOpenTdeeInfo}
                              sx={{
                                ml: 1,
                                color: "#00A9FE",
                                animation: `${pulse} 2s infinite ease-in-out`
                              }}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={`TDEE lựa chọn: ${tdeeUser} calo`}
                          color="info"
                          sx={{ fontWeight: 600, fontSize: 15 }}
                        />
                        {recommendations.show_recommended && (
                          <Chip
                            label={`TDEE khuyến nghị: ${tdeeRecommended} calo`}
                            color="success"
                            sx={{ fontWeight: 600, fontSize: 15 }}
                          />
                        )}
                        
                      </Stack>
                      <Chip
                        label={`Tổng năng lượng thực đơn: ${mealsTotalKcal} calo`}
                        color={chipColor}
                        sx={{ mt: 2, fontWeight: 700, fontSize: 16 }}
                        icon={<LocalDiningIcon />}
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                  <Popover
                    id={tdeeInfoId}
                    open={openTdeeInfo}
                    anchorEl={tdeeInfoAnchorEl}
                    onClose={handleCloseTdeeInfo}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    PaperProps={{
                      elevation: 3,
                      sx: { borderRadius: 2 }
                    }}
                  >
                    <Box sx={{ p: 2, maxWidth: 600 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                        TDEE là gì?
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>TDEE (Total Daily Energy Expenditure)</strong> là Tổng Năng lượng Tiêu thụ Hàng ngày, tức là tổng lượng calo cơ thể bạn đốt cháy trong một ngày.
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Biết TDEE giúp bạn xác định lượng calo cần nạp để duy trì, giảm hoặc tăng cân hiệu quả.
                      </Typography>
                      <Typography variant="caption" component="p" sx={{ fontStyle: 'italic', color: theme.palette.text.secondary }}>
                        <b>TDEE lựa chọn:</b> Mức TDEE bạn cung cấp hoặc hệ thống tính dựa trên thông tin (cân nặng, chiều cao, tuổi, mức độ hoạt động) của bạn.
                        <br />
                        <b> TDEE khuyến nghị:</b> Mức TDEE mà hệ thống gợi ý để bạn có thể đạt được mục tiêu sức khỏe tốt hơn, đặc biệt nếu BMI hiện tại của bạn chưa ở mức tối ưu.
                      </Typography>
                    </Box>
                  </Popover>
                  
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Lưu ý: 
                    <br />Các món ăn không được chú thích sẽ mặc định là 100g
                    <br />Thực đơn này chỉ mang tính tham khảo, bạn có thể cần bổ sung thêm món ăn và tích hợp lời khuyên từ chuyên gia.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {macroTargets && (
          <Card sx={{ mb: 3, background: "linear-gradient(120deg, #e0f7fa 0%, #fffde7 100%)", borderRadius: 3, boxShadow: 2, p: 2 }}>
            <CardContent>
              
              <MacroPieChart
                macroTargets={macroTargets}
                microTotals={isShowRecommended ? recommendations.micronutrients_recommended : recommendations.micronutrients_user}
                microTargets={isShowRecommended ? recommendations.micronutrient_targets_recommended : recommendations.micronutrient_targets_user}
              />
              
            </CardContent>
          </Card>
        )}
        <Button
          onClick={onToggleMenuType}
          variant="contained"
          color={isShowRecommended ? 'error' : 'success'}
          
          sx={{
            display: 'block',
            borderRadius: '20px',
            px: 3,
            mx: "auto",
            py: 1,
            mb: 3,
            textTransform: 'none',
            fontWeight: '600',
            boxShadow: 3,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
            },
          }}
        >
          {isShowRecommended
            ? 'Xem menu KHÔNG khuyến nghị'
            : 'Xem menu KHUYẾN NGHỊ'}
        </Button>

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
                      Mục tiêu: {meal.meal_kcal_target} calo
                    </Typography>
                    {meal.meal_macros_target && (
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <Chip label={`P: ${meal.meal_macros_target.protein_g}g`}  size="small" sx={{ bgcolor: "#6366f1", color: "#fff" }} />
                        <Chip label={`F: ${meal.meal_macros_target.fat_g}g`}  size="small" sx={{ bgcolor: "#f59e42", color: "#fff" }} />
                        <Chip label={`C: ${meal.meal_macros_target.carb_g}g`}  size="small" sx={{ bgcolor: "#22d3ee", color: "#fff" }} />
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
                                      <Chip
                                        tabIndex={0}
                                        label={`Protein: ${dish.protein ?? 0}g`}
                                        sx={{ bgcolor: "#6366f1", color: "#fff" }}
                                        size="small"
                                      />
                                      <Chip
                                        tabIndex={0}
                                        label={`Béo: ${dish.fat ?? 0}g`}
                                        sx={{ bgcolor: "#f59e42", color: "#fff" }}
                                        size="small"
                                      />
                                      <Chip
                                        tabIndex={0}
                                        label={`Carb: ${dish.carbs ?? 0}g`}
                                        sx={{ bgcolor: "#22d3ee", color: "#fff" }}
                                        size="small"
                                      />
                                      <Chip
                                        tabIndex={0}
                                        label={`Cholesterol: ${dish.cholesterol ?? 0}mg`}
                                        sx={{ bgcolor: "#d7263d", color: "#fff" }}
                                        size="small"
                                      />
                                      <Chip
                                        tabIndex={0}
                                        label={`Natri: ${dish.sodium ?? 0}mg`}
                                        sx={{ bgcolor: "#f7b801", color: "#fff" }}
                                        size="small"
                                      />
                                      <Chip
                                        tabIndex={0}
                                        label={`Chất xơ: ${dish.fiber ?? 0}g`}
                                        sx={{ bgcolor: "#1f8a70", color: "#fff" }}
                                        size="small"
                                      />

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
                          {meal.meal_total_kcal} calo
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
          <Stack direction="row" spacing={2} justifyContent="flex-end" mb={3}>
            <Button
              onClick={() => handleSaveMenu(new Date().toISOString().slice(0, 10))}
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              size="large"
              disabled={!recommendations || saveLoading}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 400,
                boxShadow: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Lưu thực đơn cho hôm nay
            </Button>

            <Button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleSaveMenu(tomorrow.toISOString().slice(0, 10));
              }}
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              size="large"
              disabled={!recommendations || saveLoading}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 400,
                boxShadow: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Lưu thực đơn cho ngày mai
            </Button>

            {typeof onRegenerateMenu === 'function' && (
              <Tooltip title="Tạo lại thực đơn với thông số cũ" arrow>
                <Button
                  onClick={() => lastMenuParams && onRegenerateMenu(lastMenuParams, true)}
                  variant="outlined"
                  color="primary"
                  startIcon={<AutorenewIcon />}
                  size="large"
                  disabled={isLoadingMenu || !lastMenuParams}
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 400,
                    boxShadow: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                    },
                  }}
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