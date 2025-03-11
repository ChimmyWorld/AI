import React from 'react';
import { Box, Typography } from '@mui/material';

const BullseyeLogo = ({ size = 'medium' }) => {
  // Size variants
  const sizes = {
    small: { logoSize: 24, fontSize: '12px' },
    medium: { logoSize: 32, fontSize: '16px' },
    large: { logoSize: 48, fontSize: '24px' }
  };
  
  const { logoSize, fontSize } = sizes[size] || sizes.medium;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        component="div"
        sx={{
          width: logoSize,
          height: logoSize,
          backgroundColor: '#FF4500',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          mr: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Bull's head shape */}
        <svg
          width={logoSize * 0.8}
          height={logoSize * 0.8}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3c-1.5 0-2.5.5-3.5 1.5s-1.7 2-2 3c-.5 1.5-.5 3 0 4.5.3 1 .8 1.9 1.5 2.6m8-11.6c1.5 0 2.5.5 3.5 1.5s1.7 2 2 3c.5 1.5.5 3 0 4.5-.3 1-.8 1.9-1.5 2.6M7 14c0 1.2.5 2.3 1.3 3.1.8.8 1.9 1.3 3.1 1.3m9.6-4.4c0 1.2-.5 2.3-1.3 3.1-.8.8-1.9 1.3-3.1 1.3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" fill="white" />
          <circle cx="12" cy="12" r="1.5" fill="#FF4500" />
          {/* Dart in the bullseye */}
          <line x1="11" y1="5" x2="12" y2="10.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
          <path d="M10.5 5.5L11.5 4.5L12.5 5.5" fill="white" stroke="white" strokeWidth="0.5" />
        </svg>
      </Box>
      <Typography
        variant="h6"
        noWrap
        sx={{ 
          color: 'black', 
          fontWeight: 'bold', 
          fontSize,
          display: { xs: 'none', sm: 'block' } 
        }}
      >
        bullseye
      </Typography>
    </Box>
  );
};

export default BullseyeLogo;
