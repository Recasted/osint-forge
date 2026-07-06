create table if not exists crypto_payments (
  id integer primary key autoincrement,
  order_id text not null,
  invoice_id text,
  payment_status text not null,
  price_amount real not null default 0,
  price_currency text not null default 'usd',
  actually_paid real not null default 0,
  pay_currency text,
  raw_payload text not null,
  created_at text not null default current_timestamp
);

create index if not exists crypto_payments_order_id_idx on crypto_payments(order_id);
create index if not exists crypto_payments_invoice_id_idx on crypto_payments(invoice_id);
