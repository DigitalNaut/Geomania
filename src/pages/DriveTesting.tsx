import { type MouseEventHandler, useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";

import MainView from "src/components/layout/MainView";
import Button from "src/components/common/Button";
import { type FilesListResponse, useGoogleDriveAPI } from "src/hooks/useGoogleDriveAPI";
import { DriveAccessButton } from "src/components/drive/DriveAccess";

export default function DriveTestPage() {
  const [filesList, setFilesList] = useState<FilesListResponse>();
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fetchFileList, uploadFile, deleteFile } = useGoogleDriveAPI();

  const fetchFiles = useCallback(async () => {
    const fileList = await fetchFileList();
    setFilesList(fileList.data);
  }, [fetchFileList]);

  useEffect(() => {
    if (filesList) return;

    fetchFiles();
  }, [fetchFiles, filesList]);

  const clearFileInput = () => {
    if (!fileInputRef.current) return;

    fileInputRef.current.value = "";
  };

  const handleFileUpload: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    if (!fileInputRef.current?.files) return;

    const [file] = fileInputRef.current.files;

    if (!file) return;

    setIsBusy(true);
    await uploadFile({
      file,
      metadata: { name: file.name, mimeType: file.type },
    });
    clearFileInput();
    await fetchFiles();
    setIsBusy(false);
  };

  const handleFileDelete = async (id?: string) => {
    if (!id) return;

    setIsBusy(true);
    await deleteFile({ id });
    await fetchFiles();
    setIsBusy(false);
  };

  return (
    <MainView className="gap-2 sm:flex-col">
      <h1 className="text-2xl">Drive Test Page</h1>
      <section className="flex flex-col gap-1 bg-white/5 p-2">
        <DriveAccessButton />
        <h2 className="text-lg">Files on Drive: {filesList?.files?.length || "No files"}</h2>
        <div className="flex max-w-lg flex-col gap-2 p-2">
          {filesList?.files?.map((file, index) => (
            <div key={file.name} className="flex items-center justify-between gap-2 px-2 py-1 hover:bg-white/5">
              <span className="text-sm">{index + 1}.</span>
              {file.name}
              <span className="text-sm">ID: {file.id?.slice(-5)}</span>
              <button
                className="text-red-400 disabled:text-slate-400/40"
                onClick={() => handleFileDelete(file.id)}
                disabled={isBusy}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex gap-2 bg-white/5 p-2">
        <input type="file" ref={fileInputRef} />
        {fileInputRef.current && (
          <>
            <Button onClick={clearFileInput} disabled={isBusy}>
              <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button onClick={handleFileUpload} disabled={isBusy}>
              Upload
            </Button>
          </>
        )}
      </section>
    </MainView>
  );
}
