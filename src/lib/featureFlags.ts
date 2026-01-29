/**
 * Feature flags for controlling visibility of sections
 * These can be toggled to enable/disable features without code changes
 */

export const featureFlags = {
  /**
   * Show the Insights section on the homepage
   * Set to false to temporarily hide the section
   * TODO: Re-enable when user-specific data and wealth context are available
   */
  showInsights: false,
} as const;
