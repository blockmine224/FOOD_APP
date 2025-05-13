import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Lottie from "lottie-react";
import cookingAnimation from "../assets/lottie/cooking.json"; 

const steps = [
  "Đang rửa rau...",
  "Đang thái nguyên liệu...",
  "Đang nấu ăn...",
  "Đang bày biện món...",
  "Đang kiểm tra dinh dưỡng..."
];
const tips = [
  "Mẹo: Rau xanh giúp tăng sức đề kháng!",
  "Bạn biết không? Ăn sáng đều giúp tăng hiệu quả học tập.",
  "Món ăn ngon cần có sự cân bằng dinh dưỡng.",
  "Mỗi ngày nên uống đủ nước để cơ thể khỏe mạnh.",
  "Đa dạng thực phẩm giúp bổ sung đủ dưỡng chất.",
  "Ăn chậm nhai kỹ để tiêu hóa tốt hơn.",
  "Chế biến hấp, luộc giữ nhiều vitamin hơn chiên xào."
];

export default function FoodLoadingOverlay() {
  const [stepIdx, setStepIdx] = useState(0);
  const [tip, setTip] = useState(tips[0]);

  useEffect(() => {
    setTip(tips[Math.floor(Math.random() * tips.length)]);
    const interval = setInterval(() => {
      setStepIdx(s => (s + 1) % steps.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        bgcolor: 'rgba(255,255,255,0.80)', zIndex: 1300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <Paper elevation={8} sx={{ px: 6, py: 4, borderRadius: 6, textAlign: 'center', bgcolor: 'white', boxShadow: 8 }}>
        <Box sx={{ width: 180, mx: 'auto' }}>
          <Lottie animationData={cookingAnimation} loop autoPlay />
        </Box>
        <Typography mt={2} fontWeight="bold" fontSize={22} color="primary">
          {steps[stepIdx]}
        </Typography>
        <Typography mt={2} color="text.secondary" fontSize={17}>
          {tip}
        </Typography>
      </Paper>
    </Box>
  );
}