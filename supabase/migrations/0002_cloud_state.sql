-- Dedicated private state; no browser or anonymous role can read customer data.
create table if not exists public.artique_state (
  id text primary key check (id = 'store'),
  revision integer not null default 1,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.artique_state enable row level security;
revoke all on public.artique_state from public, anon, authenticated;
grant select, insert, update on public.artique_state to service_role;

create or replace function public.artique_compare_and_swap(expected_revision integer, next_payload jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.artique_state set payload = next_payload, revision = revision + 1, updated_at = now()
  where id = 'store' and revision = expected_revision;
  return found;
end;
$$;
revoke all on function public.artique_compare_and_swap(integer, jsonb) from public, anon, authenticated;
grant execute on function public.artique_compare_and_swap(integer, jsonb) to service_role;

-- Both buckets are private. Existing authorized app routes serve the images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artique-products', 'artique-products', false, 8388608, array['image/webp']),
       ('artique-proofs', 'artique-proofs', false, 8388608, array['image/webp'])
on conflict (id) do nothing;
