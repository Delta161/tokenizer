import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { Home, Security } from '@mui/icons-material';
import AuditLogTable from '../components/AuditLog/AuditLogTable';

const AdminAuditLogPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            href="/" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/admin"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Security sx={{ mr: 0.5 }} fontSize="inherit" />
            Admin
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            Audit Logs
          </Typography>
        </Breadcrumbs>

        <Typography variant="h4" component="h1" gutterBottom>
          System Audit Logs
        </Typography>
        
        <Typography variant="body1" paragraph>
          This page displays a comprehensive audit trail of all significant actions performed in the system.
          Use the filters to narrow down results by action type, entity, date range, and more.
        </Typography>
        
        <AuditLogTable />
      </Box>
    </Container>
  );
};

export default AdminAuditLogPage;