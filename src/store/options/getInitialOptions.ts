import storageService from "@frontend/services/localStorageService";
import { Options } from "./types";
import { DeepPartial } from "@frontend/types/util";
import merge from "deepmerge";
import { OPTIONS_INITIAL_STATE } from "./config";

export default function getInitialOptions(): Options {
  if (typeof window === "undefined") {
    return OPTIONS_INITIAL_STATE;
  }

  const cachedOptions = storageService.getSync<DeepPartial<Options>>("options");

  if (!cachedOptions) {
    return OPTIONS_INITIAL_STATE;
  }

  return merge(OPTIONS_INITIAL_STATE, cachedOptions) as Options;
}
