import { KeyStatus, ProviderHealth } from '../../src/types';

export type KeyTier = 'tier1_primary' | 'tier2_burst' | 'tier3_emergency';

interface ManagedKey {
  index: number;
  rawKey: string;
  maskedKey: string;
  tier: KeyTier;
  status: 'active' | 'cooldown' | 'standby' | 'disabled';
  failureCount: number;
  requestCount: number;
  lastUsed?: Date;
  cooldownUntil?: Date;
}

export class KeyManager {
  private keys: ManagedKey[] = [];
  private currentPointer = 0;
  private totalRequests = 0;
  private totalErrors = 0;
  public cacheHits = 0;

  // Rolling request timestamps for traffic rate detection (last 60s)
  private recentRequestTimestamps: number[] = [];
  private readonly TRAFFIC_BURST_THRESHOLD = 10; // >10 requests in 60s activates Tier 2 scaling
  private readonly ROLLING_WINDOW_MS = 60 * 1000;

  constructor() {
    this.refreshKeys();
  }

  public refreshKeys(): void {
    // Collect keys from all potential environment variables
    const rawList: string[] = [];

    // Check specific numbered slots
    const slotKeys = [
      process.env.PIXABAY_KEY_1 || process.env.PIXABAY_API_KEY_1,
      process.env.PIXABAY_KEY_2 || process.env.PIXABAY_API_KEY_2,
      process.env.PIXABAY_KEY_3 || process.env.PIXABAY_API_KEY_3,
      process.env.PIXABAY_KEY_4 || process.env.PIXABAY_API_KEY_4,
      process.env.PIXABAY_KEY_5 || process.env.PIXABAY_API_KEY_5,
    ];

    slotKeys.forEach(k => {
      if (k && k.trim()) rawList.push(k.trim());
    });

    // Check comma-separated list
    if (process.env.PIXABAY_API_KEYS) {
      const parts = process.env.PIXABAY_API_KEYS.split(',').map(s => s.trim()).filter(Boolean);
      parts.forEach(p => {
        if (!rawList.includes(p)) rawList.push(p);
      });
    }

    // Check single fallback
    if (process.env.PIXABAY_API_KEY && !rawList.includes(process.env.PIXABAY_API_KEY.trim())) {
      rawList.unshift(process.env.PIXABAY_API_KEY.trim());
    }

    // Default active key provided by user
    const DEFAULT_KEY = '57423042-ac1ca67bb6c3159924d56ca4f';
    if (!rawList.includes(DEFAULT_KEY)) {
      rawList.unshift(DEFAULT_KEY);
    }

    // Fill up to 5 slots with available keys
    this.keys = [1, 2, 3, 4, 5].map(idx => {
      const raw = rawList[idx - 1] || '';
      const trimmed = raw.trim();
      const masked = trimmed.length > 8
        ? `${trimmed.substring(0, 4)}...${trimmed.substring(trimmed.length - 4)}`
        : trimmed ? 'configured' : 'unconfigured';

      let tier: KeyTier = 'tier1_primary';
      if (idx === 3 || idx === 4) tier = 'tier2_burst';
      if (idx === 5) tier = 'tier3_emergency';

      return {
        index: idx,
        rawKey: trimmed,
        maskedKey: masked,
        tier,
        status: trimmed ? (tier === 'tier1_primary' ? 'active' : 'standby') : 'disabled',
        failureCount: 0,
        requestCount: 0,
      };
    });
  }

  public hasConfiguredKeys(): boolean {
    return this.keys.some(k => k.rawKey.length > 0 && k.status !== 'disabled');
  }

  /**
   * Determine whether traffic velocity or Tier 1 degradation justifies spinning up Tier 2
   */
  private shouldScaleUpTier2(now: number): boolean {
    // 1. Clean old timestamps
    this.recentRequestTimestamps = this.recentRequestTimestamps.filter(t => (now - t) < this.ROLLING_WINDOW_MS);

    // 2. High traffic velocity
    if (this.recentRequestTimestamps.length >= this.TRAFFIC_BURST_THRESHOLD) {
      return true;
    }

    // 3. Either of the primary keys is in cooldown or has failures
    const tier1Keys = this.keys.filter(k => k.tier === 'tier1_primary' && k.rawKey.length > 0);
    const tier1HasCooldown = tier1Keys.some(k => k.status === 'cooldown' || k.failureCount > 0);
    return tier1HasCooldown;
  }

  public getNextKey(): { key: string; keyIndex: number; tier: KeyTier; mode: string } | null {
    const nowMs = Date.now();
    const nowDate = new Date(nowMs);
    this.recentRequestTimestamps.push(nowMs);

    // Refresh cooldown expirations
    for (const k of this.keys) {
      if (k.status === 'cooldown' && k.cooldownUntil && k.cooldownUntil <= nowDate) {
        k.status = k.tier === 'tier1_primary' ? 'active' : 'standby';
        k.cooldownUntil = undefined;
        k.failureCount = 0;
        console.log(`[VISTORA KeyManager] Key #${k.index} (${k.tier}) cooldown lifted, returned to service.`);
      }
    }

    // 1. Check Primary Duo (Tier 1)
    const tier1Active = this.keys.filter(
      k => k.tier === 'tier1_primary' && k.status === 'active' && k.rawKey.length > 0
    );

    const isScalingRequired = this.shouldScaleUpTier2(nowMs);

    // 2. Check if we should activate Tier 2 (Burst Scalers)
    if (isScalingRequired) {
      for (const k of this.keys) {
        if (k.tier === 'tier2_burst' && k.rawKey.length > 0 && k.status === 'standby') {
          k.status = 'active';
          console.log(`[VISTORA KeyManager] 🚀 Traffic/Load trigger: Dynamically spun up Key #${k.index} (Tier 2 Burst Scaler)`);
        }
      }
    }

    // Combine currently active keys in Tier 1 and Tier 2
    let eligibleKeys = this.keys.filter(
      k => (k.tier === 'tier1_primary' || k.tier === 'tier2_burst') &&
           k.status === 'active' &&
           k.rawKey.length > 0
    );

    // 3. If all Tier 1 and Tier 2 keys are unavailable/in cooldown, activate Tier 3 (Emergency Hot-Standby)
    if (eligibleKeys.length === 0) {
      const emergencyKey = this.keys.find(
        k => k.tier === 'tier3_emergency' && k.rawKey.length > 0 && k.status !== 'cooldown'
      );

      if (emergencyKey) {
        emergencyKey.status = 'active';
        console.warn(`[VISTORA KeyManager] ⚡ EMERGENCY ACTIVATION: Triggering Key #${emergencyKey.index} (Hot-Standby Reserve) to prevent downtime.`);
        emergencyKey.lastUsed = nowDate;
        emergencyKey.requestCount++;
        this.totalRequests++;
        return {
          key: emergencyKey.rawKey,
          keyIndex: emergencyKey.index,
          tier: 'tier3_emergency',
          mode: 'emergency_reserve',
        };
      }
    }

    // If still no keys available from primary/secondary, check if any configured key is available
    if (eligibleKeys.length === 0) {
      const anyActive = this.keys.find(k => k.rawKey.length > 0 && k.status !== 'cooldown' && k.status !== 'disabled');
      if (anyActive) {
        anyActive.lastUsed = nowDate;
        anyActive.requestCount++;
        this.totalRequests++;
        return {
          key: anyActive.rawKey,
          keyIndex: anyActive.index,
          tier: anyActive.tier,
          mode: 'fallback_active',
        };
      }
      return null;
    }

    // Round-robin selection among eligible active keys
    this.currentPointer = (this.currentPointer + 1) % eligibleKeys.length;
    const selected = eligibleKeys[this.currentPointer];
    selected.lastUsed = nowDate;
    selected.requestCount++;
    this.totalRequests++;

    return {
      key: selected.rawKey,
      keyIndex: selected.index,
      tier: selected.tier,
      mode: isScalingRequired ? 'burst_scaled' : 'primary_duo',
    };
  }

  public recordSuccess(keyIndex: number): void {
    const k = this.keys.find(item => item.index === keyIndex);
    if (k) {
      k.failureCount = Math.max(0, k.failureCount - 1);
    }
  }

  public recordFailure(keyIndex: number, isRateLimit = false): void {
    this.totalErrors++;
    const k = this.keys.find(item => item.index === keyIndex);
    if (!k) return;

    k.failureCount++;
    if (isRateLimit || k.failureCount >= 2) {
      // 3-minute cooldown for rate limits or errors
      k.status = 'cooldown';
      k.cooldownUntil = new Date(Date.now() + 3 * 60 * 1000);
      console.warn(`[VISTORA KeyManager] Key #${keyIndex} (${k.tier}) entered cooldown until ${k.cooldownUntil.toLocaleTimeString()}`);
    }
  }

  public getHealthSummary(): ProviderHealth & {
    activeTier: string;
    recentRpsWindow: number;
    tiers: Record<string, { configured: number; active: number }>;
  } {
    const configuredKeys = this.keys.filter(k => k.rawKey.length > 0).length;
    const activeKeys = this.keys.filter(k => k.status === 'active' && k.rawKey.length > 0).length;

    const t1 = this.keys.filter(k => k.tier === 'tier1_primary' && k.rawKey.length > 0);
    const t2 = this.keys.filter(k => k.tier === 'tier2_burst' && k.rawKey.length > 0);
    const t3 = this.keys.filter(k => k.tier === 'tier3_emergency' && k.rawKey.length > 0);

    const now = Date.now();
    const isScaled = this.recentRequestTimestamps.filter(t => (now - t) < this.ROLLING_WINDOW_MS).length >= this.TRAFFIC_BURST_THRESHOLD;
    const isEmergency = t3.some(k => k.status === 'active');

    const activeTier = isEmergency
      ? 'Tier 3: Emergency Reserve Active'
      : isScaled
      ? 'Tier 2: Burst Scaling Active'
      : 'Tier 1: Primary Duo Active';

    let overallStatus: 'healthy' | 'degraded' | 'cooldown' | 'standby' = 'standby';
    if (configuredKeys === 0) {
      overallStatus = 'standby';
    } else if (activeKeys > 0) {
      overallStatus = 'healthy';
    } else {
      overallStatus = 'cooldown';
    }

    const keyStatuses: KeyStatus[] = this.keys.map(k => ({
      keyIndex: k.index,
      maskedKey: k.maskedKey,
      status: k.status,
      failureCount: k.failureCount,
      lastUsed: k.lastUsed ? k.lastUsed.toISOString() : undefined,
      cooldownUntil: k.cooldownUntil ? k.cooldownUntil.toISOString() : undefined,
    }));

    return {
      providerName: 'Pixabay Multi-Tier Engine',
      status: overallStatus,
      totalConfiguredKeys: configuredKeys,
      activeKeys,
      requestCount: this.totalRequests,
      errorCount: this.totalErrors,
      cacheHits: this.cacheHits,
      keys: keyStatuses,
      activeTier,
      recentRpsWindow: this.recentRequestTimestamps.filter(t => (now - t) < this.ROLLING_WINDOW_MS).length,
      tiers: {
        tier1_primary: { configured: t1.length, active: t1.filter(k => k.status === 'active').length },
        tier2_burst: { configured: t2.length, active: t2.filter(k => k.status === 'active').length },
        tier3_emergency: { configured: t3.length, active: t3.filter(k => k.status === 'active').length },
      },
    };
  }
}

export const pixabayKeyManager = new KeyManager();
