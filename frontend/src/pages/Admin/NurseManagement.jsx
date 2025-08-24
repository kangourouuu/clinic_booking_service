import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiServices';

const NurseManagement = () => {
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newNurse, setNewNurse] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: ''
    });

    const fetchNurses = async () => {
        try {
            const response = await adminService.getNurses();
            setNurses(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNurses();
    }, []);

    const handleCreateNurse = async (e) => {
        e.preventDefault();
        try {
            await adminService.createNurse(newNurse);
            setNewNurse({ name: '', email: '', password: '', phone_number: '' });
            setShowCreateForm(false);
            fetchNurses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteNurse = async (id) => {
        try {
            await adminService.deleteNurse(id);
            fetchNurses();
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
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Nurse Management</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    {showCreateForm ? 'Cancel' : 'Create Nurse'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">Create New Nurse</h3>
                    <form onSubmit={handleCreateNurse}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                                <input type="text" value={newNurse.name} onChange={(e) => setNewNurse({ ...newNurse, name: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <input type="email" value={newNurse.email} onChange={(e) => setNewNurse({ ...newNurse, email: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                <input type="password" value={newNurse.password} onChange={(e) => setNewNurse({ ...newNurse, password: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                                <input type="text" value={newNurse.phone_number} onChange={(e) => setNewNurse({ ...newNurse, phone_number: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                        </div>
                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Submit</button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
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
                        {nurses.map(nurse => (
                            <tr key={nurse.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{nurse.id}</td>
                                <td className="py-3 px-6 text-left">{nurse.name}</td>
                                <td className="py-3 px-6 text-center">{nurse.email}</td>
                                <td className="py-3 px-6 text-center">{nurse.phone_number}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button onClick={() => handleDeleteNurse(nurse.id)} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">D</button>
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

export default NurseManagement;