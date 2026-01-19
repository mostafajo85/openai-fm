# Monetization System Documentation

## Overview

This application uses a **minimal, cookie-based quota system** for monetization. It tracks character usage anonymously without requiring user registration or passwords.

## Key Design Decisions

### 1. **Anonymous User Tracking**
- Users are identified by a cookie-based UUID
- No passwords, emails, or authentication required
- Cookie lasts 1 year
- Privacy-first: only tracks character usage

### 2. **Pricing Tiers** (Static Configuration)

| Tier | Characters/Month | Price | Status |
|------|-----------------|-------|--------|
| **Free** | 10,000 | $0 | Active |
| **Basic** | 100,000 | $9.99 | Config only* |
| **Pro** | 500,000 | $29.99 | Config only* |

*Payment integration not implemented yet

### 3. **Monetization is OPTIONAL**

The entire monetization system can be enabled or disabled with a single environment variable:

```env
NEXT_PUBLIC_ENABLE_MONETIZATION=true   # Enable quotas
NEXT_PUBLIC_ENABLE_MONETIZATION=false  # Disable (unlimited)
```

When disabled:
- No quota tracking
- No limits
- No usage displays
- App behaves as completely free service

---

## How It Works

### User Flow

1. **First Visit**
   - System generates anonymous UUID
   - Stores in HTTP-only cookie
   - Creates quota record (Free tier: 10,000 chars/month)

2. **Text-to-Speech Request**
   - System checks remaining quota
   - If quota available → Process request
   - If quota exceeded → Return friendly error
   - On success → Deduct character count

3. **Quota Warnings**
   - 80% used → Yellow warning
   - 100% used → Red warning + soft upgrade CTA

4. **Monthly Reset**
   - Quota resets on 1st of each month
   - Character count goes back to 0

---

## Architecture

### Components

**[quota.service.ts](file:///d:/Jo-Programing/jo%20sp/openai-fm/src/services/quota.service.ts)**
- In-memory quota tracking (Map-based)
- Monthly reset logic
- Usage percentage calculation
- Quota consumption/checking

**[user.service.ts](file:///d:/Jo-Programing/jo%20sp/openai-fm/src/services/user.service.ts)**
- Cookie-based user identification
- UUID generation
- No database required

**[QuotaDisplay.tsx](file:///d:/Jo-Programing/jo%20sp/openai-fm/src/components/ui/QuotaDisplay.tsx)**
- Visual progress bar
- Usage statistics
- Color-coded warnings
- Soft upgrade CTA (non-aggressive)

### Configuration

All limits are in `src/config/index.ts`:

```typescript
export const PRICING_TIERS = {
  FREE: {
    name: 'Free',
    charactersPerMonth: 10000,
    price: 0,
  },
  BASIC: {
    name: 'Basic',
    charactersPerMonth: 100000,
    price: 9.99,
  },
  PRO: {
    name: 'Pro',
    charactersPerMonth: 500000,
    price: 29.99,
  },
};
```

**To change limits**, edit these values and restart the server.

---

## Disabling Monetization

### Method 1: Environment Variable (Recommended)

In `.env.local`:
```env
NEXT_PUBLIC_ENABLE_MONETIZATION=false
```

Restart server. The app now has:
- ✅ No quota limits
- ✅ No usage tracking
- ✅ No upgrade messages
- ✅ Complete free service

### Method 2: Remove Components

If you want to permanently remove monetization:

1. Remove quota check from API route:
   ```typescript
   // Comment out or remove:
   quotaService.checkQuota(userId, validated.characterCount);
   quotaService.consumeQuota(userId, validated.characterCount);
   ```

2. Remove QuotaDisplay from UI

3. Remove files:
   - `src/services/quota.service.ts`
   - `src/services/user.service.ts`
   - `src/components/ui/QuotaDisplay.tsx`

---

## Limitations (Current)

### What's Implemented
✅ Quota tracking
✅ Character counting
✅ Monthly resets
✅ Usage warnings
✅ User identification
✅ Easily disabled

### What's NOT Implemented
❌ Payment processing (Stripe, PayPal, etc.)
❌ Actual tier upgrades (just config)
❌ Subscription management
❌ User dashboard
❌ Email notifications
❌ Database persistence

**Quota data is stored in-memory** and will reset if the server restarts. This is acceptable for demos but should be upgraded to a database (PostgreSQL/Redis) for production.

---

## Future Upgrades (Optional)

If you want to add real payments:

### 1. **Add Database**
Replace in-memory Map with PostgreSQL or Redis:
```typescript
// Instead of: quotas: Map<string, UserQuota>
// Use database table: user_quotas
```

### 2. **Add Stripe Integration**
Example flow:
1. User clicks "Upgrade to Basic"
2. Redirect to Stripe Checkout
3. On success webhook, call:
   ```typescript
   quotaService.upgradeTier(userId, 'BASIC');
   ```

### 3. **Add Email Notifications**
- SendGrid or similar
- Send on quota warnings
- Send on successful upgrade

### 4. **Add User Dashboard**
- `/dashboard` page
- Show usage history
- Manage subscription
- Download invoices

---

## Testing Monetization

### Enable Monetization
```env
NEXT_PUBLIC_ENABLE_MONETIZATION=true
```

### Test Quota Limits

1. **Check remaining quota**:
   - UI shows quota bar
   - Free tier: 10,000 chars

2. **Exceed quota**:
   - Generate audio with text >10,000 chars total
   - Should receive `QUOTA_EXCEEDED` error
   - Error message shows remaining characters

3. **Monthly reset**:
   - Quota resets on 1st of month
   - Or manually in code: `quotaService.cleanup()`

### Disable Monetization
```env
NEXT_PUBLIC_ENABLE_MONETIZATION=false
```

Now unlimited usage.

---

## Security Considerations

1. **Cookie Security**
   - HTTP-only (prevents XSS)
   - Secure flag in production
   - SameSite: lax

2. **No Sensitive Data**
   - Only stores anonymous UUID
   - No PII, emails, or passwords

3. **Rate Limiting**
   - Still applies even with quotas
   - Prevents abuse

4. **Quota Manipulation**
   - User can clear cookies to reset quota
   - This is acceptable for demos
   - For production, implement server-side persistence

---

## FAQ

**Q: Can users cheat by clearing cookies?**
A: Yes, currently. For production, use database + IP tracking.

**Q: What happens when quota resets?**
A: On the 1st of each month, character count goes to 0.

**Q: Can I increase the free tier limit?**
A: Yes, edit `PRICING_TIERS.FREE.charactersPerMonth` in config.

**Q: Does this work with multiple devices?**
A: No, each device gets its own quota (cookie-based).

**Q: How do I implement actual payments?**
A: See "Future Upgrades" section above for Stripe integration.

---

## Summary

This is a **production-safe, minimal monetization layer** that:

✅ Works without authentication
✅ Tracks usage fairly
✅ Can be disabled instantly
✅ Shows upgrade potential
✅ Doesn't harm UX
✅ Easy to extend later

**For demos/MVPs**: Use as-is
**For production**: Add database + payment gateway

---

Last Updated: January 2026
