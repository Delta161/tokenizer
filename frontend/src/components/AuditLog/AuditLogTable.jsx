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
} from '@mui/material';
import { FilterList, Refresh, Info } from '@mui/icons-material';
import { format } from 'date-fns';

// Action type to color mapping
const actionTypeColors = {
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

// Mock API call - replace with actual API call in production
const fetchAuditLogs = async (filters) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.userId) queryParams.append('userId', filters.userId);
    if (filters.actionType) queryParams.append('actionType', filters.actionType);
    if (filters.entityType) queryParams.append('entityType', filters.entityType);
    if (filters.entityId) queryParams.append('entityId', filters.entityId);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    
    const response = await fetch(`/api/audit/logs?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

const AuditLogTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    actionType: '',
    entityType: '',
    fromDate: '',
    toDate: '',
    limit: 10,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Available entity types for filtering
  const entityTypes = ['Property', 'Investment', 'User', 'Document'];
  
  // Available action types for filtering
  const actionTypes = Object.keys(actionTypeColors);
  
  const loadAuditLogs = async () => {
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
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  
  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    loadAuditLogs();
  };
  
  const resetFilters = () => {
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
  
  const formatMetadata = (metadata) => {
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