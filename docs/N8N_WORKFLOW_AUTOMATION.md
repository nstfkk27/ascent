# n8n Workflow Automation Strategy

## Overview

This document outlines the complete n8n automation strategy for your real estate platform, covering lead generation, admin tasks, marketing, and customer response automation.

---

## Architecture Overview

```
┌─────────────────┐
│  External APIs  │ (Facebook, Apify, WhatsApp, Line)
└────────┬────────┘
         │
    ┌────▼────┐
    │   n8n   │ (Automation Engine)
    └────┬────┘
         │
┌────────▼────────────┐
│  Your Platform API  │ (estateascent.com)
└─────────────────────┘
```

**Connection Method:**
- n8n → Your Platform: REST API calls with API key authentication
- Your Platform → n8n: Webhooks for event notifications
- External Services → n8n: API integrations, webhooks, scraping

---

## 1. Lead Hunter Workflow

### Workflow: Facebook Lead Capture & Matching

**Trigger:** Scheduled (every 2 hours) or Manual

**Steps:**

1. **Apify Facebook Scraper**
   - Extract leads from Facebook groups/pages
   - Get: Name, Contact, Budget, Requirements

2. **AI Agent (OpenAI/Claude)**
   - Clean gibberish text
   - Extract structured data:
     ```json
     {
       "name": "John Doe",
       "phone": "+66812345678",
       "email": "john@example.com",
       "budget": "5000000-8000000",
       "category": "CONDO",
       "bedrooms": 2,
       "area": "Jomtien",
       "listingType": "SALE"
     }
     ```

3. **Store in Airtable/Google Sheets**
   - Create lead record
   - Status: "NEW"

4. **Match Properties (Your Platform API)**
   - Call: `GET /api/n8n/properties/match`
   - Parameters: budget, category, bedrooms, area
   - Returns: Top 5 matching properties with listing codes

5. **Create Enquiry (Your Platform API)**
   - Call: `POST /api/n8n/enquiries`
   - Attach matched properties
   - Assign to agent based on area

6. **Notify Agent**
   - Send WhatsApp/Line message
   - Include lead details + matched properties
   - Link to CRM

**n8n Nodes:**
```
Schedule Trigger → Apify → OpenAI → Google Sheets → HTTP Request (Match) 
→ HTTP Request (Create Enquiry) → WhatsApp/Line → End
```

**Estimated Time Saved:** 2-3 hours/day

---

## 2. Admin Workflow

### Workflow A: Invoice & Receipt Generation

**Trigger:** Deal status changes to "CLOSED" (Webhook from your platform)

**Steps:**

1. **Receive Webhook**
   - Deal data: property, client, amount, agent

2. **Generate Invoice PDF**
   - Use template (Carbone.io or PDF.co)
   - Include: Deal details, commission breakdown, payment terms

3. **Store in Cloudinary**
   - Upload PDF
   - Get public URL

4. **Save to Platform**
   - Call: `POST /api/n8n/documents/invoice`
   - Store URL, deal ID, client info

5. **Send to Client**
   - Email with PDF attachment
   - WhatsApp/Line with download link
   - SMS notification

6. **Update Google Sheets**
   - Accounting sheet
   - Track: Invoice number, amount, date, status

**n8n Nodes:**
```
Webhook → PDF Generator → Cloudinary → HTTP Request (Save) 
→ Email/WhatsApp/SMS → Google Sheets → End
```

### Workflow B: Payment Tracking

**Trigger:** Manual or Scheduled (daily)

**Steps:**

1. **Check Payment Status**
   - Read from Google Sheets
   - Filter: Pending payments

2. **Send Reminders**
   - 3 days before due: Friendly reminder
   - Due date: Payment due notice
   - 3 days overdue: Urgent reminder

3. **Update Platform**
   - Call: `POST /api/n8n/notifications/send`
   - Log reminder sent

**Estimated Time Saved:** 5-6 hours/week

---

## 3. Marketing Workflow

### Workflow A: Auto-Post Featured Properties

**Trigger:** Scheduled (Daily at 9 AM, 3 PM, 7 PM)

**Steps:**

1. **Get Featured Properties**
   - Call: `GET /api/n8n/properties/featured`
   - Filter: New, price drops, super deals

2. **Generate Post Content (AI)**
   - OpenAI prompt:
     ```
     Create engaging Facebook post for this property:
     - Title: {title}
     - Price: {price}
     - Features: {bedrooms}BR, {size}sqm
     - Highlights: {highlights}
     
     Include emojis, call-to-action, and hashtags.
     Write in Thai and English.
     ```

3. **Create Image Carousel**
   - Get property images from Cloudinary
   - Add watermark/branding

4. **Post to Social Media**
   - Facebook Page
   - Facebook Groups
   - Line Official Account
   - Instagram (via Buffer/Hootsuite)

5. **Track Performance**
   - Call: `POST /api/n8n/social/track`
   - Store: Post ID, platform, property ID, timestamp

**n8n Nodes:**
```
Schedule → HTTP Request (Get Properties) → OpenAI → Image Processing 
→ Facebook/Line/Instagram → HTTP Request (Track) → End
```

### Workflow B: News & Knowledge Base

**Trigger:** Scheduled (Weekly)

**Steps:**

1. **Scrape Real Estate News**
   - Sources: Thai property sites, international news
   - Keywords: Pattaya, Jomtien, real estate trends

2. **AI Summarization**
   - OpenAI: Summarize articles
   - Generate blog post outline

3. **Create Draft Blog Post**
   - Call: `POST /api/n8n/posts`
   - Status: DRAFT
   - Category: NEWS or KNOWLEDGE

4. **Notify Content Team**
   - Slack/Email: Review and publish

**Estimated Time Saved:** 8-10 hours/week

---

## 4. Responder Workflow

### Workflow A: Initial Message Classification

**Trigger:** New message received (Facebook, Line, WhatsApp webhook)

**Steps:**

1. **Receive Message**
   - Platform: Facebook Messenger, Line, WhatsApp
   - Content: Text, images, location

2. **AI Classification**
   - OpenAI prompt:
     ```
     Classify this message intent:
     - ENQUIRY: Asking about property
     - VIEWING: Request to view property
     - PRICE: Price negotiation
     - INFO: General information
     - COMPLAINT: Issue or complaint
     - SPAM: Irrelevant
     
     Message: {message}
     ```

3. **Route Based on Intent**

   **If ENQUIRY:**
   - Extract: Budget, bedrooms, area, type
   - Match properties
   - Send auto-response with 3-5 listings
   - Create enquiry in platform

   **If VIEWING:**
   - Check agent availability
   - Send available time slots
   - Create viewing appointment

   **If PRICE:**
   - Forward to assigned agent
   - Send: "Agent will contact you within 1 hour"

   **If INFO:**
   - Search knowledge base
   - Send relevant article/FAQ
   - If not found, forward to agent

   **If COMPLAINT:**
   - High priority notification to manager
   - Auto-response: "We apologize. Manager will contact you within 30 minutes"

   **If SPAM:**
   - Ignore or auto-block

4. **Log Interaction**
   - Call: `POST /api/n8n/chat/response`
   - Store: Message, intent, response, timestamp

**n8n Nodes:**
```
Webhook → OpenAI (Classify) → Switch (Intent) 
→ [Multiple branches based on intent] 
→ WhatsApp/Facebook/Line Reply → HTTP Request (Log) → End
```

### Workflow B: Property Listing Sender

**Trigger:** Enquiry created or manual request

**Steps:**

1. **Get Property Details**
   - Call: `GET /api/properties/{id}`
   - Get: Images, details, agent info

2. **Format Message**
   - Template:
     ```
     🏠 {title}
     💰 ฿{price:formatted}
     📐 {size} sqm | 🛏️ {bedrooms}BR | 🚿 {bathrooms}BA
     📍 {area}, {city}
     
     ✨ Highlights:
     {highlights}
     
     📸 View photos: {link}
     📞 Contact: {agent.name} - {agent.phone}
     ```

3. **Send via Multiple Channels**
   - WhatsApp: Text + images
   - Facebook: Carousel
   - Line: Flex message with images
   - Email: HTML template

4. **Track Delivery**
   - Update enquiry status
   - Log sent timestamp

**Estimated Time Saved:** 15-20 hours/week

---

## Platform API Integration

### Required API Endpoints

Create these endpoints in your platform for n8n integration:

#### 1. Lead & Enquiry Management

```typescript
// Match properties based on criteria
GET /api/n8n/properties/match
Query params: budget, category, bedrooms, area, listingType
Response: Property[]

// Create enquiry
POST /api/n8n/enquiries
Body: { name, email, phone, message, propertyIds[], source }
Response: { id, enquiryNumber }

// Get enquiry details
GET /api/n8n/enquiries/{id}
Response: Enquiry with properties
```

#### 2. Document Management

```typescript
// Store invoice
POST /api/n8n/documents/invoice
Body: { dealId, url, invoiceNumber, amount, dueDate }
Response: { id }

// Store receipt
POST /api/n8n/documents/receipt
Body: { dealId, url, receiptNumber, amount, paidDate }
Response: { id }
```

#### 3. Marketing & Content

```typescript
// Get featured properties
GET /api/n8n/properties/featured
Query params: limit, category
Response: Property[]

// Create blog post
POST /api/n8n/posts
Body: { title, content, category, status }
Response: { id, slug }

// Track social post
POST /api/n8n/social/track
Body: { propertyId, platform, postId, url }
Response: { id }
```

#### 4. Notifications

```typescript
// Send multi-channel notification
POST /api/n8n/notifications/send
Body: { 
  userId, 
  channels: ['email', 'whatsapp', 'line'],
  template: 'payment_reminder',
  data: { ... }
}
Response: { sent: true, channels: [...] }
```

#### 5. Chat & Knowledge Base

```typescript
// Search knowledge base
GET /api/n8n/kb/search
Query params: query, limit
Response: Article[]

// Log chat response
POST /api/n8n/chat/response
Body: { platform, userId, message, intent, response }
Response: { id }
```

---

## Authentication & Security

### API Key Authentication

1. **Generate API Key**
   ```bash
   # Generate secure random key
   openssl rand -hex 32
   ```

2. **Store in Environment**
   ```env
   N8N_API_KEY=your-generated-key-here
   ```

3. **Middleware for n8n Routes**
   ```typescript
   // src/middleware/n8n-auth.ts
   export function validateN8nApiKey(request: Request) {
     const apiKey = request.headers.get('X-N8N-API-Key');
     if (apiKey !== process.env.N8N_API_KEY) {
       return new Response('Unauthorized', { status: 401 });
     }
   }
   ```

4. **Apply to All n8n Routes**
   ```typescript
   // src/app/api/n8n/[...]/route.ts
   export async function POST(request: Request) {
     const authError = validateN8nApiKey(request);
     if (authError) return authError;
     
     // Process request...
   }
   ```

### Rate Limiting

Apply strict rate limits to n8n endpoints:
- 100 requests/minute
- 1000 requests/hour

### IP Whitelisting (Optional)

If n8n is self-hosted, whitelist its IP:
```typescript
const ALLOWED_IPS = [process.env.N8N_SERVER_IP];
```

---

## n8n Setup & Configuration

### 1. Installation Options

**Option A: n8n Cloud (Recommended for Start)**
- Hosted solution
- No server management
- $20-50/month
- URL: https://app.n8n.cloud

**Option B: Self-Hosted (For Scale)**
- VPS (DigitalOcean, AWS, Vultr)
- Docker installation
- Full control
- ~$10-20/month

### 2. Required Integrations

Install these n8n nodes:

**Core:**
- HTTP Request
- Webhook
- Schedule Trigger
- Switch (for routing)
- Set (for data transformation)

**AI:**
- OpenAI (GPT-4 for classification)
- Anthropic Claude (alternative)

**Communication:**
- WhatsApp Business API
- Facebook Messenger
- Line Messaging API
- Gmail/SMTP
- Twilio (SMS)

**Storage:**
- Google Sheets
- Airtable
- Cloudinary

**Scraping:**
- Apify
- HTTP Request (for simple scraping)

**PDF:**
- Carbone.io
- PDF.co
- Puppeteer (for custom templates)

### 3. Workflow Templates

I'll create ready-to-import n8n workflow JSON files for each automation.

---

## Cost Estimation

### Monthly Costs

| Service | Purpose | Cost |
|---------|---------|------|
| n8n Cloud | Automation platform | $20-50 |
| OpenAI API | AI classification & content | $30-100 |
| Apify | Facebook scraping | $49 |
| WhatsApp Business API | Messaging | $0-50 |
| Line Messaging API | Messaging | Free-$20 |
| Cloudinary | File storage | Free-$20 |
| PDF.co | Document generation | $9-29 |
| **Total** | | **$108-318/month** |

### ROI Calculation

**Time Saved:**
- Lead Hunter: 2-3 hours/day = 60-90 hours/month
- Admin: 5-6 hours/week = 20-24 hours/month
- Marketing: 8-10 hours/week = 32-40 hours/month
- Responder: 15-20 hours/week = 60-80 hours/month

**Total Time Saved:** 172-234 hours/month

**Value:**
- At $20/hour: $3,440 - $4,680/month
- **ROI:** 10-40x return on investment

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up n8n (Cloud or Self-hosted)
- [ ] Create API endpoints for n8n integration
- [ ] Implement API key authentication
- [ ] Test basic webhook connection

### Phase 2: Lead Hunter (Week 3-4)
- [ ] Set up Apify Facebook scraper
- [ ] Create AI extraction workflow
- [ ] Build property matching logic
- [ ] Test end-to-end lead capture

### Phase 3: Responder (Week 5-6)
- [ ] Set up WhatsApp/Line/Facebook webhooks
- [ ] Create message classification workflow
- [ ] Build auto-response templates
- [ ] Test multi-channel responses

### Phase 4: Admin (Week 7-8)
- [ ] Create invoice/receipt templates
- [ ] Set up PDF generation
- [ ] Build payment reminder workflow
- [ ] Integrate with accounting sheets

### Phase 5: Marketing (Week 9-10)
- [ ] Create social media posting workflow
- [ ] Build content generation pipeline
- [ ] Set up performance tracking
- [ ] Test automated posting

### Phase 6: Optimization (Week 11-12)
- [ ] Monitor workflow performance
- [ ] Optimize AI prompts
- [ ] Add error handling
- [ ] Create backup workflows

---

## Best Practices

### 1. Error Handling
- Add error nodes to all workflows
- Send alerts on failures
- Implement retry logic
- Log all errors

### 2. Data Privacy
- Encrypt sensitive data
- GDPR/PDPA compliance
- Secure API keys
- Regular security audits

### 3. Monitoring
- Track workflow execution times
- Monitor API usage
- Set up alerts for failures
- Review logs weekly

### 4. Testing
- Test workflows in staging first
- Use test data initially
- Validate AI outputs
- Monitor accuracy

### 5. Documentation
- Document each workflow
- Keep API docs updated
- Train team on manual overrides
- Maintain changelog

---

## Next Steps

1. **Review this strategy** with your team
2. **Prioritize workflows** based on impact
3. **Set up n8n account** (Cloud recommended to start)
4. **Create API endpoints** (I can help build these)
5. **Start with one workflow** (Responder recommended - highest ROI)
6. **Scale gradually** as you gain confidence

Would you like me to:
1. Create the actual API endpoints for n8n integration?
2. Build sample n8n workflow JSON files?
3. Set up the authentication middleware?
4. Create webhook handlers for your platform?
