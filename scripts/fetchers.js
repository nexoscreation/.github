import axios from 'axios';

// 🛠 Axios interceptor for logging errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - Fetch failed: ${error.message}`);
    return Promise.reject(error);
  }
);

// ⏳ Helper function for delay (exponential backoff)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🔄 Fetch with retry (better handling)
const fetchWithRetry = async (url, options = {}, retries = 3, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.info(`[INFO] ${new Date().toISOString()} - Fetching: ${url}`);
      const response = await axios({ url, ...options });
      return response.data;
    } catch (error) {
      console.warn(`[WARN] ${new Date().toISOString()} - Retry ${i + 1}/${retries} for: ${url}`);
      if (i === retries - 1) throw error;
      await delay(delayMs * (i + 1)); // Exponential backoff
    }
  }
};

// 📦 Fetch npm packages
export const fetchNPMPackages = async (npmUID) => {
  return fetchWithRetry(`https://registry.npmjs.com/-/v1/search?text=maintainer:${npmUID}`);
};

// 📈 Fetch npm package downloads
export const fetchNPMPackageDownloads = async (packageName) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  return fetchWithRetry(`https://api.npmjs.org/downloads/point/2015-01-10:${today}/${packageName}`);
};

// 🏆 Fetch GitHub user info
export const fetchGitHubUserinfo = async (githubUID, token) => {
  return fetchWithRetry(`https://api.github.com/users/${githubUID}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

// 📂 Fetch GitHub repositories
export const fetchGitHubRepositories = async (githubUID, token) => {
  return fetchWithRetry(`https://api.github.com/users/${githubUID}/repos?per_page=100`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

// 🏢 Fetch GitHub organizations
export const fetchGitHubOrganizations = async (githubUID, token) => {
  return fetchWithRetry(`https://api.github.com/users/${githubUID}/orgs`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
