import * as Keychain from "react-native-keychain";

// Save tokens securely using default secure storage
export const saveTokens = async (token, referenceToken) => {
  try {
    const tokens = JSON.stringify({ token, referenceToken });

    await Keychain.setGenericPassword("auth", tokens, {
      accessible: Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
    });

    return true;
  } catch (error) {
    return false;
  }
};

// Get tokens securely
export const getTokens = async () => {
  try {
    const creds = await Keychain.getGenericPassword();
    if (creds) {
      const parsed = JSON.parse(creds.password);

      if (parsed?.token && parsed?.referenceToken) {

        return {
          token: parsed.token,
          referenceToken: parsed.referenceToken,
        };
      } else {
        return null;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Clear tokens securely
export const clearTokens = async () => {
  try {
    await Keychain.resetGenericPassword();
    return true;
  } catch (error) {
    return false;
  }
};
