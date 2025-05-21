import StarIcon from '@mui/icons-material/Star'; 
import { Button, Box, keyframes, Typography } from '@mui/material';

const pulseCircle = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255,215,64,0.7); }
  80% { box-shadow: 0 0 0 16px rgba(255,215,64,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,215,64,0); }
`;

export default function StarButton({ onClick }) {
  return (
    <Box position="relative" display="inline-block" mb={4}>
      <Box
        sx={{
          position: 'absolute',
          top: -13,
          right: -8,
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          zIndex: 1,
          animation: `${pulseCircle} 1.7s infinite`,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -8,
          zIndex: 2,
        }}
      >
        <StarIcon
          sx={{
            color: "#FFD740",
            fontSize: 32,
            filter: "drop-shadow(0 0 6px #FFD74088)",
          }}
        />
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={onClick}
        sx={{
            opacity: 0.8,
            
            fontWeight: "bold",
            fontSize: 22,
            px: 5,
            py: 1.7,
            borderRadius: 25,
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
            },
        }}
      >
        <Box display="flex" alignItems="center" sx={{ color: '#323232' }}>
          <span
            role="img"
            aria-label="sparkle"
            style={{
              fontSize: 28,
              marginRight: 8,
              animation: "updown 1.3s infinite alternate"
            }}
          >
            ✨
          </span>
          Quy trình tạo thực đơn?
        </Box>
      </Button>

      <style>{`
        @keyframes updown {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
      `}</style>
    </Box>
  );
}
