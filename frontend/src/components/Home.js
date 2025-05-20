import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  IconButton,
  Dialog,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SpaIcon from '@mui/icons-material/Spa';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import FoodBankIcon from '@mui/icons-material/FoodBank';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import EatTodayMascot from './EatTodayMascot';
import MenuDialog from './MenuDialog';
import RecommendationMenuSection from './RecommendationMenuSection'; 
import CloseIcon from '@mui/icons-material/Close';
import { keyframes } from '@mui/system';
import FoodLoadingOverlay from './FoodLoadingOverlay';
import { Snackbar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { WorkOverview } from "./work";
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { MobileStepper, Avatar } from '@mui/material';
import HowMenuCreatedDialog from './HowMenuCreate';
import StarButton from './StarButton';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px);}
  to   { opacity: 1; transform: translateY(0);}
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

const nutritionQuotes = [
  {
    quote: "Let food be thy medicine and medicine be thy food.",
    author: "Hippocrates",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  },
  {
    quote: "Eat to live, not live to eat.",
    author: "Socrates",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  },
  {
    quote: "The secret of long life is to eat half, walk double, laugh triple and love without measure.",
    author: "Tibetan Proverb",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  },
  {
    quote: "A healthy outside starts from the inside.",
    author: "Robert Urich",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  },
  {
    quote: "To eat is a necessity, but to eat intelligently is an art.",
    author: "François de La Rochefoucauld",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  },
  {
    quote: "Those who think they have no time for healthy eating will sooner or later have to find time for illness.",
    author: "Edward Stanley",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  },
  {
    quote: "The food you eat can be either the safest and most powerful form of medicine or the slowest form of poison.",
    author: "Ann Wigmore",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  },
  {
    quote: "He who takes medicine and neglects to diet wastes the skill of his doctors.",
    author: "Chinese Proverb",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  },
  {
    quote: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
    avatar: "https://i.postimg.cc/G2q9fP87/av1.jpg"
  }
];

function LongevityQuoteCarousel() {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = nutritionQuotes.length;

  const handleNext = () => setActiveStep((prev) => (prev + 1) % maxSteps);
  const handleBack = () => setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % maxSteps);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeStep, maxSteps]);

  return (
    <Card elevation={3} sx={{ p: 3, mx: "auto", maxWidth: 620, textAlign: "center", borderRadius: 10, mt: 6 }}>
      <CardContent>
        <Stack alignItems="center" spacing={2}>
          <Avatar src={nutritionQuotes[activeStep].avatar} sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
            <FormatQuoteIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6" fontStyle="italic" sx={{ minHeight: 72, fontWeight: 500 }}>
            "{nutritionQuotes[activeStep].quote}"
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            – {nutritionQuotes[activeStep].author}
          </Typography>
          <MobileStepper
            variant="dots"
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            nextButton={
              <IconButton onClick={handleNext}><KeyboardArrowRight /></IconButton>
            }
            backButton={
              <IconButton onClick={handleBack}><KeyboardArrowLeft /></IconButton>
            }
            sx={{ background: "none", justifyContent: "center", borderRadius: 3 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

const scienceSteps = [
  {
    icon: <SpaIcon color="success" sx={{ fontSize: 40 }} />,
    title: "Chống lão hóa tế bào",
    desc: "Chế độ ăn giàu rau củ, chất chống oxy hóa giúp làm chậm quá trình lão hóa tế bào, kéo dài tuổi thọ."
  },
  {
    icon: <FavoriteIcon color="error" sx={{ fontSize: 40 }} />,
    title: "Giảm nguy cơ bệnh mạn tính",
    desc: "Ăn uống hợp lý giúp giảm tỷ lệ mắc các bệnh tim mạch, tiểu đường, ung thư – những kẻ thù của tuổi thọ."
  },
  {
    icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 40 }} />,
    title: "Tối ưu hóa gen trường thọ",
    desc: "Các chế độ ăn như Địa Trung Hải, Okinawa có liên kết với gen kéo dài tuổi thọ."
  },
  {
    icon: <FoodBankIcon color="primary" sx={{ fontSize: 40 }} />,
    title: "Nuôi dưỡng đường ruột khỏe mạnh",
    desc: "Ăn đa dạng thực vật, probiotic giúp lợi khuẩn phát triển và hỗ trợ hệ miễn dịch, tăng tuổi thọ."
  }
];

const longevityTips = [
  {
    icon: <EmojiFoodBeverageIcon color="primary" sx={{ fontSize: 34 }} />,
    title: "Ăn nhiều rau củ",
    desc: "Bổ sung đa dạng rau xanh, quả mọng mỗi ngày để tăng chất xơ, vitamin, chất chống oxy hóa."
  },
  {
    icon: <FavoriteIcon color="error" sx={{ fontSize: 34 }} />,
    title: "Hạn chế đường và thực phẩm chế biến",
    desc: "Tránh xa đồ ngọt, nước uống có đường, đồ ăn nhanh để giảm nguy cơ bệnh tật."
  },
  {
    icon: <SpaIcon color="success" sx={{ fontSize: 34 }} />,
    title: "Giữ cân nặng hợp lý",
    desc: "Kiểm soát khẩu phần, vận động đều đặn giúp duy trì cân nặng khỏe mạnh."
  },
  {
    icon: <EmojiEventsIcon color="warning" sx={{ fontSize: 34 }} />,
    title: "Ăn theo chế độ trường thọ",
    desc: "Tham khảo chế độ ăn Địa Trung Hải, Okinawa, Blue Zones nổi tiếng thế giới."
  },
  {
    icon: <RestaurantIcon color="secondary" sx={{ fontSize: 34 }} />,
    title: "Ăn vừa đủ, đừng quá no",
    desc: "Thực hành ăn chậm, lắng nghe cơ thể và dừng lại trước khi thấy quá no."
  },
];

function Home() {
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [message, setMessage] = useState('');
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [showMenuSuggestPanel, setShowMenuSuggestPanel] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [showUnrecMenu, setShowUnrecMenu] = useState(false);
  const [lastMenuParams, setLastMenuParams] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLoginMsg, setShowLoginMsg] = useState(false);
  const [showIntroDialog, setShowIntroDialog] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [showHowMenuDialog, setShowHowMenuDialog] = useState(false);
  const [howMenuStep, setHowMenuStep] = useState(0);

  const [showHowMenuLoginMsg, setShowHowMenuLoginMsg] = useState(false);

  const [quickMenuDialogOpen, setQuickMenuDialogOpen] = useState(false);


  const [userData, setUserData] = useState({
      displayName: '',
      email: '',
      gender: '',
      date_of_birth: '',
      height: '',
      weight: '',
    });
  const [avatar, setAvatar] = useState(null);

  const API = process.env.REACT_APP_API_URL;

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.avatarUrl) data.avatarUrl = `${API}${data.avatarUrl}`;
        setUserData(data);
        setAvatar(data.avatarUrl);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.pageYOffset > 300);
    window.addEventListener('scroll', handleScroll);
    fetchUserData();
    return () => window.removeEventListener('scroll', handleScroll);
    
  }, []);

  const handleMenuConfirm = async (params) => {
    setIsLoadingMenu(true);
    setError('');
    setLastMenuParams(params);
    setShowUnrecMenu(false);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/api/menu/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          activity_level: params.activityLevel,
          goal_type: params.goalType,
          goal_intensity: params.goalIntensity,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setRecommendations(data);
        setShowUnrecMenu(false);
        setMenuDialogOpen(false);
        setShowMenuSuggestPanel(true);
      } else {
        setError(data.error || 'Failed to load menu recommendations');
      }
    } catch (err) {
      setError('Failed to load menu recommendations.');
    } finally {
      setIsLoadingMenu(false);
    }
  };


  const handleHowMenuGetStarted = () => {
    if (isAuthenticated) {
      setShowHowMenuDialog(false);
      setMenuDialogOpen(true);
    } else {
      setShowHowMenuLoginMsg(true);
      setTimeout(() => {
        setShowHowMenuLoginMsg(false);
        setShowHowMenuDialog(false);
        navigate('/login');
      }, 1800);
    }
  };

  const HOW_MENU_STEPS_LEN = 6;

  const translateBMICategory = (cat) => {
    switch (cat) {
      case 'underweight': return 'Thiếu cân';
      case 'normal': return 'Bình thường';
      case 'overweight': return 'Thừa cân';
      case 'obese': return 'Béo phì';
      default: return cat;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" >
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

      <HowMenuCreatedDialog
        open={showHowMenuDialog}
        onClose={() => setShowHowMenuDialog(false)}
        activeStep={howMenuStep}
        setActiveStep={setHowMenuStep}
        renderExtra={
          howMenuStep === HOW_MENU_STEPS_LEN - 1 && (
            <Box flex={1} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                fontWeight: 700,
                fontSize: 18,
                
                mr:26,
                mt: 2,
                px: 4,
                py: 1.5,
                borderRadius: 10,
                fontFamily: "Roboto slab",
                backgroundColor: "#4A628A",
                '&:hover': { backgroundColor: '#7AB2D3' },
              }}
              onClick={() => handleHowMenuGetStarted(true)}
            >
              Bắt đầu ngay!
            </Button>
          </Box>
          )
        }
      />

      <Snackbar
        open={showHowMenuLoginMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Vui lòng đăng nhập trước..."
        ContentProps={{
          sx: { fontWeight: 600, fontSize: 18, background: "#d32f2f", borderRadius: 25 }
        }}
      />

      <MenuDialog
        open={menuDialogOpen}
        onClose={() => setMenuDialogOpen(false)}
        onConfirm={handleMenuConfirm}
        userData={userData}
      />

      <Dialog
        open={showMenuSuggestPanel}
        onClose={() => setShowMenuSuggestPanel(false)}
        maxWidth="md"
        fullWidth
      >
        <IconButton
          onClick={() => setShowMenuSuggestPanel(false)}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          <RecommendationMenuSection
            showCreateMenuButton={false}
            userData={{}}
            isLoadingMenu={isLoadingMenu}
            setIsLoadingMenu={setIsLoadingMenu}
            menuDialogOpen={menuDialogOpen}
            setMenuDialogOpen={setMenuDialogOpen}
            handleGetRecommendations={handleMenuConfirm}
            recommendations={recommendations}
            showUnrecMenu={showUnrecMenu}
            setShowUnrecMenu={setShowUnrecMenu}
            translateBMICategory={translateBMICategory}
            lastMenuParams={lastMenuParams}
            token={token}
            hideHowMenuButton={true}
          />
        </Box>
      </Dialog>

      
      <Snackbar
        open={showHowMenuLoginMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Vui lòng đăng nhập trước..."
        ContentProps={{
          sx: { fontWeight: 600, fontSize: 18, background: "#d32f2f", borderRadius: 25 }
        }}
      />

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
                Trường Thọ Bắt Đầu Từ <span style={{ color: '#DFF2EB' }}>Dinh Dưỡng</span>
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
                Ăn uống khoa học là chìa khóa kéo dài tuổi thọ, phòng ngừa bệnh tật và sống trọn vẹn mỗi ngày.<br />
                Khám phá thực đơn thông minh, lời khuyên vàng từ chuyên gia và bí quyết sống khỏe mạnh trường thọ!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  <Box
                    sx={{
                      animation: 'spin 1.6s linear infinite',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      },
                      display: 'inline-flex'
                    }}
                  >
                    <span role="img" aria-label="rocket" style={{ fontSize: 26 }}>🥑</span>
                  </Box>
                }
                endIcon={
                  <Box
                    sx={{
                      animation: 'bounce 1.2s infinite alternate',
                      '@keyframes bounce': {
                        '0%': { transform: 'translateY(0)' },
                        '100%': { transform: 'translateY(-6px)' }
                      },
                      display: 'inline-flex'
                    }}
                  >
                    <span role="img" aria-label="arrow" style={{ fontSize: 22 }}>😋</span>
                  </Box>
                }
                sx={{
                  opacity: 0.8,
                  mt: 2,
                  fontWeight: "bold",
                  fontSize: 22,
                  px: 5,
                  py: 1.7,
                  borderRadius: 5,
                  fontFamily: "Roboto slab",
                  background: "linear-gradient(90deg,#B9E5E8 0%,#DFF2EB 100%)",
                  color: "#323232",
                  letterSpacing: 1,
                  boxShadow: "0 6px 24px #B9E5E8",
                  transition: "transform 0.18s, box-shadow 0.18s",
                  textShadow: "0 2px 8px #fff5",
                  '&:hover': {
                    background: "linear-gradient(100deg,#B9E5E8 0%,#DFF2EB 100%)",
                    transform: "scale(1.045)",
                    boxShadow: "0 8px 36px #DFF2EB"
                  }
                }}
                onClick={() => setShowOverview(true)}
              >
                Bắt đầu khám phá!
              </Button>
              <WorkOverview open={showOverview} onClose={() => setShowOverview(false)} />
              
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
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

      <Container maxWidth="lg" sx={{ mb: 6, mt: 6 }} id="science">
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{
            mb: 2,
            fontFamily: "Roboto Slab",
            animation: `${fadeIn} 1s ease-out`,
            color: "#323232",
            fontWeight: 700
          }}
        >
          Vì sao chế độ ăn quyết định tuổi thọ?
        </Typography>
        <Grid container spacing={3}>
          {scienceSteps.map((step, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper elevation={3} sx={{
                p: 3, minHeight: 200, textAlign: 'center',
                background: "#f7fff7", borderRadius: 10, boxShadow: "0 2px 8px #0001"
              }}>
                <Box mb={1}>{step.icon}</Box>
                <Typography variant="h6" sx={{ color: "primary.dark", fontWeight: 700, mb: .5 }}>{step.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>{step.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box display="flex" justifyContent="center" my={4} >
        <StarButton
          onClick={() => {
            setShowHowMenuDialog(true);
            setHowMenuStep(0);
          }}
        >
          Quy trình tạo thực đơn?
        </StarButton>
      </Box>

      

      <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{
            mb: -5,
            fontFamily: "Roboto Slab",
            animation: `${fadeIn} 1s ease-out`,
            color: "#323232",
            fontWeight: 700
          }}
        >
          Trích dẫn nổi tiếng  
        </Typography>

          

      <LongevityQuoteCarousel />

      <Container maxWidth="lg" sx={{ mt: 7, mb: 5 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            mb: 3,
            fontFamily: "Roboto Slab",
            fontWeight: 700,
            color: "#323232"
          }}
        >
          5 Bí Quyết Ăn Uống Kéo Dài Tuổi Thọ
        </Typography>
        <Grid container spacing={4}>
          {longevityTips.map((tip, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper elevation={4} sx={{
                p: 3,
                minHeight: 180,
                textAlign: 'center',
                background: idx % 2 === 0 ? "#e3f9e5" : "#e0f7fa",
                borderRadius: 3,
                boxShadow: "0 2px 10px #0002"
              }}>
                <Box mb={1}>{tip.icon}</Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>{tip.title}</Typography>
                <Typography variant="body2">{tip.desc}</Typography>
              </Paper>
            </Grid>
          ))}
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
      {isLoadingMenu && <FoodLoadingOverlay />}
      <EatTodayMascot onClick={() => setMenuDialogOpen(true)} />


        <Snackbar
          open={showLoginMsg}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          message="Vui lòng đăng nhập trước..."
          ContentProps={{
            sx: { fontWeight: 600, fontSize: 18, background: "#d32f2f", borderRadius: 25 }
          }}
        />
    </Box>
    
  );
}

export default Home;