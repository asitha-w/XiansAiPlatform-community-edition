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
import type { ContractEntity, AgentRecommendation } from '../../../types';
import RecommendationsPanel from './RecommendationsPanel';

interface ContractEntityPanelProps {
  entity?: ContractEntity | null;
  onEdit?: (entity: ContractEntity) => void;
  onSave?: (entity: ContractEntity) => void;
  isEditing?: boolean;
  recommendations?: AgentRecommendation[];
  onDismissRecommendation?: (id: string) => void;
  onApplyRecommendation?: (id: string) => void;
}

// Mock data for demonstration
const mockOrder: ContractEntity = {
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

const ContractEntityPanel: React.FC<ContractEntityPanelProps> = ({
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
        mt: 10,
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
    
    // Get insight categories with counts
    const categories = recommendations.reduce((acc, rec) => {
      if (!acc[rec.type]) acc[rec.type] = 0;
      acc[rec.type]++;
      return acc;
    }, {} as Record<string, number>);
    
    return { 
      highPriority, 
      mediumPriority, 
      lowPriority, 
      total: recommendations.length,
      categories
    };
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'validation':
        return <CheckIcon sx={{ fontSize: 16 }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'suggestion':
        return <CheckIcon sx={{ fontSize: 16 }} />; // Using CheckIcon for suggestions too
      default:
        return <CheckIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'validation':
        return '#A3BE8C';
      case 'warning':
        return '#EBCB8B';
      case 'suggestion':
        return '#88C0D0';
      default:
        return '#80868B';
    }
  };

  const insightsSummary = getInsightsSummary();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1 }}>
        {/* Enhanced Entity Header with Better Visual Hierarchy */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                backgroundColor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '0.5px solid',
                borderColor: 'grey.100'
              }}>
                {getEntityIcon(entity.type)}
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 400, mb: 0.5 }}>
                  {entity.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
          
          <Box sx={{ display: 'flex', gap: 4, color: 'text.secondary' }}>
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

        <Divider sx={{ mx: 3, borderColor: 'grey.50' }} />

        {/* AI Insights - Unified Component Container */}
        <Box sx={{ py: 2 }}>
          {/* Unified AI Insights Component */}
          <Box sx={{
            backgroundColor: '#FFFFFF',
            borderTop: '0.5px solid #E8EAED',
            borderBottom: '0.5px solid #E8EAED',
            overflow: 'hidden'
          }}>
            {/* Combined AI Insights Title and Summary in One Row */}
            <Box 
              sx={{ 
                p: 2,
                backgroundColor: insightsSummary.highPriority > 0 ? '#FFF9E6' : '#F8F9FA',
                borderBottom: insightsExpanded ? '0.5px solid #E8EAED' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: insightsSummary.highPriority > 0 ? '#FFF6D9' : '#F1F3F4',
                }
              }}
              onClick={() => setInsightsExpanded(!insightsExpanded)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* AI Insights Title */}
                  <Typography variant="h6" sx={{ 
                    fontWeight: 500,
                    color: 'text.primary',
                    mr: 1
                  }}>
                    AI Insights
                  </Typography>
                  
                  {/* Insight Categories Overview */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {Object.entries(insightsSummary.categories).map(([type, count]) => (
                      <Box 
                        key={type}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          border: '0.5px solid',
                          borderColor: getCategoryColor(type) + '40',
                        }}
                      >
                        <Box sx={{ color: getCategoryColor(type), display: 'flex' }}>
                          {getCategoryIcon(type)}
                        </Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 500, 
                            color: 'text.primary',
                            textTransform: 'capitalize'
                          }}
                        >
                          {type}: {count}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Priority Summary */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {insightsSummary.highPriority > 0 && (
                      <Chip
                        label={`${insightsSummary.highPriority} High`}
                        size="small"
                        sx={{
                          backgroundColor: '#FFF2D9',
                          color: '#B8860B',
                          fontWeight: 500,
                          height: 20,
                          border: '0.5px solid #F0D49C',
                          '& .MuiChip-label': { px: 0.75 }
                        }}
                      />
                    )}
                    {(insightsSummary.mediumPriority > 0 || insightsSummary.lowPriority > 0) && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary'
                        }}
                      >
                        +{insightsSummary.mediumPriority + insightsSummary.lowPriority} more
                      </Typography>
                    )}
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

            {/* Expanded Content - Same Container */}
            <Collapse in={insightsExpanded}>
              <Box>
                
                {/* Content Container */}
                <Box sx={{ 
                  maxHeight: '400px',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#F1F3F4',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#DADCE0',
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: '#BDC1C6',
                    },
                  },
                }}>
                  <RecommendationsPanel 
                    recommendations={recommendations}
                    onDismiss={onDismissRecommendation}
                    onApply={onApplyRecommendation}
                  />
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Box>

        <Divider sx={{ mx: 3, borderColor: 'grey.50' }} />

        {/* Enhanced Order-specific content */}
        {entity.type === 'order' && entity.data && (
          <Box sx={{ p: 5, pt: 4 }}>
            {/* Enhanced Customer Information */}
            <Box sx={{ mb: 5 }}>
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400 }}>
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
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400 }}>
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
              <Typography variant="h6" sx={{ mb: 4, fontWeight: 400 }}>
                Order Items
              </Typography>
              <TableContainer sx={{ 
                border: '0.5px solid',
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
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
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
                        borderBottom: 'none',
                        pt: 3
                      }}>
                        Total
                      </TableCell>
                      <TableCell align="right" sx={{ 
                        fontWeight: 600, 
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
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 400 }}>
                    Notes
                  </Typography>
                  <Box sx={{ 
                    p: 4, 
                    backgroundColor: '#FFF9E6',
                    borderRadius: 3,
                    border: '0.5px solid',
                    borderColor: '#F0D49C'
                  }}>
                    <Typography variant="body1" sx={{ 
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



export default ContractEntityPanel;