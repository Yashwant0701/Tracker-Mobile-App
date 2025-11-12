import * as Keychain from "react-native-keychain";

// Save tokens securely using default secure storage
export const saveTokens = async (token, referenceToken) => {
  try {
    const tokens = JSON.stringify({ token, referenceToken });

    await Keychain.setGenericPassword("auth", tokens, {
      accessible: Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY,
    });
   // console.log("Tokens saved with default secure storage ");

    return true;
  } catch (error) {
   // console.error("Error saving tokens:", error);
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
        // console.log("Tokens retrieved successfully ");
        // console.log("Access Token:", parsed.token);
        // console.log("Refresh Token:", parsed.referenceToken);
        return {
          token: parsed.token,
          referenceToken: parsed.referenceToken,
        };
      } else {
        //console.warn("Tokens retrieved but missing values ");
        return null;
      }
    }
    return null;
  } catch (error) {
   // console.error("Error getting tokens:", error);
    return null;
  }
};

// Clear tokens securely
export const clearTokens = async () => {
  try {
    await Keychain.resetGenericPassword();
    //console.log("Tokens cleared successfully ");
    return true;
  } catch (error) {
   // console.error("Error clearing tokens:", error);
    return false;
  }
};
