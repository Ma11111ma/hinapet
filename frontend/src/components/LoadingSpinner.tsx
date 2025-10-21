"use client";
//frontend/src/components/LoadingSpinner.tsx
export const LoadingSpinner = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin drop-shadow-md" />
    </div>
  );
};
