import storageService from "@frontend/services/localStorageService";

export default function clearAuthData() {
  storageService.removeSync("user");
  storageService.removeSync("tokens");
}
