# n8n Integration API Routes

All n8n API routes require authentication via API key.

## Authentication

Add to request headers:
```
X-N8N-API-Key: your-secret-api-key
```

Set in environment variables:
```
N8N_API_KEY=generate-a-strong-random-key
```

## Rate Limiting

All n8n endpoints are rate-limited:
- 100 requests per minute per API key
- 1000 requests per hour per API key

## Endpoints

### Lead Management

**POST /api/n8n/leads**
Create lead from external source

**GET /api/n8n/properties/match**
Find matching properties for lead criteria

**POST /api/n8n/enquiries**
Create enquiry with matched properties

### Document Management

**POST /api/n8n/documents/invoice**
Store invoice and create record

**POST /api/n8n/documents/receipt**
Store receipt and create record

### Notifications

**POST /api/n8n/notifications/send**
Send multi-channel notification

### Content Management

**POST /api/n8n/posts**
Create blog post

**GET /api/n8n/properties/featured**
Get featured properties for marketing

**POST /api/n8n/social/track**
Track social media post

### Chat & Response

**POST /api/n8n/chat/classify**
Classify message intent

**GET /api/n8n/kb/search**
Search knowledge base

**POST /api/n8n/chat/response**
Log auto-response

## Webhooks

Platform sends webhooks to n8n for:
- Deal status changes
- New enquiries
- Property updates
- Agent actions

Configure webhook URL in n8n settings.
