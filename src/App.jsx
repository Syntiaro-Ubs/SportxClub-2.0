import { RouterProvider } from "react-router";
import { ThemeProvider } from "./app/providers/theme-provider";
import { AuthProvider } from "./app/providers/auth-provider";
import { router } from "./routes";

import { Toaster } from "sonner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AuthProvider>
    </ThemeProvider>
  );
}
