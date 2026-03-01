# CampusEvent API - Deployment Guide 🚀

## Backend Deployment (Render.com)

### 1. Prepare Backend for Deployment

```bash
# Build the backend
cd campus-event-api
npm run build

# The build will create a 'dist' folder with compiled JavaScript
```

### 2. Environment Variables for Render

Create these environment variables in your Render dashboard:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_events?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_here_make_it_long_and_random
JWT_EXPIRE=7d
NODE_ENV=production
PORT=10000
```

### 3. Deploy to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `campus-event-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier is fine for testing

### 4. Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Whitelist your Render app's IP (or 0.0.0.0/0 for testing)

## Frontend Deployment (Vercel.com)

### 1. Prepare Frontend for Deployment

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Build the frontend
npm run build
```

### 2. Environment Variables for Vercel

```env
VITE_API_URL=https://your-render-app.onrender.com/api
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

## Testing Your Deployed Application

### Backend Health Check
```bash
curl https://your-app.onrender.com/health
# Should return: {"status":"OK","message":"Server is running"}
```

### API Endpoints Test
```bash
# Get all events
curl https://your-app.onrender.com/api/events

# Register a test user
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Frontend Access
- Open your Vercel deployment URL
- Try registering a new account
- Browse events
- Test the full user flow

## Troubleshooting

### Common Backend Issues
- **MongoDB Connection**: Check your connection string and IP whitelist
- **JWT Secret**: Ensure it's set and secure
- **Port**: Render uses 10000 by default

### Common Frontend Issues
- **API URL**: Make sure VITE_API_URL points to your backend
- **CORS**: Backend should allow your frontend domain
- **Build Errors**: Ensure all dependencies are installed

### Environment Variables Checklist
- [ ] MONGODB_URI (Backend)
- [ ] JWT_SECRET (Backend)
- [ ] JWT_EXPIRE (Backend)
- [ ] NODE_ENV=production (Backend)
- [ ] PORT=10000 (Backend)
- [ ] VITE_API_URL (Frontend)

## Production Optimizations

### Backend
- Enable gzip compression
- Set up proper logging
- Configure rate limiting
- Set up monitoring

### Frontend
- Enable service worker for caching
- Optimize images
- Set up error boundaries
- Configure analytics

## Security Checklist
- [ ] JWT secrets are secure and random
- [ ] MongoDB has proper authentication
- [ ] CORS is configured for production domains
- [ ] HTTPS is enabled
- [ ] Passwords are hashed
- [ ] Input validation is in place

---

🎉 **Congratulations!** Your CampusEvent API is now live and ready for users!</content>
<parameter name="filePath">c:\Users\Joe\Documents\GitHub\campus-event-api\DEPLOYMENT.md