import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import RightSidebar from '../components/RightSidebar';

export default function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      {/* Right Sidebar */}
      <RightSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main content area - adjust margin for sidebar */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'mr-16' : 'mr-64'
        }`}>
        <Outlet />
      </main>
    </div>
  );
}
