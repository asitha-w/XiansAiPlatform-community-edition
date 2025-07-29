import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import type { BusinessEntity, AgentRecommendation } from '../../types';
import RecommendationsPanel from './RecommendationsPanel';

interface BusinessEntityPanelProps {
  entity?: BusinessEntity | null;
  onEdit?: (entity: BusinessEntity) => void;
  onSave?: (entity: BusinessEntity) => void;
  isEditing?: boolean;
  recommendations?: AgentRecommendation[];
  onDismissRecommendation?: (id: string) => void;
  onApplyRecommendation?: (id: string) => void;
}

// Mock data for demonstration
const mockOrder: BusinessEntity = {
  id: 'ORD-2024-001',
  type: 'order',
  title: 'Customer Order #2024-001',
  status: 'pending_review',
  lastModified: new Date(),
  assignedTo: 'sarah.johnson@company.com',
  data: {
    customer: {
      id: 'CUST-001',
      name: 'Acme Corporation',
      email: 'orders@acme.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business St, Suite 100, New York, NY 10001',
    },
    orderDetails: {
      orderDate: '2024-01-15',
      dueDate: '2024-02-15',
      currency: 'USD',
      total: 12450.00,
      taxAmount: 1245.00,
      subtotal: 11205.00,
    },
    items: [
      {
        id: 'ITEM-001',
        name: 'Enterprise Software License',
        quantity: 1,
        unitPrice: 8500.00,
        total: 8500.00,
      },
      {
        id: 'ITEM-002',
        name: 'Implementation Services',
        quantity: 15,
        unitPrice: 180.50,
        total: 2707.50,
      },
    ],
    notes: 'Urgent order - customer needs delivery by end of month.',
  },
};

const mockRecommendations: AgentRecommendation[] = [
  {
    id: 'rec-1',
    type: 'validation',
    title: 'Order Total Verified',
    description: 'The order calculations are correct. Tax amount and total match expected values.',
    priority: 'low',
    createdAt: new Date(Date.now() - 5000),
  },
  {
    id: 'rec-2',
    type: 'warning',
    title: 'Customer Credit Check',
    description: 'Customer has exceeded their credit limit by $2,450. Consider requesting payment before delivery.',
    priority: 'high',
    entityField: 'orderDetails.total',
    suggestedAction: 'Request payment',
    createdAt: new Date(Date.now() - 10000),
  },
  {
    id: 'rec-3',
    type: 'suggestion',
    title: 'Upsell Opportunity',
    description: 'Customer frequently orders implementation services. Consider offering a training package at 15% discount.',
    priority: 'medium',
    suggestedAction: 'Add training package',
    createdAt: new Date(Date.now() - 15000),
  },
];

const BusinessEntityPanel: React.FC<BusinessEntityPanelProps> = ({
  entity = mockOrder,
  onEdit,
  onSave,
  isEditing = false,
  recommendations = mockRecommendations,
  onDismissRecommendation,
  onApplyRecommendation,
}) => {
  const [insightsExpanded, setInsightsExpanded] = useState(false);

  if (!entity) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'text.secondary',
        p: 4
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 56, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            No Entity Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a business entity to view details
          </Typography>
        </Box>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending_review':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ReceiptIcon />;
      case 'customer':
        return <PersonIcon />;
      case 'invoice':
        return <ReceiptIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  const getInsightsSummary = () => {
    const highPriority = recommendations.filter(r => r.priority === 'high').length;
    const mediumPriority = recommendations.filter(r => r.priority === 'medium').length;
    const lowPriority = recommendations.filter(r => r.priority === 'low').length;
    
    return { highPriority, mediumPriority, lowPriority, total: recommendations.length };
  };

  const insightsSummary = getInsightsSummary();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1 }}>
        {/* Enhanced Entity Header with Better Visual Hierarchy */}
        <Box sx={{ p: 5, pb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 3, 
                backgroundColor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'grey.100'
              }}>
                {getEntityIcon(entity.type)}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 400, mb: 1, fontSize: '1.35rem' }}>
                  {entity.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {entity.id}
                  </Typography>
                  <Chip 
                    label={entity.status.replace('_', ' ')} 
                    size="small" 
                    color={getStatusColor(entity.status)}
                    variant="outlined"
                    sx={{ 
                      textTransform: 'capitalize',
                      borderColor: 'grey.200',
                      backgroundColor: 'grey.50'
                    }}
                  />
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => onEdit?.(entity)}
                  variant="outlined"
                  sx={{ minWidth: 80 }}
                >
                  Edit
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" color="success" onClick={() => onSave?.(entity)}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <CancelIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 6, fontSize: '0.875rem', color: 'text.secondary' }}>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Last modified: {entity.lastModified.toLocaleDateString()}
            </Typography>
            {entity.assignedTo && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Assigned to: {entity.assignedTo}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ mx: 5, borderColor: 'grey.50' }} />

        {/* Enhanced AI Insights with Better Design */}
        <Box sx={{ p: 5 }}>
          <Typography variant="h6" sx={{ 
            mb: 4, 
            fontWeight: 400,
            color: 'text.primary',
            fontSize: '1.125rem'
          }}>
            AI Insights
          </Typography>

          {/* Enhanced Insights Summary */}
          <Box 
            sx={{ 
              p: 4,
              borderRadius: 3,
              backgroundColor: insightsSummary.highPriority > 0 ? '#FFF9E6' : '#FCFCFC',
              border: '1px solid',
              borderColor: insightsSummary.highPriority > 0 ? '#F0D49C' : '#F1F3F4',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: insightsSummary.highPriority > 0 ? '#EBCB8B' : '#E8EAED',
                backgroundColor: insightsSummary.highPriority > 0 ? '#FFF6D9' : '#F8F9FA',
                boxShadow: '0 2px 12px rgba(46, 52, 64, 0.04)',
              }
            }}
            onClick={() => setInsightsExpanded(!insightsExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid',
                  borderColor: 'grey.100'
                }}>
                  {insightsSummary.highPriority > 0 ? (
                    <WarningIcon sx={{ color: '#EBCB8B', fontSize: 22 }} />
                  ) : (
                    <CheckIcon sx={{ color: '#A3BE8C', fontSize: 22 }} />
                  )}
                </Box>
                
                <Box>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 500, 
                    mb: 0.5,
                    color: 'text.primary',
                    fontSize: '1rem'
                  }}>
                    {insightsSummary.total === 0 ? 'No insights to review' : 
                     insightsSummary.highPriority > 0 ? 'Action required' : 'All insights reviewed'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {insightsSummary.total} insights available
                    {insightsSummary.highPriority > 0 && ` • ${insightsSummary.highPriority} high priority`}
                  </Typography>
                </Box>
              </Box>
              
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                {insightsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Expanded Insights Content */}
          <Collapse in={insightsExpanded}>
            <Box sx={{ mt: 4 }}>
              <RecommendationsPanel 
                recommendations={recommendations}
                onDismiss={onDismissRecommendation}
                onApply={onApplyRecommendation}
              />
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ mx: 5, borderColor: 'grey.50' }} />

        {/* Enhanced Order-specific content */}
        {entity.type === 'order' && entity.data && (
          <Box sx={{ p: 5, pt: 4 }}>
            {/* Enhanced Customer Information */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, fontSize: '1.125rem' }}>
                Customer Information
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: 4,
                mb: 4
              }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                    opacity: 0.8
                  }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {entity.data.customer?.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                    opacity: 0.8
                  }}>
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {entity.data.customer?.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                    opacity: 0.8
                  }}>
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {entity.data.customer?.phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                    opacity: 0.8
                  }}>
                    Customer ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {entity.data.customer?.id}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  mb: 1,
                  display: 'block',
                  opacity: 0.8
                }}>
                  Address
                </Typography>
                <Typography variant="body1">
                  {entity.data.customer?.address}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 5, borderColor: 'grey.50' }} />

            {/* Enhanced Order Details */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, fontSize: '1.125rem' }}>
                Order Details
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: 4 
              }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                    opacity: 0.8
                  }}>
                    Order Date
                  </Typography>
                  <Typography variant="body1">
                    {entity.data.orderDetails?.orderDate}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                    opacity: 0.8
                  }}>
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {entity.data.orderDetails?.dueDate}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                    opacity: 0.8
                  }}>
                    Currency
                  </Typography>
                  <Typography variant="body1">
                    {entity.data.orderDetails?.currency}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    mb: 1,
                    display: 'block',
                    opacity: 0.8
                  }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ${entity.data.orderDetails?.total?.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 5, borderColor: 'grey.50' }} />

            {/* Enhanced Order Items */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400, fontSize: '1.125rem' }}>
                Order Items
              </Typography>
              <TableContainer sx={{ 
                border: '1px solid',
                borderColor: 'grey.100',
                borderRadius: 3,
                backgroundColor: 'background.paper'
              }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entity.data.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ py: 3 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 3 }}>
                          {item.quantity}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 3 }}>
                          ${item.unitPrice?.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 3, fontWeight: 500 }}>
                          ${item.total?.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} sx={{ fontWeight: 500, borderBottom: 'none' }}>
                        Subtotal
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500, borderBottom: 'none' }}>
                        ${entity.data.orderDetails?.subtotal?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} sx={{ fontWeight: 500, borderBottom: 'none' }}>
                        Tax
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500, borderBottom: 'none' }}>
                        ${entity.data.orderDetails?.taxAmount?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} sx={{ 
                        fontWeight: 600, 
                        fontSize: '1.1rem',
                        borderBottom: 'none',
                        pt: 3
                      }}>
                        Total
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600, 
                        fontSize: '1.1rem',
                        borderBottom: 'none',
                        pt: 3,
                        color: 'primary.main'
                      }}>
                        ${entity.data.orderDetails?.total?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Enhanced Notes */}
            {entity.data.notes && (
              <>
                <Divider sx={{ my: 5, borderColor: 'grey.50' }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 400, fontSize: '1.125rem' }}>
                    Notes
                  </Typography>
                  <Box sx={{ 
                    p: 4, 
                    backgroundColor: '#FFF9E6',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: '#F0D49C'
                  }}>
                    <Typography variant="body2" sx={{ 
                      lineHeight: 1.6,
                      color: 'text.primary'
                    }}>
                      {entity.data.notes}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BusinessEntityPanel; 