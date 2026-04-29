// Refreshes metro_housing_data by pulling from Census ACS, HUD FMR, and FRED Case-Shiller.
// Triggered weekly via pg_cron. Can also be called manually with optional { metroId } body.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Metro id → external codes for each data source.
// CBSA (5-digit) is what Census + HUD use. FRED Case-Shiller series IDs only exist for ~20 major metros.
interface MetroCode {
  cbsa: string;            // CBSA code for Census + HUD
  censusState: string;     // 2-digit state FIPS
  censusPlace?: string;    // optional 7-digit place code for city-level Census query
  fredSeries?: string;     // FRED Case-Shiller series id (Tiered)
}

const METRO_CODES: Record<string, MetroCode> = {
  "nyc":           { cbsa: "35620", censusState: "36", fredSeries: "NYXRSA" },
  "la":            { cbsa: "31080", censusState: "06", fredSeries: "LXXRSA" },
  "chicago":       { cbsa: "16980", censusState: "17", fredSeries: "CHXRSA" },
  "houston":       { cbsa: "26420", censusState: "48" },
  "phoenix":       { cbsa: "38060", censusState: "04", fredSeries: "PHXRSA" },
  "philly":        { cbsa: "37980", censusState: "42" },
  "san-antonio":   { cbsa: "41700", censusState: "48" },
  "san-diego":     { cbsa: "41740", censusState: "06", fredSeries: "SDXRSA" },
  "dallas":        { cbsa: "19100", censusState: "48", fredSeries: "DAXRSA" },
  "austin":        { cbsa: "12420", censusState: "48" },
  "sf":            { cbsa: "41860", censusState: "06", fredSeries: "SFXRSA" },
  "seattle":       { cbsa: "42660", censusState: "53", fredSeries: "SEXRSA" },
  "denver":        { cbsa: "19740", censusState: "08", fredSeries: "DNXRSA" },
  "dc":            { cbsa: "47900", censusState: "11", fredSeries: "WDXRSA" },
  "boston":        { cbsa: "14460", censusState: "25", fredSeries: "BOXRSA" },
  "nashville":     { cbsa: "34980", censusState: "47" },
  "atlanta":       { cbsa: "12060", censusState: "13", fredSeries: "ATXRSA" },
  "miami":         { cbsa: "33100", censusState: "12", fredSeries: "MIXRSA" },
  "tampa":         { cbsa: "45300", censusState: "12", fredSeries: "TPXRSA" },
  "orlando":       { cbsa: "36740", censusState: "12" },
  "portland":      { cbsa: "38900", censusState: "41", fredSeries: "POXRSA" },
  "minneapolis":   { cbsa: "33460", censusState: "27", fredSeries: "MNXRSA" },
  "charlotte":     { cbsa: "16740", censusState: "37", fredSeries: "CRXRSA" },
  "raleigh":       { cbsa: "39580", censusState: "37" },
  "salt-lake":     { cbsa: "41620", censusState: "49" },
  "pittsburgh":    { cbsa: "38300", censusState: "42" },
  "columbus":      { cbsa: "18140", censusState: "39" },
  "indianapolis":  { cbsa: "26900", censusState: "18" },
  "detroit":       { cbsa: "19820", censusState: "26", fredSeries: "DEXRSA" },
  "las-vegas":     { cbsa: "29820", censusState: "32", fredSeries: "LVXRSA" },
  "san-jose":      { cbsa: "41940", censusState: "06" },
  "kansas-city":   { cbsa: "28140", censusState: "29" },
  "cincinnati":    { cbsa: "17140", censusState: "39" },
  "milwaukee":     { cbsa: "33340", censusState: "55" },
  "richmond":      { cbsa: "40060", censusState: "51" },
  "new-orleans":   { cbsa: "35380", censusState: "22" },
  "sacramento":    { cbsa: "40900", censusState: "06" },
  "memphis":       { cbsa: "32820", censusState: "47" },
  "louisville":    { cbsa: "31140", censusState: "21" },
  "baltimore":     { cbsa: "12580", censusState: "24" },
  "oklahoma-city": { cbsa: "36420", censusState: "40" },
  "jacksonville":  { cbsa: "27260", censusState: "12" },
  "boise":         { cbsa: "14260", censusState: "16" },
  "tucson":        { cbsa: "46060", censusState: "04" },
  "honolulu":      { cbsa: "26180", censusState: "15" },
  "charleston":    { cbsa: "16700", censusState: "45" },
  "des-moines":    { cbsa: "19780", censusState: "19" },
  "albuquerque":   { cbsa: "10740", censusState: "35" },
};

interface SourceResult<T> {
  data?: T;
  error?: string;
}

// ─── Census ACS B25077 (median home value) + B25064 (median gross rent) ───
async function fetchCensus(
  cbsa: string,
  apiKey: string,
): Promise<SourceResult<{ medianHomeValue: number; medianGrossRent: number; year: number }>> {
  // ACS 5-year subject tables. Geo: "metropolitan statistical area/micropolitan statistical area" (summary level 310).
  // The Census API requires this exact phrase, URL-encoded with + or %20 for spaces and %2F for the slash.
  const year = 2022;
  const geo = encodeURIComponent("metropolitan statistical area/micropolitan statistical area");
  const url = `https://api.census.gov/data/${year}/acs/acs5?get=NAME,B25077_001E,B25064_001E&for=${geo}:${cbsa}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { error: `Census HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
    }
    const text = await res.text();
    // Census sometimes returns HTML error pages with 200 status — guard with a JSON parse check.
    let json: any;
    try { json = JSON.parse(text); } catch { return { error: `Census non-JSON: ${text.slice(0, 150)}` }; }
    if (!Array.isArray(json) || json.length < 2) return { error: "Census: empty result" };
    // Header: ["NAME", "B25077_001E", "B25064_001E", "metropolitan statistical area/micropolitan statistical area"]
    const [, row] = json;
    const homeValue = Number(row[1]);
    const grossRent = Number(row[2]);
    if (!isFinite(homeValue) || homeValue <= 0) return { error: "Census: invalid home value" };
    return { data: { medianHomeValue: homeValue, medianGrossRent: grossRent, year } };
  } catch (e) {
    return { error: `Census fetch failed: ${(e as Error).message}` };
  }
}

// ─── HUD Fair Market Rent ───
// Per HUD docs (https://www.huduser.gov/portal/dataset/fmr-api.html), the entityid for a metro is
// formatted "METRO{cbsa}M{cbsa}" (e.g. METRO35620M35620 for NYC). The trailing 99999 used in the
// docs example is the COUNTY format, not metro.
async function fetchHUD(
  cbsa: string,
  token: string,
): Promise<SourceResult<{ studio: number; br1: number; br2: number; br3: number; br4: number; year: number }>> {
  const year = 2025;
  const entityId = `METRO${cbsa}M${cbsa}`;
  const url = `https://www.huduser.gov/hudapi/public/fmr/data/${entityId}?year=${year}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      return { error: `HUD HTTP ${res.status} for ${entityId}: ${(await res.text()).slice(0, 200)}` };
    }
    const json = await res.json();
    return parseHud(json, year);
  } catch (e) {
    return { error: `HUD fetch failed: ${(e as Error).message}` };
  }
}

function parseHud(
  json: any,
  year: number,
): SourceResult<{ studio: number; br1: number; br2: number; br3: number; br4: number; year: number }> {
  const d = json?.data?.basicdata;
  // basicdata is either an object (single area) or an array of counties
  const block = Array.isArray(d) ? d[0] : d;
  if (!block) return { error: "HUD: no basicdata" };
  const studio = Number(block["Efficiency"] ?? block["fmr_0"] ?? 0);
  const br1 = Number(block["One-Bedroom"] ?? block["fmr_1"] ?? 0);
  const br2 = Number(block["Two-Bedroom"] ?? block["fmr_2"] ?? 0);
  const br3 = Number(block["Three-Bedroom"] ?? block["fmr_3"] ?? 0);
  const br4 = Number(block["Four-Bedroom"] ?? block["fmr_4"] ?? 0);
  if (br2 <= 0) return { error: "HUD: missing 2BR FMR" };
  return { data: { studio, br1, br2, br3, br4, year } };
}

// ─── FRED Case-Shiller ───
async function fetchFRED(
  series: string,
  apiKey: string,
): Promise<SourceResult<{ index: number; yoyAppreciation: number; date: string; series: string }>> {
  // Pull latest 13 monthly observations so we can compute YoY change.
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=13`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { error: `FRED HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
    }
    const json = await res.json();
    const obs = (json?.observations || []).filter((o: any) => o.value !== "." && !isNaN(Number(o.value)));
    if (obs.length === 0) return { error: "FRED: no observations" };
    const latest = obs[0];
    const yearAgo = obs[12] || obs[obs.length - 1];
    const latestVal = Number(latest.value);
    const yearAgoVal = Number(yearAgo.value);
    const yoy = yearAgoVal > 0 ? ((latestVal - yearAgoVal) / yearAgoVal) * 100 : 0;
    return { data: { index: latestVal, yoyAppreciation: Number(yoy.toFixed(2)), date: latest.date, series } };
  } catch (e) {
    return { error: `FRED fetch failed: ${(e as Error).message}` };
  }
}

async function refreshOne(
  metroId: string,
  codes: MetroCode,
  keys: { census: string; hud: string; fred: string },
  supabase: any,
) {
  const errors: Record<string, string> = {};
  const sources: string[] = [];

  const [censusRes, hudRes, fredRes] = await Promise.all([
    fetchCensus(codes.cbsa, keys.census),
    fetchHUD(codes.cbsa, keys.hud),
    codes.fredSeries ? fetchFRED(codes.fredSeries, keys.fred) : Promise.resolve({ error: "no series" } as SourceResult<any>),
  ]);

  const row: Record<string, any> = { metro_id: metroId, last_fetched_at: new Date().toISOString() };

  if (censusRes.data) {
    row.census_median_home_value = censusRes.data.medianHomeValue;
    row.census_median_gross_rent = censusRes.data.medianGrossRent;
    row.census_year = censusRes.data.year;
    sources.push("Census ACS");
  } else if (censusRes.error) {
    errors.census = censusRes.error;
  }

  if (hudRes.data) {
    row.hud_fmr_studio = hudRes.data.studio;
    row.hud_fmr_1br = hudRes.data.br1;
    row.hud_fmr_2br = hudRes.data.br2;
    row.hud_fmr_3br = hudRes.data.br3;
    row.hud_fmr_4br = hudRes.data.br4;
    row.hud_year = hudRes.data.year;
    sources.push("HUD FMR");
  } else if (hudRes.error) {
    errors.hud = hudRes.error;
  }

  if (fredRes.data) {
    row.fred_case_shiller_index = fredRes.data.index;
    row.fred_yoy_appreciation = fredRes.data.yoyAppreciation;
    row.fred_series_id = fredRes.data.series;
    row.fred_observation_date = fredRes.data.date;
    sources.push("FRED Case-Shiller");
  } else if (fredRes.error && codes.fredSeries) {
    errors.fred = fredRes.error;
  }

  row.sources = sources;
  row.fetch_errors = errors;

  const { error: upsertErr } = await supabase.from("metro_housing_data").upsert(row, { onConflict: "metro_id" });
  if (upsertErr) {
    return { metroId, ok: false, error: upsertErr.message, sources, errors };
  }
  return { metroId, ok: true, sources, errors };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const CENSUS_API_KEY = Deno.env.get("CENSUS_API_KEY");
    const HUD_API_TOKEN = Deno.env.get("HUD_API_TOKEN");
    const FRED_API_KEY = Deno.env.get("FRED_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!CENSUS_API_KEY) throw new Error("CENSUS_API_KEY is not configured");
    if (!HUD_API_TOKEN) throw new Error("HUD_API_TOKEN is not configured");
    if (!FRED_API_KEY) throw new Error("FRED_API_KEY is not configured");
    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Supabase env not configured");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    let body: { metroId?: string } = {};
    try { body = await req.json(); } catch { /* GET or empty body */ }

    const targets: [string, MetroCode][] = body.metroId
      ? (METRO_CODES[body.metroId] ? [[body.metroId, METRO_CODES[body.metroId]]] : [])
      : Object.entries(METRO_CODES);

    if (targets.length === 0) {
      return new Response(JSON.stringify({ error: "Unknown metroId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Run in batches of 5 to avoid hammering APIs
    const results: any[] = [];
    for (let i = 0; i < targets.length; i += 5) {
      const batch = targets.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map(([id, codes]) =>
          refreshOne(id, codes, { census: CENSUS_API_KEY, hud: HUD_API_TOKEN, fred: FRED_API_KEY }, supabase),
        ),
      );
      results.push(...batchResults);
    }

    const ok = results.filter(r => r.ok).length;
    return new Response(
      JSON.stringify({
        refreshed: ok,
        total: results.length,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("refresh-housing-data error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
