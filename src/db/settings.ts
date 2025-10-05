import { eq } from 'drizzle-orm';
import db from './index.js';
import { settings } from './schema.js';

export interface Setting {
  key: string;
  value: string;
}

export function getSetting(key: string): string | null {
  const result = db.select().from(settings).where(eq(settings.key, key)).get();
  return result?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value },
    })
    .run();
}

export function deleteSetting(key: string): void {
  db.delete(settings).where(eq(settings.key, key)).run();
}

export function getAllSettings(): Record<string, string> {
  const results = db.select().from(settings).all();

  const settingsMap: Record<string, string> = {};
  for (const { key, value } of results) {
    settingsMap[key] = value;
  }
  return settingsMap;
}

// Convenience functions for specific settings
export const getOpenRouterKey = () => getSetting('openrouter_key');
export const setOpenRouterKey = (key: string) => setSetting('openrouter_key', key);

export const getLinearKey = () => getSetting('linear_key');
export const setLinearKey = (key: string) => setSetting('linear_key', key);

export const getDefaultEditor = () => getSetting('default_editor');
export const setDefaultEditor = (editor: string) => setSetting('default_editor', editor);

export const getDefaultTeamId = () => getSetting('default_team_id');
export const setDefaultTeamId = (teamId: string) => setSetting('default_team_id', teamId);

export const hasRequiredKeys = (): boolean => {
  return !!(getOpenRouterKey() && getLinearKey());
};
