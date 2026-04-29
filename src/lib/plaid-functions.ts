export const invokePlaidFunction = async <T = any>(
  functionName: string,
  payload: Record<string, unknown>,
): Promise<T> => {
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  const functionBaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!publishableKey || !functionBaseUrl) {
    throw new Error("Account linking is not configured for this build");
  }

  const response = await fetch(`${functionBaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  const result = responseText ? JSON.parse(responseText) : {};
  if (!response.ok || result?.error) {
    const message = result?.error || result?.message || responseText || `Unable to connect accounts (${response.status})`;
    const detail = result?.details ? ` Details: ${JSON.stringify(result.details)}` : "";
    throw new Error(`${message}${detail}`);
  }

  return result as T;
};