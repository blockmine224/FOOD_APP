import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Divider, Stack, Chip, Avatar, Button, Fade, Paper,
  Table, TableContainer, TableBody, TableCell, TableHead, TableRow, LinearProgress, Tooltip, IconButton, Collapse, useTheme, CircularProgress, Menu, MenuItem
} from "@mui/material";
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MacroPieChart from './MacroPieChart';
import { getMenus, deleteMenu } from '../api/userMenus';
import { translateText } from '../utils/translate';
import { useNotification } from "./NotificationProvider";
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
  const [openNutrition, setOpenNutrition] = useState({});
  const [openIngredients, setOpenIngredients] = useState({});
  const [dishLang, setDishLang] = useState({});
  const [viNames, setViNames] = useState({});
  const [viIngredients, setViIngredients] = useState({});
  const [translating, setTranslating] = useState({});

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
        setOpenNutrition({});
        setOpenIngredients({});
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
      } catch (e) {
        notify("Xóa thực đơn thất bại!", "error");
      }
      setDeleteLoading(null);
    }
  );
};

  const handleSelectMenu = (menu) => {
    setSelectedMenu(menu);
    setOpenNutrition({});
    setOpenIngredients({});
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
  const toggleNutrition = (dishId) => setOpenNutrition((prev) => ({ ...prev, [dishId]: !prev[dishId] }));
  const toggleIngredients = (dishId) => setOpenIngredients((prev) => ({ ...prev, [dishId]: !prev[dishId] }));

  const todayTab = (
    <Button
      variant={view === 'today' ? "contained" : "outlined"}
      color="primary"
      sx={{ minWidth: 120, borderRadius: 4, fontWeight: 700, fontSize: 16, textTransform: "none" }}
      onClick={() => {
        handleView('today');
      }}
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
      onClick={() => {
        handleView('tomorrow');
      }}
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
              setOpenNutrition({});
              setOpenIngredients({});
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

  return (
    <Card sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 5}}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{fontFamily:"Roboto slab"}}>
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
          color="primary"
          mb={2}
          sx={{ fontSize: 20, letterSpacing: 0.5, fontFamily:"Roboto slab" }}
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
              <Card sx={{ mb: 3, background: "linear-gradient(120deg, #e0ffe3 0%, #e0e7ff 100%)", boxShadow: 4, borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: theme.palette.success.main, width: 64, height: 64, fontSize: 28, boxShadow: 2 }}>
                      <RestaurantIcon fontSize="inherit" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                        BMI: {selectedAnalysis.bmi} ({translateBMICategory(selectedAnalysis.bmi_category)})
                      </Typography>
                      <Typography variant="body1" color="secondary">{selectedAnalysis.user_message}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <b>TDEE lựa chọn:</b> {selectedAnalysis.tdee_user || selectedAnalysis.tdee} kcal/ngày
                        {selectedAnalysis.tdee_recommended && (
                      <>
                      {" | "}
                      <b>TDEE khuyến nghị:</b> {selectedAnalysis.tdee_recommended} kcal/ngày
                      </>
                        )}
                      </Typography>
                      <Chip
                        label={`Tổng năng lượng: ${selectedAnalysis.meals_total_kcal_user || selectedAnalysis.meals_total_kcal} kcal`}
                        color="success"
                        sx={{ mt: 1, fontWeight: 700, fontSize: 16 }}
                        icon={<LocalDiningIcon />}
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
              {selectedAnalysis.macro_targets_user && (
                <Card sx={{ mb: 3, background: "linear-gradient(120deg, #e0f7fa 0%, #fffde7 100%)", borderRadius: 3, boxShadow: 2, p: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} color="primary" mb={1}>
                      Phân bổ năng lượng theo ngày:
                    </Typography>
                    <MacroPieChart
                      macroTargets={selectedAnalysis.macro_targets_user}
                      microTotals={selectedAnalysis.micronutrients_user}
                      microTargets={selectedAnalysis.micronutrient_targets_user}
                    />
                    
                  </CardContent>
                </Card>
              )}
              {selectedAnalysis.meals_user && selectedAnalysis.meals_user.map((meal, idx) => (
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
              <Stack direction="row" justifyContent="flex-end" mt={2}>
                <Button
                  color="error"
                  variant="contained"
                  startIcon={<DeleteIcon/>}
                  size="large"
                  sx={{ borderRadius: 3, boxShadow: 2 }}
                  onClick={() => handleDelete(selectedMenu.id)}
                  disabled={deleteLoading === selectedMenu.id}
                >
                  Xóa thực đơn này
                </Button>

                
              </Stack>
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
}