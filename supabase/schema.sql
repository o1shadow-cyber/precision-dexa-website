-- Precision Dexa booking system schema.
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
--
-- Both tables have RLS enabled with zero policies: nothing is reachable via the
-- anon/publishable key. Every read and write goes through Next.js server code
-- using the service_role/secret key, which bypasses RLS by design.

create table available_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  slot_time time not null,
  status text not null default 'available'
    check (status in ('available', 'held', 'booked')),
  held_until timestamptz,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  unique (slot_date, slot_time)
);

alter table available_slots enable row level security;

create table bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references available_slots(id),
  patient_name text not null,
  birthdate date not null,
  weight_lbs numeric not null,
  gender text not null,
  email text not null,
  phone text not null,
  has_provider_order boolean not null default false,
  provider_order_path text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'expired')),
  amount_cents integer not null default 14900,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table bookings enable row level security;

-- Speeds up the two hot-path queries: the public slot list, and the
-- webhook's lookup of a booking by its Stripe Checkout Session id.
create index idx_available_slots_status_date on available_slots (status, slot_date, slot_time);
create index idx_bookings_stripe_session on bookings (stripe_checkout_session_id);
