// Dev build (ng serve / ng build without --configuration production).
// Relative path — ng serve proxies /api to the local backend via
// proxy.conf.json, so no absolute URL is needed here.
export const environment = {
  apiBaseUrl: '/api',
};
