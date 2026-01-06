# n8n Integration Setup Guide

## ✅ Endpoints Created

All n8n API endpoints have been created and are ready to use:

### 1. Property Matching
**GET** `/api/n8n/properties/match`
- Match properties based on lead criteria
- Query params: `minBudget`, `maxBudget`, `category`, `bedrooms`, `area`, `city`, `listingType`, `limit`

### 2. Enquiry Management
**POST** `/api/n8n/enquiries` - Create enquiry
**GET** `/api/n8n/enquiries?id={id}` - Get enquiry details

### 3. Featured Properties
**GET** `/api/n8n/properties/featured`
- Get properties for marketing
- Query params: `limit`, `category`, `type` (all/new/super_deal/featured)

### 4. Notifications
**POST** `/api/n8n/notifications/send`
- Send multi-channel notifications (email, WhatsApp, Line, SMS)

### 5. Documents
**POST** `/api/n8n/documents/invoice` - Store invoice
**POST** `/api/n8n/documents/receipt` - Store receipt

### 6. Chat & Response
**POST** `/api/n8n/chat/classify` - Classify message intent
**POST** `/api/n8n/chat/response` - Log chat interaction

### 7. Content
**POST** `/api/n8n/posts` - Create blog post

---

## 🔧 Setup Steps

### Step 1: Generate API Key

```bash
# Generate a secure random API key
openssl rand -hex 32
```

### Step 2: Add to Environment Variables

Add to `.env.local`:
```env
N8N_API_KEY=your-generated-key-here
NEXT_PUBLIC_SITE_URL=https://estateascent.com
```

Add to Vercel (Production):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `N8N_API_KEY` with your generated key
3. Add `NEXT_PUBLIC_SITE_URL` with your domain

### Step 3: Test Endpoints

```bash
# Test property matching
curl -X GET "https://estateascent.com/api/n8n/properties/match?category=CONDO&bedrooms=2&limit=5" \
  -H "X-N8N-API-Key: your-api-key"

# Test enquiry creation
curl -X POST "https://estateascent.com/api/n8n/enquiries" \
  -H "X-N8N-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+66812345678",
    "message": "Interested in condos in Jomtien"
  }'
```

---

## 📝 n8n Workflow Examples

### Example 1: Lead Hunter Workflow

**n8n Nodes:**
1. **Schedule Trigger** (Every 2 hours)
2. **Apify** - Scrape Facebook leads
3. **OpenAI** - Extract structured data
4. **HTTP Request** - Match properties
   - URL: `https://estateascent.com/api/n8n/properties/match`
   - Method: GET
   - Headers: `X-N8N-API-Key: {{$env.N8N_API_KEY}}`
   - Query: `category={{$json.category}}&bedrooms={{$json.bedrooms}}&minBudget={{$json.minBudget}}&maxBudget={{$json.maxBudget}}`
5. **HTTP Request** - Create enquiry
   - URL: `https://estateascent.com/api/n8n/enquiries`
   - Method: POST
   - Headers: `X-N8N-API-Key: {{$env.N8N_API_KEY}}`
   - Body: Lead data
6. **WhatsApp** - Notify agent

### Example 2: Auto-Responder Workflow

**n8n Nodes:**
1. **Webhook** - Receive message from WhatsApp/Line/Facebook
2. **HTTP Request** - Classify message
   - URL: `https://estateascent.com/api/n8n/chat/classify`
   - Method: POST
   - Body: `{"message": "{{$json.message}}", "platform": "whatsapp"}`
3. **Switch** - Route based on intent
4. **HTTP Request** - Match properties (if ENQUIRY)
5. **WhatsApp/Line/Facebook** - Send response
6. **HTTP Request** - Log interaction

### Example 3: Marketing Auto-Post

**n8n Nodes:**
1. **Schedule Trigger** (Daily at 9 AM)
2. **HTTP Request** - Get featured properties
   - URL: `https://estateascent.com/api/n8n/properties/featured?type=super_deal&limit=3`
3. **OpenAI** - Generate post content
4. **Facebook/Line** - Post to social media
5. **HTTP Request** - Track post (optional)

---

## 🔒 Security Notes

1. **Never expose API key** in client-side code
2. **Rate limiting** is enabled (100 req/min)
3. **Input validation** is applied to all endpoints
4. **HTTPS only** - API key transmitted securely

---

## 🐛 Troubleshooting

### Error: "API key required"
- Check header: `X-N8N-API-Key` (case-sensitive)
- Verify key matches `.env` value

### Error: "Too many requests"
- Rate limit exceeded (100/min)
- Wait or implement request queuing in n8n

### Error: "Validation failed"
- Check required fields in request body
- Verify data types (numbers, strings, etc.)

### TypeScript Errors (Development)
Some endpoints reference fields that may need to be added to your Prisma schema:
- `Enquiry.source` - Add to track lead source
- `Deal.metadata` - Add for storing invoice/receipt data
- `Post.slug` - Add for SEO-friendly URLs

To add these fields, update `prisma/schema.prisma` and run:
```bash
npx prisma migrate dev --name add_n8n_fields
```

---

## 📊 Next Steps

1. ✅ **Endpoints created** - Ready to use
2. ⏳ **Set up n8n** - Create account at n8n.cloud
3. ⏳ **Configure workflows** - Import templates
4. ⏳ **Test integration** - Start with one workflow
5. ⏳ **Monitor & optimize** - Track performance

---

## 💡 Tips

- **Start small**: Begin with one workflow (recommend: Auto-Responder)
- **Test thoroughly**: Use n8n's test mode before going live
- **Monitor logs**: Check n8n execution logs and your platform logs
- **Iterate**: Refine AI prompts and routing logic based on results
- **Scale gradually**: Add more workflows as you gain confidence

---

## 📚 Resources

- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- OpenAI API: https://platform.openai.com/docs
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Line Messaging API: https://developers.line.biz/en/docs/messaging-api/

---

## Support

If you encounter issues:
1. Check n8n execution logs
2. Check your platform API logs (Vercel logs)
3. Verify API key is correct
4. Test endpoints with curl/Postman first
5. Check rate limits haven't been exceeded
