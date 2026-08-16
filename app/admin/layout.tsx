import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-root min-h-screen bg-zinc-950 text-white font-sans selection:bg-fuchsia-500">
      {children}
    </div>
  );
}