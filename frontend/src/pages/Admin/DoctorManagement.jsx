import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiServices';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: ''
    });

    const fetchDoctors = async () => {
        try {
            const response = await adminService.getAllDoctors();
            setDoctors(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        try {
            await adminService.createDoctor(newDoctor);
            setNewDoctor({ name: '', email: '', password: '', phone_number: '' });
            setShowCreateForm(false);
            fetchDoctors();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteDoctor = async (id) => {
        try {
            await adminService.deleteDoctor(id);
            fetchDoctors();
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
                <h2 className="text-3xl font-bold">Doctor Management</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    {showCreateForm ? 'Cancel' : 'Create Doctor'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">Create New Doctor</h3>
                    <form onSubmit={handleCreateDoctor}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                                <input type="text" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <input type="email" value={newDoctor.email} onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                <input type="password" value={newDoctor.password} onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                                <input type="text" value={newDoctor.phone_number} onChange={(e) => setNewDoctor({ ...newDoctor, phone_number: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                        </div>
                        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">Submit</button>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Id</th>
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-center">Email</th>
                            <th className="py-3 px-6 text-center">Phone</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {doctors.map(doctor => (
                            <tr key={doctor.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{doctor.id}</td>
                                <td className="py-3 px-6 text-left">{doctor.name}</td>
                                <td className="py-3 px-6 text-center">{doctor.email}</td>
                                <td className="py-3 px-6 text-center">{doctor.phone_number}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2">E</button>
                                        <button onClick={() => handleDeleteDoctor(doctor.id)} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">D</button>
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

export default DoctorManagement;
