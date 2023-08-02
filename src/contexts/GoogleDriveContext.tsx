import { type PropsWithChildren, useState, createContext, useContext } from "react";
import { type NonOAuthError, type TokenResponse, useGoogleLogin, hasGrantedAnyScopeGoogle } from "@react-oauth/google";
import axios, { type AxiosRequestConfig, type AxiosResponse, type ResponseType } from "axios";

import { Script } from "src/components/common/Script";

type MetadataType = {
  name: string;
  mimeType: string;
  parents?: string[];
};
type FileParams = {
  id: string;
  file: File;
  metadata: MetadataType;
};

type FileResponseType = {
  json: JSON;
  blob: Blob;
  arraybuffer: ArrayBuffer;
  document: Document;
  text: string;
  stream: ReadableStream;
};
type FileDownloadResponse<T extends ResponseType> = T extends keyof FileResponseType
  ? FileResponseType[T] | GoogleDriveError | false
  : JSON | GoogleDriveError | false;
type FileUploadResponse = (FileUploadSuccess & GoogleDriveError) | false;
type FileDeletedResponse = GoogleDriveError | "";
type FilesListResponse = GoogleDriveError & gapi.client.drive.FileList;

type GoogleDriveContextType = {
  uploadFile(
    { file, metadata }: Omit<FileParams, "id">,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<FileUploadResponse, unknown>>;

  updateFile(
    { file, metadata }: FileParams,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<FileUploadResponse, unknown>>;

  fetchFileList(config?: AxiosRequestConfig): Promise<AxiosResponse<FilesListResponse, unknown>>;

  fetchFile<T extends ResponseType>(
    file: gapi.client.drive.File,
    config?: AxiosRequestConfig<T>,
  ): Promise<AxiosResponse<FileDownloadResponse<T>, unknown>>;

  deleteFile(
    file: gapi.client.drive.File,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<FileDeletedResponse, unknown>>;

  requestDriveAccess(): void;
  disconnectDrive(): void;

  hasDriveAccess: boolean;
  isDriveLoaded: boolean;
  isDriveAuthorizing: boolean;
  userDriveTokens?: TokenResponse;
  error: Error | NonOAuthError | null;
};

const notReadyMessage = "Google Drive is unavailable.";

const googleDriveContext = createContext<GoogleDriveContextType | null>(null);

const scope = "https://www.googleapis.com/auth/drive.appdata";
const spaces = "appDataFolder";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_API_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

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
  apiKey: string;
}>) {
  const [isDriveLoaded, setIsLoaded] = useState(false);
  const [isDriveAuthorizing, setIsDriveAuthorizing] = useState(false);
  const [hasDriveAccess, setHasAccess] = useState(false);
  const [userDriveTokens, setUserTokens] = useState<TokenResponse>();
  const [tokensExpirationDate, setTokensExpirationDate] = useState<Date>();
  const [error, setError] = useState<Error | NonOAuthError | null>(null);

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

  const initDriveImplicitFlow = useGoogleLogin({
    prompt: "",
    scope,
    onNonOAuthError(error) {
      clearTokensAndAccess();
      setIsDriveAuthorizing(false);
      setError(error);
    },
    onSuccess(tokenResponse: TokenResponse) {
      setTokensAndAccess(tokenResponse);
      setIsDriveAuthorizing(false);
      setError(null);
    },
    onError(errorResponse) {
      clearTokensAndAccess();
      setIsDriveAuthorizing(false);
      setError(new Error(errorResponse.error_description));
    },
  });

  function requestDriveAccess() {
    if (!isDriveLoaded) throw new Error(notReadyMessage);

    if (isDriveAuthorizing) return;

    setError(null);

    setIsDriveAuthorizing(true);
    initDriveImplicitFlow();
  }

  function disconnectDrive() {
    if (!isDriveLoaded) throw new Error(notReadyMessage);

    if (isDriveAuthorizing) return;

    clearTokensAndAccess();
    setIsDriveAuthorizing(false);
    setError(null);
  }

  function validateDriveAccess() {
    if (!isDriveLoaded) return new Error("Google Drive is not loaded.");

    if (!userDriveTokens || !tokensExpirationDate) return new Error("User not authenticated.");

    if (new Date() > tokensExpirationDate) {
      clearTokensAndAccess();
      return new Error("Session expired.");
    }

    if (!hasGrantedAnyScopeGoogle(userDriveTokens, scope)) return new Error("Unauthorized.");

    return null;
  }

  const uploadFile: GoogleDriveContextType["uploadFile"] = async ({ file, metadata }, config) => {
    const noAccess = validateDriveAccess();
    if (noAccess) return Promise.reject(noAccess);

    metadata.parents = [spaces];

    const body = new FormData();
    body.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    body.append("file", file);

    const request = axios.post<FileUploadResponse>(DRIVE_API_UPLOAD_URL, body, {
      params: { uploadType: "multipart" },
      headers: {
        Authorization: `Bearer ${userDriveTokens?.access_token}`,
      },
      ...config,
    });

    return request;
  };

  const updateFile: GoogleDriveContextType["updateFile"] = async ({ id, file, metadata }, config) => {
    const noAccess = validateDriveAccess();
    if (noAccess) return Promise.reject(noAccess);

    const formBody = new FormData();
    formBody.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formBody.append("file", file);

    const request = axios.patch<FileUploadResponse>(`${DRIVE_API_UPLOAD_URL}/${id}`, formBody, {
      params: { uploadType: "multipart" },
      headers: {
        Authorization: `Bearer ${userDriveTokens?.access_token}`,
      },
      ...config,
    });

    return request;
  };

  const fetchFile: GoogleDriveContextType["fetchFile"] = async (
    { id },
    { params, ...config }: AxiosRequestConfig = {},
  ) => {
    const noAccess = validateDriveAccess();
    if (noAccess) return Promise.reject(noAccess);

    const request = axios.get(`${DRIVE_API_URL}/${id}`, {
      params: { alt: "media", ...params },
      responseType: "arraybuffer",
      headers: {
        authorization: `Bearer ${userDriveTokens?.access_token}`,
      },
      ...config,
    });

    return request;
  };

  const fetchFileList: GoogleDriveContextType["fetchFileList"] = async ({
    params,
    ...config
  }: AxiosRequestConfig = {}) => {
    const noAccess = validateDriveAccess();
    if (noAccess) return Promise.reject(noAccess);

    console.log("Drive access validated. Requesting data...");

    const request = axios.get(DRIVE_API_URL, {
      params: {
        pageSize: 10,
        fields: "files(id, name, mimeType, hasThumbnail, thumbnailLink, iconLink, size)",
        spaces,
        oauth_token: userDriveTokens?.access_token,
        ...params,
      },
      ...config,
    });

    return request;
  };

  const deleteFile: GoogleDriveContextType["deleteFile"] = async ({ id }, config) => {
    const noAccess = validateDriveAccess();
    if (noAccess) return Promise.reject(noAccess);

    const request = axios.delete(`${DRIVE_API_URL}/${id}`, {
      headers: {
        authorization: `Bearer ${userDriveTokens?.access_token}`,
      },
      ...config,
    });

    return request;
  };

  return (
    <googleDriveContext.Provider
      value={{
        uploadFile,
        updateFile,
        fetchFileList,
        fetchFile,
        deleteFile,
        requestDriveAccess,
        disconnectDrive,
        isDriveLoaded,
        isDriveAuthorizing,
        hasDriveAccess,
        userDriveTokens,
        error,
      }}
    >
      <Script src="https://apis.google.com/js/api.js" onLoad={handleGapiLoaded} />
      {children}
    </googleDriveContext.Provider>
  );
}

export function useGoogleDrive() {
  const context = useContext(googleDriveContext);
  if (!context) throw new Error("useGoogleDrive must be used within a GoogleDriveProvider");

  return context;
}
