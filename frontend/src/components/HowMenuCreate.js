import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Paper, Avatar, Typography, Divider, Fade, MobileStepper, Button, Box
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { renderMathContent, initMathJax } from '../utils/mathUtils';

const HOW_MENU_STEPS = [
  {
    label: "Thu thập thông tin cá nhân",
    desc: (
      <span>
        Hệ thống thu thập các chỉ số cơ bản: chiều cao, cân nặng, tuổi, giới tính, mức độ vận động, mục tiêu cá nhân.
      </span>
    ),
    icon: <PersonIcon sx={{ fontSize: 42, color: 'primary.main' }} />
  },
  {
    label: "Tính BMI & phân loại",
    desc: (
      <span>
        BMI được tính theo công thức:<br />
        <span className="math-tex">{"\\(BMI = \\frac{Cân~nặng~(kg)}{(Chiều~cao~(m))^2}\\)"}</span><br />
        Phân loại:<br />
        <b>&lt; 18.5:</b> Thiếu cân<br />
        <b>18.5 - 22.9:</b> Bình thường<br />
        <b>&gt;= 23:</b> Thừa cân/Béo phì
      </span>
    ),
    icon: <CalculateIcon sx={{ fontSize: 42, color: 'success.main' }} />
  },
  {
    label: "Tính BMR & TDEE",
    desc: (
      <span>
        <b>BMR</b> (Mifflin-St Jeor):<br />
        <span className="math-tex">
          {"\\(\\text{Nam:}\\; BMR = 10 \\times cân~nặng + 6.25 \\times chiều~cao - 5 \\times tuổi + 5\\)"}
        </span><br />
        <span className="math-tex">
          {"\\(\\text{Nữ:}\\; BMR = 10 \\times cân~nặng + 6.25 \\times chiều~cao - 5 \\times tuổi - 161\\)"}
        </span>
        <br />
        <b>TDEE</b> = BMR × hệ số vận động<br />
        <i>(Hệ số: Ít 1.2, Nhẹ 1.375, Vừa 1.55, Nhiều 1.725, Rất Nhiều 1.9)</i>
      </span>
    ),
    icon: <TrendingUpIcon sx={{ fontSize: 42, color: 'warning.main' }} />
  },
  {
    label: "Điều chỉnh TDEE theo mục tiêu & BMI",
    desc: (
      <span>
        TDEE được điều chỉnh theo mục tiêu giảm/cân/giữ cân và tình trạng BMI:<br />
        <b>Nếu thiếu cân:</b> TDEE tăng 15%<br />
        <b>Nếu thừa cân:</b> TDEE giảm 15%<br />
        <b>Mục tiêu cá nhân:</b><br />
        - Giảm cân nhanh: TDEE x 0.42 ~ 0.85<br />
        - Tăng cân nhanh: TDEE x 1.15 ~ 1.58<br />
        - Giữ cân: TDEE x 1.0
      </span>
    ),
    icon: <ChecklistIcon sx={{ fontSize: 42, color: 'secondary.main' }} />
  },
  {
    label: "Tính phân bổ dinh dưỡng",
    desc: (
      <span>
        <b>Phân bổ macronutrients:</b><br />
        <span className="math-tex">{"\\(\\text{Protein: 15\%} \\rightarrow 1g/4calo\\)"}</span><br />
        <span className="math-tex">{"\\(\\text{Fat: 25\%} \\rightarrow 1g/9calo\\)"}</span><br />
        <span className="math-tex">{"\\(\\text{Carb: 60\%} \\rightarrow 1g/4calo\\)"}</span><br />
        <b>Phân chia bữa ăn:</b> Sáng 20-25%, Trưa 35-40%, Tối 25-30%, Phụ 10-15%
      </span>
    ),
    icon: <RestaurantMenuIcon sx={{ fontSize: 42, color: 'success.dark' }} />
  },
  {
    label: "Tối ưu hóa thực đơn & kiểm tra sức khỏe",
    desc: (
      <span>
        Hệ thống chọn món phù hợp mục tiêu, sở thích, hạn chế cá nhân và tự động kiểm tra các cảnh báo cho tình trạng hạn chế (cholesterol, natri, chất xơ...) cho các bệnh lý phổ biến ở Châu á.<br />
        <b>Từ đó đạt được:</b> Một thực đơn tối ưu nhất để gia tăng tuổi thọ của bạn!
      </span>
    ),
    icon: <ChecklistIcon sx={{ fontSize: 42, color: 'primary.light' }} />
  }
];

export default function HowMenuCreatedDialog({
  open,
  onClose,
  activeStep: controlledStep,
  setActiveStep: setControlledStep,
  renderExtra,
}) {
  const [internalStep, setInternalStep] = useState(0);

  const activeStep = controlledStep !== undefined ? controlledStep : internalStep;
  const setActiveStep = setControlledStep || setInternalStep;

  React.useEffect(() => {
    if (open) {
      setActiveStep(0);
      setTimeout(() => { initMathJax(); }, 300); 
    }
    // eslint-disable-next-line
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => { initMathJax(); }, 150);
    }
    // eslint-disable-next-line
  }, [open, activeStep]);

  const goNext = () => setActiveStep((prev) => Math.min(HOW_MENU_STEPS.length - 1, prev + 1));
  const goBack = () => setActiveStep((prev) => Math.max(0, prev - 1));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "none",
          position: 'relative',
          boxShadow: 6,
          p: 0,
          minWidth: { xs: "100%", md: 600, lg: 700 },
          maxWidth: "700px"
        }
      }}
      scroll="body"
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 36,
          fontFamily: "Roboto Slab",
          color: '#fff',
          letterSpacing: 1,
          mb: 0,
          pb: 1,
        }}
      >
        Quy trình tạo thực đơn cá nhân hóa
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 14, top: 12, color: "grey.600" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent
        sx={{
          minHeight: { xs: 420, md: 420 },
          maxHeight: { xs: '80vh', md: 600 },
          p: { xs: 1.5, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto'
        }}
      >
        <Fade in timeout={400}>
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, md: 3 },
              width: { xs: '100%', sm: 480, md: 550, lg: 650 },
              borderRadius: 5,
              background: "#fff",
              boxShadow: "0 4px 24px #0001",
              mb: 1
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "background.paper",
                mx: "auto",
                mb: 2,
                boxShadow: 3
              }}
            >
              {HOW_MENU_STEPS[activeStep].icon}
            </Avatar>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: 1,
                textAlign: "center",
                fontFamily: "Roboto Slab",
                fontSize: 22,
                letterSpacing: 0.3
              }}
            >
              {HOW_MENU_STEPS[activeStep].label}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                minHeight: 56,
                textAlign: "left",
                fontSize: 17,
                px: { xs: 0.5, md: 1.5 },
                
              }}
              component="div"
            >
              {HOW_MENU_STEPS[activeStep].desc}
            </Typography>
            {renderExtra}
          </Paper>
        </Fade>
        <MobileStepper
          variant="dots"
          steps={HOW_MENU_STEPS.length}
          position="static"
          activeStep={activeStep}
          sx={{
            background: 'none',
            mt: { xs: 0, md: 2 },
            mb: 0,
            width: '100%',
            justifyContent: 'center',
            
          }}
          nextButton={
            <Button
              size="small"
              onClick={goNext}
              disabled={activeStep === HOW_MENU_STEPS.length - 1}
              sx={{ minWidth: 44 }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: 18, ml: 0.5, color:"#fff" }} />
            </Button>
          }
          backButton={
            <Button
              size="small"
              
              onClick={goBack}
              disabled={activeStep === 0}
              sx={{ minWidth: 44 }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 18, mr: 0.5, color:"#fff"  }} />
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}