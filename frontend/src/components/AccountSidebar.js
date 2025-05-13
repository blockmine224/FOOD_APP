import React from 'react';
import { Box, Avatar, Typography, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Tooltip, Divider } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';

const navItems = [
  { key: "home", label: "Trang chủ", icon: <HomeIcon /> },
  { key: "personal", label: "Thông tin cá nhân", icon: <PersonIcon /> },
  { key: "nutrition", label: "Thực đơn của bạn", icon: <AssessmentIcon /> },
  { key: "menu", label: "Xây dựng thực đơn", icon: <RestaurantMenuIcon /> }
];

export default function AccountSidebar({
  open,
  onToggle,
  selectedKey,
  onSelect,
  avatarUrl,
  displayName
}) {
  return (
    <Box
  sx={{
    width: open ? 250 : 50,
    position: 'fixed',
    left: 0,
    top: '67px', 
    height: '100%', 
    bgcolor: '#FFFDF2',
    boxShadow: 4,
    zIndex: 1200,
    transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: open ? "flex-start" : "center",
    pt: 2,
    overflowY: 'auto'
  }}
>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: open ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 0,
          pb: 1
        }}
      >
        <Avatar
          src={avatarUrl}
          sx={{
            width: 48,
            height: 48,
            mb: open ? 0 : 1,
            transition: 'all 0.3s'
          }}
        />
        {open &&
          <Box ml={2}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{fontFamily:"Roboto slab"}} > {displayName}</Typography>
          </Box>
        }
        <Tooltip title={open ? "Ẩn thanh chọn" : "Hiện thanh chọn"}>
          <IconButton sx={{ ml: open ? 1 : 0, mt: open ? 0 : 1 }} onClick={onToggle}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ width: "100%", my: 1 }} />
      <List sx={{ width: "100%", fontFamily:"Roboto slab"}}>
        {navItems.map(item => (
          <ListItemButton
            key={item.key}
            selected={selectedKey === item.key}
            onClick={() => onSelect(item.key)}
            sx={{
              justifyContent: open ? "flex-start" : "center",
              minHeight: 48
            }}
          >
            <ListItemIcon sx={{ minWidth: open ? 36 : 0, justifyContent: "center" }}>{item.icon}</ListItemIcon>
            {open && <ListItemText primary={item.label} />}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}