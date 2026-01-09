# Apify via HTTP Request - Complete Setup

Since the Apify node isn't available, use HTTP Request nodes instead. Here's the exact configuration:

---

## Step 1: Create Apify API Credential in n8n

1. **Go to:** Credentials → New Credential
2. **Type:** Header Auth
3. **Configuration:**
   - **Name:** `Apify API Token`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer YOUR_APIFY_API_TOKEN`
4. **Save**

**To get your Apify API Token:**
- Go to: https://console.apify.com/account/integrations
- Copy your API token (starts with `apify_api_`)

---

## Step 2: HTTP Request Node #1 - Start Scraper

### Node Configuration

**Basic Settings:**
- **Method:** `POST`
- **URL:** `https://api.apify.com/v2/acts/apify~facebook-groups-scraper/runs`

**Authentication:**
- **Authentication:** `Generic Credential Type`
- **Generic Auth Type:** `Header Auth`
- **Credential:** Select "Apify API Token" (from Step 1)

**Send Body:** Toggle ON

**Body Content Type:** `JSON`

**Body (JSON):**
```json
{
  "startUrls": [
    {
      "url": "https://www.facebook.com/groups/pattayarealestategroup"
    },
    {
      "url": "https://www.facebook.com/groups/pattayaexpats"
    }
  ],
  "maxPosts": 50,
  "scrapeComments": false,
  "scrapeReactions": false,
  "onlyNewPosts": true
}
```

**Options:**
- **Timeout:** `300000` (5 minutes)

---

## Step 3: Wait Node (Important!)

Add a **Wait** node between the two HTTP requests:

**Node Type:** Wait
**Resume:** After Time Interval
**Wait Amount:** `120` seconds (2 minutes)

This gives Apify time to scrape the posts.

---

## Step 4: HTTP Request Node #2 - Get Results

### Node Configuration

**Basic Settings:**
- **Method:** `GET`
- **URL:** `https://api.apify.com/v2/acts/apify~facebook-groups-scraper/runs/{{$json.data.id}}/dataset/items`

**Authentication:**
- **Authentication:** `Generic Credential Type`
- **Generic Auth Type:** `Header Auth`
- **Credential:** Select "Apify API Token" (same as Step 2)

**Send Query Parameters:** Toggle ON

**Query Parameters:**
```
format = json
clean = true
```

---

## Complete Workflow Structure

```
Schedule Trigger (Every 2 hours)
    ↓
HTTP Request #1 - Start Apify Scraper
    ↓
Wait (2 minutes)
    ↓
HTTP Request #2 - Get Results
    ↓
Split Out (to process each post separately)
    ↓
Filter - Has Contact Info
    ↓
OpenAI - Extract Lead Data
    ↓
Parse & Format
    ↓
Google Sheets - Store Lead
```

---

## Alternative: Simpler Approach with Polling

If the wait time is inconsistent, use this approach:

### HTTP Request #1 - Start Scraper (Same as above)

### HTTP Request #2 - Check Status (Loop until done)

**Method:** `GET`
**URL:** `https://api.apify.com/v2/acts/apify~facebook-groups-scraper/runs/{{$json.data.id}}`

**Add IF node:**
- If `status` = `SUCCEEDED` → Get results
- If `status` = `RUNNING` → Wait 30s and check again

### HTTP Request #3 - Get Results (Same as Step 4)

---

## Testing Your Setup

### Test 1: Start Scraper

**Expected Response:**
```json
{
  "data": {
    "id": "abc123xyz",
    "status": "RUNNING",
    "startedAt": "2026-01-06T12:00:00.000Z"
  }
}
```

**Check:**
- ✅ Status code: 201
- ✅ Response has `data.id`
- ✅ Status is "RUNNING"

### Test 2: Get Results

**Expected Response:**
```json
[
  {
    "text": "Looking for condo in Jomtien...",
    "url": "https://facebook.com/groups/...",
    "timestamp": "2026-01-06T11:30:00.000Z"
  },
  ...
]
```

**Check:**
- ✅ Status code: 200
- ✅ Array of posts
- ✅ Each post has `text` field

---

## Common Issues & Fixes

### Issue: 401 Unauthorized

**Fix:**
- Check API token is correct
- Verify token starts with `apify_api_`
- Make sure "Bearer " is in the credential (with space after)

### Issue: 404 Not Found

**Fix:**
- Check actor ID is correct: `apify~facebook-groups-scraper`
- Verify run ID is being passed correctly: `{{$json.data.id}}`

### Issue: Empty Results

**Fix:**
- Wait longer (increase wait time to 3-5 minutes)
- Check Facebook group URLs are correct
- Verify groups are public
- Check Apify dashboard for scraper status

### Issue: Timeout

**Fix:**
- Increase timeout to 600000 (10 minutes)
- Use polling approach instead of fixed wait
- Check Apify credits haven't run out

---

## Cost Optimization

**Reduce Apify Costs:**

1. **Limit posts:** Set `maxPosts: 20` instead of 50
2. **Target specific groups:** Only scrape high-quality groups
3. **Increase interval:** Run every 4 hours instead of 2
4. **Filter before scraping:** Use Apify's built-in filters

**Example optimized config:**
```json
{
  "startUrls": [
    {
      "url": "https://www.facebook.com/groups/pattayarealestategroup"
    }
  ],
  "maxPosts": 20,
  "scrapeComments": false,
  "scrapeReactions": false,
  "onlyNewPosts": true,
  "searchKeywords": ["condo", "house", "sale", "rent", "budget"]
}
```

---

## Monitoring

**Check Apify Dashboard:**
- https://console.apify.com/actors/runs
- View all scraper runs
- Check success/failure rates
- Monitor credit usage

**Add Error Handling in n8n:**

After HTTP Request #2, add **IF** node:
- If response is empty → Send alert
- If error → Log and retry
- If success → Continue to OpenAI

---

## Quick Reference

**Apify API Endpoints:**

| Action | Method | Endpoint |
|--------|--------|----------|
| Start scraper | POST | `/v2/acts/{actorId}/runs` |
| Check status | GET | `/v2/acts/{actorId}/runs/{runId}` |
| Get results | GET | `/v2/acts/{actorId}/runs/{runId}/dataset/items` |

**Authentication:**
- Header: `Authorization: Bearer apify_api_YOUR_TOKEN`

**Rate Limits:**
- 100 requests/minute
- Unlimited runs (based on credits)

---

## Ready to Test!

1. ✅ Create Header Auth credential with Apify token
2. ✅ Add HTTP Request #1 (Start scraper)
3. ✅ Add Wait node (2 minutes)
4. ✅ Add HTTP Request #2 (Get results)
5. ✅ Test with Execute Workflow

Once this works, connect to OpenAI extraction!
