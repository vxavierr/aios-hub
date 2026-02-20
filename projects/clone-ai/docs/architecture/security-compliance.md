# Clone Lab - Security & Compliance

**Version:** 1.0 | **Date:** 2026-02-20 | **Author:** Aria (Architect)

---

## Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SECURITY LAYERS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Layer 1: Network Security                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  TLS 1.3 │ Rate Limiting │ CORS │ IP Whitelisting (Enterprise)          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Layer 2: Authentication                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  API Keys │ JWT Tokens │ OAuth 2.0 │ Session Management                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Layer 3: Authorization                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  RBAC │ Resource Ownership │ Operation-Level Permissions                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Layer 4: Data Protection                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  AES-256 at Rest │ TLS 1.3 in Transit │ Key Rotation │ PII Handling    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  Layer 5: Audit & Monitoring                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Structured Logs │ Access Logs │ Security Alerts │ Compliance Reports  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flows

### CLI Authentication

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│   CLI   │                    │   API   │                    │  Vault  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ 1. clone-lab login           │                              │
     │ ────────────────────────────▶│                              │
     │                              │                              │
     │ 2. Return device code        │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │ 3. Open browser, authorize   │                              │
     │ ────────────────────────────▶│                              │
     │                              │                              │
     │ 4. Poll for token            │                              │
     │ ────────────────────────────▶│ 5. Verify authorization      │
     │                              │ ─────────────────────────────▶│
     │                              │                              │
     │                              │ 6. Return API key            │
     │                              │ ◀─────────────────────────────│
     │                              │                              │
     │ 7. Return API key            │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │ 8. Store in ~/.clone-lab/    │                              │
     │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │                              │
```

### API Authentication

```typescript
// API Key validation middleware
async function validateApiKey(apiKey: string): Promise<User> {
  // 1. Check format
  if (!apiKey.startsWith('cl_')) {
    throw new UnauthorizedError('Invalid API key format');
  }

  // 2. Lookup in cache
  const cached = await cache.get(`api-key:${apiKey}`);
  if (cached) return cached;

  // 3. Verify with vault
  const user = await vault.verifyApiKey(apiKey);
  if (!user) {
    throw new UnauthorizedError('Invalid or expired API key');
  }

  // 4. Cache for future requests
  await cache.set(`api-key:${apiKey}`, user, { ttl: 300 });

  return user;
}
```

---

## Authorization Model (RBAC)

### Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| `viewer` | `dna:read`, `manifest:read` | Read-only access |
| `developer` | `dna:*`, `manifest:*`, `session:*` | Full development access |
| `admin` | `*:*` | Full administrative access |

### Resource Ownership

```typescript
interface ResourceOwnership {
  ownerId: string;
  organizationId?: string;
  accessControl: {
    public: boolean;
    sharedWith: string[];
  };
}

// Permission check
async function canAccess(
  user: User,
  resource: Resource,
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  // 1. Check role permissions
  if (user.role.permissions.includes(`${resource.type}:${action}`)) {
    // 2. Check ownership
    if (resource.ownerId === user.id) return true;
    if (resource.accessControl.sharedWith.includes(user.id)) return true;
    if (resource.accessControl.public && action === 'read') return true;
  }
  return false;
}
```

### Sensitive Operations

```typescript
// Operations requiring re-authentication
const SENSITIVE_OPERATIONS = [
  'dna:export',
  'dna:delete',
  'dna:encrypt',
  'session:delete',
  'api-key:revoke',
];

async function requireReauth(user: User, operation: string): Promise<void> {
  if (SENSITIVE_OPERATIONS.includes(operation)) {
    const lastAuth = await cache.get(`last-auth:${user.id}`);
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (!lastAuth || Date.now() - lastAuth > maxAge) {
      throw new ReauthRequiredError(
        'This operation requires recent authentication'
      );
    }
  }
}
```

---

## Data Encryption

### At Rest

```typescript
// AES-256-GCM encryption for DNA profiles
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

interface EncryptedData {
  ciphertext: string;  // Base64 encoded
  iv: string;          // Base64 encoded
  authTag: string;     // Base64 encoded
  keyVersion: string;
}

async function encrypt(data: string, key: Buffer): Promise<EncryptedData> {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    keyVersion: 'v1',
  };
}

async function decrypt(encrypted: EncryptedData, key: Buffer): Promise<string> {
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encrypted.iv, 'base64')
  );

  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
```

### In Transit

- TLS 1.3 required for all connections
- Certificate pinning for API clients
- HSTS headers for web clients

---

## Secrets Management

### Local Development

```bash
# .env file (never committed)
CLONE_LAB_ENCRYPTION_KEY=base64-encoded-key
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
```

### Production (HashiCorp Vault)

```typescript
// Vault integration
class SecretsManager {
  private vault: VaultClient;

  async getApiKey(provider: string): Promise<string> {
    const secret = await this.vault.read(`secret/data/providers/${provider}`);
    return secret.data.api_key;
  }

  async getEncryptionKey(version: string): Promise<Buffer> {
    const secret = await this.vault.read(`secret/data/encryption/${version}`);
    return Buffer.from(secret.data.key, 'base64');
  }

  async rotateKey(version: string): Promise<void> {
    const newKey = randomBytes(KEY_LENGTH);
    await this.vault.write(`secret/data/encryption/${version}`, {
      key: newKey.toString('base64'),
      createdAt: new Date().toISOString(),
    });
  }
}
```

### Key Rotation Schedule

| Key Type | Rotation Period | Automation |
|----------|-----------------|------------|
| API Keys | 90 days | Manual |
| Encryption Keys | 365 days | Manual with migration |
| JWT Secret | 30 days | Automatic |
| TLS Certificates | 90 days | Automatic (Let's Encrypt) |

---

## Content Rights Management

### Provenance Tracking

```typescript
interface ContentProvenance {
  sourceId: string;
  sourceType: SourceType;
  sourceUrl?: string;
  extractedAt: Date;
  license?: {
    type: 'public' | 'cc-by' | 'cc-by-sa' | 'proprietary' | 'unknown';
    attribution?: string;
  };
  acknowledged: boolean;
}

// License acknowledgment before extraction
async function acknowledgeRights(
  source: SourceData,
  user: User
): Promise<void> {
  if (source.metadata.license?.type === 'proprietary') {
    const acknowledged = await db.getAcknowledgment(user.id, source.id);
    if (!acknowledged) {
      throw new RightsNotAcknowledgedError(
        'You must acknowledge ownership rights before processing this content'
      );
    }
  }
}
```

### Export Restrictions

```typescript
// Check before exporting DNA
async function validateExport(dna: PersonalityDNA, user: User): Promise<void> {
  const sources = await db.getSourcesForDNA(dna.id);

  for (const source of sources) {
    if (source.license?.type === 'proprietary') {
      throw new ExportRestrictedError(
        `DNA contains content from proprietary source: ${source.id}`
      );
    }
  }
}
```

---

## OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| A01: Broken Access Control | RBAC, resource ownership checks |
| A02: Cryptographic Failures | AES-256-GCM, TLS 1.3 |
| A03: Injection | Parameterized queries, input validation |
| A04: Insecure Design | Threat modeling, security reviews |
| A05: Security Misconfiguration | Security headers, default deny |
| A06: Vulnerable Components | Automated dependency scanning |
| A07: Auth Failures | MFA, rate limiting, secure sessions |
| A08: Data Integrity | Checksums, signature verification |
| A09: Logging Failures | Structured logs, correlation IDs |
| A10: SSRF | URL whitelisting, no internal access |

---

## Security Checklist

### CLI

- [ ] API keys stored with restricted file permissions (600)
- [ ] No credentials in command-line arguments
- [ ] Encrypted profile storage option
- [ ] Session timeout

### API

- [ ] TLS 1.3 only
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] No sensitive data in logs
- [ ] CORS properly configured

### Data

- [ ] Encryption at rest for DNA profiles
- [ ] Encryption in transit (TLS)
- [ ] Secure key storage
- [ ] Regular key rotation

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-20 | 1.0 | Initial security architecture | Aria (Architect) |

---

*Generated by Aria (Architect Agent) - AIOS Framework*
