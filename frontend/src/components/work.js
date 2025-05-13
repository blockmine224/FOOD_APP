import React from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Stack, Paper, Avatar, Fade, Typography, Box
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SaveIcon from '@mui/icons-material/Save';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const steps = [
  {
    label: "Nhập chỉ số sức khỏe & mục tiêu",
    desc: "Nhập chiều cao, cân nặng, tuổi, giới tính, vận động và mục tiêu cá nhân.",
    icon: <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
  },
  {
    label: "Nhận thực đơn cá nhân hóa",
    desc: "Chúng tôi đề xuất thực đơn phù hợp với TDEE và nhu cầu dinh dưỡng của bạn.",
    icon: <RestaurantIcon sx={{ fontSize: 40, color: 'success.main' }} />
  },
  {
    label: "Khám phá bí quyết sống lâu",
    desc: "Nhận lời khuyên, TDEE khuyến nghị và mẹo từ chuyên gia.",
    icon: <EmojiEventsIcon sx={{ fontSize: 40, color: 'warning.main' }} />
  },
  {
    label: "Lưu & theo dõi thực đơn",
    desc: "Lưu thực đơn, theo dõi tiến trình và điều chỉnh bất cứ lúc nào.",
    icon: <SaveIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
  }
];

export function WorkOverview({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "none",
          boxShadow: "none",
          p: 0,
          m: 0,
          overflow: "visible",
        }
      }}
      hideBackdrop={false}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 44,
          fontFamily: "Roboto Slab",
          color: '#fff',
          letterSpacing: 1,
          mb: 5,
        }}
      >
        Tuổi Thọ & Dinh Dưỡng hoạt động như thế nào?
        
      </DialogTitle>

      <DialogContent sx={{ overflow: "visible", background: "none", p: 0 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="center"
          justifyContent="center"
          spacing={4}
          sx={{ maxWidth: 1200, mx: "auto", my: 2 }}
        >
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <Fade in timeout={500 + idx * 180}>
                <Paper
                  elevation={6}
                  sx={{
                    p: 4,
                    minWidth: 210,
                    minHeight:360,
                    maxWidth: 250,
                    borderRadius: 5,
                    textAlign: "center",
                    background: "#fff",
                    boxShadow: "0 4px 24px #0001",
                    position: "relative",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-8px) scale(1.04)" }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "background.paper",
                      mx: "auto",
                      mb: 2,
                      boxShadow: 3
                    }}
                  >
                    {step.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {step.label}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ minHeight: 56 }}>
                    {step.desc}
                  </Typography>
                </Paper>
              </Fade>
              {idx < steps.length - 1 && (
                <ArrowForwardIcon
                  sx={{
                    mx: { xs: "auto", md: 2 },
                    fontSize: 40,
                    color: "primary.light",
                    display: { xs: "none", md: "block" }
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}