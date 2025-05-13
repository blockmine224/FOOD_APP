import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Stack,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import WcIcon from '@mui/icons-material/Wc';
import HeightIcon from '@mui/icons-material/Height';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import CakeIcon from '@mui/icons-material/Cake';
import backgroundImage from '../images/bg123_r.jpg';

function RegisterStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem('token');
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!token) {
      navigate('/register');
    }
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    gender: '',
    dateOfBirth: null,
    height: '',
    weight: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateHeight = (height) => height >= 130 && height <= 250;
  const validateWeight = (weight) => weight >= 25 && weight <= 300;
  const validateAge = (dob) => {
    if (!dob) return false;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 12 && age <= 120;
  };
  const getAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const heightError = formData.height && !validateHeight(Number(formData.height));
  const weightError = formData.weight && !validateWeight(Number(formData.weight));
  const ageError = formData.dateOfBirth && !validateAge(formData.dateOfBirth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (
      !formData.gender ||
      !formData.dateOfBirth ||
      !formData.height ||
      !formData.weight
    ) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      setIsSubmitting(false);
      return;
    }

    if (!validateAge(formData.dateOfBirth)) {
      setError('Tuổi phải từ 12 đến 120.');
      setIsSubmitting(false);
      return;
    }
    if (!validateHeight(Number(formData.height))) {
      setError('Chiều cao phải từ 130 đến 250 cm.');
      setIsSubmitting(false);
      return;
    }
    if (!validateWeight(Number(formData.weight))) {
      setError('Cân nặng phải từ 25 đến 300 kg.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/users/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0],
          height: String(formData.height),
          weight: String(formData.weight),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login?success=registered');
      } else {
        setError(data.message || 'Không thể hoàn thành đăng ký.');
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
          sx={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              backgroundImage: `linear-gradient(rgba(20, 20, 20, 0.6), rgba(20, 20, 20, 0.6)), url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: -1,
            }
          }}
        >
    <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 6 }, minHeight: '90vh' }}>
      <Paper
        elevation={5}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 5,
          mt: 3,
          boxShadow: '0 6px 36px 0 rgba(80,90,130,0.13)',
          background: 'snow',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight={800}
          textAlign="center"
          gutterBottom
          sx={{
            fontFamily: 'Roboto Slab',
            background: 'linear-gradient(90deg,#6366f1,#22d3ee)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            letterSpacing: 1,
            mb: 3,
          }}
        >
          Hoàn tất hồ sơ cá nhân
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" textAlign="center" mb={2} fontWeight={500}>
          Vui lòng nhập thông tin để cá nhân hóa trải nghiệm của bạn.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontWeight: 600 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <FormControl fullWidth margin="normal">
            <InputLabel id="gender-label">
              <WcIcon sx={{ mr: 1, mb: '-4px', fontSize: 20 }} />
              Giới tính
            </InputLabel>
            <Select
              labelId="gender-label"
              value={formData.gender}
              label="Giới tính"
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
              sx={{ fontWeight: 600 }}
            >
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
              
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={
                <span>
                  <CakeIcon sx={{ mr: 1, mb: '-4px', fontSize: 18 }} />
                  Ngày sinh
                </span>
              }
              value={formData.dateOfBirth}
              disableFuture
              inputFormat="yyyy-MM-dd"
              onChange={(newValue) => setFormData({ ...formData, dateOfBirth: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  required
                  error={Boolean(ageError)}
                  helperText={
                    ageError
                      ? 'Tuổi phải từ 12 đến 120'
                      : formData.dateOfBirth
                      ? `Tuổi: ${getAge(formData.dateOfBirth)}`
                      : ''
                  }
                />
              )}
            />
          </LocalizationProvider>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
            <TextField
              fullWidth
              label={<span><HeightIcon sx={{ mb: '-4px', fontSize: 20 }} /> Chiều cao (cm)</span>}
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              margin="normal"
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
              }}
              error={Boolean(heightError)}
              helperText={heightError ? 'Chiều cao từ 130 đến 250 cm' : ' '}
              sx={{
                '& input': { fontWeight: 600, fontSize: 18 },
              }}
            />

            <TextField
              fullWidth
              label={<span><MonitorWeightIcon sx={{ mb: '-4px', fontSize: 20 }} /> Cân nặng (kg)</span>}
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              margin="normal"
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">kg</InputAdornment>,
              }}
              error={Boolean(weightError)}
              helperText={weightError ? 'Cân nặng từ 25 đến 300 kg' : ' '}
              sx={{
                '& input': { fontWeight: 600, fontSize: 18 },
              }}
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 4,
              fontWeight: 800,
              fontSize: 20,
              fontFamily: 'Roboto Slab',
              borderRadius: 2,
              py: 1.5,
              background: 'linear-gradient(90deg,#6366f1,#22d3ee)',
              boxShadow: '0 6px 20px 0 rgba(34,211,238,0.10)',
            }}
            disabled={isSubmitting}
            endIcon={isSubmitting && <CircularProgress color="inherit" size={22} />}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
          </Button>
        </form>
      </Paper>
    </Container>
    </Box>
  );
}

export default RegisterStep2;