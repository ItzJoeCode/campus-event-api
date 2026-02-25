import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Event, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { eventAPI, healthAPI } from '../services/api';
import { Event as EventType } from '../types';

const Home: React.FC = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const fetchData = async () => {
      try {
        await healthAPI.check();
        setApiStatus('online');
        
        const response = await eventAPI.getAll();
        setEvents(response.data.data.slice(0, 3));
      } catch (error) {
        setApiStatus('offline');
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          🎫 Welcome to CampusEvents
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Discover, register, and manage campus events all in one place
        </Typography>
        <Chip 
          label={`API: ${apiStatus === 'online' ? '🟢 Online' : '🔴 Offline'}`} 
          color={apiStatus === 'online' ? 'success' : 'error'}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/events"
            endIcon={<ArrowForward />}
            sx={{ mr: 2 }}
          >
            Browse Events
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/register"
          >
            Join Now
          </Button>
        </Box>
      </Box>

      {/* Featured Events */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6 }}>
        Featured Events
      </Typography>
      
      {events.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
          No events available. Check back soon!
        </Typography>
      ) : (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {events.map((event) => (
            <Grid item key={event._id} xs={12} md={4}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {event.description.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      📅 {format(new Date(event.date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🏛️ {event.venue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      🎟️ {event.availableTickets} tickets left
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      ${event.price}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={Link}
                    to={`/events`}
                    startIcon={<Event />}
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home;