-- Cached metro-level housing data from Census ACS, HUD FMR, and FRED
CREATE TABLE public.metro_housing_data (
  metro_id TEXT PRIMARY KEY,
  -- Census ACS B25077 — median home value (annual)
  census_median_home_value NUMERIC,
  census_median_gross_rent NUMERIC,
  census_year INTEGER,
  -- HUD Fair Market Rent (annual)
  hud_fmr_studio NUMERIC,
  hud_fmr_1br NUMERIC,
  hud_fmr_2br NUMERIC,
  hud_fmr_3br NUMERIC,
  hud_fmr_4br NUMERIC,
  hud_year INTEGER,
  -- FRED Case-Shiller (where available — major metros only)
  fred_case_shiller_index NUMERIC,
  fred_yoy_appreciation NUMERIC,
  fred_series_id TEXT,
  fred_observation_date DATE,
  -- Provenance
  sources TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fetch_errors JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.metro_housing_data ENABLE ROW LEVEL SECURITY;

-- Anyone can read — this is public reference data, no PII
CREATE POLICY "Housing data is publicly readable"
ON public.metro_housing_data
FOR SELECT
USING (true);

-- Reuse the existing updated_at trigger function if present, otherwise create it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_metro_housing_data_updated_at
BEFORE UPDATE ON public.metro_housing_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_metro_housing_data_last_fetched ON public.metro_housing_data (last_fetched_at);