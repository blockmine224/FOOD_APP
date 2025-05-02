import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip'
import { useAuth } from '../contexts/AuthContext';
import { keyframes } from '@mui/system';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Link } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  People as PeopleIcon,
  AutoStories as AutoStoriesIcon,
  ArrowUpward as ArrowUpwardIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  StarBorder as StarBorderIcon,
  History as HistoryIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import educationImage from '../images/photo3.jpg';

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const gradientBg = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;



function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');

  


 


  

  

  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


 

  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      {message && (
        <Container maxWidth="md">
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '200px',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000
            }}
          >
            <Alert severity="info" sx={{ width: '100%' }}>
              {message}
            </Alert>
          </Box>
        </Container>
      )}

      <Paper
        sx={{
          position: 'relative',
          background: 'linear-gradient(-45deg, #2196f3, #64b5f6, #01214F, #1976d2)',
          backgroundSize: '400% 400%',
          animation: `${gradientBg} 15s ease infinite`,
          color: 'snow',
          
          borderRadius: 0,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="inherit"
                gutterBottom
                sx={{
                  fontSize: { 
                    xs: '1.5rem',  
                    sm: '2rem',    
                    md: '2.5rem'   
                  },
                  fontWeight: "bold",
                  fontFamily: "Roboto Slab",
                  animation: `${fadeIn} 1s ease-out`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  py: { xs: 2, md: 0 }
                }}
              >
                Chào mừng bạn đến với Hành trình học tập.
              </Typography>
              <Typography 
                variant="h5" 
                color="inherit" 
                paragraph 
                sx={{ 
                  opacity: 0.9,
                  animation: `${fadeIn} 1s ease-out 0.3s`,
                  animationFillMode: 'both',
                }}
              >
                Nâng cao kiến thức của bạn với nền tảng kiểm tra trắc nghiệm toàn diện,
                theo dõi tiến trình và đạt được mục tiêu học tập.
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => {
                  document.getElementById('overview').scrollIntoView({ 
                    behavior: 'smooth'
                  });
                }}
                sx={{ 
                  mt: 2,
                  fontSize: { xs: 16, md: 20 },
                  fontWeight: "bold",
                  fontFamily: "Roboto Slab",
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Bắt đầu
              </Button>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: { xs: 'block', sm: 'block', md: 'block'  }, mt: { xs: 4, md: 0 } }}>
              <Box
                component="img"
                src={educationImage}
                alt="Education illustration"
                sx={{
                  width: { 
                    xs: '80%',    
                    sm: '70%',    
                    md: '60%'     
                  },
                  maxWidth: '500px',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  animation: `${float} 4s ease-in-out infinite`,
                  transform: 'translateY(0)',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom 
          sx={{ 
            mb: 2, 
            fontFamily: "Roboto Slab",
            animation: `${fadeIn} 1s ease-out`,
          }}
        >
          Tổng quan
        </Typography>
        <Grid container spacing={2}>
          
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ mb: 8 }} id="overview">
        
      </Container>

      {showScrollTop && (
        <IconButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            animation: `${fadeIn} 0.3s ease-out`,
          }}
        >
          <ArrowUpwardIcon />
        </IconButton>
      )}
      
    </Box>
  );
}


export default Home;