'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          <button
            onClick={reset}
            className="bg-[#496f5d] text-white px-6 py-2 rounded-lg hover:bg-[#3d5c4d] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
