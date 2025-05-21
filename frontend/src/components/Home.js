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
  CardMedia, 
  Avatar,
  MobileStepper,
  Tooltip, 
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
import { keyframes,styled } from '@mui/system';
import FoodLoadingOverlay from './FoodLoadingOverlay';
import { Snackbar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { WorkOverview } from "./work";
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import HowMenuCreatedDialog from './HowMenuCreate';
import StarButton from './StarButton';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px);}
  to   { opacity: 1; transform: translateY(0);}
`;

const letterWave = keyframes` 
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-13px); 
  }
`;

const animatedGradientOverlay = keyframes`
  0% { background-position: 0% 50%; }
  25% { background-position: 100% 50%; }
  50% { background-position: 0% 50%; }
  75% { background-position: 100% 50%;}
  100% { background-position: 0% 50%; }
`;

const bounceDown = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(8px);
  }
  60% {
    transform: translateY(4px);
  }
`;

const pulseTitle = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03); // Phóng to nhẹ
  }
  100% {
    transform: scale(1);
  }
`;

const pendulumButton = keyframes`
  0% {
    transform: translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateX(-8px) rotate(-2deg); // Di chuyển sang trái và xoay nhẹ
  }
  75% {
    transform: translateX(8px) rotate(2deg); // Di chuyển sang phải và xoay nhẹ
  }
  100% {
    transform: translateX(0px) rotate(0deg);
  }
`;

const spinAround = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const CombinedSectionStyled = styled(Box)(({ theme }) => ({
  
  
  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
  },
}));

const HeroSectionStyled = styled(Box)(({ theme }) => ({
  position: 'relative',
  color: theme.palette.common.white,
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(12),
  textAlign: 'center',
  backgroundImage: `url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1600&q=80')`, // Chỉ ảnh nền ở đây
  backgroundSize: 'cover',
  backgroundPosition: 'center 70%',
  overflow: 'hidden',
  '&::before': { 
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(-45deg, 
      rgba(0, 0, 0, 0.6), 
      rgba(90, 90, 90, 0.7),
      rgba(68, 68, 68, 0.65), 
      rgba(0, 0, 0, 0.75)
    )`,
    backgroundSize: '400% 400%', 
    animation: `${animatedGradientOverlay} 15s ease infinite`, 
    zIndex: 1, 
  },
  '& > .MuiContainer-root': { 
    position: 'relative',
    zIndex: 2,
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
}));

const SectionTitleStyled = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  fontFamily: "'Roboto Slab', serif",
  fontWeight: 700,
  color: theme.palette.text.primary,
  textAlign: 'center',
  animation: `${fadeIn} 1s ease-out`,
  position: 'relative',
  paddingBottom: theme.spacing(1.5),
  '&::after': {
    content: '""',
    display: 'block',
    width: '500px',
    height: '2px',
    backgroundColor: "#323232",
    margin: `${theme.spacing(2)} auto 0`,
    borderRadius: '25px',
  }
}));

const FeatureCardStyled = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '25px',
  transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2], 
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10], 
  },
  animation: `${fadeIn} 0.5s ease-out forwards`,
  opacity: 0,
}));

const ScienceStepItemStyled = styled(Grid)(({ theme, reverse }) => ({ 
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(5),
  flexDirection: reverse ? 'row-reverse' : 'row', 
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column', 
    textAlign: 'center',
    alignItems: 'center',
  },
  animation: `${fadeIn} 0.7s ease-out forwards`,
  opacity: 0,
}));

const ScienceStepIconWrapperStyled = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(4), 
  marginLeft: 0, 
  flexShrink: 0, 
  [theme.breakpoints.down('md')]: {
    marginRight: 0,
    marginLeft: 0,
    marginBottom: theme.spacing(2),
  },
  '&.reversed': { 
    marginRight: 0,
    marginLeft: theme.spacing(4),
    [theme.breakpoints.down('md')]: {
        marginLeft: 0,
    },
  }
}));

const ScienceStepTextWrapperStyled = styled(Box)(({ theme }) => ({
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    textAlign: 'center',
  },
}));

const LongevityTipCardStyled = styled(Card)(({ theme, isActive, isNext, isPrev }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '24px', 
  backgroundColor: theme.palette.background.paper,
  boxShadow: isActive ? theme.shadows[12] : theme.shadows[3], 
  position: 'relative',
  overflow: 'visible', 
  paddingTop: theme.spacing(3.5), 
  margin: theme.spacing(0, 1.5), 
  transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease-out, filter 0.4s ease-out, box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
  flex: '0 0 auto',
  width: 'clamp(280px, calc(100% / 3 - 32px), 360px)', 
  scrollSnapAlign: 'center',
  ...(isActive && {
    transform: 'scale(1.05) translateY(-8px)',
    opacity: 1,
    filter: 'brightness(1)',
    zIndex: 2, 
  }),

  // Style cho các card không active
  ...(!isActive && {
    transform: 'scale(0.88)',
    opacity: 0.65,
    filter: 'brightness(0.8) saturate(0.7)', 
    zIndex: 1,
  }),

  
   ...((isNext || isPrev) && !isActive && {
     transform: 'scale(0.92)',
     opacity: 0.75,
     filter: 'brightness(0.9)',
   }),


  [theme.breakpoints.down('md')]: {
    width: 'clamp(260px, 75%, 320px)',
    paddingTop: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    width: 'clamp(240px, 85%, 300px)',
    margin: theme.spacing(0, 1),
  },
}));

const TipNumberStyled = styled(Box)(({ theme, isActive }) => ({
  position: 'absolute',
  top: -22,
  left: theme.spacing(3.5),
  backgroundColor: isActive ? theme.palette.success.main : theme.palette.secondary.light, 
  color: theme.palette.getContrastText(isActive ? theme.palette.success.main : theme.palette.secondary.light),
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  typography: 'h5',
  fontWeight: 'bold',
  boxShadow: isActive ? `0 4px 12px ${theme.palette.success.light}77` : theme.shadows[4],
  zIndex: 3, 
  transition: 'background-color 0.4s ease-out, box-shadow 0.4s ease-out, transform 0.3s ease-out',
  border: `3px solid ${theme.palette.background.paper}`, 
  ...(isActive && {
    transform: 'scale(1.1)', 
  }),
  [theme.breakpoints.down('sm')]: {
    width: 42,
    height: 42,
    top: -18,
    left: theme.spacing(2.5),
    fontSize: theme.typography.h6.fontSize,
  },
}));

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
  const theme = useTheme();

  const handleNext = () => setActiveStep((prev) => (prev + 1) % maxSteps);
  const handleBack = () => setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % maxSteps);
    }, 6000);
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
    title: "Giảm nguy cơ bệnh mãn tính",
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
  const theme = useTheme();
  const [activeLongevityTip, setActiveLongevityTip] = useState(Math.floor(longevityTips.length / 2)); 

  const [showHowMenuLoginMsg, setShowHowMenuLoginMsg] = useState(false);

  const [quickMenuDialogOpen, setQuickMenuDialogOpen] = useState(false);

  const getAnimationDelay = (index, baseDelay = 0) => ({ 
    animationDelay: `${baseDelay + index * 0.15}s`,
  });

  const handleNextTip = () => {
      setActiveLongevityTip((prev) => (prev + 1) % longevityTips.length);
  };

  const handlePrevTip = () => {
    setActiveLongevityTip((prev) => (prev - 1 + longevityTips.length) % longevityTips.length);
  };

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
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', overflowX: 'hidden' }}>
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
        maxWidth="lg" 
        fullWidth 
        PaperProps={{ 
          sx: {
            borderRadius: {xs: 2, sm: 3}, 
          }
        }}
      >
        
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
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

      
        <HeroSectionStyled>
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: "bold",
              fontFamily: "'Roboto Slab', serif",
              textShadow: '2px 2px 8px rgba(0,0,0,0.6)', 
              mb: 3,
              animation: `${fadeIn} 1s ease-out, ${pulseTitle} 2s ease-in-out infinite 1s`,
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
              color: 'inherit', 
              display: 'inline-block',
            }}
          >
            Trường Thọ Bắt Đầu Từ <span style={{
              color: theme.palette.mode === 'dark' ? theme.palette.primary.light : '#a8e063', 
              background: 'linear-gradient(90deg, #a8e063, #90d838)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Dinh Dưỡng</span>
          </Typography>
          <Typography
            variant="h4"
            paragraph
            sx={{
              opacity: 0.95,
              mb: 5,
              animation: `${fadeIn} 1s ease-out 0.3s backwards`,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              maxWidth: '700px',
              mx: 'auto',
              color: 'inherit', 
            }}
          >
            Ăn uống khoa học là chìa khóa kéo dài tuổi thọ, phòng ngừa bệnh tật và sống trọn vẹn mỗi ngày. Khám phá bí quyết sống khỏe mạnh trường thọ cùng hệ thống khuyến nghị thực đơn cá nhân hóa!
          </Typography>
          <Button
            variant="contained" 
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              fontWeight: "bold",
              fontSize: {xs: 16, sm: 20},
              px: {xs: 3, sm: 5},
              py: {xs: 1.2, sm: 1.8},
              borderRadius: '50px',
              fontFamily: "'Roboto Slab', serif",
              mb: 4,
              backgroundColor: theme.palette.common.white, 
              color: theme.palette.primary.dark, 
              boxShadow: `0 8px 25px -8px rgba(0,0,0,0.3)`,
              transition: "transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.25s, color 0.25s",
              animation: `${fadeIn} 1s ease-out 0.6s backwards, ${pendulumButton} 2.5s ease-in-out infinite 1.25s`,
              transformOrigin: 'bottom center', 
              '&:hover': {
                animationPlayState: 'paused', 
                transform: "scale(1.05) translateY(-3px)", 
                boxShadow: `0 14px 35px -12px rgba(0,0,0,0.4)`,
                backgroundColor: theme.palette.grey[200],
              }
            }}
            onClick={() => setShowOverview(true)}
          >
            Bắt đầu hành trình
          </Button>
           <WorkOverview open={showOverview} onClose={() => setShowOverview(false)} />
          <Box
            sx={{
              position: 'absolute', 
              bottom: theme.spacing(-8), 
              left: '50%',
              transform: 'translateX(-50%)',
              
              zIndex: 2, 
            }}
          >
            <IconButton
              onClick={() => {
                const nextSection = document.getElementById('science'); 
                if (nextSection) {
                  nextSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              sx={{
                color: theme.palette.common.white,
                animation: `${bounceDown} 2s infinite`,
                padding: '8px', 
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
              aria-label="Cuộn xuống"
            >
              <KeyboardArrowDownIcon sx={{ fontSize: '3.5rem' }} />
            </IconButton>
          </Box>
        </Container>
      </HeroSectionStyled>

      <Container maxWidth="lg" sx={{ py: {xs: 5, sm: 8} }} id="science">
        <SectionTitleStyled variant="h3">
          Vì Sao Chế Độ Ăn Quyết Định Tuổi Thọ?
        </SectionTitleStyled>
        {scienceSteps.map((step, idx) => (
          <ScienceStepItemStyled
            container 
            item 
            xs={12} 
            key={idx}
            reverse={idx % 2 !== 0} 
            style={getAnimationDelay(idx, 0.1)} 
          >
            <ScienceStepIconWrapperStyled className={idx % 2 !== 0 ? 'reversed' : ''}>
              <Avatar sx={{
                bgcolor: "#328E6E", 
                width: {xs: 80, sm: 100, md: 110},
                height: {xs: 80, sm: 100, md: 110},
                boxShadow: theme.shadows[5],
                transition: 'transform 0.5s ease-in-out',
                animation: `${spinAround} 5s linear infinite`
              }}>
                {React.cloneElement(step.icon, { sx: { fontSize: {xs: 40, sm: 50, md: 60}, color: "#fff" }})}
              </Avatar>
            </ScienceStepIconWrapperStyled>

            <ScienceStepTextWrapperStyled>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: "#323232", fontFamily:"'Roboto Slab', serif" }}>
                {step.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: {xs: '0.95rem', sm: '1rem'} }}>
                {step.desc}
              </Typography>
            </ScienceStepTextWrapperStyled>
          </ScienceStepItemStyled>
        ))}
      </Container>

      <CombinedSectionStyled>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center"> 

            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', p: {xs: 2, sm: 3}, animation: `${fadeIn} 1s ease-out 0.2s backwards` }}>
                <Typography
                  variant="h4" 
                  component="h2" 
                  sx={{
                    fontFamily: "'Roboto Slab', serif",
                    fontWeight: 700,
                    color: 'text.primary', 
                    mb: 1.5,
                    display: 'flex', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap', 
                    lineHeight: 1.8, 
                  }}
                >
                  {"Sẵn sàng cho một thực đơn dành riêng cho bạn?".split('').map((char, index) => (
                    <Box
                      component="span" 
                      key={index}
                      sx={{
                        display: 'inline-block', 
                        animation: `${letterWave} 2s ease-in-out infinite`, 
                        animationDelay: `${index * 0.07}s`, 
                        marginRight: char === " " ? '0.1em' : '0.03em', 
                        minWidth: char === " " ? '0.1em' : 'auto', 
                      }}
                    >
                      {char === " " ? '\u00A0' : char} 
                    </Box>
                  ))}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{mb:3.5, fontSize: '1.1rem', lineHeight: 1.7}}>
                    Khám phá quy trình khoa học, dựa trên dữ liệu và phân tích cá nhân hóa đằng sau mỗi gợi ý dinh dưỡng của chúng tôi.
                </Typography>
                <StarButton
                  onClick={() => {
                      setShowHowMenuDialog(true);
                      setHowMenuStep(0);
                  }}
                >
                  Quy trình tạo thực đơn
                </StarButton>
                
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{animation: `${fadeIn} 1s ease-out 0.4s backwards`}}>
                <LongevityQuoteCarousel />
              </Box>
            </Grid>

          </Grid>
        </Container>
      </CombinedSectionStyled>

      <Container maxWidth="lg" sx={{ py: {xs: 5, sm: 8} , overflow: 'hidden'}}>
        <SectionTitleStyled variant="h3">
          Bí Quyết Vàng Cho Tuổi Thọ
        </SectionTitleStyled>

        
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row', 
            overflowX: 'auto',    
            py: 4,               
            mb: -4,              
            px: {xs: 1, sm: 2},   
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.grey[200],
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.grey[400],
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.grey[500],
            },
            scrollSnapType: 'x mandatory', 
            '& > *': { 
              scrollSnapAlign: 'center', 
            },
          }}
        >
          {longevityTips.map((tip, idx) => {
            const isActive = idx === activeLongevityTip;
            const isAdjacent = Math.abs(idx - activeLongevityTip) === 1;
            const isDistant = Math.abs(idx - activeLongevityTip) > 1;

            let cardStyle = {
              transition: 'transform 0.4s ease-out, opacity 0.4s ease-out, filter 0.4s ease-out',
              flex: '0 0 auto', 
              width: { xs: '80%', sm: '60%', md: 'calc(100% / 3 - 16px)' }, 
              minWidth: { xs: 280, sm: 320 }, 
              marginRight: theme.spacing(2.5),
              opacity: 1,
              transform: 'scale(1)',
              filter: 'brightness(1)',
            };

            if (!isActive) {
              cardStyle.transform = 'scale(0.85)'; 
              cardStyle.opacity = 0.6;           
              cardStyle.filter = 'brightness(0.7)'; 
              if (isDistant) {
                cardStyle.transform = 'scale(0.75)';
                cardStyle.opacity = 0.3;
                cardStyle.filter = 'brightness(0.5)';
              }
            } else {
              cardStyle.boxShadow = theme.shadows[12]; 
              cardStyle.transform = 'scale(1.05) translateY(-5px)'; 
            }


            return (
              <LongevityTipCardStyled
                key={idx}
                style={getAnimationDelay(idx, 0.1)} 
                sx={{
                  ...cardStyle,
                  cursor: 'pointer',
                  '&:last-child': { marginRight: 0 } 
                }}
                onClick={() => setActiveLongevityTip(idx)} 
              >
                <TipNumberStyled sx={{backgroundColor: isActive ? theme.palette.success.main : theme.palette.secondary.main }}>{idx + 1}</TipNumberStyled>
                <CardContent sx={{ p: {xs: 2.5, sm: 3.5}, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flexGrow: 1, justifyContent: 'flex-start', pt: 3 }}>
                  <Avatar sx={{
                    bgcolor: 'transparent',
                    width: 72, height: 72, mb: 2.5,
                  }}>
                     {React.cloneElement(tip.icon, { sx: { fontSize: 48, color: isActive ? theme.palette.success.main : theme.palette.primary.main }})}
                  </Avatar>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: isActive ? theme.palette.success.dark : 'text.primary', fontFamily: "'Roboto Slab', serif", mb: 1.5, fontSize: {xs: '1.3rem', sm: '1.5rem'} }}>
                    {tip.title}
                  </Typography>
                  <Typography variant="body1" color={isActive ? 'text.primary' : "text.secondary"} sx={{ lineHeight: 1.75, fontSize: {xs: '0.9rem', sm: '1rem'} }}>
                    {tip.desc}
                  </Typography>
                </CardContent>
              </LongevityTipCardStyled>
            );
          })}
        </Box>
      </Container>

      {showScrollTop && (
        <IconButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1300, backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' }, animation: `${fadeIn} 0.3s ease-out`, boxShadow: theme.shadows[6] }} >
          <ArrowUpwardIcon />
        </IconButton>
      )}
      <EatTodayMascot onClick={() => setMenuDialogOpen(true)} />
      {isLoadingMenu && <FoodLoadingOverlay />}
      <Snackbar open={showLoginMsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} message="Vui lòng đăng nhập trước..." ContentProps={{ sx: { fontWeight: 600, fontSize: 18, background: "#d32f2f", borderRadius: 25 } }} />
    </Box>
  );
}

export default Home;