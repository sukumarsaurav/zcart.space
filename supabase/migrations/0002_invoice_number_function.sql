-- Atomic per-shop invoice number claim, used when generating an invoice on
-- order confirmation (COD immediate-confirm and Razorpay payment verify).
-- The UPDATE...RETURNING inside a single statement takes a row lock on the
-- shop's invoice_counters row, so concurrent claims can't hand out the same number.

CREATE OR REPLACE FUNCTION claim_invoice_number(p_shop_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_prefix TEXT;
  v_next   INTEGER;
BEGIN
  INSERT INTO invoice_counters (shop_id, prefix, last_number)
  VALUES (p_shop_id, 'INV', 0)
  ON CONFLICT (shop_id) DO NOTHING;

  UPDATE invoice_counters
  SET last_number = last_number + 1
  WHERE shop_id = p_shop_id
  RETURNING last_number, prefix INTO v_next, v_prefix;

  RETURN v_prefix || '-' || to_char(now(), 'YYYY') || '-' || lpad(v_next::text, 5, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION claim_invoice_number(UUID) TO service_role, authenticated;
