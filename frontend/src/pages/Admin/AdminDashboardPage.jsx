import React, { useState } from 'react';
import { Users, Stethoscope, User, ClipboardList, LayoutDashboard } from 'lucide-react';
import PatientManagement from './PatientManagement';
import DoctorManagement from './DoctorManagement';
import NurseManagement from './NurseManagement';
import ServiceManagement from './ServiceManagement';
import { cn } from '../../utils/helpers';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('patients');

  const tabs = [
    { id: 'patients', label: 'Quản lý Bệnh nhân', icon: Users, component: <PatientManagement /> },
    { id: 'doctors', label: 'Quản lý Bác sĩ', icon: Stethoscope, component: <DoctorManagement /> },
    { id: 'nurses', label: 'Quản lý Y tá', icon: User, component: <NurseManagement /> },
    { id: 'services', label: 'Quản lý Dịch vụ', icon: ClipboardList, component: <ServiceManagement /> },
  ];

  const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white shadow-lg flex-shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200',
                  { 'bg-blue-50 text-blue-600 border-r-4 border-blue-500': activeTab === tab.id }
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        {activeComponent}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
