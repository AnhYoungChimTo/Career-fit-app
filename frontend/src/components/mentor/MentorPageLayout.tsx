import { useLocation } from 'react-router-dom';
import SidePanel from './SidePanel';

interface MentorPageLayoutProps {
  children: React.ReactNode;
}

const TAB_ROUTES: Record<string, string> = {
  '/mentor/profile': 'profile',
  '/mentor/mentees': 'mentees',
  '/mentor/calendar': 'calendar',
  '/mentor/earnings': 'earnings',
  '/mentor/reviews': 'reviews',
  '/mentor/availability': 'availability',
  '/mentor/inbox': 'inbox',
  '/mentor/lobby': 'lobby',
};

export default function MentorPageLayout({ children }: MentorPageLayoutProps) {
  const location = useLocation();
  const activeTab = TAB_ROUTES[location.pathname] || 'profile';

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <SidePanel activeTab={activeTab} onTabChange={() => {}} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
