type ErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div className="flex h-screen flex-1 items-center justify-center bg-slate-900 p-6">
      <div
        role="alert"
        className="flex h-fit w-full max-w-full flex-col flex-wrap gap-2 overflow-auto rounded-lg bg-red-800 p-4 shadow-md sm:w-2/3 md:w-1/2"
      >
        <h2 className="text-lg font-bold">Something went wrong:</h2>
        <code className="w-full rounded-md bg-red-900 p-2">
          {error.message}
        </code>
        <button
          className="rounded-md bg-red-400 p-2 hover:bg-red-300"
          role="button"
          onClick={resetErrorBoundary}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
