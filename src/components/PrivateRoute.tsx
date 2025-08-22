// src/components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // 假设你有一个 auth hook

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    // 将当前URL保存到 localStorage，以便登录后重定向
    localStorage.setItem('redirectUrl', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
