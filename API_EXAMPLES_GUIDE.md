# API Examples Guide - Practical Usage

This guide shows real-world examples using your actual API routes with step-by-step explanations.

---

## 🔐 Authentication First

Before using any protected API, you need to be authenticated. The authentication cookie is automatically handled by the browser.

### **Login Example**

```javascript
// 1. Login via the UI at /login
// 2. Or programmatically:
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'agent@example.com',
    password: 'your-password'
  })
});

// Cookie is automatically set by the browser
```

---

## 📋 Example 1: Complete Property Listing Flow

### **Step 1: Upload Property Images**

```javascript
// Upload images to Cloudinary
async function uploadPropertyImages(files) {
  const uploadedUrls = [];
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'properties'); // Required: properties, agents, projects, or posts
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      uploadedUrls.push(data.data.url);
      console.log('✅ Uploaded:', data.data.url);
    }
  }
  
  return uploadedUrls;
}

// Usage:
const imageFiles = document.querySelector('#image-input').files;
const imageUrls = await uploadPropertyImages(imageFiles);
```

### **Step 2: Create Property Listing**

```javascript
async function createProperty() {
  const propertyData = {
    title: 'Luxury Condo in Sukhumvit',
    description: 'Beautiful 2-bedroom condo with city view',
    price: 8500000,
    rentPrice: 35000,
    listingType: 'BOTH', // SALE, RENT, or BOTH
    category: 'CONDO', // HOUSE, CONDO, INVESTMENT, LAND
    
    // Location
    address: '123 Sukhumvit Road',
    city: 'Bangkok',
    area: 'Sukhumvit',
    latitude: 13.7563,
    longitude: 100.5018,
    
    // Details
    bedrooms: 2,
    bathrooms: 2,
    size: 85.5,
    floor: 15,
    
    // Images from Step 1
    images: imageUrls,
    
    // Optional
    projectId: 'project-uuid-here', // If part of a project
    houseType: 'HIGH_RISE',
    furnishing: 'FULLY_FURNISHED',
    
    // Commission
    commissionRate: 3.0, // Platform commission (internal only)
    agentCommissionRate: 2.5, // Shared with agents
  };
  
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(propertyData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Property created:', result.data.id);
    return result.data;
  } else {
    console.error('❌ Error:', result.error);
  }
}
```

### **Step 3: Update Property**

```javascript
async function updateProperty(propertyId, updates) {
  const response = await fetch(`/api/properties/${propertyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price: 8200000, // Reduced price
      status: 'ACTIVE',
      description: 'Updated description with special offer!'
    })
  });
  
  const result = await response.json();
  console.log('✅ Property updated');
}
```

---

## 👥 Example 2: Team Management Flow

### **Step 1: List All Agents**

```javascript
async function getTeamMembers() {
  const response = await fetch('/api/agents');
  const data = await response.json();
  
  if (data.success) {
    console.log(`Found ${data.data.length} agents`);
    data.data.forEach(agent => {
      console.log(`- ${agent.name} (${agent.role})`);
    });
    return data.data;
  }
}
```

### **Step 2: Create New Agent**

```javascript
async function addNewAgent() {
  const newAgent = {
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+66812345678',
    whatsapp: '+66812345678',
    lineId: '@johnsmith',
    role: 'AGENT', // SUPER_ADMIN, PLATFORM_AGENT, or AGENT
    imageUrl: 'https://cloudinary.com/...'
  };
  
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAgent)
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Agent created:', result.data.agent.id);
    console.log('📧 Tell them to sign up with:', newAgent.email);
  }
}
```

### **Step 3: Update Agent Profile**

```javascript
async function updateAgentProfile(agentId) {
  const response = await fetch(`/api/agents/${agentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '+66887654321',
      whatsapp: '+66887654321',
      role: 'PLATFORM_AGENT' // Promote to platform agent
    })
  });
  
  const result = await response.json();
  console.log('✅ Agent updated');
}
```

---

## 💼 Example 3: Deal Management Flow

### **Step 1: Create Deal from Enquiry**

```javascript
async function createDealFromEnquiry(propertyId, clientInfo) {
  const dealData = {
    propertyId: propertyId,
    clientName: 'Sarah Johnson',
    clientPhone: '+66898765432',
    dealType: 'SALE', // or 'RENT'
    stage: 'NEW_LEAD', // NEW_LEAD, VIEWING, NEGOTIATION, etc.
    amount: 8200000,
    notes: 'Client interested, wants to view this weekend'
  };
  
  const response = await fetch('/api/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dealData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Deal created:', result.data.id);
    return result.data;
  }
}
```

### **Step 2: Update Deal Stage**

```javascript
async function moveDealToNextStage(dealId) {
  const response = await fetch(`/api/deals/${dealId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stage: 'VIEWING', // Progress the deal
      notes: 'Viewing scheduled for Saturday 2pm'
    })
  });
  
  const result = await response.json();
  console.log('✅ Deal updated to VIEWING stage');
  console.log('📅 Property freshness automatically updated');
}
```

### **Step 3: Close Deal**

```javascript
async function closeDeal(dealId) {
  // Update to WON stage
  await fetch(`/api/deals/${dealId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stage: 'WON',
      amount: 8000000, // Final negotiated price
      notes: 'Deal closed! Client signed contract.'
    })
  });
  
  console.log('🎉 Deal won!');
}
```

---

## 📊 Example 4: Dashboard Statistics

### **Get Agent Dashboard Stats**

```javascript
async function loadDashboard() {
  const response = await fetch('/api/agent/stats');
  const data = await response.json();
  
  if (data.success) {
    const stats = data.data;
    
    console.log('📊 Dashboard Stats:');
    console.log(`Active Listings: ${stats.activeListings}`);
    console.log(`Pending Submissions: ${stats.pendingSubmissions}`);
    console.log(`Fresh Listings: ${stats.freshListings}`);
    console.log(`Needs Check: ${stats.needsCheckListings}`);
    
    // Update UI
    document.querySelector('#active-count').textContent = stats.activeListings;
    document.querySelector('#pending-count').textContent = stats.pendingSubmissions;
  }
}

// Refresh every 30 seconds
setInterval(loadDashboard, 30000);
```

---

## ❤️ Example 5: Wishlist & Comparison

### **Add to Wishlist (Works for Guests!)**

```javascript
async function addToWishlist(propertyId) {
  const response = await fetch('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('❤️ Added to wishlist');
    // Guest ID is automatically created in cookie
  }
}
```

### **Get Wishlist Items**

```javascript
async function getWishlist() {
  const response = await fetch('/api/wishlist');
  const data = await response.json();
  
  if (data.success) {
    console.log(`You have ${data.data.items.length} saved properties`);
    
    data.data.items.forEach(item => {
      console.log(`- ${item.property.title}: ฿${item.property.price.toLocaleString()}`);
    });
  }
}
```

### **Add to Comparison (Max 4)**

```javascript
async function addToComparison(propertyId) {
  const response = await fetch('/api/comparison', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Added to comparison');
  } else if (result.error.includes('maximum')) {
    console.log('⚠️ Already comparing 4 properties. Remove one first.');
  }
}
```

---

## 🔔 Example 6: Price Alerts (Premium Feature)

### **Create Price Alert**

```javascript
async function createPriceAlert(propertyId) {
  const alertData = {
    propertyId: propertyId,
    alertType: 'PRICE_DROP', // PRICE_DROP, PRICE_INCREASE, ANY_CHANGE
    targetPrice: 7500000, // Alert when price drops to this
    percentageChange: 10 // Or alert on 10% change
  };
  
  const response = await fetch('/api/price-alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('🔔 Price alert created');
  } else if (result.error.includes('premium')) {
    console.log('⚠️ Price alerts are only for SUPER_ADMIN and PLATFORM_AGENT');
  }
}
```

### **Get My Price Alerts**

```javascript
async function getMyAlerts() {
  const response = await fetch('/api/price-alerts');
  const data = await response.json();
  
  if (data.success) {
    data.data.alerts.forEach(alert => {
      console.log(`🔔 ${alert.property.title}`);
      console.log(`   Type: ${alert.alertType}`);
      console.log(`   Target: ฿${alert.targetPrice?.toLocaleString()}`);
    });
  }
}
```

---

## 📝 Example 7: Property Submission (Public)

### **Submit Property for Review**

```javascript
// This endpoint is PUBLIC - no authentication needed
async function submitProperty() {
  const submissionData = {
    title: 'House for Sale in Chiang Mai',
    description: 'Beautiful 3-bedroom house with garden',
    price: 4500000,
    listingType: 'SALE',
    category: 'HOUSE',
    
    // Contact info
    contactName: 'Owner Name',
    contactPhone: '+66812345678',
    contactLine: '@ownerline',
    
    // Location
    address: '456 Nimman Road',
    city: 'Chiang Mai',
    state: 'Chiang Mai',
    
    // Optional
    commission: '3%',
    images: ['https://...']
  };
  
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submissionData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Submission received! We will review it soon.');
  }
}
```

---

## 🏆 Example 8: Archive Sold Property

### **Mark Property as Sold**

```javascript
async function archiveAsSold(propertyId) {
  const soldData = {
    propertyId: propertyId,
    soldType: 'SOLD', // SOLD, RENTED, or WITHDRAWN
    finalPrice: 7800000, // Actual sale price
    notes: 'Sold below asking price, quick sale'
  };
  
  const response = await fetch('/api/sold-properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(soldData)
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Property archived as sold');
    console.log(`Days on market: ${result.data.soldProperty.daysOnMarket}`);
  }
}
```

### **Get Sold Properties for Analytics**

```javascript
async function getSoldProperties() {
  const params = new URLSearchParams({
    city: 'Bangkok',
    category: 'CONDO',
    limit: '50'
  });
  
  const response = await fetch(`/api/sold-properties?${params}`);
  const data = await response.json();
  
  if (data.success) {
    console.log(`Found ${data.data.soldProperties.length} sold properties`);
    
    // Calculate average price
    const avgPrice = data.data.soldProperties.reduce((sum, p) => 
      sum + (p.finalPrice || p.listingPrice), 0
    ) / data.data.soldProperties.length;
    
    console.log(`Average sale price: ฿${avgPrice.toLocaleString()}`);
  }
}
```

---

## 🔍 Example 9: Search Properties

### **Search with Filters**

```javascript
async function searchProperties() {
  const filters = {
    city: 'Bangkok',
    area: 'Sukhumvit',
    category: 'CONDO',
    minPrice: 5000000,
    maxPrice: 10000000,
    bedrooms: 2,
    listingType: 'SALE',
    page: 1,
    limit: 20
  };
  
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/properties?${params}`);
  const data = await response.json();
  
  if (data.success) {
    console.log(`Found ${data.pagination.total} properties`);
    console.log(`Showing page ${data.pagination.page} of ${data.pagination.totalPages}`);
    
    data.data.forEach(property => {
      console.log(`${property.title} - ฿${property.price.toLocaleString()}`);
    });
  }
}
```

---

## 📱 Example 10: Complete User Flow

### **Buyer Journey**

```javascript
// 1. Browse properties
async function buyerJourney() {
  // Search for properties
  const searchResponse = await fetch('/api/properties?city=Bangkok&category=CONDO');
  const properties = await searchResponse.json();
  
  // Add favorites to wishlist
  await fetch('/api/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId: properties.data[0].id })
  });
  
  // Add to comparison
  await fetch('/api/comparison', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId: properties.data[0].id })
  });
  
  // Submit enquiry
  await fetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      propertyId: properties.data[0].id,
      name: 'John Buyer',
      email: 'john@example.com',
      phone: '+66812345678',
      message: 'Interested in viewing this property'
    })
  });
  
  console.log('✅ Enquiry submitted!');
}
```

---

## 🛠️ Error Handling Best Practices

```javascript
async function apiCallWithErrorHandling() {
  try {
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Handle different error types
      switch (response.status) {
        case 400:
          console.error('❌ Validation error:', result.error);
          // Show user-friendly message
          alert(`Please check: ${result.error}`);
          break;
        case 401:
          console.error('🔒 Not authenticated');
          window.location.href = '/login';
          break;
        case 403:
          console.error('⛔ Not authorized');
          alert('You do not have permission for this action');
          break;
        case 404:
          console.error('🔍 Not found');
          break;
        case 500:
          console.error('💥 Server error:', result.error);
          alert('Something went wrong. Please try again.');
          break;
      }
      return null;
    }
    
    return result.data;
    
  } catch (error) {
    console.error('🌐 Network error:', error);
    alert('Connection error. Please check your internet.');
    return null;
  }
}
```

---

## 📚 Response Format Reference

### **Success Response**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-12-24T11:40:00.000Z"
}
```

### **Paginated Response**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "timestamp": "2024-12-24T11:40:00.000Z"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Validation error: Title must be at least 5 characters",
  "timestamp": "2024-12-24T11:40:00.000Z"
}
```

---

## 🎯 Quick Reference

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/properties` | GET | No | Search properties |
| `/api/properties` | POST | Yes | Create property |
| `/api/properties/[id]` | PUT | Yes | Update property |
| `/api/upload` | POST | Yes | Upload images |
| `/api/agents` | GET | Yes | List agents |
| `/api/agents` | POST | Yes (SUPER_ADMIN) | Create agent |
| `/api/deals` | POST | Yes | Create deal |
| `/api/deals/[id]` | PATCH | Yes | Update deal |
| `/api/agent/stats` | GET | Yes | Dashboard stats |
| `/api/wishlist` | GET/POST/DELETE | No (Guest OK) | Manage wishlist |
| `/api/comparison` | GET/POST/DELETE | No (Guest OK) | Manage comparison |
| `/api/price-alerts` | GET/POST/DELETE | Yes (Premium) | Price alerts |
| `/api/submissions` | POST | No | Submit property |
| `/api/sold-properties` | POST | Yes | Archive as sold |

---

**Happy Coding!** 🚀

For more details, see `API_TESTING_GUIDE.md` for testing instructions.
