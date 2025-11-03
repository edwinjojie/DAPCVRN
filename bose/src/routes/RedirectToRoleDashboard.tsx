import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_DASHBOARD_PATH } from '../lib/roles';

export default function RedirectToRoleDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else {
      const roleKey = (user.role || '').toLowerCase() as keyof typeof ROLE_DASHBOARD_PATH;
      const path = ROLE_DASHBOARD_PATH[roleKey] || '/login';
      navigate(path, { replace: true });
    }
  }, [user, navigate]);

  return null;
}


