import * as Keychain from 'react-native-keychain';
import { TOKEN_KEY } from '../constants/config';

export const saveToken = async (token: string): Promise<void> => {
  await Keychain.setGenericPassword(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) return credentials.password;
  return null;
};

export const removeToken = async (): Promise<void> => {
  await Keychain.resetGenericPassword();
};

export const clearAuth = async (): Promise<void> => {
  await removeToken();
};
