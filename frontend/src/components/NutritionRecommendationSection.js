import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Divider, Stack, Chip, Avatar, Button, Fade, Paper,
  LinearProgress, Tooltip, IconButton, useTheme, CircularProgress, Menu, MenuItem, Popover, Grid, CardMedia, Dialog
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MacroPieChart from './MacroPieChart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getMenus, deleteMenu } from '../api/userMenus';
import { translateText } from '../utils/translate';
import { useNotification } from "./NotificationProvider";
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

function getVNDayLabel(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
  } catch {
    return dateStr;
  }
}

export default function NutritionRecommendationSection({ translateBMICategory, token }) {
  const theme = useTheme();
  const [view, setView] = useState("today");
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [weekAnchorEl, setWeekAnchorEl] = useState(null);
  const [selectedWeekDate, setSelectedWeekDate] = useState(null);
  const { notify, confirmDialog } = useNotification();
  const [dishLang, setDishLang] = useState({});
  const [viNames, setViNames] = useState({});
  const [viIngredients, setViIngredients] = useState({});
  const [translating, setTranslating] = useState({});
  const [detailDish, setDetailDish] = useState(null);

  // --- BMI & TDEE Info Popovers ---
  const [bmiInfoAnchorEl, setBmiInfoAnchorEl] = useState(null);
  const [tdeeInfoAnchorEl, setTdeeInfoAnchorEl] = useState(null);

  const handleOpenBmiInfo = (event) => setBmiInfoAnchorEl(event.currentTarget);
  const handleCloseBmiInfo = () => setBmiInfoAnchorEl(null);
  const handleOpenTdeeInfo = (event) => setTdeeInfoAnchorEl(event.currentTarget);
  const handleCloseTdeeInfo = () => setTdeeInfoAnchorEl(null);

  const openBmiInfo = Boolean(bmiInfoAnchorEl);
  const bmiInfoId = openBmiInfo ? 'bmi-info-popover' : undefined;
  const openTdeeInfo = Boolean(tdeeInfoAnchorEl);
  const tdeeInfoId = openTdeeInfo ? 'tdee-info-popover' : undefined;

  const loadMenus = (rangeType) => {
    setLoading(true);
    setError('');
    getMenus(rangeType)
      .then((data) => {
        setMenus(data);
        if (data.length > 0) {
          setSelectedMenu(data[0]);
          if (rangeType === 'week') setSelectedWeekDate(data[0].menu_date);
        } else {
          setSelectedMenu(null);
          if (rangeType === 'week') setSelectedWeekDate(null);
        }
        setDishLang({});
        setViNames({});
        setViIngredients({});
        setTranslating({});
      })
      .catch(e => setError(e.message || 'Không thể tải thực đơn.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!token) return;
    loadMenus('today');
    setView('today');
  }, [token]);

  const handleView = (rangeType) => {
    setView(rangeType);
    loadMenus(rangeType);
    setWeekAnchorEl(null);
  };

  const handleDelete = (menuId) => {
    confirmDialog(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa thực đơn này?",
      async () => {
        setDeleteLoading(menuId);
        try {
          await deleteMenu(menuId);
          notify("Đã xóa thực đơn thành công!", "success");
          loadMenus(view);
        } catch (e) {
          notify("Xóa thực đơn thất bại!", "error");
        }
        setDeleteLoading(null);
      }
    );
  };

  const handleSelectMenu = (menu) => {
    setSelectedMenu(menu);
    setDishLang({});
    setViNames({});
    setViIngredients({});
    setTranslating({});
    if (view === 'week') setSelectedWeekDate(menu.menu_date);
  };

  const getAnalysis = (menu) => {
    if (!menu || !menu.analysis_json) return null;
    try {
      return JSON.parse(menu.analysis_json);
    } catch {
      return null;
    }
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

  const todayTab = (
    <Button
      variant={view === 'today' ? "contained" : "outlined"}
      color="primary"
      sx={{ minWidth: 120, borderRadius: 4, fontWeight: 700, fontSize: 16, textTransform: "none" }}
      onClick={() => handleView('today')}
      startIcon={<CalendarTodayIcon />}
    >
      Hôm nay
    </Button>
  );
  const tomorrowTab = (
    <Button
      variant={view === 'tomorrow' ? "contained" : "outlined"}
      color="primary"
      sx={{ minWidth: 120, borderRadius: 4, fontWeight: 700, fontSize: 16, textTransform: "none" }}
      onClick={() => handleView('tomorrow')}
      startIcon={<CalendarTodayIcon />}
    >
      Ngày mai
    </Button>
  );
  const weekTab = (
    <>
      <Button
        variant={view === 'week' ? "contained" : "outlined"}
        color="primary"
        sx={{ minWidth: 120, borderRadius: 4, fontWeight: 700, fontSize: 16, textTransform: "none" }}
        onClick={(e) => { handleView('week'); setWeekAnchorEl(e.currentTarget); }}
        startIcon={<CalendarTodayIcon />}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Tuần này
      </Button>
      <Menu
        anchorEl={weekAnchorEl}
        open={Boolean(weekAnchorEl) && view === 'week'}
        onClose={() => setWeekAnchorEl(null)}
      >
        {[...menus].sort((a, b) => a.menu_date.localeCompare(b.menu_date)).map(menu => (
          <MenuItem
            key={menu.menu_date}
            selected={selectedWeekDate === menu.menu_date}
            onClick={() => {
              setSelectedWeekDate(menu.menu_date);
              setWeekAnchorEl(null);
              setSelectedMenu(menu);
              setDishLang({});
              setViNames({});
              setViIngredients({});
            }}
          >
            {getVNDayLabel(menu.menu_date)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );

  const menuLabel = view === 'today'
    ? "Thực đơn hôm nay"
    : view === 'tomorrow'
      ? "Thực đơn ngày mai"
      : selectedWeekDate
        ? `Thực đơn ngày ${getVNDayLabel(selectedWeekDate)}`
        : "";

  const selectedAnalysis = getAnalysis(selectedMenu);

  let bmiMin = 15, bmiMax = 35, bmiNormMin = 18.5, bmiNormMax = 22.9, tdeeRecommended , chipColor;

  let bmiVal, bmiCategory, userMessage, tdeeUser, tdeeRecommendedForDisplay,
      mealsTotalKcalForDisplay, macroTargetsForDisplay, mealsForDisplay,
      micronutrientsForDisplay, micronutrientTargetsForDisplay,
      bmiColor, chipColorForDisplay;

  if (selectedAnalysis) {
    bmiVal = selectedAnalysis.bmi;
    bmiCategory = selectedAnalysis.bmi_category;
    userMessage = selectedAnalysis.user_message;
    
    tdeeUser = selectedAnalysis.tdee_user;
    tdeeRecommendedForDisplay = selectedAnalysis.tdee_recommended; 

    mealsTotalKcalForDisplay = selectedAnalysis.meals_total_kcal;
    macroTargetsForDisplay = selectedAnalysis.macro_targets;
    mealsForDisplay = selectedAnalysis.meals;
    micronutrientsForDisplay = selectedAnalysis.micronutrients;
    micronutrientTargetsForDisplay = selectedAnalysis.micronutrient_targets;

    bmiColor = bmiVal >= 18.5 && bmiVal <= 22.9 ? theme.palette.success.main : theme.palette.error.main;
    
    if (tdeeUser && mealsTotalKcalForDisplay) {
        const diff = Math.abs(mealsTotalKcalForDisplay - tdeeUser);
        if (diff <= tdeeUser * 0.1) {
            chipColorForDisplay = "success";
        } else if (diff <= tdeeUser * 0.2) {
            chipColorForDisplay = "warning";
        } else {
            chipColorForDisplay = "error";
        }
    } else {
        chipColorForDisplay = "default";
    }
  }

  return (
    <Card sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 5 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontFamily: "Roboto slab" }}>
          Khuyến nghị dinh dưỡng và thực đơn cá nhân hóa
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={2} mb={3}>
          {todayTab}
          {tomorrowTab}
          {weekTab}
        </Stack>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          color="#4A628A"
          mb={2}
          sx={{ fontSize: 20, letterSpacing: 0.5, fontFamily: "Roboto slab" }}
        >
          {menuLabel}
        </Typography>
        {loading && <CircularProgress size={32} sx={{ mt: 2 }} />}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && !selectedMenu && (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Không có thực đơn nào cho ngày này.
          </Typography>
        )}
        {selectedAnalysis && selectedMenu && (
          <Fade in>
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
                                label={translateBMICategory(selectedAnalysis.bmi_category)}
                                color={bmiVal >= 18.5 && bmiVal <= 22.9 ? 'success' : 'error'}
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
                          {selectedAnalysis.user_message}
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
                                label={`TDEE lựa chọn: ${tdeeUser !== undefined && tdeeUser !== null ? tdeeUser : 'N/A'} calo`}
                                color="info"
                                sx={{ fontWeight: 600, fontSize: 15 }}
                              />
                              {tdeeRecommendedForDisplay && (
                                <Chip
                                  label={`TDEE khuyến nghị: ${tdeeRecommendedForDisplay} calo`}
                                  color="success"
                                  sx={{ fontWeight: 600, fontSize: 15 }}
                                />
                              )}
                            </Stack>
                            <Chip
                              label={`Tổng năng lượng thực đơn: ${mealsTotalKcalForDisplay !== undefined && mealsTotalKcalForDisplay !== null ? mealsTotalKcalForDisplay : 'N/A'} calo`}
                              color="success"
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
              {macroTargetsForDisplay && (
                <Card sx={{ mb: 3, background: "linear-gradient(120deg, #e0f7fa 0%, #fffde7 100%)", borderRadius: 3, boxShadow: 2, p: 2 }}>
                  <CardContent>
                    <MacroPieChart
                      macroTargets={macroTargetsForDisplay}
                      microTotals={micronutrientsForDisplay}
                      microTargets={micronutrientTargetsForDisplay}
                    />
                  </CardContent>
                </Card>
              )}
              {mealsForDisplay && mealsForDisplay.map((meal, idx) => (
                <Fade in key={meal.meal + idx} timeout={400 + idx * 100}>
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
                      <Avatar sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.light, boxShadow: 2, mr: 2, }} >
                        <LocalDiningIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: "#323232", letterSpacing: 0.5 }}>
                          {meal.meal} -  Mục tiêu: {meal.meal_kcal_target} calo
                          {meal.meal_macros_target && (
                            <Stack direction="row" spacing={1} mt={0.5}>
                              <Chip label={`P: ${meal.meal_macros_target.protein_g}g`} size="small" sx={{ bgcolor: "#6366f1", color: "#fff" }} />
                              <Chip label={`F: ${meal.meal_macros_target.fat_g}g`} size="small" sx={{ bgcolor: "#f59e42", color: "#fff" }} />
                              <Chip label={`C: ${meal.meal_macros_target.carb_g}g`} size="small" sx={{ bgcolor: "#22d3ee", color: "#fff" }} />
                            </Stack>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={meal.meal_kcal_target && meal.meal_total_kcal ? Math.min(100, (meal.meal_total_kcal / meal.meal_kcal_target) * 100) : 0}
                      sx={{
                        my: 2, height: 8, borderRadius: 2, background: "#e0e0e0",
                        "& .MuiLinearProgress-bar": { background: meal.meal_total_kcal > meal.meal_kcal_target ? theme.palette.error.main : theme.palette.success.main, },
                      }} />
                    <Grid container spacing={3}>
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
              <Stack direction="row" justifyContent="flex-end" mt={2}>
                <Button
                  color="error"
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  size="large"
                  onClick={() => handleDelete(selectedMenu.id)}
                  disabled={deleteLoading === selectedMenu.id}
                  sx={{
                    borderRadius: '20px',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Xóa thực đơn này?
                </Button>
              </Stack>
              <Dialog
                open={!!detailDish}
                onClose={() => setDetailDish(null)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                  sx: {
                    background: 'transparent',
                    borderRadius: { xs: 2, sm: 3 },
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
                          minWidth: { xs: '100%', sm: 280 },
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
                              fontSize: { xs: 11, sm: 14 },
                              mb: 0.5,
                            }}
                          >
                            <LocalFireDepartmentIcon sx={{ mr: 0.5, fontSize: { xs: 18, sm: 20 } }} />
                            Năng lượng
                          </Typography>
                          <Stack direction="row" spacing={2.5} alignItems="center">
                            <Chip
                              icon={<SpeedIcon sx={{ fontSize: 24, color: "#1976d2 !important" }} />}
                              label={`${detailDish.calories} Calories`}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderColor: "rgba(33, 150, 243, 0.3)",
                                color: "#1976d2",
                                bgcolor: "rgba(33, 150, 243, 0.05)",
                                fontWeight: 600,
                                fontSize: { xs: 11, sm: 14 },
                                '.MuiChip-icon': { color: "#1976d2" }
                              }}
                            />
                            <Chip
                              icon={<ScaleIcon sx={{ fontSize: 24, color: "#3D8D7A !important" }} />}
                              label={`Số lượng: ${detailDish.quantity}`}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderColor: "rgba(61,141,122,0.3)",
                                color: "#3D8D7A",
                                bgcolor: "rgba(255,193,7,0.05)",
                                fontWeight: 600,
                                fontSize: { xs: 11, sm: 14 },
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
                              fontSize: { xs: 11, sm: 14 },
                              mb: 0.5,
                            }}
                          >
                            <SpaIcon sx={{ mr: 0.5, fontSize: { xs: 18, sm: 20 } }} />
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
                                    fontSize: { xs: 10, sm: 11 },
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
                              fontSize: { xs: 11, sm: 14 },
                              mb: 0.5,
                            }}
                          >
                            <MenuBookIcon sx={{ mr: 0.5, fontSize: { xs: 18, sm: 20 } }} />
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
                              fontSize: { xs: 12, sm: 13 },
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
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
}