import * as SecureStore from "expo-secure-store";

export const getStoredUser = async () => {
  const user = await SecureStore.getItemAsync("userData");
  return user ? JSON.parse(user) : null;
};

export const getToken = async () => {
  return await SecureStore.getItemAsync("userToken");
};
