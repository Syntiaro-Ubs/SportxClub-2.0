import { useEffect } from "react";
import { useNavigate } from "react-router";

export function PlayerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/profile", { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen text-slate-500 bg-background">
      Redirecting to player profile...
    </div>
  );
}
