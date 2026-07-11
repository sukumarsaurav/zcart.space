-- =============================================================================
-- GLOBAL PROFILES & ADDRESSES
-- =============================================================================

CREATE TABLE global_profiles (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id    UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT        NOT NULL,
    phone           TEXT,
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE global_addresses (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id      UUID        NOT NULL REFERENCES global_profiles(id) ON DELETE CASCADE,
    label           TEXT        DEFAULT 'Home',
    full_name       TEXT        NOT NULL,
    phone           TEXT        NOT NULL,
    address_line1   TEXT        NOT NULL,
    address_line2   TEXT,
    city            TEXT        NOT NULL,
    state           TEXT        NOT NULL,
    pincode         TEXT        NOT NULL,
    is_default      BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_global_addr_profile ON global_addresses(profile_id);

-- TRIGGER FOR UPDATED_AT
CREATE TRIGGER trg_global_profiles_updated_at
BEFORE UPDATE ON global_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- RLS POLICIES
-- =============================================================================
ALTER TABLE global_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON global_profiles FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile"
    ON global_profiles FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile"
    ON global_profiles FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can view their own addresses"
    ON global_addresses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM global_profiles 
            WHERE global_profiles.id = global_addresses.profile_id 
            AND global_profiles.auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own addresses"
    ON global_addresses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM global_profiles 
            WHERE global_profiles.id = global_addresses.profile_id 
            AND global_profiles.auth_user_id = auth.uid()
        )
    );
