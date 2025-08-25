import React, { useState } from 'react';
import Modal from './Modal';
import { Input } from './Input';
import Button from './Button';
import { doctorService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const CreateDrugReceiptModal = ({ isOpen, onClose, queue, onReceiptCreated }) => {
    const [formData, setFormData] = useState({
        drug_name: '',
        usage_instructions: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const receiptData = {
                ...formData,
                queue_id: queue.queue_id,
                patient_id: queue.patient_id,
            };
            await doctorService.createDrugReceipt(receiptData);
            toast.success('Drug receipt created successfully!');
            onReceiptCreated();
            onClose();
        } catch (error) {
            toast.error('Failed to create drug receipt.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Drug Receipt">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="drug_name" className="block text-sm font-medium text-gray-700">Drug Name</label>
                    <Input
                        id="drug_name"
                        name="drug_name"
                        value={formData.drug_name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="usage_instructions" className="block text-sm font-medium text-gray-700">Usage Instructions</label>
                    <Input
                        id="usage_instructions"
                        name="usage_instructions"
                        value={formData.usage_instructions}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <Input
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>
                        {loading ? 'Creating...' : 'Create Receipt'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateDrugReceiptModal;
