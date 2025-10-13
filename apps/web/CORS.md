# CORS Configuration

The public widget API endpoints (`/api/public/*`) support flexible CORS configuration via environment variables.

## Environment Variables

### `CORS_ALLOWED_ORIGINS`

Comma-separated list of allowed origins. Supports:

**Allow all origins (development only):**
```bash
CORS_ALLOWED_ORIGINS="*"
```

**Exact origin:**
```bash
CORS_ALLOWED_ORIGINS="https://example.com"
```

**Wildcard subdomain:**
```bash
CORS_ALLOWED_ORIGINS="*.example.com"
```
This allows:
- `https://app.example.com`
- `https://staging.example.com`
- `https://example.com`

**Multiple origins:**
```bash
CORS_ALLOWED_ORIGINS="https://app.example.com,https://staging.example.com,*.partner.com"
```

### `CORS_ALLOW_NO_ORIGIN`

Allow requests without an Origin header (e.g., server-side requests, curl).

```bash
# Development
CORS_ALLOW_NO_ORIGIN="true"

# Production
CORS_ALLOW_NO_ORIGIN="false"
```

## Security Headers

The CORS utility automatically adds security headers to all responses:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: interest-cohort=()`
- `Vary: Origin`
- `Access-Control-Max-Age: 600` (10 minutes)

## Implementation

The CORS logic is in `lib/cors.ts` and provides:

### `withCORS(res, req, methods)`

Wraps a Response with CORS headers based on the request's Origin.

```typescript
const res = NextResponse.json({ data: "..." });
return withCORS(res, req, ["GET", "POST"]);
```

### `preflight(req, methods)`

Handles OPTIONS preflight requests.

```typescript
export async function OPTIONS(req: Request) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}
```

### `forbidCORS(req)`

Returns a 403 response without CORS headers (browser will block).

```typescript
if (!isAuthorized) {
  return forbidCORS(req);
}
```

## Production Recommendations

1. **Never use `*` in production** - explicitly list allowed origins
2. **Set `CORS_ALLOW_NO_ORIGIN=false`** in production
3. **Use wildcards sparingly** - prefer exact origins when possible
4. **Monitor CORS errors** - check browser console for blocked requests
5. **Test thoroughly** - verify widget works on all customer domains

## Example Production Config

```bash
# Production .env
CORS_ALLOWED_ORIGINS="https://docs.acme.com,https://app.acme.com,*.partners.acme.com"
CORS_ALLOW_NO_ORIGIN="false"
```

