import React, { useState } from "react";
import {
  Box, Typography, Card, CardContent, Stack, Chip, Avatar, Button, Divider, Fade, Paper,
  LinearProgress, Tooltip, IconButton, useTheme, Popover, Grid, Dialog, CardMedia
} from "@mui/material";
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import GTranslateIcon from '@mui/icons-material/GTranslate'; 
import MacroPieChart from "./MacroPieChart";
import { SaveAs as SaveIcon} from "@mui/icons-material"; 
import { translateText } from '../utils/translate';
import { saveMenu } from "../api/userMenus";
import { Snackbar, Alert } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import backgroundImage from '../images/food1.jpg';
import { keyframes } from '@mui/system';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'; 
import SpaIcon from '@mui/icons-material/Spa'; 
import MenuBookIcon from '@mui/icons-material/MenuBook'; 
import SpeedIcon from '@mui/icons-material/Speed'; 
import ScaleIcon from '@mui/icons-material/Scale'; 

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
  const [dishLang, setDishLang] = useState({}); 
  const [viNames, setViNames] = useState({});
  const [viIngredients, setViIngredients] = useState({});
  const [translating, setTranslating] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [detailDish, setDetailDish] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const bmiColor =
    recommendations.bmi >= 18.5 && recommendations.bmi <= 22.9 ? theme.palette.success.main : theme.palette.error.main;

  const [bmiInfoAnchorEl, setBmiInfoAnchorEl] = React.useState(null);
  const handleOpenBmiInfo = (event) => setBmiInfoAnchorEl(event.currentTarget);
  const handleCloseBmiInfo = () => setBmiInfoAnchorEl(null);
  const openBmiInfo = Boolean(bmiInfoAnchorEl);
  const bmiInfoId = openBmiInfo ? 'bmi-info-popover' : undefined;

  const [tdeeInfoAnchorEl, setTdeeInfoAnchorEl] = React.useState(null);
  const handleOpenTdeeInfo = (event) => setTdeeInfoAnchorEl(event.currentTarget);
  const handleCloseTdeeInfo = () => setTdeeInfoAnchorEl(null);
  const openTdeeInfo = Boolean(tdeeInfoAnchorEl);
  const tdeeInfoId = openTdeeInfo ? 'tdee-info-popover' : undefined;

  if (!recommendations) return null;

  const isShowRecommended = recommendations.show_recommended && showRecommendedMenu;

  const currentAnalysisDataForSaving = {
    bmi: recommendations.bmi,
    bmi_category: recommendations.bmi_category,
    user_message: isShowRecommended ? recommendations.recommended_message : recommendations.user_message,
    tdee_user: recommendations.tdee_user, // TDEE người dùng chọn luôn có
    tdee_recommended: isShowRecommended ? recommendations.tdee_recommended : null, // Chỉ có nếu đang xem menu khuyến nghị
    meals_total_kcal: isShowRecommended ? recommendations.meals_total_kcal_recommended : recommendations.meals_total_kcal_user,
    macro_targets: isShowRecommended ? recommendations.macro_targets_recommended : recommendations.macro_targets_user,
    micronutrients: isShowRecommended ? recommendations.micronutrients_recommended : recommendations.micronutrients_user,
    micronutrient_targets: isShowRecommended ? recommendations.micronutrient_targets_recommended : recommendations.micronutrient_targets_user,
    // Quan trọng: meals cũng phải lấy từ đúng nguồn
    meals: isShowRecommended ? recommendations.meals_recommended : recommendations.meals_user,
    // Thêm các trường cần thiết khác mà hàm saveMenu hoặc backend của bạn cần
    // Ví dụ:
    // goal_type: recommendations.goal_type, // (Nếu có)
    // activity_level: recommendations.activity_level, // (Nếu có)
    show_recommended_when_saved: isShowRecommended, // Lưu lại trạng thái này để biết menu gốc là gì
  };

  const meals = isShowRecommended
    ? recommendations.meals_recommended
    : recommendations.meals_user;

  const macroTargets = isShowRecommended
    ? recommendations.macro_targets_recommended
    : recommendations.macro_targets_user;

  const mealsTotalKcal = isShowRecommended
    ? recommendations.meals_total_kcal_recommended
    : recommendations.meals_total_kcal_user;

  const tdeeUser = recommendations.tdee_user;
  const tdeeRecommended = recommendations.tdee_recommended;

  const message = isShowRecommended
    ? recommendations.recommended_message
    : recommendations.user_message;

  const chipColor = isShowRecommended || recommendations.user_choice_recommended ? "success" : "error";

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

  const getToken = () => localStorage.getItem('token');

  const handleSaveMenu = async (menuDate) => {
    const token = getToken();
    if (!token) {
      setSnackbar({ open: true, message: "Cần đăng nhập để lưu thực đơn!", severity: "warning" });
      return;
    }
    setSaveLoading(true);
    try {
      const menuMealsToSave = isShowRecommended ? recommendations.meals_recommended : recommendations.meals_user;

      if (!menuMealsToSave || menuMealsToSave.length === 0) {
          setSnackbar({ open: true, message: "Không có món ăn nào để lưu.", severity: "error" });
          setSaveLoading(false);
          return;
      }

      const saveMealsPayload = menuMealsToSave.flatMap(meal =>
        meal.dishes.map(dish => ({
          meal_type: meal.meal,
          recipe_id: dish.recipe_id,
          quantity: dish.quantity || 1,
        }))
      )
      await saveMenu(menuDate, saveMealsPayload, currentAnalysisDataForSaving);
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
                        {recommendations.bmi >= 18.5 && recommendations.bmi <= 22.9 ? "✔️" : "⚠️"}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h5" fontWeight={700} color="#323232" mb={0.5} fontFamily="Roboto slab" >
                          Chỉ số BMI
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
                            {recommendations.bmi}
                          </Typography>
                          <Chip
                            label={translateBMICategory(recommendations.bmi_category)}
                            color={recommendations.bmi >= 18.5 && recommendations.bmi <= 22.9 ? 'success' : 'error'}
                            size="small"
                            sx={{ ml: 1, fontWeight: 600 }}
                            icon={<InfoOutlinedIcon />}
                          />
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(0, ((recommendations.bmi - 15) / (35 - 15)) * 100))}
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
                          {isShowRecommended && tdeeRecommended && (
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

          {/* Modern grid of dish cards */}
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
                  <Box display="flex" alignItems="center" mb={2}>
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
                      
                      <Typography variant="h6" fontWeight={700} sx={{color:"#323232", letterSpacing: 0.5 }}>
                        {meal.meal} -  Mục tiêu: {meal.meal_kcal_target} calo
                        {meal.meal_macros_target && (
                        <Stack direction="row" spacing={1} mt={0.5}>
                          <Chip label={`P: ${meal.meal_macros_target.protein_g}g`}  size="small" sx={{ bgcolor: "#6366f1", color: "#fff" }} />
                          <Chip label={`F: ${meal.meal_macros_target.fat_g}g`}  size="small" sx={{ bgcolor: "#f59e42", color: "#fff" }} />
                          <Chip label={`C: ${meal.meal_macros_target.carb_g}g`}  size="small" sx={{ bgcolor: "#22d3ee", color: "#fff" }} />
                        </Stack>
                      )}
                      </Typography>
                     
                      
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
                  <Grid container spacing={3} >
                    {meal.dishes.map((dish) => {
                      const lang = dishLang[dish.recipe_id] || "en";
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={dish.recipe_id}>
                          <Card
                            sx={{
                              borderRadius: {xs:3, sm:4}, 
                              boxShadow: {xs:3, sm:6},
                              cursor: "pointer",
                              height: "100%",
                              pt: 5, 
                              background: "linear-gradient(to bottom, rgba(255,255,255,0.90) 0%, #fff 100%)",
                              position: "relative", 
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center", 
                              transition: "0.2s",
                              "&:hover": { boxShadow: 12, transform: "translateY(-4px)" }
                            }}
                            onClick={() => setDetailDish(dish)}
                          >
                            <Box
                              sx={{
                                position: "relative", 
                                width: "calc(100% - 32px)", 
                                margin: "0 auto",
                                mt: theme.spacing(-4),
                                mb: theme.spacing(1.5),
                                zIndex: 2,
                                borderRadius: 3, 
                                boxShadow: "0 8px 24px 0 rgba(0,0,0,0.1), 0 3px 10px rgba(0,0,0,0.08)", 
                                border: "4px solid #fff", 
                                overflow: "hidden", 
                                background: "#fff",
                                aspectRatio: '1 / 1',
                              }}
                            >
                              <CardMedia
                                component="img"
                                image={dish.image_url || 'https://via.placeholder.com/300?text=No+Image'}
                                alt={dish.name}
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover", 
                                  display: "block",
                                }}
                              />
                              <Box sx={{
                                position: 'absolute',
                                top: theme.spacing(0.8),
                                left: theme.spacing(0.8),
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                zIndex: 3
                              }}>
                                <Box sx={{
                                  px: 1, py: 0.3, borderRadius: '10px',
                                  bgcolor: "rgba(0,0,0,0.55)",
                                  backdropFilter: "blur(2px)",
                                  fontWeight: 600, fontSize: {xs:9, sm:10},
                                  color: "#fff"
                                }}>
                                  {dish.calories} cal
                                </Box>
                                {dish.quantity && (
                                  <Box sx={{
                                    px: 1, py: 0.3, borderRadius: '10px',
                                    bgcolor: "rgba(0,0,0,0.55)",
                                    backdropFilter: "blur(2px)",
                                    fontWeight: 600, fontSize: {xs:9, sm:10},
                                    color: "#fff"
                                  }}>
                                    SL: {dish.quantity}
                                  </Box>
                                )}
                              </Box>
                            </Box> 

                            <CardContent sx={{
                              p: {xs: 1, sm: 1.5},
                              pt: 0, 
                              flexGrow: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              textAlign: 'center',
                              mt: -3, 
                              
                            }}>
                              <Typography variant="subtitle1" fontWeight={700} align="center" sx={{ mb: 0.5, fontSize: {xs: '0.9rem', sm: '1rem'}, lineHeight: 1.3 }}>
                                {lang === "vi"
                                  ? (viNames[dish.recipe_id] || dish.name)
                                  : dish.name}
                              </Typography>
                              <Typography align="center" sx={{ color: "#00897b",mb: -2, fontWeight: 600, fontSize: {xs: '0.8rem', sm: '0.9rem'} }}>
                                Tổng calo: {dish.total_kcal}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography align="right" fontWeight={700} mt={2}>
                    Tổng năng lượng bữa này: {meal.meal_total_kcal} calo
                  </Typography>
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
      {/* --- DETAILS DIALOG --- */}
      <Dialog
        open={!!detailDish}
        onClose={() => setDetailDish(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'transparent',
            borderRadius: {xs: 2, sm: 3},
            overflow: 'hidden'
          }
        }}
      >
        {detailDish && (
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: 340,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(240, 243, 255, 0.8) 100%)',
                zIndex: 1,
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                p: { xs: 1.5, sm: 2.5 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                minHeight: 320, 
                backdropFilter: 'blur(10px)',
                borderRadius: 'inherit',
              }}
            >
              <Box
                sx={{
                  flex: 0.6, 
                  minWidth: { xs: "100%", sm: 150 }, 
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRight: { sm: `1px solid ${theme.palette.divider}`, xs: "none" },
                  pb: { xs: 1.5, sm: 0 },
                  pr: { sm: 2, xs: 0 },
                  mr: { sm: 2, xs: 0 },
                }}
              >
                <Box
                  sx={{
                    width: "100%", 
                    minWidth: 150,
                    maxWidth: 250, 
                    borderRadius: 3,
                    boxShadow: "0 8px 30px 0 rgba(180, 213, 252, 0.3), 0 2px 6px rgba(0,0,0,0.08)",
                    border: "3px solid #fff", 
                    overflow: "hidden",
                    background: "#fff",
                    ml: 0,
                    
                  }}
                >
                  <CardMedia
                    component="img"
                    image={detailDish.image_url}
                    alt={detailDish.name}
                    sx={{
                      width: "100%",
                      height: { xs: 140, sm: 225 }, 
                      objectFit: "cover"
                    }}
                  />
                </Box>
                <Typography
                  variant="h6" 
                  fontWeight={700}
                  align="center"
                  sx={{
                    color: "text.primary",
                    letterSpacing: 0.1,
                    fontFamily: "'Roboto Slab', serif",
                    mb: 0.5
                  }}
                >
                  {dishLang[detailDish.recipe_id] === "vi"
                    ? (viNames[detailDish.recipe_id] || detailDish.name)
                    : detailDish.name}
                </Typography>
                <Box
                  sx={{
                    mt: 0.5,
                    px: 1.5, 
                    py: 0.6,
                    borderRadius: 2,
                    bgcolor: "rgba(44, 176, 109, 0.1)",
                    fontWeight: 600,
                    color: "#26a69a",
                    fontSize: 14, 
                    boxShadow: "0 1px 4px rgba(162, 229, 227, 0.3)",
                    display: "inline-block"
                  }}
                >
                  Tổng calo: {detailDish.total_kcal}
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1.2, 
                  display: "flex",
                  flexDirection: "column",
                  minWidth: {xs: '100%', sm: 280},
                  pl: { sm: 2, xs: 0 },
                  pt: { xs: 1.5, sm: 0 },
                  gap: 1.5, 
                }}
              >
                <Box>
                  <Typography
                    variant="caption" 
                    fontWeight={700}
                    display="block" 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: "primary.dark",
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                      fontSize: {xs: 11, sm: 14},
                      mb: 0.5, 
                    }}
                  >
                    <LocalFireDepartmentIcon sx={{ mr: 0.5, fontSize: {xs: 18, sm: 20} }} />
                    Năng lượng
                  </Typography>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                     <Chip
                        icon={<SpeedIcon sx={{fontSize: 24, color: "#1976d2 !important"}}/>}
                        label={`${detailDish.calories} Calories`}
                        variant="outlined"
                        size="small"
                        sx={{
                            borderColor: "rgba(33, 150, 243, 0.3)",
                            color: "#1976d2",
                            bgcolor: "rgba(33, 150, 243, 0.05)",
                            fontWeight: 600,
                            fontSize: {xs: 11, sm: 14},
                            '.MuiChip-icon': { color: "#1976d2" }
                        }}
                    />
                    <Chip
                        icon={<ScaleIcon sx={{fontSize: 24, color: "#3D8D7A !important"}}/>}
                        label={`Số lượng: ${detailDish.quantity}`}
                        variant="outlined"
                        size="small"
                        sx={{
                            borderColor: "rgba(61,141,122,0.3)",
                            color: "#3D8D7A",
                            bgcolor: "rgba(255,193,7,0.05)",
                            fontWeight: 600,
                            fontSize: {xs: 11, sm: 14},
                            '.MuiChip-icon': { color: "#f9a825" }
                        }}
                    />
                  </Stack>
                </Box>

                <Divider sx={{ my: 0.8 }} />

                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    display="block"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: "success.dark",
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                      fontSize: {xs: 11, sm: 14},
                      mb: 0.5,
                    }}
                  >
                    <SpaIcon sx={{ mr: 0.5, fontSize: {xs: 18, sm: 20} }} />
                    Thành phần dinh dưỡng
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {[
                      { label: "Protein", value: detailDish.protein, unit: "g", color: "#6366f1" },
                      { label: "Béo", value: detailDish.fat, unit: "g", color: "#f59e42" },
                      { label: "Carb", value: detailDish.carbs, unit: "g", color: "#22d3ee" },
                      { label: "Cholesterol", value: detailDish.cholesterol, unit: "mg", color: "#d7263d" },
                      { label: "Natri", value: detailDish.sodium, unit: "mg", color: "#f7b801" },
                      { label: "Chất xơ", value: detailDish.fiber, unit: "g", color: "#1f8a70" },
                    ].map((item) => (
                      (item.value !== null && typeof item.value !== 'undefined') && (
                        <Chip
                          key={item.label}
                          label={`${item.label}: ${item.value ?? 0}${item.unit}`}
                          size="small"
                          sx={{
                            bgcolor: item.color,
                            color: "#fff",
                            fontWeight: 500,
                            fontSize: {xs: 10, sm: 11}, 
                            height: '22px', 
                            borderRadius: '10px',
                            boxShadow: `0 1px 3px 0 ${item.color}33`,
                            '& .MuiChip-label': {
                              overflow: 'visible',
                              lineHeight: '1.2' 
                            }
                          }}
                        />
                      )
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 0.8 }} />

                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    display="block"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                      fontSize: {xs: 11, sm: 14},
                      mb: 0.5,
                    }}
                  >
                    <MenuBookIcon sx={{ mr: 0.5, fontSize: {xs: 18, sm: 20} }} />
                    Nguyên liệu
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5, 
                      minHeight: 60, 
                      maxHeight: 120, 
                      overflow: "auto",
                      background: "rgba(238, 249, 250, 0.2)",
                      borderColor: 'rgba(0,0,0,0.08)',
                      borderRadius: 1.5, 
                      fontSize: {xs: 12, sm: 13},
                      color: "text.primary",
                      '&::-webkit-scrollbar': {
                        width: '5px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'rgba(0,0,0,0.02)',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.1)',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "text.secondary", lineHeight: 1.5, fontSize: 'inherit' }}>
                      {dishLang[detailDish.recipe_id] === "vi"
                        ? (viIngredients[detailDish.recipe_id] || detailDish.ingredients)
                        : detailDish.ingredients}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </React.Fragment>
  );
}