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

### `withCORS(res, req, methods, extraAllowed?, opts?)`

Wraps a Response with CORS headers based on the request's Origin.

```typescript
const res = NextResponse.json({ data: "..." });
return withCORS(res, req, ["GET", "POST"]);
```

**Per-request allow-list:**
```typescript
// Merge environment origins with project-specific domains
const projectDomains = ["https://customer-site.com", "*.customer.io"];
return withCORS(res, req, ["GET", "POST"], projectDomains);
```

**Project-only mode (ignore environment origins):**
```typescript
// Use ONLY project-specific origins, skip env list
const projectDomains = ["https://customer.com"];
return withCORS(res, req, ["GET", "POST"], projectDomains, { projectOnly: true });
```

### `preflight(req, methods, extraAllowed?, opts?)`

Handles OPTIONS preflight requests with optional per-request origins and options.

```typescript
export async function OPTIONS(req: Request) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

// With per-request origins
export async function OPTIONS(req: Request) {
  const projectDomains = await getProjectDomains();
  return preflight(req, ["GET", "POST", "OPTIONS"], projectDomains);
}

// Project-only mode
export async function OPTIONS(req: Request) {
  const projectDomains = await getProjectDomains();
  return preflight(req, ["GET", "POST", "OPTIONS"], projectDomains, { projectOnly: true });
}
```

### `forbidCORS(req)`

Returns a 403 response without CORS headers (browser will block).

```typescript
if (!isAuthorized) {
  return forbidCORS(req);
}
```

### `parseEnvAllowed()`

Parses the environment variable `CORS_ALLOWED_ORIGINS` into an array.

```typescript
const envOrigins = parseEnvAllowed();
// ["https://example.com", "*.partner.com"]
```

## Managing Per-Project Origins via API

### Get Project Origins

```http
GET /api/projects/{projectId}/origins
```

**Response:**
```json
{
  "allowed_origins": ["https://customer.com", "*.staging.customer.io"]
}
```

### Update Project Origins

```http
PUT /api/projects/{projectId}/origins
Content-Type: application/json

{
  "allowed_origins": ["https://customer.com", "*.staging.customer.io"]
}
```

**Notes:**
- Set to `null` to use only global env config
- Set to `[]` (empty array) to block all origins
- Maximum 50 entries per project
- Requires admin or owner role

**Response:**
```json
{
  "ok": true,
  "allowed_origins": ["https://customer.com", "*.staging.customer.io"]
}
```

## When to Use Project-Only Mode

Use `{ projectOnly: true }` when:

- **Customer wants complete control** - Override global defaults entirely
- **Isolated projects** - Project has no relationship to your global origins
- **Security isolation** - Prevent accidental exposure via global env list
- **White-label deployments** - Customer manages their own CORS policy

**Example:**
```typescript
// Customer A's widget can ONLY be embedded on their domains
// Even if CORS_ALLOWED_ORIGINS="*", this project ignores it
const customerOrigins = ["https://customer-a.com", "*.customer-a.io"];
return withCORS(res, req, ["GET"], customerOrigins, { projectOnly: true });
```

## Production Recommendations

1. **Never use `*` in production** - explicitly list allowed origins
2. **Set `CORS_ALLOW_NO_ORIGIN=false`** in production
3. **Use wildcards sparingly** - prefer exact origins when possible
4. **Monitor CORS errors** - check browser console for blocked requests
5. **Test thoroughly** - verify widget works on all customer domains
6. **Per-project restrictions** - Use `allowed_origins` for sensitive projects
7. **Consider projectOnly** - For maximum isolation per customer

## Example Production Config

```bash
# Production .env (global defaults)
CORS_ALLOWED_ORIGINS="https://docs.acme.com,https://app.acme.com"
CORS_ALLOW_NO_ORIGIN="false"
```

```sql
-- Per-project restrictions (database)
UPDATE projects 
SET allowed_origins = ARRAY['*.partners.acme.com']
WHERE name = 'Partner Portal Widget';
```

