import { type PropsWithChildren, useState, createContext, useContext, useRef } from "react";
import {
  type NonOAuthError,
  type TokenResponse,
  useGoogleLogin,
  hasGrantedAnyScopeGoogle,
  useGoogleOAuth,
} from "@react-oauth/google";

import { Script } from "src/components/common/Script";
import DriveSettingsHook from "src/components/drive/DriveSettingsHook";

type DriveAccessValidator = { hasAccess: true; error: undefined } | { hasAccess: false; error: Error };

type GoogleDriveContextType = {
  requestDriveAccess(): void;
  disconnectDrive(): void;
  validateDriveAccess(): DriveAccessValidator;
  hasDriveAccess: boolean;
  isDriveLoaded: boolean;
  isDriveAuthorizing: boolean;
  userDriveTokens?: TokenResponse;
  error: Error | NonOAuthError | null;
};

const googleDriveContext = createContext<GoogleDriveContextType | null>(null);

const notReadyMessage = "Google Drive is unavailable.";
const scope = "https://www.googleapis.com/auth/drive.appdata";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

type ConditionalHookProps = {
  onHasAccess: (fn: () => void) => void;
  onNonOAuthError?: ((nonOAuthError: NonOAuthError) => void) | undefined;
  onSuccess?: ((tokenResponse: Omit<TokenResponse, "error" | "error_description" | "error_uri">) => void) | undefined;
  onError?: ((errorResponse: Pick<TokenResponse, "error" | "error_description" | "error_uri">) => void) | undefined;
};

function ConditionalHook({ onHasAccess, onNonOAuthError, onSuccess, onError }: ConditionalHookProps) {
  const initDriveImplicitFlow = useGoogleLogin({
    prompt: "",
    scope,
    onNonOAuthError,
    onSuccess,
    onError,
  });

  onHasAccess(initDriveImplicitFlow);

  return null;
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
}: PropsWithChildren<{
  apiKey?: string;
}>) {
  const [isDriveLoaded, setIsLoaded] = useState(false);
  const [isDriveAuthorizing, setIsDriveAuthorizing] = useState(false);
  const [hasDriveAccess, setHasAccess] = useState(false);
  const [userDriveTokens, setUserTokens] = useState<TokenResponse>();
  const [tokensExpirationDate, setTokensExpirationDate] = useState<Date>();
  const [error, setError] = useState<Error | NonOAuthError | null>(null);
  const { setAutoConnectDrive } = DriveSettingsHook();

  const { scriptLoadedSuccessfully } = useGoogleOAuth();

  const initDriveImplicitFlow = useRef<() => void>(() => null);

  async function initGapiClient() {
    try {
      await gapi.client.init({
        apiKey,
        discoveryDocs: [DISCOVERY_DOC],
      });
    } catch (error) {
      if (error instanceof Error) setError(error);
      else setError(new Error("An unknown error occurred."));
    }

    setIsLoaded(true);
  }

  const handleGapiLoaded = () => {
    if (isDriveLoaded) return;

    gapi.load("client", initGapiClient);
  };

  function setTokensAndAccess(newTokens: TokenResponse) {
    setTokensExpirationDate(new Date(Date.now() + newTokens.expires_in * 1000));
    setUserTokens(newTokens);
    setHasAccess(hasGrantedAnyScopeGoogle(newTokens, scope));
  }

  function clearTokensAndAccess() {
    setUserTokens(undefined);
    setHasAccess(false);
  }

  function requestDriveAccess() {
    if (!isDriveLoaded) throw new Error(notReadyMessage);

    if (isDriveAuthorizing) return;

    setError(null);

    setIsDriveAuthorizing(true);
    initDriveImplicitFlow.current();
  }

  function disconnectDrive() {
    if (!isDriveLoaded) throw new Error(notReadyMessage);

    if (isDriveAuthorizing) return;

    clearTokensAndAccess();
    setIsDriveAuthorizing(false);
    setError(null);
    setAutoConnectDrive(false);
  }

  function validateDriveAccess(): DriveAccessValidator {
    if (!isDriveLoaded) return { hasAccess: false, error: new Error("Google Drive is not loaded.") };

    if (!userDriveTokens || !tokensExpirationDate)
      return { hasAccess: false, error: new Error("User not authenticated.") };

    if (new Date() > tokensExpirationDate) {
      clearTokensAndAccess();
      return { hasAccess: false, error: new Error("Session expired.") };
    }

    if (!hasGrantedAnyScopeGoogle(userDriveTokens, scope))
      return { hasAccess: false, error: new Error("Unauthorized.") };

    return { hasAccess: true, error: undefined };
  }

  function onNonOAuthError(error: NonOAuthError) {
    clearTokensAndAccess();
    setIsDriveAuthorizing(false);
    setError(error);
  }

  function onSuccess(tokenResponse: TokenResponse) {
    setTokensAndAccess(tokenResponse);
    setIsDriveAuthorizing(false);
    setError(null);
  }

  function onError(errorResponse: Pick<TokenResponse, "error" | "error_description" | "error_uri">) {
    clearTokensAndAccess();
    setIsDriveAuthorizing(false);
    setError(new Error(errorResponse.error_description));
  }

  return (
    <googleDriveContext.Provider
      value={{
        validateDriveAccess,
        requestDriveAccess,
        disconnectDrive,
        isDriveLoaded,
        isDriveAuthorizing,
        hasDriveAccess,
        userDriveTokens,
        error,
      }}
    >
      {scriptLoadedSuccessfully && apiKey && (
        <>
          <Script src="https://apis.google.com/js/api.js" onLoad={handleGapiLoaded} />
          <ConditionalHook
            onHasAccess={(fn) => (initDriveImplicitFlow.current = fn)}
            onSuccess={onSuccess}
            onError={onError}
            onNonOAuthError={onNonOAuthError}
          />
        </>
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
