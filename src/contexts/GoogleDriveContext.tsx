import type { PropsWithChildren } from "react";
import type { AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import type { NonOAuthError, TokenResponse } from "@react-oauth/google";
import { useState, createContext, useContext } from "react";
import { useGoogleLogin, hasGrantedAnyScopeGoogle } from "@react-oauth/google";
import axios from "axios";

import { Script } from "src/components/Script";

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
type FileDownloadResponse<T extends ResponseType> =
  T extends keyof FileResponseType
    ? FileResponseType[T] | GoogleDriveError | false
    : JSON | GoogleDriveError | false;
type FileUploadResponse = (FileUploadSuccess & GoogleDriveError) | false;
type FileDeletedResponse = GoogleDriveError | "";
export type FilesListResponse = GoogleDriveError & gapi.client.drive.FileList;

type GoogleDriveContextType = {
  uploadFile(
    { file, metadata }: Omit<FileParams, "id">,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<FileUploadResponse, unknown>>;

  updateFile(
    { file, metadata }: FileParams,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<FileUploadResponse, unknown>>;

  fetchFileList(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<FilesListResponse, unknown>>;

  fetchFile<T extends ResponseType>(
    file: gapi.client.drive.File,
    config?: AxiosRequestConfig<T>
  ): Promise<AxiosResponse<FileDownloadResponse<T>, unknown>>;

  deleteFile(
    file: gapi.client.drive.File,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<FileDeletedResponse, unknown>>;

  requestDriveAccess(): void;

  hasDriveAccess: boolean;
  isDriveLoaded: boolean;
  isDriveAuthorizing: boolean;
  userDriveTokens?: TokenResponse;
  nonDriveError: NonOAuthError | null;
  error: Error | null;
};

const notReadyErrorMsj = "Google Drive is uninitialized.";

const googleDriveContext = createContext<GoogleDriveContextType>({
  hasDriveAccess: false,
  uploadFile: () => Promise.reject(notReadyErrorMsj),
  updateFile: () => Promise.reject(notReadyErrorMsj),
  fetchFileList: () => Promise.reject(notReadyErrorMsj),
  fetchFile: () => Promise.reject(notReadyErrorMsj),
  deleteFile: () => Promise.reject(notReadyErrorMsj),
  requestDriveAccess: () => null,
  isDriveLoaded: false,
  isDriveAuthorizing: false,
  userDriveTokens: undefined,
  nonDriveError: null,
  error: null,
});

const scope = "https://www.googleapis.com/auth/drive.appdata";
const spaces = "appDataFolder";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
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
export function GoogleDriveProvider({ children }: PropsWithChildren) {
  const [isDriveLoaded, setIsLoaded] = useState(false);
  const [hasDriveAccess, setHasAccess] = useState(false);
  const [isDriveAuthorizing, setIsDriveAuthorizing] = useState(false);
  const [userDriveTokens, setUserTokens] = useState<TokenResponse>();
  const [tokensExpirationDate, setTokensExpirationDate] = useState<Date>();
  const [error, setError] = useState<Error | null>(null);
  const [nonDriveError, setNonDriveError] = useState<NonOAuthError | null>(
    null
  );

  async function initGapiClient() {
    try {
      await gapi.client.init({
        apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
      console.log("Google Drive API initialized.");
      setIsLoaded(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }
      console.log("Weird error was:", error);
      setIsLoaded(false);
    }
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
    onNonOAuthError: (error) => {
      clearTokensAndAccess();
      setIsDriveAuthorizing(false);
      setNonDriveError(error);
      setError(null);
    },
    onSuccess: (tokenResponse: TokenResponse) => {
      setTokensAndAccess(tokenResponse);
      setIsDriveAuthorizing(false);
      setNonDriveError(null);
      setError(null);
    },
    onError: (errorResponse) => {
      clearTokensAndAccess();
      setIsDriveAuthorizing(false);
      setNonDriveError(null);
      setError(new Error(errorResponse.error_description));
    },
    scope,
  });

  function requestDriveAccess() {
    if (!isDriveLoaded) throw new Error(notReadyErrorMsj);

    if (isDriveAuthorizing) return;

    setNonDriveError(null);
    setError(null);

    setIsDriveAuthorizing(true);
    initDriveImplicitFlow();
  }

  function validateAccess() {
    if (!isDriveLoaded) throw new Error("Google Drive is not loaded.");

    if (!userDriveTokens || !tokensExpirationDate) {
      throw new Error("User not authenticated.");
    }

    if (new Date() > tokensExpirationDate) {
      clearTokensAndAccess();
      throw new Error("Session expired.");
    }

    if (!hasGrantedAnyScopeGoogle(userDriveTokens, scope)) {
      throw new Error("Unauthorized.");
    }

    return true;
  }

  const uploadFile: GoogleDriveContextType["uploadFile"] = async (
    { file, metadata },
    config
  ) => {
    try {
      validateAccess();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }

    metadata.parents = [spaces];

    const body = new FormData();
    body.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
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

  const updateFile: GoogleDriveContextType["updateFile"] = async (
    { id, file, metadata },
    config
  ) => {
    try {
      validateAccess();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }

    const formBody = new FormData();
    formBody.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    formBody.append("file", file);

    const request = axios.patch<FileUploadResponse>(
      `${DRIVE_API_UPLOAD_URL}/${id}`,
      formBody,
      {
        params: { uploadType: "multipart" },
        headers: {
          Authorization: `Bearer ${userDriveTokens?.access_token}`,
        },
        ...config,
      }
    );

    return request;
  };

  const fetchFile: GoogleDriveContextType["fetchFile"] = async (
    { id },
    { params, ...config }: AxiosRequestConfig = {}
  ) => {
    try {
      validateAccess();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }

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
    try {
      validateAccess();
    } catch (error) {
      return Promise.reject(error);
    }

    console.log("Drive access validated. Requesting data...");

    const request = axios.get(DRIVE_API_URL, {
      params: {
        pageSize: 10,
        fields:
          "files(id, name, mimeType, hasThumbnail, thumbnailLink, iconLink, size)",
        spaces,
        oauth_token: userDriveTokens?.access_token,
        ...params,
      },
      ...config,
    });

    return request;
  };

  const deleteFile: GoogleDriveContextType["deleteFile"] = async (
    { id },
    config
  ) => {
    try {
      validateAccess();
    } catch (error) {
      return Promise.reject(error);
    }

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
        isDriveLoaded,
        isDriveAuthorizing,
        hasDriveAccess,
        userDriveTokens,
        nonDriveError,
        error,
      }}
    >
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={handleGapiLoaded}
      />
      {children}
    </googleDriveContext.Provider>
  );
}

/**
 * Provides a hook to access the Google Drive context
 */
export function useGoogleDrive() {
  const context = useContext(googleDriveContext);
  if (!context)
    throw new Error("useGoogleDrive must be used within a GoogleDriveContext");

  return context;
}
