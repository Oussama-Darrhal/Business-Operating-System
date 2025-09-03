import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { DashboardButton } from './ui/dashboard-button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
    Building,
    Search,
    Plus,
    Loader2,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Users
} from 'lucide-react';
import { smeApi, type AvailableSME, type SMEData } from '../services/smeApi';

interface SMESelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSMEConnected: (smeData: SMEData) => void;
}

type ViewMode = 'selection' | 'connect' | 'create';

const SMESelectionModal: React.FC<SMESelectionModalProps> = ({
    isOpen,
    onClose,
    onSMEConnected
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('selection');
    const [availableSMEs, setAvailableSMEs] = useState<AvailableSME[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSME, setSelectedSME] = useState<AvailableSME | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state for creating new SME
    const [newSMEData, setNewSMEData] = useState<Partial<SMEData>>({
        companyName: '',
        industry: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        timezone: 'UTC'
    });

    // Load available SMEs when modal opens
    useEffect(() => {
        if (isOpen && viewMode === 'selection') {
            loadAvailableSMEs();
        }
    }, [isOpen, viewMode]);

    // Clear message after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const loadAvailableSMEs = async () => {
        setIsLoading(true);
        try {
            const response = await smeApi.getAvailableSMEs();
            if (response.success && Array.isArray(response.data)) {
                setAvailableSMEs(response.data);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to load available SMEs' });
            }
        } catch (error) {
            console.error('Error loading available SMEs:', error);
            setMessage({ type: 'error', text: 'Failed to load available SMEs' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectToSME = async () => {
        if (!selectedSME) return;

        setIsLoading(true);
        try {
            const response = await smeApi.connectToSME(selectedSME.id);
            if (response.success) {
                setMessage({ type: 'success', text: 'Successfully connected to SME!' });
                // Fetch the full SME profile and pass it to parent
                const profileResponse = await smeApi.getProfile();
                if (profileResponse.success && profileResponse.data) {
                    onSMEConnected(profileResponse.data as SMEData);
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                }
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to connect to SME' });
            }
        } catch (error) {
            console.error('Error connecting to SME:', error);
            setMessage({ type: 'error', text: 'Failed to connect to SME' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSME = async () => {
        setIsLoading(true);
        try {
            const response = await smeApi.createSME(newSMEData);
            if (response.success) {
                setMessage({ type: 'success', text: 'SME creation will be available soon!' });
            } else {
                setMessage({ type: 'error', text: response.message || 'SME creation not available yet' });
            }
        } catch (error) {
            console.error('Error creating SME:', error);
            setMessage({ type: 'error', text: 'SME creation not available yet' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof SMEData, value: string) => {
        setNewSMEData(prev => ({ ...prev, [field]: value }));
    };

    const filteredSMEs = availableSMEs.filter(sme =>
        sme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sme.business_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sme.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBack = () => {
        setViewMode('selection');
        setSelectedSME(null);
        setMessage(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        {viewMode !== 'selection' && (
                            <button
                                onClick={handleBack}
                                className="p-1 hover:bg-gray-800 rounded"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        )}
                        <Building className="h-5 w-5" />
                        {viewMode === 'selection' && 'SME Connection Required'}
                        {viewMode === 'connect' && 'Connect to Existing SME'}
                        {viewMode === 'create' && 'Create New SME'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {viewMode === 'selection' && 'You need to connect to an SME to access the company profile. Choose an option below:'}
                        {viewMode === 'connect' && 'Select an existing SME to connect your account.'}
                        {viewMode === 'create' && 'Fill in the details to create a new SME (placeholder - will be implemented later).'}
                    </DialogDescription>
                </DialogHeader>

                {/* Success/Error Message */}
                {message && (
                    <div className={`rounded-lg p-4 flex items-center gap-3 ${
                        message.type === 'success'
                            ? 'bg-green-900/30 border border-green-700 text-green-400'
                            : 'bg-red-900/30 border border-red-700 text-red-400'
                    }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Selection View */}
                    {viewMode === 'selection' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DashboardButton
                                variant="primary"
                                size="lg"
                                onClick={() => setViewMode('connect')}
                                className="h-24 flex-col gap-2"
                            >
                                <Users className="h-8 w-8" />
                                <div className="text-center">
                                    <div className="font-medium">Connect to Existing SME</div>
                                    <div className="text-sm opacity-80">Join an existing company</div>
                                </div>
                            </DashboardButton>

                            <DashboardButton
                                variant="secondary"
                                size="lg"
                                onClick={() => setViewMode('create')}
                                className="h-24 flex-col gap-2"
                            >
                                <Plus className="h-8 w-8" />
                                <div className="text-center">
                                    <div className="font-medium">Create New SME</div>
                                    <div className="text-sm opacity-80">Start a new company profile</div>
                                </div>
                            </DashboardButton>
                        </div>
                    )}

                    {/* Connect to Existing SME View */}
                    {viewMode === 'connect' && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search SMEs by name, industry, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                                    <span className="ml-2 text-gray-400">Loading SMEs...</span>
                                </div>
                            )}

                            {/* SME List */}
                            {!isLoading && (
                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {filteredSMEs.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            No SMEs found matching your search.
                                        </div>
                                    ) : (
                                        filteredSMEs.map((sme) => (
                                            <div
                                                key={sme.id}
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                    selectedSME?.id === sme.id
                                                        ? 'border-blue-500 bg-blue-900/20'
                                                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                                                }`}
                                                onClick={() => setSelectedSME(sme)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-white">{sme.name}</h3>
                                                        <p className="text-sm text-gray-400 capitalize">{sme.business_type}</p>
                                                        <p className="text-sm text-gray-500">{sme.email}</p>
                                                        <p className="text-sm text-gray-500">{sme.city}, {sme.country}</p>
                                                    </div>
                                                    {selectedSME?.id === sme.id && (
                                                        <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Connect Button */}
                            {selectedSME && (
                                <div className="flex justify-end">
                                    <DashboardButton
                                        variant="primary"
                                        onClick={handleConnectToSME}
                                        disabled={isLoading}
                                        className="gap-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Users className="h-4 w-4" />
                                        )}
                                        {isLoading ? 'Connecting...' : 'Connect to SME'}
                                    </DashboardButton>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create New SME View */}
                    {viewMode === 'create' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="companyName" className="text-gray-400 mb-2">
                                        Company Name <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="companyName"
                                        value={newSMEData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        placeholder="Enter company name"
                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="industry" className="text-gray-400 mb-2">
                                        Industry <span className="text-red-400">*</span>
                                    </Label>
                                    <Select
                                        value={newSMEData.industry}
                                        onValueChange={(value) => handleInputChange('industry', value)}
                                    >
                                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                            <SelectValue placeholder="Select industry" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                            <SelectItem value="technology">Technology</SelectItem>
                                            <SelectItem value="healthcare">Healthcare</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="retail">Retail</SelectItem>
                                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                            <SelectItem value="education">Education</SelectItem>
                                            <SelectItem value="consulting">Consulting</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="description" className="text-gray-400 mb-2">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={newSMEData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Brief description of your company..."
                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email" className="text-gray-400 mb-2">
                                        Email <span className="text-red-400">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newSMEData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="company@example.com"
                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="text-gray-400 mb-2">
                                        Phone
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={newSMEData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="font-medium">Coming Soon</span>
                                </div>
                                <p className="text-yellow-400/80 text-sm mt-1">
                                    SME creation functionality will be implemented in a future update. 
                                    For now, you can only connect to existing SMEs.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <DashboardButton
                                    variant="primary"
                                    onClick={handleCreateSME}
                                    disabled={true}
                                    className="gap-2 opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create SME (Coming Soon)
                                </DashboardButton>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SMESelectionModal;
