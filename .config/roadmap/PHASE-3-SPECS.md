# PHASE 3: AI COMPANION + SEXTING INTEGRATION

**Status:** Ready to integrate after Phase 2 content gallery  
**Integration:** Reuses Phase 1-2 infrastructure; parallel monetization system  
**Gate:** Unlock after Phase 2 content player is complete  

---

## MONETIZATION STRATEGY

### Tier Structure

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 messages/day, read-only gallery access |
| **Lite** | $9.99/mo | Unlimited messages, basic companion |
| **Pro** | $19.99/mo | Multiple companions, voice messages, custom personas |
| **Premium** | $49.99/mo | All Pro + live streaming, video sync, priority support |

### Revenue Drivers

1. **Subscription Base:** $9.99-$49.99/month
   - Target: 100 subscribers by Month 3 (Phase 1 gate)
   - Target: 500 subscribers by Month 9 (Phase 2)

2. **Token System (Optional Upsell)**
   - Lite users can purchase tokens: $4.99 = 100 tokens
   - Premium features cost 10-50 tokens per interaction
   - **Projection:** 20% of Lite users spend $10-50/mo extra

3. **Custom Persona Sales**
   - Marketplace: Buy/sell AI companion personas
   - Revenue share: 70/30 (creator/platform)
   - **Projection:** $5-10k/mo by Month 12

---

## API ENDPOINTS (POST-PHASE-2)

### Companion Management
```
GET /api/aura8/companions/list
GET /api/aura8/companions/[id]
POST /api/aura8/companions/create (Pro+ tier)
POST /api/aura8/companions/[id]/publish (marketplace)
```

### Messaging
```
POST /api/aura8/messages/send
GET /api/aura8/conversations/[id]
GET /api/aura8/messages/stats
```

### Subscription Management
```
GET /api/aura8/subscriptions/current
POST /api/aura8/subscriptions/upgrade
POST /api/aura8/subscriptions/cancel
```

### Token System
```
POST /api/aura8/tokens/purchase
GET /api/aura8/tokens/balance
GET /api/aura8/tokens/ledger
```

---

## DATABASE SCHEMA (TO ADD)

```sql
CREATE TABLE aura8_companions (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES aura8_subscribers(email),
  name TEXT,
  persona_description TEXT,
  system_prompt TEXT (Claude instructions),
  voice_id TEXT (Vapi voice ID),
  avatar_url TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE aura8_conversations (
  id UUID PRIMARY KEY,
  user_id TEXT REFERENCES aura8_subscribers(email),
  companion_id UUID REFERENCES aura8_companions(id),
  messages JSONB (array of {role, content, timestamp}),
  token_usage INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE aura8_subscriptions (
  id UUID PRIMARY KEY,
  user_email TEXT REFERENCES aura8_subscribers(email),
  tier TEXT ('free', 'lite', 'pro', 'premium'),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE aura8_token_ledger (
  id UUID PRIMARY KEY,
  user_email TEXT REFERENCES aura8_subscribers(email),
  action TEXT ('purchase', 'spend', 'refund'),
  amount INTEGER,
  companion_id UUID (nullable),
  metadata JSONB,
  created_at TIMESTAMP
);
```

---

## RETENTION AUTOMATIONS (Email)

### Inactive User Sequences

```
Day 1 (Inactive): "We miss you! Your companion is waiting."
Day 7 (Inactive): "Come back and unlock 5 free messages."
Day 14 (Inactive): "Limited time: 3 days of unlimited messages, 50% off."
Day 30 (Inactive): "Your subscription is expiring soon. Reactivate and save."
```

### Churn Prevention

- Monitor: 0 messages in last 7 days
- Action: Send re-engagement email with incentive
- Upgrade offer: Free trial of next tier (3 days)

---

**Integration:** Add this to Aura8 immediately after Phase 2 gallery is stable.
