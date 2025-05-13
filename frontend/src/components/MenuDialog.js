import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Slider,
  Fade,
  Stack,
  Grow,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { motion, AnimatePresence } from 'framer-motion'; 

const activityLevels = [
  { value: 'sedentary', label: 'Ít vận động', desc: 'Công việc bàn giấy, ít đi lại', icon: <FitnessCenterIcon color="primary" /> },
  { value: 'light', label: 'Vận động nhẹ', desc: 'Đi bộ nhẹ, tập thể dục nhẹ 1-3 ngày/tuần', icon: <FitnessCenterIcon color="success" /> },
  { value: 'moderate', label: 'Vận động vừa', desc: 'Tập gym, đá bóng, thể thao 3-5 ngày/tuần', icon: <FitnessCenterIcon color="secondary" /> },
  { value: 'high', label: 'Vận động nhiều', desc: 'Vận động viên, lao động chân tay, tập nặng 6-7 ngày/tuần', icon: <FitnessCenterIcon color="warning" /> },
  { value: 'very_high', label: 'Vận động rất nhiều', desc: 'Tập luyện cường độ rất cao, thể thao chuyên nghiệp', icon: <FitnessCenterIcon color="error" /> },
];

const goals = [
  { value: 'maintenance', label: 'Giữ cân', icon: <FlagCircleIcon color="primary" /> },
  { value: 'loss', label: 'Giảm cân', icon: <FlagCircleIcon color="error" /> },
  { value: 'gain', label: 'Tăng cân', icon: <FlagCircleIcon color="success" /> },
];

const intensities = [
  { value: 'light', label: 'Nhẹ', desc: 'Thay đổi nhẹ, phù hợp duy trì lâu dài', icon: <FlashOnIcon color="info"/> },
  { value: 'safe', label: 'An toàn', desc: 'Thay đổi hợp lý, cân bằng sức khỏe', icon: <FlashOnIcon color="success"/> },
  { value: 'fast', label: 'Nhanh', desc: 'Thay đổi nhanh, cần theo dõi chặt chẽ', icon: <FlashOnIcon color="error"/> },
];

const steps = ['Mức độ hoạt động', 'Mục tiêu', 'Cường độ'];

const variants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: 'spring' } },
  exit:    { opacity: 0, y: -40, scale: 0.98, transition: { duration: 0.3 } },
};



const MenuDialog = ({ open, onClose, onConfirm, userData }) => {
  const [step, setStep] = useState(0);
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [goalType, setGoalType] = useState('maintenance');
  const [goalIntensity, setGoalIntensity] = useState('safe');
  const [infoError, setInfoError] = useState('');
  const navigate = useNavigate();

  const theme = useTheme();
  const isBig = useMediaQuery(theme.breakpoints.up('md'));

  const activityIndex = activityLevels.findIndex(item => item.value === activityLevel);
  const goalIndex = goals.findIndex(item => item.value === goalType);
  const intensityIndex = intensities.findIndex(item => item.value === goalIntensity);

  const handleNext = () => {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(goalType === 'maintenance' ? 3 : 2);
    else setStep(3);
  };

  const handleBack = () => setStep(Math.max(0, step - 1));

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  const isUserInfoComplete = (user) => {
    if (!user) return false;
    return (
      user.displayName &&
      user.email &&
      user.gender &&
      user.date_of_birth &&
      user.height &&
      user.weight
    );
  };

  const handleConfirm = () => {
    if (!isUserInfoComplete(userData)) {
      setInfoError('Bạn cần điền đầy đủ thông tin cá nhân trước khi tạo menu!');
      setTimeout(() => {
        setInfoError('');
        onClose();
        navigate('/account');
      }, 2000);
      return;
    }
    onConfirm({ activityLevel, goalType, goalIntensity });
    handleClose();
  };

  

  return (
    <Dialog open={open} onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: motion.div,
        initial: { scale: 0.95, opacity: 0, y: 60 },
        animate: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", duration: 0.5 } },
        exit: { scale: 0.95, opacity: 0, y: -60, transition: { duration: 0.3 } },
        style: {
          borderRadius: 32,
          boxShadow: "0 12px 56px rgba(80,90,130,0.18)",
          background: "#FBFBFB",
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          textAlign: 'center',
          letterSpacing: 1,
          fontSize: isBig ? 32 : 22,
          fontFamily: "Roboto slab",
          background: "linear-gradient(90deg,#6366f1,#22d3ee)",
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}
      >
        Tùy chỉnh thực đơn cá nhân
      </DialogTitle>
      <DialogContent sx={{ minHeight: isBig ? 360 : 220, px: isBig ? 8 : 2, py: 4 }}>
        {infoError && (
          <Box sx={{ mb: 2 }}>
            <Typography color="error" fontWeight={700} fontSize={17} align="center">
              {infoError}
            </Typography>
          </Box>
        )}
        <Stepper activeStep={step >= 3 ? 2 : step} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography fontWeight={700}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-activity" {...variants}>
              <Box>
                <Typography fontWeight={700} mb={2} align="center" fontSize={isBig ? 22 : 18}>Chọn mức độ hoạt động:</Typography>
                <Slider
                  value={activityIndex}
                  min={0}
                  max={activityLevels.length - 1}
                  marks={activityLevels.map((l, i) => ({
                    value: i,
                    label: <span style={{ fontSize: isBig ? 18 : 14 }}>{l.label}</span>,
                  }))}
                  step={1}
                  onChange={(_, v) => setActivityLevel(activityLevels[v].value)}
                  valueLabelDisplay="off"
                  sx={{
                    mt: 5,
                    mb: 2,
                    color: '#6366f1',
                    '.MuiSlider-thumb': { height: 32, width: 32, bgcolor: '#fff', border: '3px solid #6366f1' }
                  }}
                />
                <Stack alignItems="center" mt={2}>
                  <Grow in timeout={700}><Box>{activityLevels[activityIndex].icon}</Box></Grow>
                  <Typography variant="body2" color="text.secondary" align="center" mt={1} fontSize={isBig ? 18 : 15}>
                    {activityLevels[activityIndex].desc}
                  </Typography>
                </Stack>
              </Box>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step-goal" {...variants}>
              <Box>
                <Typography fontWeight={700} mb={2} align="center" fontSize={isBig ? 22 : 18}>Chọn mục tiêu của bạn:</Typography>
                <Slider
                  value={goalIndex}
                  min={0}
                  max={goals.length - 1}
                  marks={goals.map((g, i) => ({
                    value: i,
                    label: <span style={{ fontSize: isBig ? 18 : 14 }}>{g.label}</span>,
                  }))}
                  step={1}
                  onChange={(_, v) => setGoalType(goals[v].value)}
                  valueLabelDisplay="off"
                  sx={{
                    mt: 5,
                    mb: 2,
                    color: '#22d3ee',
                    '.MuiSlider-thumb': { height: 32, width: 32, bgcolor: '#fff', border: '3px solid #22d3ee' }
                  }}
                />
                <Stack alignItems="center" mt={2}>
                  <Grow in timeout={700}><Box>{goals[goalIndex].icon}</Box></Grow>
                </Stack>
              </Box>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-intensity" {...variants}>
              <Box>
                <Typography fontWeight={700} mb={2} align="center" fontSize={isBig ? 22 : 18}>Chọn cường độ thay đổi:</Typography>
                <Slider
                  value={intensityIndex}
                  min={0}
                  max={intensities.length - 1}
                  marks={intensities.map((g, i) => ({
                    value: i,
                    label: <span style={{ fontSize: isBig ? 18 : 14 }}>{g.label}</span>,
                  }))}
                  step={1}
                  onChange={(_, v) => setGoalIntensity(intensities[v].value)}
                  valueLabelDisplay="off"
                  sx={{
                    mt: 5,
                    mb: 2,
                    color: '#f59e42',
                    '.MuiSlider-thumb': { height: 32, width: 32, bgcolor: '#fff', border: '3px solid #f59e42' }
                  }}
                />
                <Stack alignItems="center" mt={2}>
                  <Grow in timeout={700}><Box>{intensities[intensityIndex].icon}</Box></Grow>
                  <Typography color="text.secondary" mt={1} align="center" fontSize={isBig ? 16 : 13}>
                    {intensities[intensityIndex].desc}
                  </Typography>
                </Stack>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", pb: 3, px: isBig ? 5 : 2 }}>
        {step > 0 && step < 3 && (
          <Button
            color="primary"
            onClick={handleBack}
            sx={{ fontWeight: 700, fontSize: 17 }}
          >
            Quay lại
          </Button>
        )}
        {step === 0 && (
          <Button
            color="primary"
            onClick={handleClose}
            sx={{ fontWeight: 700, fontSize: 17 }}
          >
            Hủy
          </Button>
        )}
  
        {step === 0 && (
          <Button
            variant="contained"
            onClick={handleNext}
            color="primary"
            sx={{
              fontWeight: 800,
              fontSize: 19,
              fontFamily: "Roboto slab",
              borderRadius: 2,
              px: 5,
              py: 1.2,
              background: 'linear-gradient(90deg,#6366f1,#22d3ee)',
             boxShadow: '0 6px 20px 0 rgba(34,211,238,0.12)'
            }}
          >
            Tiếp tục
          </Button>
        )}
        {step === 1 && goalType !== "maintenance" && (
          <Button
            variant="contained"
            onClick={handleNext}
            color="primary"
            sx={{
              fontWeight: 800,
              fontSize: 19,
              fontFamily: "Roboto slab",
              borderRadius: 2,
              px: 5,
              py: 1.2,
              background: 'linear-gradient(90deg,#6366f1,#22d3ee)',
              boxShadow: '0 6px 20px 0 rgba(34,211,238,0.12)'
            }}
          >
            Tiếp tục
          </Button>
        )}
        {((step === 2 && goalType !== "maintenance") || (step === 1 && goalType === "maintenance")) && (
          <Button
            variant="contained"
            onClick={handleConfirm}
            color="success"
            sx={{
              fontWeight: 800,
              fontSize: 19,
              fontFamily: "Roboto slab",
              borderRadius: 2,
              px: 5,
              py: 1.2,
              background: 'linear-gradient(90deg,#16a34a,#22d3ee)',
              boxShadow: '0 8px 32px 0 rgba(16,185,129,0.13)'
            }}
          >
            Xác nhận & tạo menu
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MenuDialog;