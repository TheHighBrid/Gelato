# Antigravity handoff: MELATO REA (quota-preserving)

**Read these two files on branch `docs/rea-readiness-and-handoff-20261121` before starting:**
- `docs/rea/READ_ONLY_AUDIT_2026-11-21.md`
- `docs/rea/EXECUTION_BACKLOG.md`

Preflight completed by GPT without spending Antigravity tokens on repository mapping, AGENTS.md reading, open PR inventory, CI triage, active automation checks or existing Living Book / Virtual Rack discovery.

**Start task M-00 only:** identify live Shopify published theme and actual active Living Lookbook/editorial/rack routes by read-only inspection. Output concise route-to-file mapping and screenshots where useful. Reuse evidence already in documents. Do not scan the entire repo again or reconstruct the research. Live REA MCP handshake is unverified; perform a single non-destructive readiness check if a local REA session exists, otherwise proceed with ordinary browser inspection rather than blocking.

Do not modify code, create a new Next.js storefront, merge PRs, change automated schedules or publish Shopify files during M-00. Record exact sources and remaining uncertainties. When M-00 passes, choose **one** non-overlapping implementation package from EXECUTION_BACKLOG and open an isolated branch. Avoid cart, PDP, theme layout and reconciliation files while open PRs are pending. All implementation must preserve MELATO Product Page Bible v1.1.1, verified product data and the storefront integration.

Keep a terse HANDOFF per change: task ID; branch/commit; files; test commands/results; remaining gate. Escalate only a specific blocker with logs. Full release requires owner approval.
