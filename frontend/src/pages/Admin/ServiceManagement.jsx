import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/apiServices';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: '',
        service_category_id: ''
    });

    const fetchServices = async () => {
        try {
            // Assuming there is a function to get all services.
            // If not, this part needs to be adjusted.
            // For now, we'll work with an empty list and focus on creation.
            // const response = await adminService.getServices();
            // setServices(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleCreateService = async (e) => {
        e.preventDefault();
        try {
            await adminService.createService(newService);
            setNewService({ name: '', description: '', price: '', service_category_id: '' });
            setShowCreateForm(false);
            fetchServices();
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
                <h2 className="text-3xl font-bold">Service Management</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    {showCreateForm ? 'Cancel' : 'Create Service'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">Create New Service</h3>
                    <form onSubmit={handleCreateService}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input type="text" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <input type="text" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                <input type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Category ID</label>
                                <input type="text" value={newService.service_category_id} onChange={(e) => setNewService({ ...newService, service_category_category_id: e.target.value })} className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
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
                            <th className="py-3 px-6 text-left">Description</th>
                            <th className="py-3 px-6 text-center">Price</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {/* Service data will be mapped here */}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServiceManagement;
