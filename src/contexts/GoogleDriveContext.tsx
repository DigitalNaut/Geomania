import { type MutableRefObject, type PropsWithChildren, useState, createContext, useContext, useRef } from "react";
import {
  type NonOAuthError,
  type TokenResponse,
  useGoogleLogin,
  hasGrantedAnyScopeGoogle,
  useGoogleOAuth,
} from "@react-oauth/google";

import { Script } from "src/components/common/Script";

type DriveState =
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

type DriveAccessValidator = { hasAccess: true } | { hasAccess: false; error: Error };

type GoogleDriveContextType = {
  requestDriveAccess(): void;
  disconnectDrive(): void;
  validateDriveAccess(): DriveAccessValidator;
  state: DriveState;
  userDriveTokens?: TokenResponse;
};

const googleDriveContext = createContext<GoogleDriveContextType | null>(null);

// See: https://developers.google.com/identity/protocols/oauth2/scopes#drive
const scope = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
const discoveryDocs = [DISCOVERY_DOC];

type ConditionalHookProps = {
  callback: MutableRefObject<() => void>;
  onSuccess?: (tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => void;
  onError?: (errorResponse: NonOAuthError | Pick<TokenResponse, "error" | "error_description" | "error_uri">) => void;
};

function ImplicitFlow({ callback, onSuccess, onError }: ConditionalHookProps) {
  callback.current = useGoogleLogin({
    prompt: "",
    scope,
    onSuccess,
    onError,
    onNonOAuthError: onError,
  });

  return null;
}

function useDriveState() {
  const [state, setState] = useState<DriveState>({ status: "idle", loaded: false });

  const raiseError = (error: Error | NonOAuthError) =>
    void setState((prevState) => ({
      status: "error",
      loaded: prevState.loaded,
      error,
    }));

  const changeStatus = (newStatus: (DriveState & { loaded: true; error: undefined })["status"]) => {
    const { status } = state;

    if (status === newStatus) return;

    if (
      (status === "idle" && newStatus !== "loaded") ||
      (status === "loaded" && newStatus !== "unauthorized") ||
      (status === "unauthorized" && newStatus !== "access") ||
      (status === "access" && newStatus !== "loaded")
    ) {
      raiseError(new Error(`Invalid state transition from ${state} to ${newStatus}`));
    }

    setState({ status: newStatus, loaded: true });
  };

  return { state, changeStatus, raiseError };
}

async function loadGapiScripts() {
  return new Promise((resolve) => {
    gapi.load("client", resolve);
  });
}

async function initGapiClient(apiKey?: string) {
  return gapi.client.init({ apiKey, discoveryDocs });
}

/**
 * Provides a Google Drive API context for child components. Children components can access the
 * Google Drive API functionality by calling methods on the `googleDriveContext` object.
 * To use this context:
 * 1. Wrap your component tree with this provider.
 * 2. Then use the `useGoogleDrive` hook to request access to Google Drive.
 * 3. Finally call the methods on the `useGoogleDrive` hook to use the API.
 */
export function GoogleDriveProvider({
  children,
  apiKey,
  onUserDisconnect,
}: PropsWithChildren<{
  apiKey?: string;
  onUserDisconnect?: () => void;
}>) {
  const { state, changeStatus, raiseError } = useDriveState();
  const { status } = state;
  const initDriveImplicitFlow = useRef<() => void>(() => null);

  const [userDriveTokens, setUserTokens] = useState<TokenResponse>();
  const [tokensExpirationDate, setTokensExpirationDate] = useState<Date>();

  const { scriptLoadedSuccessfully } = useGoogleOAuth();

  async function handleGapiLoaded() {
    if (status !== "idle") return;

    try {
      await loadGapiScripts();
      await initGapiClient(apiKey);
      changeStatus("loaded");
    } catch (error) {
      if (error instanceof Error) raiseError(error);
      else raiseError(new Error("An unknown error occurred."));
    }
  }

  function setTokensAndAccess(newTokens: TokenResponse) {
    setTokensExpirationDate(new Date(Date.now() + newTokens.expires_in * 1000));
    setUserTokens(newTokens);
  }

  function clearTokensAndAccess() {
    setUserTokens(undefined);
  }

  function requestDriveAccess() {
    if (status !== "loaded") return;

    changeStatus("unauthorized");

    clearTokensAndAccess();
    initDriveImplicitFlow.current();
  }

  function onSuccess(tokenResponse: TokenResponse) {
    if (hasGrantedAnyScopeGoogle(tokenResponse, scope)) {
      setTokensAndAccess(tokenResponse);
      changeStatus("access");
    } else {
      clearTokensAndAccess();
      raiseError(new Error("Unauthorized."));
    }
  }

  function onError(errorResponse: NonOAuthError | Pick<TokenResponse, "error" | "error_description" | "error_uri">) {
    if ("type" in errorResponse) raiseError(errorResponse);
    else raiseError(new Error(errorResponse.error_description));

    clearTokensAndAccess();
  }

  function validateDriveAccess(): DriveAccessValidator {
    let errorMessage = "";

    if (status !== "access") {
      errorMessage = "No access.";
    } else if (!userDriveTokens) {
      clearTokensAndAccess();
      errorMessage = "User not authenticated.";
    } else if (!tokensExpirationDate || new Date() > tokensExpirationDate) {
      clearTokensAndAccess();
      errorMessage = "Session expired.";
    }

    if (errorMessage) return { hasAccess: false, error: new Error(errorMessage) };

    return { hasAccess: true };
  }

  function disconnectDrive() {
    if (status !== "access") return;

    changeStatus("loaded");

    clearTokensAndAccess();
    onUserDisconnect?.();
  }

  return (
    <googleDriveContext.Provider
      value={{ validateDriveAccess, requestDriveAccess, disconnectDrive, state, userDriveTokens }}
    >
      <Script src="https://apis.google.com/js/api.js" onLoad={handleGapiLoaded} />

      {scriptLoadedSuccessfully && apiKey && (
        <ImplicitFlow callback={initDriveImplicitFlow} onSuccess={onSuccess} onError={onError} />
      )}

      {children}
    </googleDriveContext.Provider>
  );
}

export function useGoogleDriveContext() {
  const context = useContext(googleDriveContext);

  if (!context) throw new Error("useGoogleDrive must be used within a GoogleDriveProvider");

  return context;
}
