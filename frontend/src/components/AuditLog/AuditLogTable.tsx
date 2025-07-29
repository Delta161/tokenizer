import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  SelectChangeEvent,
} from '@mui/material';
import { FilterList, Refresh, Info } from '@mui/icons-material';
import { format } from 'date-fns';

// Define types for audit logs and filters
interface User {
  email: string;
  id: string;
}

interface AuditLog {
  id: string;
  actionType: string;
  entityType: string;
  entityId?: string;
  user?: User;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface AuditLogFilters {
  userId?: string;
  actionType: string;
  entityType: string;
  entityId?: string;
  fromDate: string;
  toDate: string;
  limit: number;
  offset: number;
}

// Action type to color mapping
const actionTypeColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  PROPERTY_CREATED: 'success',
  PROPERTY_UPDATED: 'info',
  PROPERTY_APPROVED: 'success',
  PROPERTY_REJECTED: 'error',
  INVESTMENT_CREATED: 'success',
  INVESTMENT_CONFIRMED: 'success',
  INVESTMENT_CANCELLED: 'error',
  USER_CREATED: 'success',
  USER_UPDATED: 'info',
  KYC_SUBMITTED: 'warning',
  KYC_APPROVED: 'success',
  KYC_REJECTED: 'error',
  TOKEN_DEPLOYED: 'success',
  WALLET_VERIFIED: 'success',
  DOCUMENT_UPLOADED: 'info',
  DOCUMENT_DELETED: 'error',
};

// API call using apiClient
import apiClient from '@/services/apiClient';

const fetchAuditLogs = async (filters: AuditLogFilters): Promise<AuditLog[]> => {
  try {
    const params: Record<string, string | number> = {};
    
    if (filters.userId) params.userId = filters.userId;
    if (filters.actionType) params.actionType = filters.actionType;
    if (filters.entityType) params.entityType = filters.entityType;
    if (filters.entityId) params.entityId = filters.entityId;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;
    
    const response = await apiClient.get('/audit/logs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

const AuditLogTable: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<AuditLogFilters>({
    actionType: '',
    entityType: '',
    fromDate: '',
    toDate: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Available entity types for filtering
  const entityTypes: string[] = ['Property', 'Investment', 'User', 'Document'];
  
  // Available action types for filtering
  const actionTypes: string[] = Object.keys(actionTypeColors);
  
  const loadAuditLogs = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs({
        ...filters,
        offset: (page - 1) * filters.limit,
      });
      setLogs(data);
      // In a real implementation, you would get the total count from the API
      // and calculate total pages
      setTotalPages(Math.ceil(100 / filters.limit)); // Mock total of 100 records
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAuditLogs();
  }, [page, filters.limit]);
  
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent): void => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number): void => {
    setPage(newPage);
  };
  
  const applyFilters = (): void => {
    setPage(1); // Reset to first page when applying filters
    loadAuditLogs();
  };
  
  const resetFilters = (): void => {
    setFilters({
      actionType: '',
      entityType: '',
      fromDate: '',
      toDate: '',
      limit: 10,
      offset: 0,
    });
    setPage(1);
    loadAuditLogs();
  };
  
  const formatMetadata = (metadata: Record<string, any> | undefined): string => {
    if (!metadata) return 'None';
    
    try {
      // For simple display, just show the keys
      const keys = Object.keys(metadata);
      return keys.join(', ');
    } catch (e) {
      return 'Invalid metadata';
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Audit Logs
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={loadAuditLogs}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle Filters">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterList />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {showFilters && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Filters
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Action Type</InputLabel>
              <Select
                name="actionType"
                value={filters.actionType}
                onChange={handleFilterChange}
                label="Action Type"
              >
                <MenuItem value="">All</MenuItem>
                {actionTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Entity Type</InputLabel>
              <Select
                name="entityType"
                value={filters.entityType}
                onChange={handleFilterChange}
                label="Entity Type"
              >
                <MenuItem value="">All</MenuItem>
                {entityTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="From Date"
              name="fromDate"
              type="date"
              value={filters.fromDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="To Date"
              name="toDate"
              type="date"
              value={filters.toDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              <button onClick={applyFilters} className="btn btn-primary">
                Apply Filters
              </button>
              <button onClick={resetFilters} className="btn btn-secondary">
                Reset
              </button>
            </Box>
          </Box>
        </Box>
      )}
      
      {loading ? (
        <Typography>Loading audit logs...</Typography>
      ) : logs.length === 0 ? (
        <Typography>No audit logs found.</Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Chip 
                        label={log.actionType} 
                        color={actionTypeColors[log.actionType] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {log.entityType}
                      {log.entityId && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          ID: {log.entityId}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.user ? log.user.email : 'System'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.createdAt), 'PPpp')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {formatMetadata(log.metadata)}
                        {log.metadata && (
                          <Tooltip title={JSON.stringify(log.metadata, null, 2)}>
                            <IconButton size="small">
                              <Info fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
            />
          </Box>
        </>
      )}
    </Paper>
  );
};

export default AuditLogTable;