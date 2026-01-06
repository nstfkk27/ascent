# Lead Hunter Workflow - Complete Implementation Guide

## 🎯 Objective

Automatically capture leads from Facebook, extract structured data using AI, match them with your properties, create enquiries, and notify agents - saving 2-3 hours per day.

---

## 📊 Workflow Overview

```
Facebook Groups/Pages
        ↓
    Apify Scraper (Every 2 hours)
        ↓
    Extract Posts with Contact Info
        ↓
    OpenAI GPT-4 (Clean & Structure Data)
        ↓
    Google Sheets (Store Leads)
        ↓
    Your Platform API (Match Properties)
        ↓
    Your Platform API (Create Enquiry)
        ↓
    WhatsApp/Line (Notify Agent)
```

**Time Saved:** 2-3 hours/day = 60-90 hours/month  
**ROI:** Immediate - automated lead capture 24/7

---

## 🔧 Setup Requirements

### 1. Services Needed

| Service | Purpose | Cost | Sign Up |
|---------|---------|------|---------|
| n8n | Automation platform | ✅ You have | - |
| Apify | Facebook scraping | $49/month | apify.com |
| OpenAI | AI extraction | $20-50/month | platform.openai.com |
| Google Sheets | Lead storage | Free | - |
| WhatsApp Business | Notifications | Free-$50/month | business.whatsapp.com |

### 2. API Keys Required

```env
# Add to n8n credentials
OPENAI_API_KEY=sk-...
APIFY_API_TOKEN=apify_api_...
N8N_API_KEY=your-platform-api-key
WHATSAPP_ACCESS_TOKEN=... (optional)
```

---

## 📝 Step-by-Step Implementation

### Step 1: Set Up Apify Facebook Scraper

1. **Go to Apify**: https://apify.com
2. **Find Actor**: Search for "Facebook Groups Scraper" or "Facebook Posts Scraper"
3. **Configure Scraper**:
   ```json
   {
     "startUrls": [
       "https://www.facebook.com/groups/pattaya-real-estate",
       "https://www.facebook.com/groups/jomtien-condos",
       "https://www.facebook.com/groups/thailand-property-buyers"
     ],
     "maxPosts": 50,
     "scrapeComments": false,
     "scrapeReactions": false,
     "onlyNewPosts": true
   }
   ```
4. **Test Run**: Click "Start" to test
5. **Get API Token**: Settings → Integrations → API Token

**Target Facebook Groups:**
- Pattaya Real Estate groups
- Expat groups in Thailand
- Property investment groups
- Jomtien/Pattaya community groups

### Step 2: Create Google Sheet for Leads

1. **Create Sheet**: "Facebook Leads"
2. **Columns**:
   - A: Timestamp
   - B: Source (Facebook Group URL)
   - C: Original Post
   - D: Name
   - E: Email
   - F: Phone
   - G: Budget
   - H: Category
   - I: Bedrooms
   - J: Area
   - K: Listing Type
   - L: Status (NEW/CONTACTED/CONVERTED)
   - M: Matched Properties
   - N: Enquiry ID
   - O: Agent Assigned

3. **Share**: Share with your n8n service account email

### Step 3: Set Up n8n Workflow

#### Import This Workflow to n8n:

**Workflow Name:** "Lead Hunter - Facebook to Platform"

**Trigger:** Schedule - Every 2 hours (9 AM - 9 PM)

**Nodes:**

1. **Schedule Trigger**
   - Cron: `0 */2 9-21 * * *` (Every 2 hours, 9 AM - 9 PM)

2. **Apify - Run Facebook Scraper**
   - Actor: Facebook Groups Scraper
   - Wait for finish: Yes
   - Output: Dataset items

3. **Filter Posts**
   - Keep only posts with contact info
   - Expression: `{{ $json.text.includes('@') || $json.text.match(/\d{9,10}/) }}`

4. **OpenAI - Extract Lead Data**
   - Model: gpt-4-turbo
   - System Prompt: (see AI Prompts section below)
   - User Message: `{{ $json.text }}`
   - Output: JSON

5. **Function - Parse JSON**
   - Code:
   ```javascript
   const lead = JSON.parse($input.item.json.choices[0].message.content);
   return {
     json: {
       ...lead,
       source: $('Apify').item.json.url,
       originalPost: $('Apify').item.json.text,
       timestamp: new Date().toISOString()
     }
   };
   ```

6. **Google Sheets - Append Row**
   - Sheet: Facebook Leads
   - Values: Map all lead fields

7. **HTTP Request - Match Properties**
   - Method: GET
   - URL: `https://estateascent.com/api/n8n/properties/match`
   - Headers: `X-N8N-API-Key: {{ $env.N8N_API_KEY }}`
   - Query Parameters:
     ```
     minBudget={{ $json.budgetMin }}
     maxBudget={{ $json.budgetMax }}
     category={{ $json.category }}
     bedrooms={{ $json.bedrooms }}
     area={{ $json.area }}
     listingType={{ $json.listingType }}
     limit=5
     ```

8. **IF - Has Matches**
   - Condition: `{{ $json.properties.length > 0 }}`

9. **HTTP Request - Create Enquiry** (If YES)
   - Method: POST
   - URL: `https://estateascent.com/api/n8n/enquiries`
   - Headers: `X-N8N-API-Key: {{ $env.N8N_API_KEY }}`
   - Body:
   ```json
   {
     "name": "{{ $('Function').item.json.name }}",
     "email": "{{ $('Function').item.json.email }}",
     "phone": "{{ $('Function').item.json.phone }}",
     "message": "Lead from Facebook: {{ $('Function').item.json.originalPost.substring(0, 200) }}",
     "channel": "FACEBOOK",
     "source": "n8n-lead-hunter",
     "metadata": {
       "budget": "{{ $('Function').item.json.budget }}",
       "category": "{{ $('Function').item.json.category }}",
       "bedrooms": "{{ $('Function').item.json.bedrooms }}",
       "area": "{{ $('Function').item.json.area }}",
       "matchedProperties": "{{ $('HTTP Request - Match Properties').item.json.properties }}"
     }
   }
   ```

10. **WhatsApp - Notify Agent** (If YES)
    - To: Agent phone number
    - Message Template:
    ```
    🎯 New Lead from Facebook!
    
    👤 Name: {{ $('Function').item.json.name }}
    📧 Email: {{ $('Function').item.json.email }}
    📱 Phone: {{ $('Function').item.json.phone }}
    💰 Budget: ฿{{ $('Function').item.json.budget }}
    🏠 Looking for: {{ $('Function').item.json.category }} in {{ $('Function').item.json.area }}
    
    ✅ {{ $('HTTP Request - Match Properties').item.json.count }} properties matched!
    
    Top matches:
    {{ $('HTTP Request - Match Properties').item.json.properties.slice(0, 3).map(p => `• ${p.title} - ฿${p.price.toLocaleString()}`).join('\n') }}
    
    📋 Enquiry: {{ $('HTTP Request - Create Enquiry').item.json.enquiry.enquiryNumber }}
    🔗 View: https://estateascent.com/agent/enquiries
    ```

11. **Google Sheets - Update Row** (If YES)
    - Update Status: MATCHED
    - Update Enquiry ID
    - Update Matched Properties count

12. **Slack/Email - No Match Alert** (If NO)
    - Notify team about lead with no matches
    - Manual follow-up required

---

## 🤖 AI Prompts

### OpenAI Extraction Prompt

**System Prompt:**
```
You are a real estate lead extraction AI. Extract structured data from Facebook posts about property inquiries in Thailand.

Extract the following information:
1. Name (if mentioned)
2. Email (if mentioned)
3. Phone number (Thai format: +66 or 0)
4. Budget (in THB, convert millions to numbers)
5. Property category (CONDO, HOUSE, LAND, or INVESTMENT)
6. Number of bedrooms (if mentioned)
7. Preferred area (Pattaya, Jomtien, Naklua, etc.)
8. Listing type (SALE or RENT)

If information is not mentioned, use null.

For budget:
- "5 million" = 5000000
- "5M" = 5000000
- "5-8 million" = budgetMin: 5000000, budgetMax: 8000000

Output ONLY valid JSON in this exact format:
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "budgetMin": number or null,
  "budgetMax": number or null,
  "category": "CONDO|HOUSE|LAND|INVESTMENT or null",
  "bedrooms": number or null,
  "area": "string or null",
  "listingType": "SALE|RENT or null",
  "confidence": 0.0-1.0
}
```

**User Message:**
```
Extract lead data from this Facebook post:

{{ $json.text }}
```

### Example Inputs & Outputs

**Input 1:**
```
"Looking for 2BR condo in Jomtien, budget 5-8 million baht for sale. 
Contact: John Doe, john@email.com, 081-234-5678"
```

**Output 1:**
```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "+66812345678",
  "budgetMin": 5000000,
  "budgetMax": 8000000,
  "category": "CONDO",
  "bedrooms": 2,
  "area": "Jomtien",
  "listingType": "SALE",
  "confidence": 0.95
}
```

**Input 2 (Thai):**
```
"สนใจคอนโดให้เช่าที่พัทยา 2 ห้องนอน งบ 20,000-30,000 บาท/เดือน
ติดต่อ: 089-123-4567"
```

**Output 2:**
```json
{
  "name": null,
  "email": null,
  "phone": "+66891234567",
  "budgetMin": 20000,
  "budgetMax": 30000,
  "category": "CONDO",
  "bedrooms": 2,
  "area": "Pattaya",
  "listingType": "RENT",
  "confidence": 0.85
}
```

---

## 📊 Testing the Workflow

### Test 1: Manual Trigger

1. In n8n, click "Execute Workflow"
2. Check each node's output
3. Verify:
   - ✅ Apify returns posts
   - ✅ OpenAI extracts data correctly
   - ✅ Google Sheets row added
   - ✅ Properties matched
   - ✅ Enquiry created
   - ✅ WhatsApp sent

### Test 2: Sample Data

Use this test post in n8n:
```
"Hi everyone! I'm looking for a 2-bedroom condo in Jomtien for sale, 
budget around 6-7 million baht. Must have sea view and pool. 
Contact me: Sarah Johnson, sarah.j@email.com, 081-555-1234"
```

Expected result:
- Name: Sarah Johnson
- Email: sarah.j@email.com
- Phone: +66815551234
- Budget: 6M-7M
- Category: CONDO
- Bedrooms: 2
- Area: Jomtien
- Type: SALE

### Test 3: End-to-End

1. Post a test message in a Facebook group
2. Wait for next scheduled run (or trigger manually)
3. Check:
   - Google Sheets has new row
   - Platform has new enquiry
   - Agent received WhatsApp notification

---

## 🎛️ Configuration Options

### Frequency

**Recommended:** Every 2 hours during business hours (9 AM - 9 PM)

**Aggressive:** Every hour (more leads, higher API costs)

**Conservative:** Every 4 hours (lower costs, might miss leads)

### Facebook Groups to Monitor

**High Priority:**
- Pattaya Expats
- Thailand Property Investors
- Jomtien Community
- Pattaya Real Estate Marketplace

**Medium Priority:**
- General Thailand expat groups
- Digital nomad groups
- Retirement in Thailand groups

### Lead Quality Filters

Add to workflow after OpenAI extraction:

```javascript
// Filter low-quality leads
if ($json.confidence < 0.6) {
  return null; // Skip low confidence
}

if (!$json.phone && !$json.email) {
  return null; // Must have contact info
}

if (!$json.budgetMin && !$json.category) {
  return null; // Must have some criteria
}

return $json;
```

---

## 📈 Monitoring & Optimization

### Key Metrics to Track

1. **Leads Captured** (daily/weekly)
2. **Match Rate** (% of leads with property matches)
3. **Conversion Rate** (% of leads that become enquiries)
4. **Response Time** (time to agent contact)
5. **Cost per Lead** (Apify + OpenAI costs / leads)

### Google Sheets Dashboard

Add these formulas:

**Total Leads Today:**
```
=COUNTIF(A:A, ">="&TODAY())
```

**Match Rate:**
```
=COUNTIF(L:L, "MATCHED") / COUNTA(A:A)
```

**Average Budget:**
```
=AVERAGE(G:G)
```

### Optimization Tips

1. **Improve AI Accuracy:**
   - Review failed extractions
   - Update prompts with examples
   - Add validation rules

2. **Reduce Costs:**
   - Filter posts before sending to OpenAI
   - Use GPT-3.5 for simple extractions
   - Batch process leads

3. **Increase Lead Quality:**
   - Target specific Facebook groups
   - Filter by keywords before extraction
   - Set minimum budget thresholds

---

## 🚨 Troubleshooting

### Issue: No leads captured

**Check:**
- Apify scraper is running
- Facebook groups are active
- Posts contain contact info
- Filters aren't too strict

### Issue: AI extraction errors

**Check:**
- OpenAI API key is valid
- Prompt is correct
- Input text isn't too long
- JSON parsing is working

### Issue: No property matches

**Check:**
- Properties exist in database
- Search criteria are reasonable
- API endpoint is working
- Budget ranges are realistic

### Issue: WhatsApp not sending

**Check:**
- WhatsApp Business API is set up
- Phone numbers are correct format
- Message template is approved
- API token is valid

---

## 💰 Cost Breakdown

### Monthly Costs (Estimated)

| Service | Usage | Cost |
|---------|-------|------|
| Apify | 50 posts × 12 runs/day | $49 |
| OpenAI | ~360 API calls/month | $20-30 |
| WhatsApp | ~100 messages/month | Free-$10 |
| **Total** | | **$69-89/month** |

### ROI Calculation

**Time Saved:** 2-3 hours/day × 30 days = 60-90 hours/month

**Value:** 60 hours × $20/hour = **$1,200/month**

**ROI:** $1,200 / $89 = **13.5x return**

---

## 🎯 Success Metrics

### Week 1 Goals
- [ ] Workflow running automatically
- [ ] 10+ leads captured
- [ ] 50%+ match rate
- [ ] 5+ enquiries created

### Month 1 Goals
- [ ] 100+ leads captured
- [ ] 60%+ match rate
- [ ] 30+ enquiries created
- [ ] 5+ conversions to viewings

### Optimization Goals
- [ ] <$1 cost per lead
- [ ] <5 minute response time
- [ ] 70%+ match rate
- [ ] 10%+ conversion to deals

---

## 🚀 Next Steps

1. **Set up Apify** (30 minutes)
   - Create account
   - Configure Facebook scraper
   - Test run

2. **Set up OpenAI** (15 minutes)
   - Get API key
   - Test extraction prompt
   - Verify JSON output

3. **Create Google Sheet** (10 minutes)
   - Set up columns
   - Share with n8n
   - Add formulas

4. **Build n8n Workflow** (1-2 hours)
   - Import template
   - Configure credentials
   - Test each node

5. **Test End-to-End** (30 minutes)
   - Manual trigger
   - Sample data
   - Live test

6. **Monitor & Optimize** (ongoing)
   - Check daily for first week
   - Adjust prompts
   - Refine filters

---

## 📞 Support

If you need help:
1. Check n8n execution logs
2. Verify API credentials
3. Test each node individually
4. Check Google Sheets for data
5. Review Apify scraper output

**Ready to start?** Begin with Step 1: Set Up Apify Facebook Scraper! 🚀
