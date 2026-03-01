import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
// import { EventAvailable as EventIcon, Today as CalendarTodayIcon, LocationOn as LocationOnIcon, Group as PeopleIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { eventAPI } from '../services/api';
import { Event as EventType } from '../types';

const Events: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
  });

  const categories = [
    'All',
    'technical',
    'cultural',
    'sports',
    'academic',
    'social',
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getAll();
      setEvents(response.data.data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load events. Please try again later.');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let result = [...events];

    if (filters.category && filters.category !== 'All') {
      result = result.filter(event => event.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.venue.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(result);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: 'primary',
      cultural: 'secondary',
      sports: 'error',
      academic: 'warning',
      social: 'info',
    };
    return colors[category] || 'default';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'success';
      case 'ongoing': return 'warning';
      case 'completed': return 'default';
      default: return 'info';
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
          🎭 All Events
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Discover and register for exciting campus events
        </Typography>
      </Box>

      {/* Filters */}
      <Card elevation={2} sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search events"
              variant="outlined"
              value={filters.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title, description, or venue..."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Category"
              value={filters.category}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('category', e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({ category: '', search: '' })}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h1" sx={{ mb: 2 }}>🎪</Typography>
          <Typography variant="h5" gutterBottom>
            No events found
          </Typography>
          <Typography color="text.secondary">
            {events.length === 0 
              ? 'No events are available at the moment. Check back soon!'
              : 'Try adjusting your search or filters.'}
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredEvents.length} of {events.length} events
          </Typography>

          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item key={event._id} xs={12} sm={6} md={4}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Event Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {event.title}
                      </Typography>
                      <Chip
                        label={event.status}
                        color={getStatusColor(event.status) as any}
                        size="small"
                      />
                    </Box>

                    {/* Category */}
                    <Chip
                      label={event.category}
                      color={getCategoryColor(event.category) as any}
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    {/* Description */}
                    <Typography color="text.secondary" paragraph>
                      {event.description.substring(0, 120)}...
                    </Typography>

                    {/* Event Details */}
                    <Box sx={{ mt: 2 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }}>📅</Typography>
                        <Typography variant="body2">
                          {format(new Date(event.date), 'EEE, MMM dd, yyyy • hh:mm a')}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }}>📍</Typography>
                        <Typography variant="body2">{event.venue}</Typography>
                      </Box>

                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }}>👥</Typography>
                        <Typography variant="body2">
                          {event.availableTickets} of {event.totalTickets} tickets available
                        </Typography>
                      </Box>
                    </Box>

                    {/* Price and Organizer */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="h6" color="primary">
                        ${event.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        By: {typeof event.organizer === 'object' ? event.organizer.name : 'Unknown'}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      component={Link}
                      to="/register"
                      disabled={event.availableTickets === 0}
                    >
                      {event.availableTickets === 0 ? 'Sold Out' : 'Register Now'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Events;