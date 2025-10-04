import Conf from 'conf';

interface StorageSchema {
  openrouterApiKey?: string;
  linearApiKey?: string;
}

const storage = new Conf<StorageSchema>({
  projectName: 'relay-cli',
  encryptionKey: 'relay-cli-secure-key-v1' // In production, use a more secure approach
});

export const getOpenRouterKey = (): string | undefined => {
  return storage.get('openrouterApiKey');
};

export const setOpenRouterKey = (key: string): void => {
  storage.set('openrouterApiKey', key);
};

export const getLinearKey = (): string | undefined => {
  return storage.get('linearApiKey');
};

export const setLinearKey = (key: string): void => {
  storage.set('linearApiKey', key);
};

export const clearAllKeys = (): void => {
  storage.clear();
};

export const hasRequiredKeys = (): boolean => {
  return !!(getOpenRouterKey() && getLinearKey());
};
