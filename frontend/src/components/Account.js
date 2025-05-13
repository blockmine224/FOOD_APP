import React, { useState, useEffect } from 'react';
import { keyframes } from '@mui/system';
import { Container, Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccountSidebar from './AccountSidebar';
import PersonalInfoSection from './PersonalInfoSection';
import NutritionRecommendationSection from './NutritionRecommendationSection';
import RecommendationMenuSection from './RecommendationMenuSection';
import EatTodayMascot from './EatTodayMascot';
import MenuDialog from './MenuDialog';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import FoodLoadingOverlay from './FoodLoadingOverlay';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px);}
  to   { opacity: 1; transform: translateY(0);}
`;

function Account() {
  const { logout, updateDisplayName } = useAuth();
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    gender: '',
    date_of_birth: '',
    height: '',
    weight: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [showUnrecMenu, setShowUnrecMenu] = useState(false);
  const [lastMenuParams, setLastMenuParams] = useState(null);
  const [showMenuSuggestPanel, setShowMenuSuggestPanel] = useState(false);
  const [preference, setPreference] = useState('');
  const [restrictions, setRestrictions] = useState([]);
  const getToken = () => localStorage.getItem('token');

  const API = process.env.REACT_APP_API_URL;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [section, setSection] = useState("personal");
  const navigate = useNavigate();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSidebarSelect = (key) => {
    if (key === "home") {
      navigate("/");
    } else {
      setSection(key);
    }
  };

  const handlePreview = () => {
    if (avatar || userData.avatarUrl) {
      const imageUrl = avatar || userData.avatarUrl;
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${API}${imageUrl}`;
      setPreviewUrl(fullUrl);
      setOpenPreview(true);
    }
  };

  const handleGetRecommendations = async (params) => {
    try {
      setIsLoadingMenu(true);
      setError('');
      setLastMenuParams(params);
      const token = getToken();
      const response = await fetch(`${API}/api/menu/recommendations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activity_level: params.activityLevel,
          goal_type: params.goalType,
          goal_intensity: params.goalIntensity
        })
      });
      const data = await response.json();
      if (response.ok) {
        setRecommendations(data);
        setShowUnrecMenu(false);
        if (section !== "menu") setShowMenuSuggestPanel(true); 
      } else {
        setError(data.error || 'Failed to load menu recommendations');
      }
    } catch (err) {
      setError('Failed to load menu recommendations.');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const translateBMICategory = (category) => {
    switch (category) {
      case 'underweight': return 'Thiếu cân';
      case 'normal': return 'Bình thường';
      case 'overweight': return 'Thừa cân';
      case 'obese': return 'Béo phì';
      default: return category;
    }
  };

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

        const prefRes = await fetch(`${API}/api/users/preferences`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (prefRes.ok) {
          const prefData = await prefRes.json();
          setPreference(prefData.preference_type || '');
          setRestrictions(prefData.restriction_types || []);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5242880) {
        setError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setIsUploading(true);
      setError('');
      setMessage('');
      const previewUrl = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append('avatar', file);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API}/api/users/avatar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const data = await response.json();
        if (response.ok) {
          const fullAvatarUrl = `${API}${data.avatarUrl}`;
          setAvatar(fullAvatarUrl);
          setUserData(prev => ({ ...prev, avatarUrl: fullAvatarUrl }));
          setMessage('Cập nhật ảnh đại diện thành công!');
        } else {
          setError(data.message || 'Không thể tải lên ảnh. Vui lòng thử lại.');
        }
      } catch (error) {
        setError('Đã xảy ra lỗi khi tải lên ảnh');
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { logout(); return; }
        const userResponse = await fetch(`${API}/api/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error();
        const userData = await userResponse.json();
        setUserData(userData);
      } catch (error) {
        setError('Lỗi lấy dữ liệu, hãy đăng nhập lại.');
      }
    };
    if (searchParams.get('success') === 'loggedin') {
      setMessage('Đăng nhập thành công!');
      searchParams.delete('success');
      setSearchParams(searchParams);
    }
    fetchData();
  }, [logout, searchParams, setSearchParams]);

  const handleEdit = () => { setEditMode(true); setMessage(''); setError(''); };

  const handleSave = async () => {
    setMessage(''); setError('');
    if (!userData.displayName) { setError('Tên hiển thị không được trống!'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) { setError('Vui lòng nhập địa chỉ email hợp lệ.'); return; }

    const dob = userData.date_of_birth;
    const height = Number(userData.height);
    const weight = Number(userData.weight);

    if (dob) {
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age < 12 || age > 120) {
          setError('Tuổi phải từ 12 đến 120');
          return;
        }
    }

    if (height < 130 || height > 250) {
        setError('Chiều cao phải từ 130 đến 250 cm');
        return;
    }
    if (weight < 25 || weight > 300) {
        setError('Cân nặng phải từ 25 đến 300 kg');
        return;
    }

    const token = localStorage.getItem('token');
    try {
      
      const response = await fetch(`${API}/api/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to update user data.');
        return;
      }
      
      const prefRes = await fetch(`${API}/api/users/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          preference_type: preference,
          restriction_types: restrictions,
        }),
      });
      const prefData = await prefRes.json();
      if (!prefRes.ok) {
        setError(prefData.message || 'Failed to update preferences.');
        return;
      }
      setMessage('Thay đổi thông tin thành công!');
      setEditMode(false);
      localStorage.setItem('displayName', userData.displayName);
      updateDisplayName(userData.displayName);
    } catch (error) {
      setError('Failed to save changes.');
    }
  };


  const handleChange = (e) => { setUserData({ ...userData, [e.target.name]: e.target.value }); };
  const getInitials = (name) => name.split(' ').map(word => word[0]).join('').toUpperCase();
  const handleCancel = () => { setEditMode(false); setMessage(''); };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AccountSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
        selectedKey={section}
        onSelect={handleSidebarSelect}
        avatarUrl={avatar || userData.avatarUrl}
        displayName={userData.displayName || "User"}
      />
      <Box sx={{
        flex: 1,
        pl: sidebarOpen ? 28 : 9,
        pr: 0,
        pt: 4,
        transition: "padding-left 0.3s"
      }}>
        <Container maxWidth="lg">
          <MenuDialog
            open={menuDialogOpen}
            onClose={() => setMenuDialogOpen(false)}
            onConfirm={handleGetRecommendations}
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
                userData={userData}
                isLoadingMenu={isLoadingMenu}
                menuDialogOpen={menuDialogOpen}
                setMenuDialogOpen={setMenuDialogOpen}
                handleGetRecommendations={handleGetRecommendations}
                recommendations={recommendations}
                showUnrecMenu={showUnrecMenu}
                setShowUnrecMenu={setShowUnrecMenu}
                translateBMICategory={translateBMICategory}
                lastMenuParams={lastMenuParams}
            
              />
            </Box>
          </Dialog>

          {isLoadingMenu && <FoodLoadingOverlay />}
          {section === "personal" && (
            <PersonalInfoSection
              userData={userData}
              avatar={avatar}
              isUploading={isUploading}
              getInitials={getInitials}
              handlePreview={handlePreview}
              handleAvatarUpload={handleAvatarUpload}
              editMode={editMode}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancel={handleCancel}
              handleChange={handleChange}
              textFieldStyle={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': { '& fieldset': { borderColor: 'primary.main' } },
                  '&.Mui-focused': { '& fieldset': { borderWidth: '2px' } },
                },
              }}
              message={message}
              setMessage={setMessage}
              error={error}
              setError={setError}
              preference={preference}
              setPreference={setPreference}
              restrictions={restrictions}
              setRestrictions={setRestrictions}
            />
          )}
          {section === "nutrition" && (
            <NutritionRecommendationSection
              recommendations={recommendations}
              translateBMICategory={translateBMICategory}
              
            />
          )}
          {section === "menu" && (
            <RecommendationMenuSection
              showCreateMenuButton={true}
              userData={userData}
              isLoadingMenu={isLoadingMenu}
              menuDialogOpen={menuDialogOpen}
              setMenuDialogOpen={setMenuDialogOpen}
              handleGetRecommendations={handleGetRecommendations}
              recommendations={recommendations}
              showUnrecMenu={showUnrecMenu}
              setShowUnrecMenu={setShowUnrecMenu}
              translateBMICategory={translateBMICategory}
              lastMenuParams={lastMenuParams}
              
            />
          )}
          <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md">
            <DialogTitle>Ảnh đại diện</DialogTitle>
            <DialogContent>
              <Box component="img" src={previewUrl} alt="Avatar preview" sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPreview(false)}>Đóng</Button>
            </DialogActions>
          </Dialog>
        </Container>
        <EatTodayMascot onClick={() => setMenuDialogOpen(true)} />
      </Box>
    </Box>
  );
}

export default Account;