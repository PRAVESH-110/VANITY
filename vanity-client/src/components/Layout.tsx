import { Outlet } from "react-router-dom";

/**
 * Layout is used only for the /projects/:id sub-route.
 * The Dashboard itself renders its own full sidebar layout.
 * This wrapper simply passes through to the Outlet.
 */
export default function Layout() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Outlet />
    </div>
  );
}
