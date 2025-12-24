# API Testing Guide

## 🧪 How to Test Your Migrated APIs

All 17 migrated routes are ready to test. This guide provides examples for each endpoint.

---

## 🔑 Authentication

Most routes require authentication. Get your auth token first:

### **Login to get token:**
1. Go to: `https://yourdomain.com/login`
2. Login with your credentials
3. Open Browser DevTools → Application → Cookies
4. Copy the `sb-*-auth-token` cookie value

### **Use token in requests:**
```bash
# The cookie is automatically sent by the browser
# For API testing tools (Postman/Insomnia), add cookie header
```

---

## 📋 API Endpoints to Test

### **1. Agent Management**

#### **GET /api/agents** - List all agents
```bash
# Browser
https://yourdomain.com/api/agents

# With inactive filter
https://yourdomain.com/api/agents?includeInactive=true

# Expected Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Agent Name",
      "email": "agent@example.com",
      "role": "AGENT",
      "isActive": true
    }
  ],
  "timestamp": "2024-12-24T..."
}
```

#### **POST /api/agents** - Create agent (SUPER_ADMIN only)
```bash
# Request Body:
{
  "name": "New Agent",
  "email": "newagent@example.com",
  "phone": "+66812345678",
  "role": "AGENT",
  "lineId": "line123",
  "whatsapp": "+66812345678"
}

# Expected Response:
{
  "success": true,
  "data": {
    "agent": { ... }
  },
  "timestamp": "2024-12-24T..."
}
```

#### **GET /api/agents/[id]** - Get single agent
```bash
https://yourdomain.com/api/agents/[agent-uuid]
```

#### **PUT /api/agents/[id]** - Update agent
```bash
# Request Body:
{
  "name": "Updated Name",
  "phone": "+66887654321"
}
```

#### **DELETE /api/agents/[id]** - Soft delete agent (SUPER_ADMIN only)
```bash
# Sends DELETE request to:
https://yourdomain.com/api/agents/[agent-uuid]

# Agent is deactivated (isActive = false), not deleted
```

---

### **2. Agent Stats**

#### **GET /api/agent/stats** - Dashboard statistics
```bash
https://yourdomain.com/api/agent/stats

# Expected Response:
{
  "success": true,
  "data": {
    "activeListings": 45,
    "pendingSubmissions": 3,
    "freshListings": 30,
    "needsCheckListings": 15
  }
}
```

---

### **3. Deal Management**

#### **GET /api/deals/[id]** - Get deal details
```bash
https://yourdomain.com/api/deals/[deal-uuid]

# Expected Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientName": "John Doe",
    "clientPhone": "+66812345678",
    "stage": "VIEWING",
    "dealType": "SALE",
    "amount": 5000000,
    "property": {
      "id": "uuid",
      "title": "Condo in Bangkok"
    }
  }
}
```

#### **PATCH /api/deals/[id]** - Update deal
```bash
# Request Body:
{
  "stage": "NEGOTIATION",
  "notes": "Client interested, negotiating price"
}

# When stage changes, property.lastVerifiedAt is automatically updated
```

#### **DELETE /api/deals/[id]** - Delete deal
```bash
# Sends DELETE request to:
https://yourdomain.com/api/deals/[deal-uuid]
```

---

### **4. File Upload**

#### **POST /api/upload** - Upload file to Cloudinary
```bash
# Form Data:
file: [image file]
folder: "properties" | "agents" | "projects" | "posts"

# Expected Response:
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "ascent/properties/abc123"
  }
}
```

#### **DELETE /api/upload** - Delete file from Cloudinary
```bash
# Request Body:
{
  "publicId": "ascent/properties/abc123"
}
```

---

### **5. Wishlist (Guest & Authenticated)**

#### **GET /api/wishlist** - Get user's wishlist
```bash
https://yourdomain.com/api/wishlist

# Works for both authenticated users and guests (cookie-based)
```

#### **POST /api/wishlist** - Add to wishlist
```bash
# Request Body:
{
  "propertyId": "property-uuid"
}

# For guests, automatically creates guest_id cookie
```

#### **DELETE /api/wishlist** - Remove from wishlist
```bash
https://yourdomain.com/api/wishlist?propertyId=[property-uuid]
```

---

### **6. Comparison (Guest & Authenticated)**

#### **GET /api/comparison** - Get comparison list
```bash
https://yourdomain.com/api/comparison

# Max 4 properties
```

#### **POST /api/comparison** - Add to comparison
```bash
# Request Body:
{
  "propertyId": "property-uuid"
}

# Returns error if already at max (4 properties)
```

#### **DELETE /api/comparison** - Remove from comparison
```bash
https://yourdomain.com/api/comparison?propertyId=[property-uuid]
```

---

### **7. Price Alerts (Premium Feature)**

#### **GET /api/price-alerts** - Get user's price alerts
```bash
https://yourdomain.com/api/price-alerts

# Only for SUPER_ADMIN and PLATFORM_AGENT
# Returns 403 for regular AGENT role
```

#### **POST /api/price-alerts** - Create price alert
```bash
# Request Body:
{
  "propertyId": "property-uuid",
  "alertType": "PRICE_DROP",
  "targetPrice": 4500000,
  "percentageChange": 10
}

# alertType: "PRICE_DROP" | "PRICE_INCREASE" | "ANY_CHANGE"
```

#### **DELETE /api/price-alerts** - Delete price alert
```bash
https://yourdomain.com/api/price-alerts?alertId=[alert-uuid]
```

---

### **8. Blog Posts**

#### **GET /api/posts** - List posts
```bash
# Public endpoint
https://yourdomain.com/api/posts

# With filters
https://yourdomain.com/api/posts?category=NEWS&published=true&page=1&limit=10

# Categories: MARKET_TREND, INVESTMENT, LEGAL, NEWS
```

#### **POST /api/posts** - Create post (SUPER_ADMIN only)
```bash
# Request Body:
{
  "title": "Market Update December 2024",
  "excerpt": "Brief summary...",
  "content": "Full content here...",
  "category": "MARKET_TREND",
  "coverImage": "https://...",
  "published": true,
  "authorName": "John Doe"
}
```

---

### **9. Property Submissions**

#### **GET /api/submissions** - List submissions (Authenticated)
```bash
https://yourdomain.com/api/submissions

# Only authenticated agents can view
```

#### **POST /api/submissions** - Submit property (Public)
```bash
# Public endpoint - no auth required
# Request Body:
{
  "title": "Condo for Sale",
  "description": "Beautiful 2BR condo...",
  "price": 5000000,
  "listingType": "SALE",
  "category": "CONDO",
  "contactName": "John Doe",
  "contactPhone": "+66812345678",
  "contactLine": "line123",
  "address": "123 Sukhumvit Rd",
  "city": "Bangkok",
  "state": "Bangkok",
  "commission": "3%",
  "images": ["https://..."]
}

# Categories: HOUSE, CONDO, INVESTMENT, LAND
```

---

### **10. Sold Properties**

#### **GET /api/sold-properties** - Get sold properties
```bash
# Public endpoint for analytics
https://yourdomain.com/api/sold-properties

# With filters
https://yourdomain.com/api/sold-properties?city=Bangkok&category=CONDO&limit=50
```

#### **POST /api/sold-properties** - Archive property as sold
```bash
# Request Body:
{
  "propertyId": "property-uuid",
  "soldType": "SOLD",
  "finalPrice": 4800000,
  "notes": "Sold below asking price"
}

# soldType: "SOLD" | "RENTED" | "WITHDRAWN"
```

---

## 🧪 Testing Checklist

### **Authentication Tests**
- [ ] Login works
- [ ] Authenticated routes require login
- [ ] Role-based access works (SUPER_ADMIN, PLATFORM_AGENT, AGENT)
- [ ] Guest features work (wishlist, comparison)

### **Agent Management**
- [ ] List agents
- [ ] Create agent (SUPER_ADMIN only)
- [ ] Update agent
- [ ] Soft delete agent
- [ ] View agent stats

### **Deal Management**
- [ ] Get deal details
- [ ] Update deal stage
- [ ] Property freshness updates when stage changes
- [ ] Delete deal
- [ ] Authorization checks (only property owner's agent)

### **File Upload**
- [ ] Upload image to Cloudinary
- [ ] Delete image from Cloudinary
- [ ] Folder validation works

### **User Features**
- [ ] Add to wishlist (guest)
- [ ] Add to wishlist (authenticated)
- [ ] Remove from wishlist
- [ ] Add to comparison (max 4)
- [ ] Remove from comparison
- [ ] Create price alert (premium only)
- [ ] Delete price alert

### **Content**
- [ ] List posts with filters
- [ ] Create post (SUPER_ADMIN only)
- [ ] Submit property (public)
- [ ] View submissions (authenticated)
- [ ] Archive property as sold

### **Error Handling**
- [ ] Invalid input returns 400 with clear message
- [ ] Unauthorized returns 401
- [ ] Forbidden returns 403
- [ ] Not found returns 404
- [ ] Server errors return 500

### **Data Validation**
- [ ] Email validation works
- [ ] Phone number validation works
- [ ] UUID validation works
- [ ] Enum validation works
- [ ] Required fields are enforced

### **Decimal Serialization**
- [ ] Prices are returned as numbers (not strings)
- [ ] Commission rates are numbers
- [ ] Coordinates are numbers
- [ ] No serialization errors

---

## 🔍 How to Check Logs

### **Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click "Logs"
4. Filter by function name or search by ID

### **Search Logs:**
```
# Search by agent ID
agentId: "uuid"

# Search by property ID
propertyId: "uuid"

# Search by error level
level: "error"

# Search by specific route
"POST /api/agents"
```

---

## ⚠️ Common Issues

### **401 Unauthorized**
- Check if you're logged in
- Verify cookie is being sent
- Check token hasn't expired

### **403 Forbidden**
- Check user role (some routes require SUPER_ADMIN)
- Verify agent profile exists
- Check premium feature access

### **400 Validation Error**
- Check request body format
- Verify all required fields
- Check enum values match schema
- Verify UUIDs are valid

### **500 Server Error**
- Check Vercel logs for details
- Verify DATABASE_URL is set
- Check for missing environment variables

---

## 📊 Expected Response Format

### **Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-12-24T..."
}
```

### **Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  },
  "timestamp": "2024-12-24T..."
}
```

### **Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-12-24T..."
}
```

---

## 🎯 Quick Test Script

You can use this in browser console to test APIs:

```javascript
// Test GET endpoint
fetch('/api/agents')
  .then(r => r.json())
  .then(console.log);

// Test POST endpoint
fetch('/api/wishlist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ propertyId: 'your-property-uuid' })
})
  .then(r => r.json())
  .then(console.log);

// Test with error handling
async function testAPI() {
  try {
    const res = await fetch('/api/agent/stats');
    const data = await res.json();
    console.log('Success:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}
testAPI();
```

---

## ✅ All Tests Passing?

Once all tests pass:
1. ✅ Your APIs are working correctly
2. ✅ Authentication is secure
3. ✅ Validation is working
4. ✅ Logging is capturing events
5. ✅ Ready for production!

---

**Happy Testing!** 🚀

If you find any issues, check:
1. Vercel logs for error details
2. Browser console for client errors
3. Network tab for request/response
4. Database for data consistency
