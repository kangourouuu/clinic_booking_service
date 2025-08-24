import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiServices';

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPatient, setNewPatient] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: ''
    });

    const fetchPatients = async () => {
        try {
            const response = await adminService.getPatients();
            setPatients(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            await adminService.createPatient(newPatient);
            setNewPatient({ name: '', email: '', password: '', phone_number: '' });
            setShowCreateForm(false);
            fetchPatients();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Patient Management</h2>
            <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                {showCreateForm ? 'Cancel' : 'Create Patient'}
            </button>

            {showCreateForm && (
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h3 className="text-xl font-bold mb-4">Create New Patient</h3>
                    <form onSubmit={handleCreatePatient}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                            <input type="text" value={newPatient.name} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                            <input type="email" value={newPatient.email} onChange={(e) => setNewPatient({...newPatient, email: e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                            <input type="password" value={newPatient.password} onChange={(e) => setNewPatient({...newPatient, password: e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                            <input type="text" value={newPatient.phone_number} onChange={(e) => setNewPatient({...newPatient, phone_number: e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Submit</button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded my-6">
                <table className="min-w-max w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Id</th>
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-center">Email</th>
                            <th className="py-3 px-6 text-center">Phone</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {patients.map(patient => (
                            <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                    {patient.id}
                                </td>
                                <td className="py-3 px-6 text-left">
                                    {patient.name}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    {patient.email}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    {patient.phone_number}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">E</button>
                                        <button className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">D</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientManagement;
