# n8n Node Setup Guide

## Installing Required Nodes

### Apify Node (For Facebook Scraping)

**Option 1: Install via n8n UI (Recommended)**

1. In n8n, click the **"+"** to add a new node
2. Search for "Apify"
3. If not found, you need to install it:
   - Go to: **Settings → Community Nodes**
   - Click "Install a community node"
   - Enter: `n8n-nodes-apify`
   - Click "Install"
   - Wait for installation to complete
   - Restart n8n workflow editor

**Option 2: Manual Installation (Self-Hosted n8n)**

If you're self-hosting n8n:

```bash
# SSH into your n8n server
cd ~/.n8n
npm install n8n-nodes-apify

# Restart n8n
pm2 restart n8n
# or
docker restart n8n
```

**Option 3: Use n8n Cloud (Easiest)**

If you're using n8n Cloud, Apify node should be available by default. If not:
- Contact n8n support
- Or use HTTP Request node instead (see below)

---

## Alternative: Use HTTP Request Instead of Apify Node

If you can't install the Apify node, use the **HTTP Request** node to call Apify API directly:

### Replace Apify Node with HTTP Request

**Node Configuration:**

```
Node Type: HTTP Request
Method: POST
URL: https://api.apify.com/v2/acts/apify~facebook-groups-scraper/runs

Authentication: Header Auth
Header Name: Authorization
Header Value: Bearer YOUR_APIFY_API_TOKEN

Body (JSON):
{
  "startUrls": [
    {"url": "https://www.facebook.com/groups/pattayarealestategroup"}
  ],
  "maxPosts": 50,
  "scrapeComments": false,
  "scrapeReactions": false
}

Options:
- Wait for completion: Yes
- Timeout: 300000 (5 minutes)
```

**Then add another HTTP Request to get results:**

```
Node Type: HTTP Request
Method: GET
URL: https://api.apify.com/v2/acts/apify~facebook-groups-scraper/runs/{{$json.data.id}}/dataset/items

Authentication: Header Auth
Header Name: Authorization
Header Value: Bearer YOUR_APIFY_API_TOKEN
```

---

## Alternative Scraping Methods (No Apify Needed)

### Option A: RSS Feed Scraper (Free)

Many Facebook groups have RSS feeds:

**Node: RSS Feed Read**
```
URL: https://www.facebook.com/feeds/page.php?id=GROUP_ID&format=rss20
```

**Pros:**
- ✅ Free
- ✅ Built into n8n
- ✅ No external service

**Cons:**
- ❌ Limited to public groups
- ❌ May not have all post details
- ❌ Facebook may block

### Option B: Webhook from IFTTT/Zapier

Set up IFTTT to monitor Facebook and send to n8n webhook:

1. **IFTTT Applet:**
   - Trigger: New post in Facebook group
   - Action: Webhook to n8n

2. **n8n Webhook Node:**
   - Receives posts from IFTTT
   - Continues with OpenAI extraction

**Pros:**
- ✅ Easy setup
- ✅ Real-time notifications

**Cons:**
- ❌ IFTTT limitations
- ❌ May miss some posts

### Option C: Manual CSV Upload (Simplest for Testing)

For testing without Apify:

1. **Manually copy Facebook posts** to CSV file
2. **Upload CSV to Google Sheets**
3. **n8n reads from Google Sheets** instead of Apify
4. **Continue with OpenAI extraction**

**Modified Workflow:**
```
Google Sheets Trigger (new row)
  ↓
OpenAI Extract
  ↓
Store in Private Sheet
```

---

## Simplified Workflow for Testing (No Apify)

### Test with Manual Input

**For immediate testing without Apify:**

1. **Replace Schedule + Apify nodes with Manual Trigger**
2. **Add test data directly in n8n:**

```json
{
  "text": "Looking for 2BR condo in Jomtien, budget 5-7 million. Contact: John Doe, john@email.com, 081-234-5678",
  "url": "https://facebook.com/groups/test"
}
```

3. **Test OpenAI extraction**
4. **Verify Google Sheets storage**
5. **Once working, add Apify later**

---

## Recommended Approach for You

Since you want to **test the AI first**, I recommend:

### Phase 1: Test AI Extraction (Today - No Apify Needed)

**Workflow:**
```
Manual Trigger
  ↓
Set Test Data (sample Facebook posts)
  ↓
OpenAI Extract
  ↓
Google Sheets Store
  ↓
Email Notify
```

**Test with these sample posts:**

```javascript
[
  {
    "text": "สนใจคอนโดให้เช่าที่จอมเทียน 2 ห้องนอน งบ 20,000-30,000 บาท/เดือน ติดต่อ: 089-123-4567",
    "url": "https://facebook.com/groups/test1"
  },
  {
    "text": "Looking for house in Pattaya for sale, 3-4 bedrooms, budget 10-15 million baht. Email: buyer@example.com",
    "url": "https://facebook.com/groups/test2"
  },
  {
    "text": "Need condo near beach, max 5km, 2BR, under 8M. Call 081-555-1234",
    "url": "https://facebook.com/groups/test3"
  }
]
```

### Phase 2: Add Apify (After AI is Working)

Once you're happy with AI extraction accuracy:
1. Install Apify node or use HTTP Request
2. Replace Manual Trigger with Schedule + Apify
3. Go live with automatic scraping

---

## Quick Test Workflow (Copy to n8n)

**Simplified workflow for testing AI extraction:**

### Node 1: Manual Trigger
- Type: Manual Trigger

### Node 2: Set Test Data
- Type: Set
- Value:
```json
{
  "items": [
    {
      "text": "Looking for 2BR condo in Jomtien for sale, budget 5-7 million baht. Must have sea view and pool. Contact: Sarah Johnson, sarah.j@email.com, 081-555-1234",
      "url": "https://facebook.com/groups/test"
    }
  ]
}
```

### Node 3: OpenAI Extract
- (Same as in your workflow)

### Node 4: Function - Parse
- (Same as in your workflow)

### Node 5: Google Sheets Store
- (Same as in your workflow)

**Click Execute Workflow** → Test AI extraction immediately!

---

## Summary

**For immediate testing (recommended):**
1. ✅ Use Manual Trigger + Test Data
2. ✅ Test OpenAI extraction accuracy
3. ✅ Refine prompts based on results
4. ✅ Verify Google Sheets storage

**For production (later):**
1. ⏳ Install Apify node or use HTTP Request
2. ⏳ Add Schedule Trigger
3. ⏳ Connect to real Facebook groups
4. ⏳ Go live with automation

**You can test the entire AI extraction pipeline TODAY without Apify!**

---

## Need Help?

- Can't find a node? Check Settings → Community Nodes
- Using n8n Cloud? All nodes should be available
- Self-hosted? Install via npm
- Want to test first? Use Manual Trigger approach above
