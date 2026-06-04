# Delhivery API CORS Issue & Backend Proxy Solution

## 🚨 Issue: Network Error / CORS

### **Problem:**
When calling Delhivery API directly from the browser, you get:
```
ERR_NETWORK
Network error: Unable to reach Delhivery API. 
This may be due to CORS restrictions or network connectivity issues.
```

### **Root Cause:**
Delhivery API **does not allow direct browser requests** due to CORS (Cross-Origin Resource Sharing) restrictions. This is a security measure to:
- Prevent API keys from being exposed in the browser
- Protect against unauthorized access
- Ensure requests come from trusted servers

---

## ✅ Solution: Backend API Proxy

### **Architecture:**
```
Browser → Your Backend Server → Delhivery API
(Frontend)    (Proxy/Middleware)    (External API)
```

Instead of calling Delhivery directly from the browser, route requests through your backend server.

---

## 🔧 Implementation Options

### **Option 1: Node.js Express Backend (Recommended)**

#### **Step 1: Create Backend Proxy Server**

Create `server/delhiveryProxy.js`:

```javascript
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));

app.use(express.json());

// Delhivery configuration
const DELHIVERY_CONFIG = {
  baseURL: process.env.DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com',
  token: process.env.DELHIVERY_API_TOKEN
};

// Create axios instance for Delhivery
const delhiveryClient = axios.create({
  baseURL: DELHIVERY_CONFIG.baseURL,
  headers: {
    'Authorization': `Token ${DELHIVERY_CONFIG.token}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// ============ PROXY ENDPOINTS ============

// Pickup Request
app.post('/api/delhivery/pickup/request', async (req, res) => {
  try {
    const { pickup_time, pickup_date, warehouse_name, quantity } = req.body;
    
    console.log('📦 Proxying pickup request to Delhivery:', req.body);
    
    const response = await delhiveryClient.post('/fm/request/new/', {
      pickup_time,
      pickup_date,
      warehouse_name,
      quantity
    });
    
    console.log('✅ Delhivery pickup response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Delhivery pickup error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Create Warehouse
app.post('/api/delhivery/warehouse/create', async (req, res) => {
  try {
    console.log('🏭 Proxying warehouse creation to Delhivery');
    const response = await delhiveryClient.post('/api/backend/clientwarehouse/create/', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Delhivery warehouse creation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Edit Warehouse
app.post('/api/delhivery/warehouse/edit', async (req, res) => {
  try {
    console.log('✏️ Proxying warehouse edit to Delhivery');
    const response = await delhiveryClient.post('/api/backend/clientwarehouse/edit/', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Delhivery warehouse edit error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Create Shipment
app.post('/api/delhivery/shipment/create', async (req, res) => {
  try {
    console.log('📦 Proxying shipment creation to Delhivery');
    const response = await delhiveryClient.post('/api/cmu/create.json', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Delhivery shipment creation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Generate Waybills
app.post('/api/delhivery/waybills/generate', async (req, res) => {
  try {
    const { count = 5 } = req.body;
    console.log(`📋 Proxying waybill generation (count: ${count}) to Delhivery`);
    const response = await delhiveryClient.get(`/waybill/api/bulk/json/?count=${count}`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Delhivery waybill generation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Track Shipment
app.get('/api/delhivery/shipment/track/:waybill', async (req, res) => {
  try {
    const { waybill } = req.params;
    console.log(`🔍 Proxying shipment tracking for ${waybill} to Delhivery`);
    
    const trackClient = axios.create({
      baseURL: process.env.DELHIVERY_TRACK_URL || 'https://track.delhivery.com',
      headers: {
        'Authorization': `Token ${DELHIVERY_CONFIG.token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const response = await trackClient.get(`/api/v1/packages/json/?waybill=${waybill}`);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Delhivery tracking error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Delhivery proxy server is running',
    delhiveryConfigured: !!DELHIVERY_CONFIG.token && DELHIVERY_CONFIG.token !== 'xxxxxxxxxxxxxxxx'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Delhivery Proxy Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
  console.log(`🔑 Delhivery API configured: ${!!DELHIVERY_CONFIG.token && DELHIVERY_CONFIG.token !== 'xxxxxxxxxxxxxxxx' ? 'Yes' : 'No'}`);
});
```

#### **Step 2: Install Dependencies**

```bash
npm install express axios cors dotenv
```

#### **Step 3: Update .env**

```env
# Delhivery API
DELHIVERY_API_TOKEN=your-actual-token-here
DELHIVERY_BASE_URL=https://staging-express.delhivery.com
DELHIVERY_TRACK_URL=https://track.delhivery.com

# Server
PORT=3001
FRONTEND_URL=http://localhost:5174
```

#### **Step 4: Start Backend Server**

```bash
node server/delhiveryProxy.js
```

Or add to `package.json`:
```json
{
  "scripts": {
    "server": "node server/delhiveryProxy.js",
    "dev": "concurrently \"npm run server\" \"vite\""
  }
}
```

---

### **Option 2: Update Frontend to Use Proxy**

Update `src/services/DelhiveryService.ts`:

```typescript
// Add environment variable for backend proxy
const USE_BACKEND_PROXY = import.meta.env.VITE_USE_DELHIVERY_PROXY === 'true';
const BACKEND_PROXY_URL = import.meta.env.VITE_BACKEND_PROXY_URL || 'http://localhost:3001';

const DELHIVERY_CONFIG = {
  baseURL: USE_BACKEND_PROXY 
    ? `${BACKEND_PROXY_URL}/api/delhivery`
    : (import.meta.env.VITE_DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com'),
  // ... rest of config
};

// Update axios instance to not add Authorization header if using proxy
this.axiosInstance = axios.create({
  baseURL: DELHIVERY_CONFIG.baseURL,
  timeout: DELHIVERY_CONFIG.timeout,
  headers: USE_BACKEND_PROXY ? {
    'Content-Type': 'application/json'
  } : {
    'Authorization': `Token ${DELHIVERY_CONFIG.token}`,
    'Content-Type': 'application/json',
  },
});

// Update requestPickup to use proxy endpoint
async requestPickup(request: PickupRequest): Promise<any> {
  const endpoint = USE_BACKEND_PROXY ? '/pickup/request' : '/fm/request/new/';
  
  const delhiveryRequest = {
    pickup_time: request.pickup_time,
    pickup_date: request.pickup_date,
    warehouse_name: request.pickup_location,
    quantity: request.expected_package_count
  };
  
  const response = await this.axiosInstance.post(endpoint, delhiveryRequest);
  return response.data;
}
```

Update `.env`:
```env
VITE_USE_DELHIVERY_PROXY=true
VITE_BACKEND_PROXY_URL=http://localhost:3001
```

---

### **Option 3: Serverless Functions (Vercel/Netlify)**

#### **Vercel Serverless Function**

Create `api/delhivery/pickup.js`:

```javascript
const axios = require('axios');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pickup_time, pickup_date, warehouse_name, quantity } = req.body;
    
    const response = await axios.post(
      'https://staging-express.delhivery.com/fm/request/new/',
      { pickup_time, pickup_date, warehouse_name, quantity },
      {
        headers: {
          'Authorization': `Token ${process.env.DELHIVERY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message
    });
  }
}
```

Add to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ]
}
```

---

## 📊 Comparison

| Solution | Pros | Cons | Best For |
|----------|------|------|----------|
| **Express Backend** | Full control, easy debugging, can add business logic | Requires separate server | Development, Production |
| **Update Frontend** | Seamless integration | Requires backend setup | Production-ready apps |
| **Serverless** | No server management, auto-scaling | Cold starts, limited execution time | Simple deployments |

---

## 🎯 Recommended Approach

**For Development:**
1. Use Express backend proxy locally
2. Keep API keys secure in backend `.env`
3. Frontend calls `http://localhost:3001/api/delhivery/*`

**For Production:**
1. Deploy backend proxy alongside frontend
2. Use environment variables for configuration
3. Add rate limiting and authentication
4. Monitor API usage

---

## 🔒 Security Best Practices

1. **Never expose API keys in frontend**
   - ❌ Bad: `VITE_DELHIVERY_API_TOKEN` (visible in browser)
   - ✅ Good: Backend environment variable

2. **Add authentication to proxy endpoints**
   ```javascript
   // Simple API key authentication
   app.use('/api/delhivery', (req, res, next) => {
     const apiKey = req.headers['x-api-key'];
     if (apiKey !== process.env.INTERNAL_API_KEY) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   });
   ```

3. **Rate limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/delhivery', limiter);
   ```

4. **Request validation**
   ```javascript
   const { body, validationResult } = require('express-validator');
   
   app.post('/api/delhivery/pickup/request', [
     body('pickup_time').notEmpty(),
     body('pickup_date').isISO8601(),
     body('warehouse_name').notEmpty(),
     body('quantity').isInt({ min: 1 })
   ], async (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     // ... rest of handler
   });
   ```

---

## ✅ Testing the Proxy

### **1. Test Backend Health:**
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Delhivery proxy server is running",
  "delhiveryConfigured": true
}
```

### **2. Test Pickup Request:**
```bash
curl -X POST http://localhost:3001/api/delhivery/pickup/request \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_time": "11:00:00",
    "pickup_date": "2024-10-20",
    "warehouse_name": "Main Warehouse",
    "quantity": 5
  }'
```

Expected response:
```json
{
  "success": true,
  "pickup_id": "PKP123456",
  "message": "Pickup request created successfully"
}
```

---

## 🐛 Troubleshooting

### **Issue: "Cannot reach backend proxy"**
- Ensure backend server is running on port 3001
- Check CORS configuration
- Verify `VITE_BACKEND_PROXY_URL` in `.env`

### **Issue: "401 Unauthorized from Delhivery"**
- Verify `DELHIVERY_API_TOKEN` in backend `.env`
- Check if using staging vs production token
- Ensure token format: `Token your-token-here`

### **Issue: "Request timeout"**
- Increase timeout in axios config
- Check Delhivery API status
- Verify network connectivity

---

## 🎉 Result

Once backend proxy is set up:
- ✅ No more CORS errors
- ✅ API keys secure on backend
- ✅ Pickup requests work correctly
- ✅ All Delhivery features functional
- ✅ Better error handling and logging

**Your Delhivery integration will be production-ready!** 🚀

