---
id: delivery
title: Delivery playbook
type: playbook
status: active
owner: founders
updated: 2026-07-26
depends_on: [offer]
decisions: []
---

# 04 — Delivery Playbook

## Client onboarding (run via /new-client)
1. Create `docs/clients/<name>/brief.md` from the template the command generates.
2. Kickoff call: goals, success metric, data sources, stakeholders, deadline, budget frame.
3. Access checklist: systems, test accounts, sample data (anonymized where possible), contact
   person, communication channel (email/Teams — client's choice).
4. If personal data is processed: AVV (Auftragsverarbeitungsvertrag) before any data touches us.
   `TBD: AVV template from lawyer/generator — do not draft from scratch.`
5. Written Angebot via /proposal → signed before work starts. Deposit for P2+ projects.

## Delivery standards
- One private repo per client. Client gets access or a handover export at the end.
- Staging before production. No direct-to-prod changes.
- Secrets in a manager (never in repo). GDPR: data minimization, EU hosting by default.
- Every project ships with: README (run/deploy), architecture sketch, handover doc in German,
  30-min handover call.
- Definition of done: acceptance criteria from the Angebot checked off in writing by the client.

## Weekly rhythm (founders)
30 min: pipeline review (Partner A) + delivery status (Partner B) + one improvement to this repo.
Decisions land in docs/05-decisions.md.

## Case engine
After every project: write `docs/clients/<name>/case-draft.md` — problem, solution, numbers,
quote. Ask permission to publish. Cases are the marketing engine; never skip this.
