export default async function AuthLayout({
  children,
}: {
  children: React. ReactNode;
}) {
  // Remove session check from layout to prevent redirect loops
  // Let the middleware handle auth redirects instead
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}