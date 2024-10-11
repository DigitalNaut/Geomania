import type { NonOAuthError, TokenResponse } from "@react-oauth/google";
import type { MutableRefObject } from "react";

export type DriveState =
  | {
      status: "idle";
      loaded: false;
    }
  | {
      status: "loaded" | "unauthorized" | "access";
      loaded: true;
    }
  | {
      status: "error";
      loaded: boolean;
      error: Error | NonOAuthError;
    };

export type DriveAccessValidator = { hasAccess: true } | { hasAccess: false; error: Error };

export type GoogleDriveContextType = {
  requestDriveAccess(): void;
  disconnectDrive(): void;
  validateDriveAccess(): DriveAccessValidator;
  state: DriveState;
  userDriveTokens?: TokenResponse;
};

export type ConditionalHookProps = {
  callback: MutableRefObject<() => void>;
  onSuccess?: (tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => void;
  onError?: (errorResponse: NonOAuthError | Pick<TokenResponse, "error" | "error_description" | "error_uri">) => void;
};
