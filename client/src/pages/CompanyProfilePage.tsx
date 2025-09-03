import { useState, useEffect } from 'react';
import {
    Building,
    Mail,
    Phone,
    MapPin,
    Edit,
    Save,
    X,
    Upload,
    Loader2,
    CheckCircle,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { DashboardButton } from '../components/ui/dashboard-button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PermissionGuard } from '../components/PermissionGuard';
import { usePermission } from '../services/permissionService';
import { smeApi, type SMEData } from '../services/smeApi';
import SMESelectionModal from '../components/SMESelectionModal';
import Layout from '../components/Layout';

const CompanyProfilePage = () => {
    const { hasPermission } = usePermission();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [hasSME, setHasSME] = useState<boolean | null>(null);
    const [showSMEModal, setShowSMEModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState<SMEData>({
        companyName: '',
        industry: '',
        description: '',
        foundedYear: '',
        companySize: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        timezone: '',
        currency: '',
        businessHours: '',
        taxId: '',
        logoUrl: undefined
    });

    // Original data for comparison
    const [originalData, setOriginalData] = useState<SMEData>(formData);

    // Validation errors
    const [errors, setErrors] = useState<Partial<Record<keyof SMEData, string>>>({});

    // Load company data on mount
    useEffect(() => {
        loadCompanyProfile();
    }, []);

    // Auto-hide save message after 5 seconds
    useEffect(() => {
        if (saveMessage) {
            const timer = setTimeout(() => setSaveMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [saveMessage]);

    const loadCompanyProfile = async () => {
        setIsLoading(true);
        try {
            const response = await smeApi.getProfile();
            if (response.success && response.data) {
                const smeData = response.data as SMEData;
                setFormData(smeData);
                setOriginalData(smeData);
                setHasSME(true);
            } else if (response.has_sme === false) {
                // User has no SME connected
                setHasSME(false);
                setShowSMEModal(true);
            } else {
                setSaveMessage({ type: 'error', text: response.message || 'Failed to load SME profile' });
                setHasSME(false);
            }
        } catch (error) {
            console.error('Error loading SME profile:', error);
            setSaveMessage({ type: 'error', text: 'Failed to load SME profile' });
            setHasSME(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof SMEData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear validation error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        setErrors(prev => ({ ...prev, logoUrl: undefined }));

        try {
            const response = await smeApi.uploadLogo(file);
            if (response.success && response.data && 'logoUrl' in response.data) {
                setFormData(prev => ({ ...prev, logoUrl: (response.data as SMEData).logoUrl }));
                setSaveMessage({ type: 'success', text: 'Logo uploaded successfully' });
            } else {
                setErrors(prev => ({ ...prev, logoUrl: response.message || 'Failed to upload logo' }));
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            setErrors(prev => ({ ...prev, logoUrl: 'Failed to upload logo' }));
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleRemoveLogo = async () => {
        try {
            const response = await smeApi.removeLogo();
            if (response.success) {
                setFormData(prev => ({ ...prev, logoUrl: undefined }));
                setSaveMessage({ type: 'success', text: 'Logo removed successfully' });
            }
        } catch (error) {
            console.error('Error removing logo:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof SMEData, string>> = {};

        // Required fields validation
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.address?.trim()) newErrors.address = 'Address is required';
        if (!formData.city?.trim()) newErrors.city = 'City is required';
        if (!formData.country?.trim()) newErrors.country = 'Country is required';

        // Optional field validations
        if (formData.website && !/^https?:\/\/.+/.test(formData.website) && !/^www\..+/.test(formData.website)) {
            newErrors.website = 'Please enter a valid website URL';
        }
        if (formData.foundedYear && (isNaN(Number(formData.foundedYear)) || Number(formData.foundedYear) < 1800 || Number(formData.foundedYear) > new Date().getFullYear())) {
            newErrors.foundedYear = 'Please enter a valid year';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartEdit = () => {
        if (!hasPermission('company-profile', 'edit')) {
            setSaveMessage({ type: 'error', text: 'You do not have permission to edit company profile.' });
            return;
        }
        setIsEditing(true);
        setSaveMessage(null);
    };

    const handleSave = async () => {
        if (!hasPermission('company-profile', 'edit')) {
            setSaveMessage({ type: 'error', text: 'You do not have permission to edit company profile.' });
            return;
        }
        
        if (!validateForm()) return;

        setIsSaving(true);
        setSaveMessage(null);

        try {
            const response = await smeApi.updateProfile(formData);
            if (response.success) {
                setOriginalData(formData);
                setIsEditing(false);
                setSaveMessage({ type: 'success', text: 'SME profile updated successfully' });
            } else {
                if (response.errors) {
                    setErrors(response.errors);
                }
                setSaveMessage({ type: 'error', text: response.message || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Error saving SME profile:', error);
            setSaveMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditing(false);
        setErrors({});
        setSaveMessage(null);
    };



    const handleSMEConnected = (smeData: SMEData) => {
        setFormData(smeData);
        setOriginalData(smeData);
        setHasSME(true);
        setShowSMEModal(false);
        setSaveMessage({ type: 'success', text: 'Successfully connected to SME!' });
    };



    return (
        <Layout currentPage="company-profile" breadcrumb={['System & Admin', 'Company Profile']}>
            <div className="p-3 sm:p-4 lg:p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Loading State */}
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center space-y-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                                    <p className="text-gray-400">Loading SME profile...</p>
                                </div>
                            </div>
                        ) : hasSME === false ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <Building className="h-16 w-16 text-gray-400" />
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No SME Connected</h3>
                                        <p className="text-gray-400 mb-4">You need to connect to an SME to access the company profile.</p>
                                        <DashboardButton
                                            variant="primary"
                                            onClick={() => setShowSMEModal(true)}
                                            className="gap-2"
                                        >
                                            <Building className="h-4 w-4" />
                                            Connect to SME
                                        </DashboardButton>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Success/Error Message */}
                                {saveMessage && (
                                    <div className={`rounded-lg p-4 flex items-center gap-3 ${saveMessage.type === 'success'
                                            ? 'bg-green-900/30 border border-green-700 text-green-400'
                                            : 'bg-red-900/30 border border-red-700 text-red-400'
                                        }`}>
                                        {saveMessage.type === 'success' ? (
                                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        )}
                                        <span>{saveMessage.text}</span>
                                    </div>
                                )}

                                {/* Page Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl font-bold text-white mb-2">Company Profile</h1>
                                        <p className="text-gray-400">Manage your company information and settings</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0">
                                        {isEditing ? (
                                            <>
                                                <DashboardButton
                                                    variant="help"
                                                    size="default"
                                                    onClick={handleCancel}
                                                    disabled={isSaving}
                                                    className="gap-2 w-full sm:w-auto justify-center"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Cancel
                                                </DashboardButton>
                                                <DashboardButton
                                                    variant="primary"
                                                    size="default"
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="gap-2 w-full sm:w-auto justify-center"
                                                >
                                                    {isSaving ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4" />
                                                    )}
                                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                                </DashboardButton>
                                            </>
                                        ) : (
                                            <PermissionGuard moduleId="company-profile" permission="edit">
                                                <DashboardButton
                                                    variant="primary"
                                                    size="default"
                                                    onClick={handleStartEdit}
                                                    className="gap-2 w-full sm:w-auto justify-center"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Edit Profile
                                                </DashboardButton>
                                            </PermissionGuard>
                                        )}
                                    </div>
                                </div>

                                {/* Company Information Cards */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Company Overview */}
                                    <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-white">Company Overview</h2>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {/* Company Name */}
                                                <div>
                                                    <Label htmlFor="companyName" className="text-gray-400 mb-2">
                                                        Company Name <span className="text-red-400">*</span>
                                                    </Label>
                                                    {isEditing ? (
                                                        <div>
                                                            <Input
                                                                id="companyName"
                                                                value={formData.companyName}
                                                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                                                placeholder="Enter company name"
                                                                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                                aria-invalid={!!errors.companyName}
                                                            />
                                                            {errors.companyName && (
                                                                <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                            <p className="text-white">{formData.companyName || 'Not set'}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Industry */}
                                                <div>
                                                    <Label htmlFor="industry" className="text-gray-400 mb-2">
                                                        Industry <span className="text-red-400">*</span>
                                                    </Label>
                                                    {isEditing ? (
                                                        <div>
                                                            <Select
                                                                value={formData.industry}
                                                                onValueChange={(value) => handleInputChange('industry', value)}
                                                            >
                                                                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                                                    <SelectValue placeholder="Select industry" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                                                    <SelectItem value="technology" className="text-white hover:bg-gray-700 focus:bg-gray-700">Technology</SelectItem>
                                                                    <SelectItem value="healthcare" className="text-white hover:bg-gray-700 focus:bg-gray-700">Healthcare</SelectItem>
                                                                    <SelectItem value="finance" className="text-white hover:bg-gray-700 focus:bg-gray-700">Finance</SelectItem>
                                                                    <SelectItem value="retail" className="text-white hover:bg-gray-700 focus:bg-gray-700">Retail</SelectItem>
                                                                    <SelectItem value="manufacturing" className="text-white hover:bg-gray-700 focus:bg-gray-700">Manufacturing</SelectItem>
                                                                    <SelectItem value="education" className="text-white hover:bg-gray-700 focus:bg-gray-700">Education</SelectItem>
                                                                    <SelectItem value="consulting" className="text-white hover:bg-gray-700 focus:bg-gray-700">Consulting</SelectItem>
                                                                    <SelectItem value="other" className="text-white hover:bg-gray-700 focus:bg-gray-700">Other</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            {errors.industry && (
                                                                <p className="text-red-400 text-sm mt-1">{errors.industry}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                            <p className="text-white">{formData.industry ? formData.industry.charAt(0).toUpperCase() + formData.industry.slice(1) : 'Not set'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <Label htmlFor="description" className="text-gray-400 mb-2">
                                                    Company Description
                                                </Label>
                                                {isEditing ? (
                                                    <Textarea
                                                        id="description"
                                                        value={formData.description}
                                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                                        placeholder="Describe your company and what you do..."
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 min-h-20"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                        <p className="text-white">{formData.description || 'No description provided'}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {/* Founded Year */}
                                                <div>
                                                    <Label htmlFor="foundedYear" className="text-gray-400 mb-2">
                                                        Founded Year
                                                    </Label>
                                                    {isEditing ? (
                                                        <div>
                                                            <Input
                                                                id="foundedYear"
                                                                type="number"
                                                                value={formData.foundedYear}
                                                                onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                                                                placeholder="e.g., 2020"
                                                                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                                min="1800"
                                                                max={new Date().getFullYear()}
                                                            />
                                                            {errors.foundedYear && (
                                                                <p className="text-red-400 text-sm mt-1">{errors.foundedYear}</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                            <p className="text-white">{formData.foundedYear || 'Not set'}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Company Size */}
                                                <div>
                                                    <Label htmlFor="companySize" className="text-gray-400 mb-2">
                                                        Company Size
                                                    </Label>
                                                    {isEditing ? (
                                                        <Select
                                                            value={formData.companySize}
                                                            onValueChange={(value) => handleInputChange('companySize', value)}
                                                        >
                                                            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                                                <SelectValue placeholder="Select company size" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                                                <SelectItem value="1-10" className="text-white hover:bg-gray-700 focus:bg-gray-700">1-10 employees</SelectItem>
                                                                <SelectItem value="10-50" className="text-white hover:bg-gray-700 focus:bg-gray-700">10-50 employees</SelectItem>
                                                                <SelectItem value="50-200" className="text-white hover:bg-gray-700 focus:bg-gray-700">50-200 employees</SelectItem>
                                                                <SelectItem value="200-1000" className="text-white hover:bg-gray-700 focus:bg-gray-700">200-1000 employees</SelectItem>
                                                                <SelectItem value="1000+" className="text-white hover:bg-gray-700 focus:bg-gray-700">1000+ employees</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                            <p className="text-white">{formData.companySize || 'Not set'}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Logo & Branding */}
                                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-white">Company Logo</h2>
                                        </div>

                                        <div className="text-center space-y-4">
                                            {/* Logo Display */}
                                            <div className="w-24 h-24 mx-auto bg-gray-700 rounded-xl flex items-center justify-center relative">
                                                {formData.logoUrl ? (
                                                    <>
                                                        <img
                                                            src={formData.logoUrl}
                                                            alt="Company Logo"
                                                            className="w-full h-full object-cover rounded-xl"
                                                        />
                                                        {isEditing && (
                                                            <button
                                                                onClick={handleRemoveLogo}
                                                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                                                            >
                                                                <Trash2 className="h-3 w-3 text-white" />
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Building className="h-12 w-12 text-gray-400" />
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-white font-medium mb-1">
                                                    {formData.logoUrl ? 'Company Logo' : 'Upload Logo'}
                                                </p>
                                                <p className="text-gray-400 text-sm">Max file size: 2MB</p>
                                                {errors.logoUrl && (
                                                    <p className="text-red-400 text-sm mt-1">{errors.logoUrl}</p>
                                                )}
                                            </div>

                                            {isEditing && (
                                                <div className="space-y-2">
                                                    <label htmlFor="logo-upload" className="block">
                                                        <DashboardButton
                                                            variant="primary"
                                                            size="sm"
                                                            className="w-full gap-2 cursor-pointer inline-flex items-center justify-center"
                                                            disabled={uploadingLogo}
                                                            asChild
                                                        >
                                                            <span className="inline-flex items-center gap-2">
                                                                {uploadingLogo ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Upload className="h-4 w-4" />
                                                                )}
                                                                <span>{uploadingLogo ? 'Uploading...' : 'Choose File'}</span>
                                                            </span>
                                                        </DashboardButton>
                                                    </label>
                                                    <input
                                                        id="logo-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleLogoUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-white">Contact Information</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Email */}
                                        <div>
                                            <Label htmlFor="email" className="text-gray-400 mb-2 flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email Address <span className="text-red-400">*</span>
                                            </Label>
                                            {isEditing ? (
                                                <div>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                                        placeholder="company@example.com"
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                        aria-invalid={!!errors.email}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.email || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <Label htmlFor="phone" className="text-gray-400 mb-2 flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Phone Number <span className="text-red-400">*</span>
                                            </Label>
                                            {isEditing ? (
                                                <div>
                                                    <Input
                                                        id="phone"
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                                        placeholder="+1 (555) 123-4567"
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                        aria-invalid={!!errors.phone}
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.phone || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Website */}
                                        <div>
                                                                                    <Label htmlFor="website" className="text-gray-400 mb-2">
                                                Website
                                            </Label>
                                            {isEditing ? (
                                                <div>
                                                    <Input
                                                        id="website"
                                                        type="url"
                                                        value={formData.website}
                                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                                        placeholder="www.company.com"
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                        aria-invalid={!!errors.website}
                                                    />
                                                    {errors.website && (
                                                        <p className="text-red-400 text-sm mt-1">{errors.website}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.website || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address Section */}
                                    <div className="mt-6 space-y-6">
                                        <div>
                                            <Label htmlFor="address" className="text-gray-400 mb-2 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Street Address <span className="text-red-400">*</span>
                                            </Label>
                                            {isEditing ? (
                                                <div>
                                                    <Input
                                                        id="address"
                                                        value={formData.address}
                                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                                        placeholder="123 Business Street, Suite 100"
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                        aria-invalid={!!errors.address}
                                                    />
                                                    {errors.address && (
                                                        <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.address || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* City */}
                                            <div>
                                                <Label htmlFor="city" className="text-gray-400 mb-2">
                                                    City <span className="text-red-400">*</span>
                                                </Label>
                                                {isEditing ? (
                                                    <div>
                                                        <Input
                                                            id="city"
                                                            value={formData.city}
                                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                                            placeholder="San Francisco"
                                                            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                            aria-invalid={!!errors.city}
                                                        />
                                                        {errors.city && (
                                                            <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                        <p className="text-white">{formData.city || 'Not set'}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* State */}
                                            <div>
                                                <Label htmlFor="state" className="text-gray-400 mb-2">
                                                    State/Province
                                                </Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="state"
                                                        value={formData.state}
                                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                                        placeholder="CA"
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                    />
                                                ) : (
                                                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                        <p className="text-white">{formData.state || 'Not set'}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Zip Code */}
                                            <div>
                                                <Label htmlFor="zipCode" className="text-gray-400 mb-2">
                                                    ZIP/Postal Code
                                                </Label>
                                                {isEditing ? (
                                                    <Input
                                                        id="zipCode"
                                                        value={formData.zipCode}
                                                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                                        placeholder="94105"
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                    />
                                                ) : (
                                                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                        <p className="text-white">{formData.zipCode || 'Not set'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Country */}
                                        <div>
                                            <Label htmlFor="country" className="text-gray-400 mb-2">
                                                Country <span className="text-red-400">*</span>
                                            </Label>
                                            {isEditing ? (
                                                <div>
                                                    <Input
                                                        id="country"
                                                        value={formData.country}
                                                        onChange={(e) => handleInputChange('country', e.target.value)}
                                                        placeholder="United States"
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                        aria-invalid={!!errors.country}
                                                    />
                                                    {errors.country && (
                                                        <p className="text-red-400 text-sm mt-1">{errors.country}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.country || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Business Settings */}
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-white">Business Settings</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Timezone */}
                                        <div>
                                            <Label htmlFor="timezone" className="text-gray-400 mb-2">
                                                Timezone
                                            </Label>
                                            {isEditing ? (
                                                <Select
                                                    value={formData.timezone}
                                                    onValueChange={(value) => handleInputChange('timezone', value)}
                                                >
                                                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                                        <SelectValue placeholder="Select timezone" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                                        <SelectItem value="America/New_York" className="text-white hover:bg-gray-700 focus:bg-gray-700">Eastern Time (UTC-5)</SelectItem>
                                                        <SelectItem value="America/Chicago" className="text-white hover:bg-gray-700 focus:bg-gray-700">Central Time (UTC-6)</SelectItem>
                                                        <SelectItem value="America/Denver" className="text-white hover:bg-gray-700 focus:bg-gray-700">Mountain Time (UTC-7)</SelectItem>
                                                        <SelectItem value="America/Los_Angeles" className="text-white hover:bg-gray-700 focus:bg-gray-700">Pacific Time (UTC-8)</SelectItem>
                                                        <SelectItem value="UTC" className="text-white hover:bg-gray-700 focus:bg-gray-700">UTC (GMT+0)</SelectItem>
                                                        <SelectItem value="Europe/London" className="text-white hover:bg-gray-700 focus:bg-gray-700">London (GMT+0)</SelectItem>
                                                        <SelectItem value="Europe/Paris" className="text-white hover:bg-gray-700 focus:bg-gray-700">Paris (GMT+1)</SelectItem>
                                                        <SelectItem value="Asia/Tokyo" className="text-white hover:bg-gray-700 focus:bg-gray-700">Tokyo (GMT+9)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.timezone || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Currency */}
                                        <div>
                                            <Label htmlFor="currency" className="text-gray-400 mb-2">
                                                Currency
                                            </Label>
                                            {isEditing ? (
                                                <Select
                                                    value={formData.currency}
                                                    onValueChange={(value) => handleInputChange('currency', value)}
                                                >
                                                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                                                        <SelectValue placeholder="Select currency" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                                        <SelectItem value="USD" className="text-white hover:bg-gray-700 focus:bg-gray-700">USD ($)</SelectItem>
                                                        <SelectItem value="EUR" className="text-white hover:bg-gray-700 focus:bg-gray-700">EUR (€)</SelectItem>
                                                        <SelectItem value="GBP" className="text-white hover:bg-gray-700 focus:bg-gray-700">GBP (£)</SelectItem>
                                                        <SelectItem value="CAD" className="text-white hover:bg-gray-700 focus:bg-gray-700">CAD (C$)</SelectItem>
                                                        <SelectItem value="AUD" className="text-white hover:bg-gray-700 focus:bg-gray-700">AUD (A$)</SelectItem>
                                                        <SelectItem value="JPY" className="text-white hover:bg-gray-700 focus:bg-gray-700">JPY (¥)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.currency || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Business Hours */}
                                        <div>
                                            <Label htmlFor="businessHours" className="text-gray-400 mb-2">
                                                Business Hours
                                            </Label>
                                            {isEditing ? (
                                                <Input
                                                    id="businessHours"
                                                    value={formData.businessHours}
                                                    onChange={(e) => handleInputChange('businessHours', e.target.value)}
                                                    placeholder="Monday - Friday: 9:00 AM - 5:00 PM"
                                                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                />
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.businessHours || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tax ID */}
                                        <div>
                                            <Label htmlFor="taxId" className="text-gray-400 mb-2">
                                                Tax ID
                                            </Label>
                                            {isEditing ? (
                                                <Input
                                                    id="taxId"
                                                    value={formData.taxId}
                                                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                                                    placeholder="XX-XXXXXXX"
                                                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                                                />
                                            ) : (
                                                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                                    <p className="text-white">{formData.taxId || 'Not set'}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
            </div>

            {/* SME Selection Modal */}
            <SMESelectionModal
                isOpen={showSMEModal}
                onClose={() => setShowSMEModal(false)}
                onSMEConnected={handleSMEConnected}
            />
        </Layout>
    );
};

export default CompanyProfilePage;
