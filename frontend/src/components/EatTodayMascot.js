import React, { useState } from 'react';
import { Box, Typography, IconButton, useTheme, Snackbar } from '@mui/material';
import Lottie from "lottie-react";
import chefLottie from "../assets/lottie/chef.json"; 
import tipsData from "../assets/tips.json"; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const waveKeyframes = `
  @keyframes letterWave {
    0% { transform: translateY(0);}
    50% { transform: translateY(-13px);}
    100% { transform: translateY(0);}
  }
`;

export default function EatTodayMascot({ onClick }) {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [bubbleIdx, setBubbleIdx] = useState(() => Math.floor(Math.random() * tipsData.length));
  const mainText = "Ăn gì hôm nay?";

  const handleMascotClick = () => {
    if (isAuthenticated) {
      onClick?.();
      setBubbleIdx(Math.floor(Math.random() * tipsData.length)); 
    } else {
      setShowLoginMsg(true);
      setTimeout(() => {
        setShowLoginMsg(false);
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <Box
      sx={{
        opacity: 0.8,
        position: 'fixed',
        bottom: 60,
        right: 40,
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.96)',
        borderRadius: 10,
        boxShadow: 4,
        px: 2,
        py: 1,
        transition: 'box-shadow 0.2s, background 0.2s',
        '&:hover': {
          background: theme.palette.third.dark,
          boxShadow: 8,
          '.mascot-bubble': {
            opacity: 1,
            transform: 'translateY(-60px) scale(1)'
          }
        },
        '@media (max-width:600px)': {
          right: 10, bottom: 10, px: 1.5, py: 0.5
        }
      }}
      onClick={handleMascotClick}
    >
      <style>{waveKeyframes}</style>
      <Box sx={{ width: 68, height: 68, mr: 2, borderRadius: '50%', overflow: 'hidden', boxShadow: 2, bgcolor: 'background.paper' }}>
        <Lottie animationData={chefLottie} loop autoplay style={{ width: '100%', height: '100%' }} />
      </Box>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          color: theme.palette.primary,
          fontFamily: "Roboto slab",
          letterSpacing: 1,
          userSelect: 'none',
          display: 'flex',
          opacity: 0.5,
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {[...mainText].map((ch, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              animation: `letterWave 2s ${i * 0.08}s infinite`,
              fontWeight: 700,
              fontSize: 24,
              fontFamily:"Roboto slab",
              marginRight: ch === " " ? 6 : 0,
              color:'#323232'
            }}
          >{ch}</span>
        ))}
      </Typography>
      <Box
        className="mascot-bubble"
        sx={{
          position: 'absolute',
          left: '0%',
          bottom: '50%',
          transform: 'translateX(-50%) translateY(-30px) scale(0.85)',
          opacity: 0,
          transition: 'opacity 0.3s, transform 0.3s',
          bgcolor: 'primary.light',
          color: '#fff',
          px: 2, py: 1,
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 500,
          boxShadow: 3,
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        {tipsData[bubbleIdx]}
      </Box>
      <Snackbar
        open={showLoginMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Vui lòng đăng nhập trước..."
        ContentProps={{
          sx: { fontWeight: 600, fontSize: 18, background: theme.palette.error.main, borderRadius:25 }
        }}
      />
    </Box>
  );
}