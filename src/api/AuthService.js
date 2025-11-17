import axios from "axios";
import { saveTokens, getTokens, clearTokens } from "../../tokenStorage"
// Load BASE_URLs from .env
const BASE_URL_CAREAXES_PATIENT_PORTAL = process.env.BASE_URL_CAREAXES_PATIENT_PORTAL;
const BASE_URL_LIVE = process.env.BASE_URL_LIVE;
const BASE_URL_PROFILEIMG = process.env.BASE_URL_PROFILEIMG;
const BASE_URL_CAREAXES_LOCATION = process.env.BASE_URL_CAREAXES_LOCATION;

// Axios instances
const careaxesPortalUATApi = axios.create({ baseURL: BASE_URL_CAREAXES_PATIENT_PORTAL });
const LiveApi = axios.create({ baseURL: BASE_URL_LIVE });
const LocationApi = axios.create({ baseURL: BASE_URL_CAREAXES_LOCATION });

// Attach token automatically for all instances
const attachAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(async (config) => {
    const tokens = await getTokens();
    if (tokens?.token) {
      config.headers.Authorization = `${tokens.token}`;
    }
    return config;
  });
};

attachAuthInterceptor(careaxesPortalUATApi);
attachAuthInterceptor(LocationApi);


// LOGIN
export const login = async (userName, password) => {
  try {
    const response = await careaxesPortalUATApi.post("account/patient-authenticate", {
      userName,
      password,
      accountTypes: ["Patient"],
      deviceType: "Web",
      deviceToken: "q9r7w5ala9m8muxq9n",
      deviceId: "5x4pxqndsp7m8muxq9n",
    });


    if (response.data?.token || response.data?.referenceToken) {
      await saveTokens(response.data.token, response.data.referenceToken);
    }

    return response;
  } catch (error) {
    return error.response;
  }
};

// LOGOUT
export const logout = async (currentUser) => {
  try {
    const tokens = await getTokens();

    if (!tokens?.token || !tokens?.referenceToken || !currentUser?.accountId) {
      await clearTokens();
      return { status: 200, data: "Logged out locally" };
    }

    const response = await careaxesPortalUATApi.post(
      "account/logout",
      {
        accountId: currentUser.accountId,
        deviceType: "Web",
        deviceId: "5x4pxqndsp7m8muxq9n",
      },
      {
        headers: { LocationId: 1 },
      }
    );

    return response;
  } catch (error) {
    return error.response;
  }
};

// REFRESH TOKEN
export const refreshToken = async () => {
  try {
    const tokens = await getTokens();
    if (!tokens?.referenceToken) throw new Error("No reference token available");

    const response = await LiveApi.put("account/refresh-authentication", {
      Token: tokens.referenceToken,
    });

    if (response.data?.token || response.data?.referenceToken) {
      await saveTokens(response.data.token, response.data.referenceToken);
    }

    return response.data;
  } catch (error) {
    await clearTokens();
    return null;
  }
};

// AUTO REFRESH HANDLER
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

careaxesPortalUATApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return careaxesPortalUATApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newTokens = await refreshToken();
        if (!newTokens?.token) throw new Error("Unable to refresh token");

        processQueue(null, newTokens.token);
        originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
        return careaxesPortalUATApi(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


// FETCH USER LIST BY MOBILE
export const fetchUserListByMobile = async (mobileNumber) => {
  try {
    const response = await careaxesPortalUATApi.put("/patients/check-user-list", {
      username: mobileNumber,
      accountTypes: ["Patient"],
    });
    return response;
  } catch (error) {
    return error.response;
  }
};

// FETCH PROFILE IMAGE
export const fetchProfileImage = async ({ thumbnailUrl }) => {
  try {
    if (!thumbnailUrl) throw new Error("No thumbnailUrl");

    return {
      status: 200,
      imageUrl: `${BASE_URL_PROFILEIMG}${thumbnailUrl}`,
    };
  } catch (error) {
    return { error: error.message };
  }
};

//  NEW: FETCH RECENT VISITS
export const fetchRecentVisits = async (accountId) => {
  try {
    if (!accountId) throw new Error("AccountId is required");

    const response = await careaxesPortalUATApi.get(`SalesVisit/FetchVisits?AccountId=${accountId}`);
    return response;
  } catch (error) {
    return error.response;
  }
};

export const fetchLocations = async () => {
  try {
    const response = await careaxesPortalUATApi.get("resources/locations");
    return response.data; // returns array of { id, name, value, optionalText }
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
};

export const fetchDoctorsByLocation = async (selectedLocationName) => {
  try {
    const response = await careaxesPortalUATApi.post(
      "providers/fetch-provider-list-items",
      { consultationName: "Physical Consultation" }
    );

    if (response.status === 200 && Array.isArray(response.data)) {
      // Filter doctors whose location matches the selected location
      const filteredDoctors = response.data.filter(
        (doctor) =>
          doctor.location &&
          doctor.location.trim().toLowerCase() === selectedLocationName.trim().toLowerCase()
      );
      return filteredDoctors;
    } else {
      console.error("Unexpected doctor API response:", response);
      return [];
    }
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
};


//  ADD VISIT
export const addVisit = async (visitData) => {
  try {
    const response = await careaxesPortalUATApi.post("SalesVisit/AddVisit", visitData);
    if (response.status === 200 && response.data === "success") {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};


//  ON DUTY LOGIN
export const onDutyLogin = async (accountId, currentAddress) => {
  try {
    const now = new Date();
    const createdDate = now.toISOString();
    const loginTime = now.toISOString();

    const payload = {
      AccountId: accountId,
      CreatedBy: accountId,
      CreatedDate: createdDate,
      LoginTime: loginTime,
      LoginGpsLocation: currentAddress || "Unknown",
      IsLogin: true,
    };


    const response = await careaxesPortalUATApi.post("SalesVisit/SalesVisitLogin", payload);
    return response;
  } catch (error) {
    console.error(" Error in OnDuty API:", error);
    return error.response || null;
  }
};

//  OFF DUTY LOGOUT
export const offDutyLogout = async (accountId, currentAddress, dayTrackerRequestId) => {
  try {
    const now = new Date();
    const logoutTime = now.toISOString();

    const payload = {
      AccountId: accountId,
      LogoutTime: logoutTime,
      LogoutGpsLocation: currentAddress || "Unknown",
      DayTrackerRequestId: dayTrackerRequestId,
    };

    const response = await careaxesPortalUATApi.put("SalesVisit/UpdateSalesVisitLogin", payload);
    return response;
  } catch (error) {
    console.error(" Error in OffDuty API:", error);
    return error.response || null;
  }
};

export const updateLocation = async ({ userId, lat, lon }) => {
  try {
    const response = await LocationApi.post("update_location", {
      user_id: userId,
      lat,
      lon
    });

    // API returns { "status": "ok" }
    if (response?.data?.status === "ok") {
      return { success: true };
    } else {
      return {
        success: false,
        message: "Unexpected response from server",
        data: response?.data
      };
    }

  } catch (error) {
    console.error("updateLocation Error:", error);

    return {
      success: false,
      message: error?.response?.data?.message || "Failed to update location",
      error
    };
  }
};


// GET USER LOCATION (ADMIN ANALYTICS)
export const getLocation = async (accountId) => {
  try {
    if (!accountId) throw new Error("AccountId is required");

    const response = await LocationApi.get(`get_location/${accountId}`);

    // Success case
    if (response?.data?.lat && response?.data?.lon) {
      return {
        success: true,
        lat: response.data.lat,
        lon: response.data.lon,
        timestamp: response.data.timestamp,
      };
    }

    // No lat/lon present -> NOT FOUND
    return { success: false, message: "Location not found" };

  } catch (error) {

    // Extract accurate server error message
    const serverMsg =
      error?.response?.data?.error ||     
      error?.response?.data?.message || 
      "Failed to fetch location";

    return {
      success: false,
      message: serverMsg,
      error
    };
  }
};
