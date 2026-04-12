import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';

function Layout() {
  return (
    <div className="layout">
      <TopBar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
