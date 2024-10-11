import axios, { type AxiosRequestConfig, type AxiosResponse, type ResponseType } from "axios";

import { useGoogleDriveContext } from "src/hooks/useGoogleDrive";

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
export type FilesListResponse = GoogleDriveError & gapi.client.drive.FileList;

const spaces = "appDataFolder";
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_API_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

type UploadFile = (
  { file, metadata }: Omit<FileParams, "id">,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileUploadResponse, unknown>>;

type UpdateFile = (
  { file, metadata }: FileParams,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileUploadResponse, unknown>>;

type FetchFileList = (config?: AxiosRequestConfig) => Promise<AxiosResponse<FilesListResponse, unknown>>;

type FetchFile = <T extends ResponseType>(
  file: gapi.client.drive.File,
  config?: AxiosRequestConfig<T>,
) => Promise<AxiosResponse<FileDownloadResponse<T>, unknown>>;

type DeleteFile = (
  file: gapi.client.drive.File,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<FileDeletedResponse, unknown>>;

export function useGoogleDriveAPI() {
  const { validateDriveAccess, userDriveTokens } = useGoogleDriveContext();

  const withValidation = async <T extends () => Promise<AxiosResponse>>(execute: T) => {
    const validation = validateDriveAccess();
    if (!validation.hasAccess) return Promise.reject(validation.error);

    return execute();
  };

  const uploadFile: UploadFile = async ({ file, metadata }, config) =>
    withValidation(() => {
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
    });

  const updateFile: UpdateFile = async ({ id, file, metadata }, config) =>
    withValidation(() => {
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
    });

  const fetchFile: FetchFile = async ({ id }, { params, ...config }: AxiosRequestConfig = {}) =>
    withValidation(() => {
      const request = axios.get(`${DRIVE_API_URL}/${id}`, {
        params: { alt: "media", ...params },
        responseType: "arraybuffer",
        headers: {
          authorization: `Bearer ${userDriveTokens?.access_token}`,
        },
        ...config,
      });

      return request;
    });

  const fetchFileList: FetchFileList = async ({ params, ...config }: AxiosRequestConfig = {}) =>
    withValidation(() => {
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
    });

  const deleteFile: DeleteFile = async ({ id }, config) =>
    withValidation(() => {
      const request = axios.delete(`${DRIVE_API_URL}/${id}`, {
        headers: {
          authorization: `Bearer ${userDriveTokens?.access_token}`,
        },
        ...config,
      });

      return request;
    });

  return {
    uploadFile,
    updateFile,
    fetchFileList,
    fetchFile,
    deleteFile,
  };
}
