import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  TextField, 
  InputAdornment, 
  useScrollTrigger, 
  Slide,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, displayName, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [userData, setUserData] = useState(null);
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.avatarUrl && !data.avatarUrl.startsWith('http')) {
              data.avatarUrl = `${API}${data.avatarUrl}`;
            }
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);
  
  const trigger = useScrollTrigger({
    threshold: 0,
    disableHysteresis: true
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const buttonStyle = {
    mr: { xs: 0.5, sm: 1 },
    fontFamily: "Roboto Slab",
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    fontSize: { xs: '0.8rem', sm: '0.875rem' },
    padding: { xs: '6px 12px', sm: '8px 16px' },
    '&::before': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: '2px',
      backgroundColor: '#000000',
      transition: 'width 0.3s ease',
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      '&::before': {
        width: '80%',
      },
    },
  };

  const getAvatarText = () => {
    if (!displayName) return '?';
    return displayName.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar position="fixed" 
          sx={{
            background: `radial-gradient(circle at center, rgba(255,255,255,0.2), transparent 70%), 
                         linear-gradient(45deg, #FFFDF2,#fafafa)`,
            backdropFilter: 'saturate(180%) blur(6px)',
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
          }}>
          <Toolbar sx={{ 
           
            transition: 'all 0.3s ease',
          }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="home" 
              component={Link} 
              to="/"
              sx={{
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                },
              }}
            >
              <img 
                src="/icon_2.ico" 
                alt="home icon" 
                style={{ width: 35, height: 35 }}
              />
            </IconButton>

            <Typography 
              variant="h6" 
              sx={{ 
                flexGrow: 1, 
                ml: { xs: 1, sm: 2 }, 
                fontFamily: "Roboto Slab",
                fontSize: { xs: '1rem', sm: '1.2rem' }, 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #FFFFFF 30%, #E3F2FD 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: '#323232',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {isAuthenticated ? `Xin chào, ${displayName}!` : 'Tuổi Thọ & Dinh Dưỡng'}
            </Typography>

            

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/account" 
                    sx={{
                      ...buttonStyle,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: '#323232'
                    }}
                  >
                    <Avatar 
                      src={userData?.avatarUrl} 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: '#2D336B',
                        border: '2px solid white',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {!userData?.avatarUrl && displayName ? getAvatarText() : null}
                    </Avatar>
                    Tài khoản
                  </Button>
                  <Button 
                    color="inherit"
                    onClick={handleLogout}
                    sx={{...buttonStyle, color:'#323232'}}
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login" 
                    sx={{...buttonStyle, color:'#323232'}}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/register" 
                    sx={{...buttonStyle, color:'#323232'}}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </Box>
            )}

            {isMobile && (
              <>
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuOpen}
                  sx={{ ml: 1, color:'#323232'}} 
                >
                  {isAuthenticated ? (
                     <Avatar 
                     src={userData?.avatarUrl}
                     sx={{ 
                       width: 35, 
                       height: 35, 
                       bgcolor: 'secondary.main',
                       border: '2px solid white',
                       transition: 'all 0.3s ease',
                       '&:hover': {
                         transform: 'scale(1.1)',
                         boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                       }
                     }}
                   >
                     {!userData?.avatarUrl && displayName ? getAvatarText() : null}
                   </Avatar>
                  ) : (
                    <MenuIcon />
                  )}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  sx={{
                    '& .MuiMenuItem-root': {
                      fontFamily: 'Roboto Slab',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      }
                    }
                  }}
                >
                  {isAuthenticated ? (
                    <>
                      <MenuItem component={Link} to="/account" onClick={handleMenuClose}>
                        Tài khoản
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                        Đăng nhập
                      </MenuItem>
                      <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
                        Đăng ký
                      </MenuItem>
                    </>
                  )}
                  <MenuItem>
                    <TextField
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="Tìm kiếm..."
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>
      </Slide>
      <Toolbar />
    </>
  );
}

export default Header;