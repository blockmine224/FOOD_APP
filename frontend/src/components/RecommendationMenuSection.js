import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Divider, Box, Button
} from '@mui/material';
import MenuDialog from './MenuDialog';
import ModernMenuSection from './ModernMenuSection';
import { Egg } from '@mui/icons-material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HowMenuCreatedDialog from './HowMenuCreate';


export default function RecommendationMenuSection({
  showCreateMenuButton = true,
  userData,
  isLoadingMenu,
  menuDialogOpen,
  setMenuDialogOpen,
  handleGetRecommendations,
  recommendations,
  showUnrecMenu,
  setShowUnrecMenu,
  translateBMICategory,
  lastMenuParams,
  hideHowMenuButton = false,
}) {
  const [howDialogOpen, setHowDialogOpen] = useState(false);

  return (
    <Card sx={{ p: 4 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontFamily: "Roboto slab" }}>
          Tạo thực đơn dinh dưỡng cá nhân
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box
          display="flex"
          alignItems="center"
          flexDirection={{ xs: "column", md: "row" }}
          gap={2}
          justifyContent="space-between"
        >
          <Box flex={1}>
            {showCreateMenuButton && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setMenuDialogOpen(true)}
                disabled={
                  !userData.height ||
                  !userData.weight ||
                  !userData.gender ||
                  !userData.date_of_birth ||
                  isLoadingMenu
                }
                startIcon={<Egg />}
                sx={{
                  fontWeight: 700,
                  fontSize: 18,
                  px: 4,
                  py: 1.5,
                  borderRadius: 10,
                  fontFamily: "Roboto slab",
                  backgroundColor: "#4A628A",
                  '&:hover': { backgroundColor: '#7AB2D3' },
                }}
              >
                Chọn mục tiêu & tạo thực đơn
              </Button>
            )}
          </Box>
          <Box flex={1} display="flex" justifyContent="flex-end">
            {!hideHowMenuButton && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<InfoOutlinedIcon />}
                sx={{
                  fontWeight: 700,
                  fontSize: 18,
                  px: 4,
                  py: 1.5,
                  borderRadius: 10,
                  fontFamily: "Roboto slab",
                  backgroundColor: "#4A628A",
                  '&:hover': { backgroundColor: '#7AB2D3' },
                }}
                onClick={() => setHowDialogOpen(true)}
              >
                Quy trình tạo thực đơn?
              </Button>
            )}
          </Box>
        </Box>

        <HowMenuCreatedDialog open={howDialogOpen} onClose={() => setHowDialogOpen(false)} />

        {recommendations && (
          <Box mt={4}>
            <ModernMenuSection
              recommendations={recommendations}
              showRecommendedMenu={!showUnrecMenu}
              translateBMICategory={translateBMICategory}
              onToggleMenuType={() => setShowUnrecMenu(prev => !prev)}
              isLoadingMenu={isLoadingMenu}
              lastMenuParams={lastMenuParams}
              onRegenerateMenu={handleGetRecommendations}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}