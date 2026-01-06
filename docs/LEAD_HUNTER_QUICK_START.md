# Lead Hunter - Quick Start Guide (30 Minutes)

Since you already have an n8n account, let's get your Lead Hunter workflow running today!

---

## ⚡ Quick Setup Checklist

### ✅ Prerequisites (You Have)
- [x] n8n account
- [x] Platform API endpoints created
- [x] Environment variables ready

### 🔧 Need to Set Up (30 minutes total)

1. **Apify Account** (10 min)
2. **OpenAI API Key** (5 min)
3. **Google Sheet** (5 min)
4. **n8n Workflow** (10 min)

---

## 🚀 Step 1: Apify Setup (10 minutes)

### 1.1 Create Account
- Go to: https://apify.com/sign-up
- Sign up (free trial available)
- Verify email

### 1.2 Get Facebook Groups Scraper
- Search: "Facebook Groups Scraper"
- Recommended: https://apify.com/apify/facebook-groups-scraper
- Click "Try for free"

### 1.3 Configure Scraper
```json
{
  "startUrls": [
    "https://www.facebook.com/groups/pattayarealestategroup",
    "https://www.facebook.com/groups/pattayaexpats"
  ],
  "maxPosts": 50,
  "scrapeComments": false,
  "scrapeReactions": false
}
```

### 1.4 Test Run
- Click "Start"
- Wait 2-3 minutes
- Check results (should see posts with text)

### 1.5 Get API Token
- Settings → Integrations → API Token
- Copy token
- Save for n8n

**Cost:** $49/month (includes 100 actor runs)

---

## 🤖 Step 2: OpenAI API (5 minutes)

### 2.1 Get API Key
- Go to: https://platform.openai.com/api-keys
- Click "Create new secret key"
- Name: "n8n Lead Hunter"
- Copy key (starts with `sk-`)

### 2.2 Add Credits
- Billing → Add payment method
- Add $10-20 to start

**Cost:** ~$20-30/month for lead extraction

---

## 📊 Step 3: Google Sheet (5 minutes)

### 3.1 Create Sheet
- Go to: https://sheets.google.com
- Create new sheet
- Name: "Facebook Leads"

### 3.2 Add Headers (Row 1)
```
A: Timestamp
B: Source
C: Original Post
D: Name
E: Email
F: Phone
G: Budget
H: Category
I: Bedrooms
J: Area
K: Listing Type
L: Status
M: Matched Properties
N: Enquiry ID
O: Agent
```

### 3.3 Get Sheet ID
- From URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
- Copy the SHEET_ID part
- Save for n8n

---

## 🔗 Step 4: n8n Workflow (10 minutes)

### 4.1 Add Credentials to n8n

**Apify:**
1. n8n → Credentials → New
2. Type: "Apify API"
3. API Token: [paste from Step 1.5]
4. Save as "Apify API"

**OpenAI:**
1. n8n → Credentials → New
2. Type: "OpenAI API"
3. API Key: [paste from Step 2.1]
4. Save as "OpenAI API"

**Google Sheets:**
1. n8n → Credentials → New
2. Type: "Google Sheets OAuth2 API"
3. Follow OAuth flow
4. Save as "Google Sheets"

**Your Platform API:**
1. n8n → Credentials → New
2. Type: "Header Auth"
3. Name: `X-N8N-API-Key`
4. Value: [your generated API key from .env]
5. Save as "Platform API Key"

### 4.2 Import Workflow

**Option A: Manual Import**
1. n8n → Workflows → Import from File
2. Upload: `n8n-workflows/lead-hunter-workflow.json`
3. Click "Import"

**Option B: Create from Scratch**
Follow the detailed guide in `LEAD_HUNTER_WORKFLOW.md`

### 4.3 Configure Nodes

**Update these values:**

1. **Apify Node:**
   - Actor ID: Your Facebook scraper actor ID
   - Input: Your Facebook group URLs

2. **Google Sheets Node:**
   - Sheet ID: [from Step 3.3]
   - Range: `A:O`

3. **HTTP Request Nodes:**
   - URL: `https://estateascent.com/api/n8n/...`
   - (or `http://localhost:3000/api/n8n/...` for testing)

4. **WhatsApp Node (Optional):**
   - Phone: Your agent's phone number
   - Or replace with Email/Slack for now

### 4.4 Test Workflow

1. Click "Execute Workflow"
2. Check each node:
   - ✅ Apify returns posts
   - ✅ OpenAI extracts data
   - ✅ Google Sheets updated
   - ✅ Properties matched
   - ✅ Enquiry created

### 4.5 Activate Workflow

1. Toggle "Active" switch
2. Workflow will run every 2 hours (9 AM - 9 PM)

---

## 🧪 Testing with Sample Data

### Test Post (Copy to n8n)
```
Looking for 2BR condo in Jomtien for sale, budget 5-7 million baht. 
Must have sea view and pool. Contact: John Doe, john@email.com, 081-234-5678
```

### Expected Output
```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "+66812345678",
  "budgetMin": 5000000,
  "budgetMax": 7000000,
  "category": "CONDO",
  "bedrooms": 2,
  "area": "Jomtien",
  "listingType": "SALE",
  "confidence": 0.95
}
```

### Verify
- ✅ Google Sheet has new row
- ✅ Properties matched (check API response)
- ✅ Enquiry created (check platform)
- ✅ Notification sent (WhatsApp/Email)

---

## 📱 WhatsApp Setup (Optional - 15 minutes)

### Option 1: WhatsApp Business API (Recommended)
1. Go to: https://business.whatsapp.com
2. Apply for API access
3. Get access token
4. Add to n8n credentials

### Option 2: Use Email Instead (Easier)
Replace WhatsApp node with Email node:
- To: Your email
- Subject: "New Lead from Facebook"
- Body: Same template

### Option 3: Use Line (For Thailand)
- Easier to set up than WhatsApp
- Popular in Thailand
- Free messaging API

---

## 🎯 Facebook Groups to Monitor

### High-Value Groups (Start Here)
1. **Pattaya Real Estate**
   - https://www.facebook.com/groups/pattayarealestategroup
   - ~50K members

2. **Pattaya Expats**
   - https://www.facebook.com/groups/pattayaexpats
   - ~100K members

3. **Thailand Property Investors**
   - https://www.facebook.com/groups/thailandpropertyinvestors
   - ~30K members

4. **Jomtien Community**
   - https://www.facebook.com/groups/jomtiencommunity
   - ~20K members

### How to Find More
1. Facebook search: "Pattaya real estate"
2. Look for active groups
3. Join groups
4. Add URLs to Apify config

---

## 📊 Monitoring Dashboard

### Google Sheets Formulas

**Add to your sheet:**

**Cell P1:** `Total Leads`
**Cell P2:** `=COUNTA(A2:A)`

**Cell Q1:** `Today's Leads`
**Cell Q2:** `=COUNTIF(A:A,">="&TODAY())`

**Cell R1:** `Match Rate`
**Cell R2:** `=COUNTIF(L:L,"MATCHED")/COUNTA(L:L)`

**Cell S1:** `Avg Budget`
**Cell S2:** `=AVERAGE(G:G)`

---

## 🐛 Common Issues & Fixes

### Issue: Apify returns no posts
**Fix:**
- Check Facebook group URLs are correct
- Make sure groups are public
- Increase `maxPosts` to 100
- Check Apify credits

### Issue: OpenAI extraction fails
**Fix:**
- Verify API key is correct
- Check OpenAI credits/billing
- Test with simpler post first
- Review prompt in node

### Issue: No properties matched
**Fix:**
- Check if properties exist in database
- Verify budget ranges are realistic
- Test API endpoint directly with curl
- Check category/area spelling

### Issue: Enquiry not created
**Fix:**
- Check API key in n8n
- Verify endpoint URL is correct
- Check required fields are present
- Review API logs in Vercel

---

## 💰 Cost Summary

| Service | Monthly Cost |
|---------|--------------|
| Apify | $49 |
| OpenAI | $20-30 |
| WhatsApp | Free-$10 |
| Google Sheets | Free |
| n8n | Free (self-hosted) or $20 (cloud) |
| **Total** | **$69-109/month** |

**ROI:** 60-90 hours saved = $1,200-1,800 value = **12-26x return**

---

## ✅ Success Checklist

After setup, you should have:

- [ ] Apify scraping Facebook groups
- [ ] OpenAI extracting lead data
- [ ] Google Sheet storing leads
- [ ] Properties being matched
- [ ] Enquiries being created
- [ ] Notifications being sent
- [ ] Workflow running every 2 hours

---

## 🚀 Go Live!

1. **Activate workflow** in n8n
2. **Monitor first 24 hours** closely
3. **Check Google Sheet** for leads
4. **Review matched properties** accuracy
5. **Adjust AI prompts** if needed
6. **Scale up** Facebook groups

---

## 📞 Need Help?

**Check:**
1. n8n execution logs (click on workflow runs)
2. Google Sheet for data
3. Vercel logs for API calls
4. Apify dashboard for scraper runs

**Common fixes:**
- Restart workflow
- Check all credentials
- Test each node individually
- Verify API endpoints are live

---

## 🎉 You're Ready!

Your Lead Hunter is now running 24/7, capturing leads while you sleep!

**Next:** Monitor for a week, then optimize based on results.

**Expected Results:**
- Week 1: 10-20 leads
- Week 2: 20-40 leads (as you add more groups)
- Month 1: 100+ leads total

Good luck! 🚀
