import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
// import {
//   EventAvailable as EventIcon,
//   ConfirmationNumber as ConfirmationNumberIcon,
//   CheckCircle as CheckCircleIcon,
//   Schedule as PendingIcon,
//   AccessTime as AccessTimeIcon,
// } from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../services/api';
import { Ticket } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    used: 0,
  });

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getUserTickets(user!._id);
      const ticketsData = response.data.data;
      setTickets(ticketsData);

      // Calculate stats
      const stats = {
        total: ticketsData.length,
        confirmed: ticketsData.filter((t: Ticket) => t.status === 'confirmed').length,
        pending: ticketsData.filter((t: Ticket) => t.status === 'pending').length,
        used: ticketsData.filter((t: Ticket) => t.checkedIn).length,
      };
      setStats(stats);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'expired': return '❌';
      default: return '🎫';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const filteredTickets = () => {
    switch (tabValue) {
      case 0: return tickets;
      case 1: return tickets.filter(t => t.status === 'confirmed');
      case 2: return tickets.filter(t => t.status === 'pending');
      default: return tickets;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          👋 Welcome, {user?.name}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your event tickets and registrations
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Tickets', value: stats.total, icon: '🎫', color: 'primary.main' },
          { label: 'Confirmed', value: stats.confirmed, icon: '✅', color: 'success.main' },
          { label: 'Pending', value: stats.pending, icon: '⏳', color: 'warning.main' },
          { label: 'Used', value: stats.used, icon: '🎪', color: 'info.main' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, fontSize: 40 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tickets Section */}
      <Paper elevation={2} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="ticket tabs">
            <Tab label="All Tickets" />
            <Tab label="Confirmed" />
            <Tab label="Pending" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {filteredTickets().length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h1" sx={{ mb: 2 }}>🎫</Typography>
              <Typography variant="h5" gutterBottom>
                No tickets yet
              </Typography>
              <Typography color="text.secondary" paragraph>
                You haven't registered for any events yet.
              </Typography>
              <Button variant="contained" href="/events">
                Browse Events
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredTickets().map((ticket) => (
                <Grid item xs={12} key={ticket._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Box display="flex" alignItems="center" mb={1}>
                            {getStatusIcon(ticket.status)}
                            <Typography variant="h6" component="h3" sx={{ ml: 1 }}>
                              {typeof ticket.event === 'object' ? ticket.event.title : 'Event'}
                            </Typography>
                          </Box>
                          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                            <Chip
                              label={ticket.status.toUpperCase()}
                              color={getStatusColor(ticket.status) as any}
                              size="small"
                            />
                            <Chip
                              label={`Ticket: ${ticket.ticketNumber}`}
                              variant="outlined"
                              size="small"
                            />
                            {ticket.expiresAt && (
                              <Chip
                                label={`Expires: ${format(new Date(ticket.expiresAt), 'MMM dd, hh:mm a')}`}
                                color="warning"
                                size="small"
                              />
                            )}
                          </Box>
                          {typeof ticket.event === 'object' && (
                            <Typography color="text.secondary">
                              📅 {format(new Date(ticket.event.date), 'MMM dd, yyyy')} • 
                              🏛️ {ticket.event.venue} • 
                              💰 ${ticket.price}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Purchased: {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                            {ticket.status === 'pending' && (
                              <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 1 }}
                              >
                                Complete Payment
                              </Button>
                            )}
                            {ticket.status === 'confirmed' && !ticket.checkedIn && (
                              <Button
                                variant="outlined"
                                color="success"
                                fullWidth
                                sx={{ mt: 1 }}
                              >
                                View Ticket
                              </Button>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" color="text.secondary">
            Confirmed tickets are ready for the event!
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {tickets.filter(t => t.status === 'pending').length === 0 ? (
            <Alert severity="info">
              No pending tickets. All your tickets are confirmed!
            </Alert>
          ) : (
            <Alert severity="warning">
              You have {tickets.filter(t => t.status === 'pending').length} pending tickets 
              that need payment within 24 hours.
            </Alert>
          )}
        </TabPanel>
      </Paper>

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              href="/events"
            >
              Browse Events
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchTickets}
            >
              Refresh Tickets
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              disabled={stats.pending === 0}
            >
              Pay Pending Tickets
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Dashboard;