create table if not exists subscriptions (
  id integer primary key autoincrement,
  email text not null,
  username text,
  ip_address text,
  plan text not null,
  credits integer not null default 0,
  unlimited integer not null default 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  source text not null default 'manual',
  starts_at text not null default current_timestamp,
  ends_at text,
  created_at text not null default current_timestamp
);

create index if not exists subscriptions_email_idx on subscriptions(email);
create index if not exists subscriptions_source_idx on subscriptions(source);

create table if not exists billing_history (
  id integer primary key autoincrement,
  email text not null,
  username text,
  source text not null,
  reference text,
  plan text,
  credits integer not null default 0,
  amount real not null default 0,
  currency text not null default 'usd',
  status text not null default 'completed',
  notes text,
  created_at text not null default current_timestamp
);

create index if not exists billing_history_email_idx on billing_history(email);
create index if not exists billing_history_source_idx on billing_history(source);

create table if not exists coupons (
  code text primary key,
  description text not null default '',
  credits_award integer not null default 0,
  subscription_plan text,
  subscription_duration text,
  percentage_discount real not null default 0,
  fixed_discount_amount real not null default 0,
  max_global_redemptions integer,
  max_redemptions_per_user integer not null default 1,
  expires_at text,
  active integer not null default 1,
  admin_notes text not null default '',
  created_by_hash text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create index if not exists coupons_active_idx on coupons(active);
create index if not exists coupons_expires_at_idx on coupons(expires_at);

create table if not exists coupon_redemptions (
  id integer primary key autoincrement,
  coupon_code text not null,
  email text not null,
  username text,
  credits_awarded integer not null default 0,
  subscription_plan text,
  subscription_duration text,
  percentage_discount real not null default 0,
  fixed_discount_amount real not null default 0,
  ip_address text,
  granted_rewards text not null,
  redeemed_at text not null default current_timestamp,
  foreign key (coupon_code) references coupons(code) on delete cascade
);

create index if not exists coupon_redemptions_coupon_idx on coupon_redemptions(coupon_code);
create index if not exists coupon_redemptions_email_idx on coupon_redemptions(email);
create index if not exists coupon_redemptions_coupon_email_idx on coupon_redemptions(coupon_code, email);