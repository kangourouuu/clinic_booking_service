import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <div className="w-64 bg-white dark:bg-gray-800 shadow-md fixed h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    {import.meta.env.VITE_CLINIC_NAME}
                </h1>
                {user && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Welcome, {user.name}
                    </p>
                )}
            </div>
            <nav className="p-4">
                <ul className="space-y-2">
                    <li>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `block px-4 py-2 rounded ${isActive
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/patients"
                            className={({ isActive }) =>
                                `block px-4 py-2 rounded ${isActive
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`
                            }
                        >
                            Patients
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/appointments"
                            className={({ isActive }) =>
                                `block px-4 py-2 rounded ${isActive
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`
                            }
                        >
                            Appointments
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;