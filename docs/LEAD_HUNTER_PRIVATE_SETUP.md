# Lead Hunter - Private Setup (For Your Use Only)

## 🔒 Making Lead Hunter Private

Since you want the Lead Hunter workflow to be **dedicated for you only** and not shared with other agents, here's how to set it up:

---

## 🎯 Private Configuration

### Option 1: Assign All Leads to Your Agent ID (Recommended)

**In n8n workflow, modify the "Create Enquiry" node:**

```json
{
  "name": "YOUR_NAME",
  "email": "lead_email",
  "phone": "lead_phone",
  "message": "Lead from Facebook automation",
  "channel": "FACEBOOK",
  "agentId": "YOUR_AGENT_ID_HERE",  // ← Add this line
  "source": "n8n-lead-hunter-private"
}
```

**How to get your Agent ID:**
1. Log into your platform
2. Go to `/agent` dashboard
3. Check browser console: `localStorage.getItem('agentId')`
4. Or check database: `SELECT id FROM AgentProfile WHERE email='your@email.com'`

### Option 2: Use Separate Google Sheet (More Private)

Instead of creating enquiries in the platform immediately, store leads in **your private Google Sheet** first:

**Benefits:**
- ✅ Only you can see the leads
- ✅ You review before adding to platform
- ✅ Filter quality before creating enquiries
- ✅ Other agents never see raw leads

**Modified Workflow:**
1. Apify scrapes Facebook
2. OpenAI extracts data
3. **Store in YOUR private Google Sheet** (stop here)
4. **You manually review** leads in sheet
5. **You decide** which ones to add to platform
6. Click button in sheet to create enquiry (optional)

### Option 3: Separate Database Table (Most Secure)

Create a private leads table that only you can access:

**Add to Prisma schema:**
```prisma
model PrivateLead {
  id            String   @id @default(uuid())
  ownerId       String   // Your agent ID
  name          String?
  email         String?
  phone         String?
  budget        Decimal?
  category      String?
  bedrooms      Int?
  area          String?
  listingType   String?
  source        String
  originalPost  String
  status        String   @default("NEW") // NEW, CONTACTED, CONVERTED, REJECTED
  matchedProps  Json?
  enquiryId     String?  // Link to enquiry if converted
  createdAt     DateTime @default(now())
  
  @@index([ownerId])
  @@index([status])
}
```

---

## 🔐 Recommended Setup: Private Google Sheet Only

This is the **simplest and most private** approach:

### Step 1: Create Private Google Sheet

**Sheet Name:** "My Private Leads - DO NOT SHARE"

**Columns:**
```
A: Timestamp
B: Facebook Group
C: Original Post
D: Name
E: Email
F: Phone
G: Budget Min
H: Budget Max
I: Category
J: Bedrooms
K: Area
L: Type (Sale/Rent)
M: Confidence Score
N: Status (NEW/REVIEWING/CONTACTED/CONVERTED/REJECTED)
O: Notes
P: Action (Button to create enquiry)
```

### Step 2: Modified n8n Workflow

**Remove these nodes:**
- ❌ API - Match Properties
- ❌ API - Create Enquiry
- ❌ WhatsApp - Notify Agent

**Keep only:**
- ✅ Schedule Trigger
- ✅ Apify - Facebook Scraper
- ✅ Filter - Has Contact Info
- ✅ OpenAI - Extract Lead Data
- ✅ Parse & Validate Lead
- ✅ Google Sheets - Store Lead (YOUR private sheet)

**Add:**
- ✅ Email - Notify YOU only (optional)

### Step 3: Review Process

**Daily routine (5-10 minutes):**
1. Open your private Google Sheet
2. Review new leads (Status = NEW)
3. For good leads:
   - Change Status to "REVIEWING"
   - Check matched properties manually on platform
   - Create enquiry manually if interested
   - Update Status to "CONVERTED"
4. For bad leads:
   - Change Status to "REJECTED"
   - Add note why (spam, wrong location, etc.)

### Step 4: Optional - Manual Enquiry Creation

**Add Google Apps Script to your sheet:**

```javascript
function createEnquiry() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  
  // Get lead data from row
  const name = sheet.getRange(row, 4).getValue();
  const email = sheet.getRange(row, 5).getValue();
  const phone = sheet.getRange(row, 6).getValue();
  const budget = sheet.getRange(row, 7).getValue();
  const category = sheet.getRange(row, 9).getValue();
  
  // Call your API
  const url = 'https://estateascent.com/api/n8n/enquiries';
  const payload = {
    name: name,
    email: email,
    phone: phone,
    message: `Budget: ${budget}, Category: ${category}`,
    agentId: 'YOUR_AGENT_ID_HERE',
    channel: 'FACEBOOK'
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-N8N-API-Key': 'YOUR_API_KEY_HERE'
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    // Update sheet
    sheet.getRange(row, 14).setValue('CONVERTED');
    sheet.getRange(row, 15).setValue(`Enquiry: ${result.enquiry.enquiryNumber}`);
    
    SpreadsheetApp.getUi().alert('Enquiry created successfully!');
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error);
  }
}

// Add button to sheet
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Lead Actions')
    .addItem('Create Enquiry', 'createEnquiry')
    .addToUi();
}
```

**Usage:**
1. Select row with lead
2. Menu: Lead Actions → Create Enquiry
3. Enquiry created and assigned to you

---

## 🚫 Preventing Other Agents from Seeing Leads

### In Your Platform Code

**Modify enquiry API to filter by agent:**

```typescript
// src/app/api/enquiries/route.ts
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  
  // Only show enquiries assigned to this agent
  const enquiries = await prisma.enquiry.findMany({
    where: {
      agentId: user.id, // ← Only their enquiries
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return NextResponse.json({ enquiries });
}
```

**This ensures:**
- ✅ Each agent only sees their own enquiries
- ✅ Your Facebook leads are private to you
- ✅ Other agents can't see your lead source

---

## 📊 Privacy Comparison

| Method | Privacy Level | Effort | Control |
|--------|---------------|--------|---------|
| **Private Google Sheet Only** | ⭐⭐⭐⭐⭐ | Low | Full |
| **Assign to Your Agent ID** | ⭐⭐⭐⭐ | Low | High |
| **Separate Database Table** | ⭐⭐⭐⭐⭐ | High | Full |
| **Manual Review First** | ⭐⭐⭐⭐⭐ | Medium | Full |

---

## 🎯 Recommended: Hybrid Approach

**Best of both worlds:**

1. **n8n captures leads** → Your private Google Sheet
2. **You review daily** (5-10 min)
3. **Good leads** → Create enquiry manually (assigned to you)
4. **Platform shows** only your enquiries
5. **Other agents** never see your Facebook leads

**Benefits:**
- ✅ Fully automated capture
- ✅ You control quality
- ✅ 100% private
- ✅ No spam in platform
- ✅ Other agents can't copy your strategy

---

## 🔒 Security Checklist

- [ ] Google Sheet is NOT shared with anyone
- [ ] n8n workflow only stores to YOUR sheet
- [ ] Enquiries created with YOUR agentId
- [ ] Platform filters enquiries by agentId
- [ ] API key is private (not shared)
- [ ] No webhooks to public channels

---

## 💡 Pro Tips

1. **Keep it secret:** Don't tell other agents about your Facebook lead source
2. **Monitor quality:** Track which Facebook groups give best leads
3. **Refine AI prompts:** Improve extraction accuracy over time
4. **Set budget filters:** Only capture leads in your price range
5. **Response speed:** Contact leads within 1 hour for best conversion

---

## 📞 Quick Setup Summary

**For maximum privacy:**

1. ✅ Create private Google Sheet (don't share)
2. ✅ n8n workflow → Sheet only (no API calls)
3. ✅ Review leads daily
4. ✅ Manually create enquiries for good leads
5. ✅ Always use YOUR agentId

**Time:** 5-10 minutes/day to review leads  
**Privacy:** 100% - only you see the leads  
**Control:** Full - you decide what goes into platform

---

Would you like me to create the simplified n8n workflow that only stores to your private Google Sheet?
