import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  IconButton,
  Divider 
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import X from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import backgroundImage from '../images/footer_r.jpg';


function Footer() {
  const currentYear = new Date().getFullYear();

  const foodLinks = [
    {
      name: "Tuikhoeconban",
      url: "https://tuikhoeconban.com/macronutrients/",
      description: " "
    },
    {
      name: "Bộ y tế",
      url: "https://moh.gov.vn/",
      description: " "
    },
    {
      name: "Nutritionsource",
      url: "https://nutritionsource.hsph.harvard.edu/",
      description: " "
    },
    {
      name: "Who",
      url: "https://www.who.int/health-topics/nutrition#tab=tab_1",
      description: " "
    },
    {
      name: "WebMD",
      url: "https://www.webmd.com/diet/default.htm",
      description: " "
    },
    {
      name: "Soumaki.vn",
      url: "https://soumaki.com.vn/vi/home/",
      description: " "
    }
  ];

  

  return (
    <Box
      component="footer"
      sx={{
        backgroundImage: `linear-gradient(rgba(20, 20, 20, 0.6), rgba(20, 20, 20, 0.6)), url(${backgroundImage})`,
        color: 'white',
        pt: 8, 
        pb: 4, 
        mt: 'auto',
        position: 'relative', 
        '&::before': { 
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
        }
      }}
    >
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily:"Roboto Slab" }}>
              Khám phá thêm
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {foodLinks.map((link, index) => (
                <Box key={index}>
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                    sx={{
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        opacity: 0.8,
                        transform: 'translateX(5px)'
                      },
                      display: 'block'
                    }}
                  >
                    {link.name}
                  </Link>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.75rem'
                    }}
                  >
                    {link.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily:"Roboto Slab" }}>
              Truy cập nhanh 
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      textDecoration: 'underline',
                      opacity: 0.8,
                      transform: 'translateX(5px)'
                    },
                    display: 'block'
                  }}
                >
                  Trang chủ
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily:"Roboto Slab" }}>
              Liên hệ 
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: '1rem' }} />
                <Typography variant="body2">support@foodwebsite.com</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontFamily:"Roboto Slab" }}>
              Theo dõi 
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="X">
                <X />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <Box sx={{ 
          textAlign: 'center',
          pt: 0,
          pb: 0 
        }}>
          <Typography variant="body2" color="inherit" >
            © {currentYear} Food Website. All rights reserved.
          </Typography>
          <Box >
            {/*
            <Link href="/privacy" color="inherit" sx={{ mx: 1 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" sx={{ mx: 1 }}>
              Terms of Service
            </Link>
            <Link href="/help" color="inherit" sx={{ mx: 1 }}>
              Help Center
            </Link>
            */}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;