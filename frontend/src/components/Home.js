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
import foodImage from '../images/food1.jpg';

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
  const [loading, setLoading] = useState(false);
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
          background: 'linear-gradient(-45deg, #71b280, #134e5e, #ff9966, #56ab2f)',
          backgroundSize: '400% 400%',
          animation: `${gradientBg} 15s ease infinite`,
          color: 'snow',
          borderRadius: 0,
          overflow: 'hidden',
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
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: "bold",
                  fontFamily: "Roboto Slab",
                  animation: `${fadeIn} 1s ease-out`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
                  py: { xs: 2, md: 0 }
                }}
              >
                Chào mừng đến với <span style={{ color: '#ffb347' }}>FoodLife</span>
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
                Khám phá thực đơn thông minh, món ăn ngon và lối sống lành mạnh giúp kéo dài tuổi thọ.
                <br />
                Chúng tôi đề xuất bữa ăn phù hợp với sở thích, sức khỏe và mục tiêu sống lâu của bạn!
              </Typography>

              <Button
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => {
                  document.getElementById('overview').scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  mt: 2,
                  fontSize: { xs: 16, md: 20 },
                  fontWeight: "bold",
                  fontFamily: "Roboto Slab",
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Khám phá thực đơn
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={foodImage}
                alt="Healthy cuisine"
                sx={{
                  width: { xs: '90%', sm: '80%', md: '70%' },
                  maxWidth: '450px',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  animation: `${float} 4s ease-in-out infinite`,
                  transform: 'translateY(0)',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Overview Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }} id="overview">
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
          Vì sức khỏe, vì tương lai
        </Typography>
        <Grid container spacing={3}>
          {/* Featured Menu */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, minHeight: 180, textAlign: 'center', background: "#f7ffe0" }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#81c784' }}>
                Thực Đơn Đề Xuất
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Được cá nhân hóa dựa trên sở thích và sức khỏe của bạn.<br />
                (Tích hợp AI/ML trong tương lai)
              </Typography>
            </Paper>
          </Grid>
          {/* Cuisine Discovery */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, minHeight: 180, textAlign: 'center', background: "#e0f7fa" }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#4dd0e1' }}>
                Khám phá Ẩm Thực
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Khám phá món ăn từ khắp nơi trên thế giới, đa dạng dinh dưỡng, tốt cho sức khỏe.
              </Typography>
            </Paper>
          </Grid>
          {/* Longevity/Health Tips */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, minHeight: 180, textAlign: 'center', background: "#fbeee6" }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#ffb74d' }}>
                Sống Khỏe Sống Lâu
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Các bí quyết ăn uống, thực phẩm trường thọ và lời khuyên từ chuyên gia.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
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
            '&:hover': { backgroundColor: 'primary.dark' },
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