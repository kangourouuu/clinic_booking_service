import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
    const { theme } = useContext(ThemeContext);

    return (
        <div className={`flex min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;