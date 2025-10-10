# PulseAI Feedback API

## Base URL

- **Prod:** `https://<your-vercel-domain>/api`
- **Dev:** `http://localhost:3000/api`

---

## POST /feedback/ingest

Create a feedback record.

**Headers**
| Name | Type | Required | Description |
|------|------|-----------|--------------|
| `Content-Type` | `application/json` | Yes | Request body is JSON |
| `X-Signature` | `string` (hex HMAC-SHA256) | Yes in production | HMAC of raw body using `HMAC_SECRET` |

**Body**
```json
{
  "project_id": "uuid",
  "text": "string",
  "metadata": { "optional": "object" }
}
```

**Responses**

- `200` → `{ "status": "ok" }`
- `400` → Invalid JSON or schema
- `401` → Missing/invalid signature
- `413` → Payload too large
- `500` → Server/db error

**HMAC Example**
```bash
export HMAC_SECRET=your-secret
BODY='{"project_id":"<PROJECT_ID>","text":"Test from docs"}'
SIG=$(node scripts/sign.js "$BODY")
curl -X POST https://<your-vercel-domain>/api/feedback/ingest \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIG" \
  --data "$BODY"
```

**Schema Reference**
| Field | Type | Notes |
|-------|------|-------|
| `project_id` | UUID | Must match a project record |
| `text` | string | Max 10,000 chars |
| `metadata` | object | Any JSON map |

---

## Status & Health

**GET /health** → `{ ok: true, supabase: "ok", env: ["NEXT_PUBLIC_SUPABASE_URL", ...], version: "<git-sha>" }`

---

© 2025 PulseAI — All rights reserved.
