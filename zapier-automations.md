# Bordman — Zapier Automation Playbook

## ZAP 1: Daily 7:30am Briefing Text to Alex

**Trigger:** Schedule → Every day at 7:30am
**Action 1:** Google Sheets → Get many rows (Prospects tab, filter Status ≠ Won/Dead/Dormant)
**Action 2:** Google Sheets → Get many rows (Clients tab)
**Action 3:** Code by Zapier (JavaScript) — build the message:

```javascript
const prospects = inputData.prospects || [];
const clients = inputData.clients || [];
const hot = prospects.filter(p => p.status === 'Hot').length;
const mrr = clients.reduce((sum, c) => sum + parseFloat(c.monthly_rate || 0), 0);
const today = new Date().toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});

const message = `☀️ Bordman Daily — ${today}
📋 Prospects: ${prospects.length} (${hot} hot)
💼 Clients: ${clients.length}
💰 MRR: $${mrr.toLocaleString()}
📞 Due today: check your Follow-Up Queue tab`;

return {message};
```

**Action 4:** Twilio → Send SMS from (586) 500-5166 to (810) 305-4392
- Message: `{{message}}`

---

## ZAP 2: Prospect Follow-Up Checker (runs 8am daily)

**Trigger:** Schedule → Every day at 8:00am
**Action 1:** Google Sheets → Get many rows (Prospects tab)
**Action 2:** Filter → Only continue if any row has Follow-Up Date = Today AND Status ∉ {Won, Dead, Dormant}
**Action 3:** Code by Zapier — loop through due rows, build texts

For each due prospect, trigger Zap 3 (or use Zapier Looping).

---

## ZAP 3: Send Personalized Follow-Up Text (called per prospect)

**Trigger:** Webhook (called from Zap 2)
**Action:** Twilio → Send SMS from (586) 500-5166 to prospect phone

**Message templates by outcome/attempt:**

- **Attempt 1 (Voicemail):**
  > "Hi {{owner_name}}, this is Alex from Bordman. I tried calling {{school_name}} earlier — I have something quick that could help you stop missing enrollments. Worth a 5-minute call? — (810) 305-4392"

- **Attempt 2:**
  > "Following up from Bordman — {{school_name}} could be capturing every missed call automatically. Parents call, our AI answers, you get a text with their info. $197/month. Happy to show you live: (810) 305-4392"

- **Attempt 3:**
  > "Last follow-up from Alex at Bordman. If missed calls aren't a problem for {{school_name}}, no worries at all. If they are — one call changed everything for our clients. (810) 305-4392. Take care!"

**After Attempt 3:**
- Action: Google Sheets → Update row → Set Status = "Dormant"

---

## ZAP 4: After Call — Owner Notification (Retell → Zapier)

**Trigger:** Webhook → Retell AI sends POST after each call ends

**Retell sends:** caller number, call duration, transcript summary, caller name (if captured)

**Action 1:** Google Sheets → Append row to Prospects tab with caller info
**Action 2:** Twilio → Send SMS to Alex (810) 305-4392:
  > "📞 New call on Bordman line
  > Caller: {{caller_name}} — {{caller_number}}
  > Duration: {{duration}}
  > Summary: {{summary}}
  > Reply CALL to call them back"

**Action 3:** Gmail → Send email to alex@bordman.ai
- Subject: `New call from {{caller_name}} — {{caller_number}}`
- Body: Full transcript + caller info

---

## ZAP 5: Week 3 Client Check-In

**Trigger:** Schedule → Every Monday at 9:00am
**Action:** Google Sheets → Get many rows (Clients tab)
**Filter:** Weeks Active = 3 AND Testimonial Requested ≠ Yes
**Action:** Twilio → Send SMS to client phone:
  > "Hi {{owner_name}}! It's Alex from Bordman — Sarah has been answering your calls for 3 weeks now. How's it going? Anything I can adjust? — (810) 305-4392"
**Action:** Google Sheets → Update row → Set Testimonial Requested = Pending

---

## ZAP 6: Week 6 Testimonial Request

**Trigger:** Schedule → Every Monday at 9:00am
**Action:** Google Sheets → Get many rows (Clients tab)
**Filter:** Weeks Active = 6 AND Testimonial Received ≠ Yes
**Action:** Twilio → Send SMS:
  > "Hi {{owner_name}} — it's Alex from Bordman. Sarah's been with you 6 weeks! If she's been helping, would you mind sharing a quick quote I can use on our website? Even one sentence helps enormously. Just reply here — I'll do the rest. Thank you!"
**Action:** Google Sheets → Update row → Set Testimonial Requested = Yes

---

## ZAP 7: Month 3 Google Review + Referral Ask

**Trigger:** Schedule → 1st of every month at 9:00am
**Action:** Google Sheets → Get many rows (Clients tab)
**Filter:** Weeks Active >= 12 AND Google Review Received ≠ Yes
**Action:** Gmail → Send email to client:
  Subject: `Quick favor — it would mean a lot`
  Body:
  > "Hi {{owner_name}},
  >
  > Three months in — Sarah has been answering every call for {{school_name}}. I hope the difference has been noticeable.
  >
  > If you've had a good experience, would you leave us a quick Google review? It takes 2 minutes and it's the best way to help Bordman grow.
  >
  > [Google Review Link — add yours here]
  >
  > And one more thing — if you know another driving school owner who's always missing calls, I'd love an introduction. Happy to waive their setup fee as a thank-you to you.
  >
  > — Alex, Bordman"

**Action:** Google Sheets → Update row → Set Referral Asked = Yes

---

## SETUP NOTES

### Connecting Retell AI to Zapier (Zap 4):
1. In Retell AI dashboard → go to your agent → Webhook settings
2. Set webhook URL to your Zapier webhook trigger URL
3. Send on: `call_ended` event
4. Test with a live call to (586) 500-5166

### Twilio SMS from (586) 500-5166:
- In Zapier Twilio step: use your Twilio Account SID + Auth Token
- From number: +15865005166
- To number: use the prospect/client phone field

### Testing:
- Test each Zap with a dummy row in the sheet before enabling
- Use Zapier's "Test & Review" step to verify the message looks right
