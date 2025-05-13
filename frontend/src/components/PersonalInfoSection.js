import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Divider, Avatar, Stack, IconButton, Tooltip, TextField, MenuItem, Alert,
  FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText, Button, Chip, Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Abc as PersonIcon,
  Wc as GenderIcon,
  Scale as WeightIcon,
  Height as HeightIcon,
  Cake as BirthdayIcon,
  AccessTime as TimeIcon,
  Image as ImageIcon,
  Restaurant as PreferenceIcon,
  ThumbUp as LikeIcon,
  Block as RestrictionIcon
} from '@mui/icons-material';

const PREFERENCES = [
  { value: '', label: 'Không ' },
  { value: 'more_vegetables', label: 'Nhiều rau' },
  { value: 'less_vegetables', label: 'Ít rau' },
  { value: 'soup', label: 'Món canh' },
  { value: 'fried', label: 'Món chiên' },
  { value: 'spicy', label: 'Món cay' },
];

const RESTRICTIONS = [
  { value: 'hypertension', label: 'Tăng huyết áp' },
  { value: 'cardio', label: 'Bệnh tim mạch' },
  { value: 'atherosclerosis', label: 'Xơ vữa động mạch' },
  { value: 'diabetes', label: 'Tiểu đường' },
  { value: 'obesity', label: 'Béo phì' },
];

export default function PersonalInfoSection({
  userData,
  avatar,
  isUploading,
  getInitials,
  handlePreview,
  handleAvatarUpload,
  editMode,
  handleEdit,
  handleSave,
  handleCancel,
  handleChange,
  textFieldStyle,
  message,
  setMessage,
  error,
  setError,
  preference,
  setPreference,
  restrictions,
  setRestrictions
}) {
  
  const [prefMessage, setPrefMessage] = useState('');
  const [prefError, setPrefError] = useState('');
  const API = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API}/api/users/preferences`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPreference(data.preference_type || '');
        setRestrictions(data.restriction_types || []);
      });
  }, []);

  

  const handleRestrictionChange = (event) => {
    const {
      target: { value }
    } = event;
    setRestrictions(
      typeof value === 'string' ? value.split(',') : value
    );
  };

  return (
    <Box>
      <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
        <Box position="relative">
          <Avatar
            src={avatar || userData.avatarUrl}
            onClick={handlePreview}
            sx={{
              width: 110, height: 110, bgcolor: '#2D336B', fontSize: '2.5rem',
              border: '4px solid', borderColor: '#000000',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)', cursor: 'pointer', opacity: isUploading ? 0.7 : 1
            }}
          >
            {!avatar && !userData.avatarUrl && getInitials(userData.displayName || 'User')}
          </Avatar>
          <input
            type="file"
            accept="image/*"
            id="avatar-upload"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
            disabled={isUploading}
          />
          <label htmlFor="avatar-upload">
            <IconButton
              component="span"
              disabled={isUploading}
              sx={{
                position: 'absolute', bottom: -5, right: 8, backgroundColor: 'primary.main', color: 'white',
                '&:hover': { backgroundColor: 'primary.dark', transform: 'scale(1.1)' }, width: 32, height: 32,
                border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'all 0.3s ease'
              }}
            >
              <ImageIcon />
            </IconButton>
          </label>
        </Box>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{fontFamily:"Roboto slab"}} > 
          {userData.displayName}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <TimeIcon fontSize="small" />
          Thành viên kể từ {new Date().getFullYear()}
        </Typography>
      </Box>
      <Divider />
      {message && (
        <Alert severity="success" sx={{ my: 2 }} onClose={() => setMessage('')}>{message}</Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ my: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      <Box mt={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{fontFamily:"Roboto slab"}} > Thông tin cá nhân</Typography>

          {!editMode ? (
            <Tooltip title="Sửa thông tin">
              <IconButton onClick={handleEdit} color="primary"><EditIcon /></IconButton>
            </Tooltip>
          ) : (
            <Box>
              <Tooltip title="Lưu thay đổi">
                <IconButton onClick={handleSave} color="primary" sx={{ mr: 1 }}><SaveIcon /></IconButton>
              </Tooltip>
              <Tooltip title="Hủy">
                <IconButton onClick={handleCancel} color="error"><CancelIcon /></IconButton>
              </Tooltip>
            </Box>
          )}
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {editMode ? (
          <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 } }}>
            <TextField label="Tên hiển thị" name="displayName" value={userData.displayName || ''} onChange={handleChange} fullWidth variant="outlined" sx={textFieldStyle}
              InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
            <TextField label="Email" name="email" value={userData.email || ''} onChange={handleChange} fullWidth variant="outlined" sx={textFieldStyle}
              InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
            <TextField label="Giới tính" name="gender" value={userData.gender || ''} onChange={handleChange} fullWidth variant="outlined" select sx={textFieldStyle}
              InputProps={{ startAdornment: <GenderIcon sx={{ mr: 1, color: 'primary.main' }} /> }}>
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
            </TextField>
            <TextField
                label="Ngày sinh"
                name="date_of_birth"
                type="date"
                value={userData.date_of_birth || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={textFieldStyle}
                InputProps={{
                    startAdornment: <BirthdayIcon sx={{ mr: 1, color: 'secondary.light' }} />
                }}
                InputLabelProps={{ shrink: true }}
                error={
                    editMode &&
                    !!userData.date_of_birth &&
                    (() => {
                        const today = new Date();
                        const birth = new Date(userData.date_of_birth);
                        let age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                        return age < 12 || age > 120;
                    })()
                }
                helperText={
                    editMode && userData.date_of_birth
                        ? (() => {
                            const today = new Date();
                            const birth = new Date(userData.date_of_birth);
                            let age = today.getFullYear() - birth.getFullYear();
                            const m = today.getMonth() - birth.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                            if (age < 12 || age > 120) return "Tuổi phải từ 12 đến 120";
                            return `Tuổi: ${age}`;
                        })()
                        : ""
                }
            />
            <TextField
                label="Chiều cao (cm)"
                name="height"
                type="number"
                value={userData.height || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={textFieldStyle}
                InputProps={{
                    startAdornment: <HeightIcon sx={{ mr: 1, color: 'primary.main' }} />
                }}
                error={editMode && !!userData.height && (userData.height < 130 || userData.height > 250)}
                helperText={
                    editMode && !!userData.height && (userData.height < 130 || userData.height > 250)
                        ? "Chiều cao phải từ 130 đến 250 cm"
                        : ""
                }
            />
            <TextField
                label="Cân nặng (kg)"
                name="weight"
                type="number"
                value={userData.weight || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                sx={textFieldStyle}
                InputProps={{
                    startAdornment: <WeightIcon sx={{ mr: 1, color: 'primary.main' }} />
                }}
                error={editMode && !!userData.weight && (userData.weight < 25 || userData.weight > 300)}
                helperText={
                    editMode && !!userData.weight && (userData.weight < 25 || userData.weight > 300)
                        ? "Cân nặng phải từ 25 đến 300 kg"
                        : ""
                }
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="preference-label" sx={{ display: 'flex', alignItems: 'center' }}>
                <LikeIcon sx={{ mr: 1, color: 'primary.main' }} /> Sở thích
              </InputLabel>
              <Select
                labelId="preference-label"
                id="preference"
                value={preference}
                label={<><LikeIcon sx={{ mr: 1, color: 'primary.main' }} /> Sở thích</>}
                onChange={(e) => setPreference(e.target.value)}
                input={<OutlinedInput label="Sở thích" />}
                startAdornment={<LikeIcon sx={{ mr: 1, color: 'primary.main' }} />}
              >
                {PREFERENCES.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PreferenceIcon sx={{ color: 'primary.main', fontSize: 18, mr: 1 }} />
                      {opt.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="restriction-label" sx={{ display: 'flex', alignItems: 'center' }}>
                <RestrictionIcon sx={{ mr: 1, color: 'error.main' }} /> Hạn chế
              </InputLabel>
              <Select
                labelId="restriction-label"
                id="restriction"
                multiple
                value={restrictions}
                onChange={handleRestrictionChange}
                input={<OutlinedInput label="Hạn chế" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === 0
                      ? <Chip label="Không có" size="small" />
                      : selected.map((value) => (
                        <Chip key={value}
                          icon={<RestrictionIcon sx={{ color: 'error.main', fontSize: 16 }} />}
                          label={RESTRICTIONS.find(opt => opt.value === value)?.label || value}
                          size="small"
                        />
                      ))}
                  </Box>
                )}
                startAdornment={<RestrictionIcon sx={{ mr: 1, color: 'error.main' }} />}
              >
                {RESTRICTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    <Checkbox checked={restrictions.indexOf(opt.value) > -1} color="error" />
                    <ListItemText primary={opt.label}
                      sx={{ ml: 1, display: 'flex', alignItems: 'center' }}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Box sx={{ '& > div': { mb: 1.5 } }}>
            <Box display="flex" alignItems="center"><PersonIcon sx={{ mr: 2, color: 'primary.main' }} /><Typography variant="body2" color="textSecondary">Tên hiển thị:</Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>{userData.displayName || 'Chưa cập nhật'}</Typography>
            </Box>
            <Box display="flex" alignItems="center"><EmailIcon sx={{ mr: 2, color: 'primary.main' }} /><Typography variant="body2" color="textSecondary">Email:</Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>{userData.email || 'Chưa cập nhật'}</Typography>
            </Box>
            <Box display="flex" alignItems="center"><GenderIcon sx={{ mr: 2, color: userData.gender === 'male' ? 'primary.main' : userData.gender === 'female' ? 'secondary.main': 'text.disabled' }} /><Typography variant="body2" color="textSecondary">Giới tính:</Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {userData.gender === 'male' ? 'Nam' : userData.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center"><BirthdayIcon sx={{ mr: 2, color: 'secondary.light' }} /><Typography variant="body2" color="textSecondary">Ngày sinh:</Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>{userData.date_of_birth || 'Chưa cập nhật'}</Typography>
            </Box>
            <Box display="flex" alignItems="center"><HeightIcon sx={{ mr: 2, color: 'primary.main' }} /><Typography variant="body2" color="textSecondary">Chiều cao:</Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>{userData.height ? `${userData.height} cm` : 'Chưa cập nhật'}</Typography>
            </Box>
            <Box display="flex" alignItems="center"><WeightIcon sx={{ mr: 2, color: 'primary.main' }} /><Typography variant="body2" color="textSecondary">Cân nặng:</Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>{userData.weight ? `${userData.weight} kg` : 'Chưa cập nhật'}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <LikeIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="body2" color="textSecondary">Sở thích:</Typography>
              <Typography variant="body1" sx={{ ml: 1 }}>
                {preference
                  ? PREFERENCES.find(p => p.value === preference)?.label || preference
                  : 'Không '}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <RestrictionIcon sx={{ mr: 2, color: 'error.main' }} />
              <Typography variant="body2" color="textSecondary">Hạn chế:</Typography>
              <Box sx={{ ml: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {restrictions.length === 0
                  ? <Chip label="Không có" size="small" />
                  : restrictions.map(r => (
                    <Chip
                      key={r}
                      icon={<RestrictionIcon sx={{ color: 'error.main', fontSize: 16 }} />}
                      label={RESTRICTIONS.find(opt => opt.value === r)?.label || r}
                      size="small"
                    />
                  ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}