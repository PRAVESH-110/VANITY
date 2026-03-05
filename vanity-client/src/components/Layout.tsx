import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded ${
      location.pathname.startsWith(path)
        ? "bg-blue-100 text-blue-600"
        : "hover:bg-gray-100"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold mb-8">
          LaunchForge 🚀
        </h2>

        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <Outlet />
      </div>

    </div>
  );
}
