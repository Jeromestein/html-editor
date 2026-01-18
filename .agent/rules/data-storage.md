# Data Storage

Supabase configuration for report persistence.

## Database

- **Provider**: Hosted Supabase PostgreSQL
- **Table**: `aet_fce_aice_report`
- **Content**: JSON blob of report data

## Security

- RLS enabled
- Currently allows anonymous access (insert/select) for simplified usage

## API

- Client: `@supabase/supabase-js`
- Implementation: `lib/api.ts`
