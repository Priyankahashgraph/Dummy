export type AnalyticsEvent =
  | "level_started"
  | "level_completed"
  | "level_failed"
  | "lever_toggled"
  | "app_booted";

export type AnalyticsPayload = Record<string, string | number | boolean>;

export interface AnalyticsAdapter {
  track(event: AnalyticsEvent, payload?: AnalyticsPayload): void;
}

class LocalAnalytics implements AnalyticsAdapter {
  track(event: AnalyticsEvent, payload?: AnalyticsPayload): void {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, payload ?? {});
  }
}

// Swap this adapter for PokiAnalytics / FutureBackendAnalytics per platform phase.
const adapter: AnalyticsAdapter = new LocalAnalytics();

export const Analytics = {
  track(event: AnalyticsEvent, payload?: AnalyticsPayload): void {
    adapter.track(event, payload);
  },
};
