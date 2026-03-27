/**
 * External API clients for GoViralBitch and Blotato.
 * These wrap the actual HTTP calls to the deployed services.
 */

const GOVIRALBITCH_URL = process.env.GOVIRALBITCH_API_URL || "https://goviralbitch-deploy.onrender.com";
const BLOTATO_API_KEY = process.env.BLOTATO_API_KEY || "";

// ─── GoViralBitch API Client ────────────────────────────────

export interface GoViralBitchPostRequest {
  topic?: string;
  pillar?: string;
  platform?: string;
  count?: number;
}

export interface GoViralBitchReelRequest {
  topic?: string;
  pillar?: string;
  duration?: number;
  count?: number;
}

export interface GoViralBitchHookRequest {
  topic?: string;
  pillar?: string;
  style?: string;
  count?: number;
}

export interface GoViralBitchAdCopyRequest {
  product?: string;
  objective?: string;
  format?: string;
  count?: number;
}

export interface GoViralBitchBatchRequest {
  week_start?: string;
  platforms?: string[];
  posts_per_day?: number;
}

export interface GoViralBitchFollowUpRequest {
  lead_name: string;
  step: number;
  interest?: string;
  partner_name?: string;
}

export interface GoViralBitchObjectionRequest {
  objection: string;
  context?: string;
  partner_name?: string;
}

export interface GoViralBitchResponse {
  id: string;
  type: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

async function callGoViralBitch(endpoint: string, body: Record<string, unknown>): Promise<GoViralBitchResponse> {
  const res = await fetch(`${GOVIRALBITCH_URL}/api/content/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`GoViralBitch API error (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function goViralBitchHealthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${GOVIRALBITCH_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function generatePost(req: GoViralBitchPostRequest) {
  return callGoViralBitch("post", req as Record<string, unknown>);
}

export async function generateReel(req: GoViralBitchReelRequest) {
  return callGoViralBitch("reel", req as Record<string, unknown>);
}

export async function generateStory(req: GoViralBitchPostRequest) {
  return callGoViralBitch("story", req as Record<string, unknown>);
}

export async function generateHooks(req: GoViralBitchHookRequest) {
  return callGoViralBitch("hooks", req as Record<string, unknown>);
}

export async function generateAdCopy(req: GoViralBitchAdCopyRequest) {
  return callGoViralBitch("ad-copy", req as Record<string, unknown>);
}

export async function generateFollowUp(req: GoViralBitchFollowUpRequest) {
  return callGoViralBitch("follow-up", req as unknown as Record<string, unknown>);
}

export async function generateObjection(req: GoViralBitchObjectionRequest) {
  return callGoViralBitch("objection", req as unknown as Record<string, unknown>);
}

export async function generateBatch(req: GoViralBitchBatchRequest) {
  return callGoViralBitch("batch", req as Record<string, unknown>);
}

// ─── Blotato API Client ─────────────────────────────────────

const BLOTATO_BASE = "https://backend.blotato.com/v2";

export interface BlotatoAccount {
  id: number;
  platform: string;
  username: string;
  displayName?: string;
}

export interface BlotatoPostRequest {
  accountId: number;
  content: {
    text: string;
    mediaUrls?: string[];
    platform: string;
  };
  target: {
    targetType: string;
    pageId?: string;
  };
}

async function callBlotato(endpoint: string, method: string = "GET", body?: unknown) {
  const headers: Record<string, string> = {
    "blotato-api-key": BLOTATO_API_KEY,
    "Content-Type": "application/json",
  };
  const res = await fetch(`${BLOTATO_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown error");
    throw new Error(`Blotato API error (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function getBlotatoAccounts(): Promise<BlotatoAccount[]> {
  try {
    const data = await callBlotato("/users/me/accounts");
    return Array.isArray(data) ? data : (data?.accounts || []);
  } catch (err) {
    console.error("[Blotato] Failed to get accounts:", err);
    return [];
  }
}

/**
 * Schedule a post on Blotato. Returns the created post data.
 * IMPORTANT: This should ONLY be called after explicit user approval!
 */
export async function scheduleOnBlotato(
  accountId: number,
  text: string,
  platform: string,
  mediaUrls?: string[],
  scheduledDate?: string,
): Promise<unknown> {
  const postData: Record<string, unknown> = {
    post: {
      accountId,
      content: {
        text,
        mediaUrls: mediaUrls || [],
        platform,
      },
      target: {
        targetType: platform,
      },
    },
    useNextFreeSlot: !scheduledDate,
  };

  if (scheduledDate) {
    (postData.post as Record<string, unknown>).scheduledSendAt = scheduledDate;
  }

  return callBlotato("/posts", "POST", postData);
}

/**
 * Publish an approved post to all selected platforms via Blotato.
 * Returns array of Blotato post IDs.
 */
export async function publishToAllPlatforms(
  content: string,
  platforms: string[],
  accounts: BlotatoAccount[],
  mediaUrls?: string[],
  scheduledDate?: string,
): Promise<string[]> {
  const postIds: string[] = [];

  for (const platform of platforms) {
    const account = accounts.find(a => a.platform.toLowerCase() === platform.toLowerCase());
    if (!account) {
      console.warn(`[Blotato] No account found for platform: ${platform}`);
      continue;
    }

    try {
      const result = await scheduleOnBlotato(
        account.id,
        content,
        platform,
        mediaUrls,
        scheduledDate,
      );
      const postId = (result as any)?.id || (result as any)?.post?.id || `${platform}-${Date.now()}`;
      postIds.push(String(postId));
    } catch (err) {
      console.error(`[Blotato] Failed to post to ${platform}:`, err);
    }
  }

  return postIds;
}

// ─── Blotato Account Mapping ────────────────────────────────
// Known Blotato accounts for LR Lifestyle Team
export const LR_BLOTATO_ACCOUNTS: BlotatoAccount[] = [
  { id: 3978, platform: "facebook", username: "Sven Sven" },
  { id: 4089, platform: "youtube", username: "Mathias Vinzing" },
  { id: 5345, platform: "instagram", username: "lr_lifestyleteam" },
  { id: 2949, platform: "linkedin", username: "Mathias Vinzing" },
  { id: 1398, platform: "threads", username: "lr_lifestyleteam" },
  { id: 17918, platform: "tiktok", username: "mathiasvinzing978" },
  { id: 6683, platform: "tiktok", username: "lr_lifestyleteam" },
  { id: 2961, platform: "twitter", username: "Matze39063828" },
];
