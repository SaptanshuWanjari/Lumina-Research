# Website PRD Reference

This app follows the root PRD at `PRD.md`.

## Scope alignment

- Single-user product surface only
- No workspaces, memberships, invites, or billing flows
- Case -> source -> run -> report lifecycle with citations and review checkpoints

## Data model expectations

The Prisma schema in `apps/website/prisma/schema.prisma` is the source of truth for app data modeling and is intentionally owner-scoped with `owner_user_id`.
