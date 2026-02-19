# Use Cases & Limitations

> Quick guide: when to use this template and when not.

---

## ✅ Perfect For

- **Learning Angular 21** — Standalone components, Signals, modern patterns
- **CRUD Applications** — Order/inventory/CRM systems with 20-50 entities
- **Offline-First Apps** — Field service, low-connectivity environments
- **Internal Admin Tools** — Dashboards, management portals, data entry
- **Rapid Prototyping** — MVPs, demos, proof of concepts
- **Small Teams** — 3-8 developers, clear architecture boundaries

---

## ❌ NOT Suitable For

- **High-Traffic Public Apps** — IndexedDB can't handle 1000s of concurrent users
- **Real-Time Collaboration** — No WebSocket support, no multi-user sync
- **Multi-Device Sync** — Data lives only in browser, not synced across devices
- **Sensitive Financial Data** — Client-side storage not secure (PCI/HIPAA compliance)
- **Large Datasets** — Browser storage limit ~50-100MB
- **Complex Analytics** — No server-side aggregation/joins

**Solution:** Add REST/GraphQL backend for production use

---

## ⚠️ Critical Limitations

**IndexedDB:**
- Storage: 50-100MB max
- Transactions: One per request
- No complex queries
- Manual schema migrations

**Security (DEMO ONLY):**
- ❌ Hardcoded users/passwords
- ❌ No password hashing
- ❌ No rate limiting/CSRF protection
- ✅ **For production:** Add real backend with OAuth/JWT, HTTPS, httpOnly cookies

**Other:**
- No multi-tab sync
- Cache clear = data lost
- No server-side logic
- Performance degrades with large datasets (>1000 records)

---

## 🎯 Quick Decision Guide

**✅ Use this template:**
- Offline-first apps, admin dashboards, internal tools
- Learning Angular 21, RBAC, clean architecture
- Prototypes, MVPs, small teams (<8 people)

**❌ Don't use:**
- Public SaaS, high-traffic sites (1000+ users)
- Multi-device sync, sensitive financial data
- Real-time collaboration, microservices

**🔄 Production:** Combine with backend (REST/GraphQL API) for auth, persistence, sync

---

## 🚀 Migration to Production

1. **Demo (Current):** IndexedDB + hardcoded users
2. **Add Backend:** Replace repositories with API calls
3. **Add Auth:** OAuth/JWT instead of session storage
4. **Scale:** Add databases, Redis cache, message queues

**Keep:** Core/Areas/Shared architecture, RBAC, guards, Signals  
**Replace:** IndexedDB → API, demo auth → real auth  
**Extend:** Add WebSockets, service workers, analytics

---

## 📋 Quick Checklist

✅ **Use if:**
- CRUD-heavy app
- < 100 concurrent users
- < 100MB data
- Team: 1-8 people
- Timeline: < 2 months to MVP

❌ **Don't use if:**
- Public SaaS
- Multi-device sync required
- PCI/HIPAA compliance
- Real-time collaboration

---

**See Also:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) — Build phases
- [PHASE2_PLAN.md](./PHASE2_PLAN.md) — Detailed plan
