import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 space-y-4">
      <h1 className="text-4xl font-bold text-green-700">Welcome to Circle</h1>

      {user && <p className="text-xl">Hello, {user.name}!</p>}

      <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
    </div>
  );
}
