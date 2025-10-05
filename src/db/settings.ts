import db from './index.js';

export interface Setting {
  key: string;
  value: string;
}

export function getSetting(key: string): string | null {
  const stmt = db.query('SELECT value FROM settings WHERE key = ?');
  const result = stmt.get(key) as Setting | undefined;
  return result?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const stmt = db.query(`
    INSERT INTO settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, value);
}

export function deleteSetting(key: string): void {
  const stmt = db.query('DELETE FROM settings WHERE key = ?');
  stmt.run(key);
}

export function getAllSettings(): Record<string, string> {
  const stmt = db.query('SELECT key, value FROM settings');
  const results = stmt.all() as Setting[];

  const settings: Record<string, string> = {};
  for (const { key, value } of results) {
    settings[key] = value;
  }
  return settings;
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
