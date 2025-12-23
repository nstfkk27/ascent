# Phase 2: Email Enquiry System

## ✅ What's Been Implemented

### 1. Email Service (`src/lib/email.ts`)
- Resend integration for sending emails
- Professional HTML email templates
- Property enquiry email function
- Structured logging for email operations

### 2. Enquiry API Route (`src/app/api/enquiries/route.ts`)
- **GET** - Fetch enquiries (authenticated agents only)
  - Role-based filtering (SUPER_ADMIN sees all, others see only their enquiries)
  - Filter by propertyId and status
  - Includes agent information
  
- **POST** - Create new enquiry (public endpoint with rate limiting)
  - Validation with Zod schema
  - Rate limiting: 5 requests per hour per IP
  - Automatic email notification to property agent
  - Stores enquiry in database
  - Graceful email failure handling (enquiry still saved)

### 3. Configuration
- Resend SDK installed
- Environment variable: `RESEND_API_KEY`
- Email sent from: `noreply@estateascent.com`

---

## 📋 Setup Instructions

### 1. Add Resend API Key to `.env`

Replace the placeholder in `.env`:

```env
RESEND_API_KEY="re_your_actual_api_key_here"
```

Get your API key from: https://resend.com/api-keys

### 2. Restart Dev Server

```bash
npm run dev
```

---

## 🧪 Testing the Email Enquiry System

### Test 1: Create an Enquiry (POST)

```bash
curl -X POST http://localhost:3000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "your-property-uuid",
    "channel": "WEBSITE_FORM",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+66812345678",
    "message": "I am interested in this property. Please contact me with more details."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "enquiry": {
      "id": "...",
      "propertyId": "...",
      "channel": "WEBSITE_FORM",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+66812345678",
      "message": "...",
      "status": "NEW",
      "agentId": "...",
      "createdAt": "...",
      "respondedAt": null
    }
  },
  "timestamp": "..."
}
```

**What Happens:**
1. ✅ Enquiry validated
2. ✅ Property and agent fetched
3. ✅ Enquiry saved to database
4. ✅ Email sent to agent from `noreply@estateascent.com`
5. ✅ Agent receives professional HTML email with enquirer details

### Test 2: Fetch Enquiries (GET - Requires Auth)

```bash
curl http://localhost:3000/api/enquiries \
  -H "Authorization: Bearer your-auth-token"
```

**Query Parameters:**
- `propertyId` - Filter by property
- `status` - Filter by status (NEW, CONTACTED, QUALIFIED, etc.)

---

## 📧 Email Template

The agent receives an email with:
- **Property Details** - Title and link to property
- **Enquirer Information** - Name, email, phone
- **Message** - The enquirer's message
- **Reply-To** - Set to enquirer's email for easy response

---

## 🔒 Security Features

1. **Rate Limiting** - 5 enquiries per hour per IP
2. **Input Validation** - Zod schema validation
3. **Email Validation** - Valid email format required
4. **Message Length** - Minimum 10 characters
5. **Error Handling** - Graceful failures, enquiry still saved if email fails

---

## 🎯 Next Steps

### Option A: Frontend Integration
Create an enquiry form component on property pages that calls this API.

### Option B: Migrate Remaining API Routes
Apply the same infrastructure patterns to:
- `/api/deals`
- `/api/contacts`
- `/api/agent/*`

---

## 📝 Notes

- Emails are sent asynchronously - if email fails, enquiry is still saved
- All operations are logged for debugging
- Agent email must exist in AgentProfile table
- Property must have an assigned agent
