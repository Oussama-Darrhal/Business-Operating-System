import { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Edit3,
    Trash2,
    Search,
    MoreVertical,
    Shield,
    Settings,
    ChevronDown,
    ArrowUpDown,
    Download,
    Upload,
    RefreshCw
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { usePermission } from '../services/permissionService';

// Import the User interface from the API service
import { userApi, User, UserRole, CreateUserRequest, UpdateUserRequest } from '../services/userApi';

const statusOptions = ['active', 'inactive', 'pending'] as const;

const UsersManagementPage = () => {
    const { hasPermission } = usePermission();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // New user form data
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        role_id: '',
        status: 'active' as 'active' | 'inactive' | 'pending',
        password: '',
        password_confirmation: ''
    });

    // Load users and roles on component mount
    useEffect(() => {
        loadData();
    }, []);

    // Debug function to test API
    const testApi = async () => {
        console.log('Testing API connection...');
        try {
            const response = await fetch('http://localhost:8000/api/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            console.log('API Response:', data);
            console.log('Auth token:', localStorage.getItem('auth-token'));
        } catch (error) {
            console.error('API Test Error:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersResponse, rolesResponse] = await Promise.all([
                userApi.getUsers(),
                userApi.getRoles()
            ]);

            if (usersResponse.success && usersResponse.data) {
                setUsers(usersResponse.data);
            } else {
                setError(usersResponse.message || 'Failed to load users');
            }

            if (rolesResponse.success && rolesResponse.data) {
                setRoles(rolesResponse.data);
            } else {
                console.warn('Failed to load roles:', rolesResponse.message);
            }
        } catch (err) {
            setError('An unexpected error occurred while loading data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.id));
        }
    };

    const handleAddUser = async () => {
        if (!hasPermission('users', 'create')) {
            setError('You do not have permission to create users.');
            setTimeout(() => setError(null), 5000);
            return;
        }
        
        // Clear previous errors
        setError(null);
        
        // Validate required fields
        if (!newUser.name.trim()) {
            setError('Name is required');
            return;
        }
        if (!newUser.email.trim()) {
            setError('Email is required');
            return;
        }
        if (!newUser.password.trim()) {
            setError('Password is required');
            return;
        }
        if (!newUser.password_confirmation.trim()) {
            setError('Password confirmation is required');
            return;
        }
        if (newUser.password !== newUser.password_confirmation) {
            setError('Password and confirmation do not match');
            return;
        }
        if (!newUser.role_id) {
            setError('Please select a role');
            return;
        }

        setLoading(true);
        try {
            const createRequest: CreateUserRequest = {
                name: newUser.name.trim(),
                email: newUser.email.trim(),
                phone: newUser.phone?.trim() || undefined,
                password: newUser.password,
                password_confirmation: newUser.password_confirmation,
                role_id: parseInt(newUser.role_id, 10),
                status: newUser.status
            };

            console.log('Creating user with data:', { ...createRequest, password: '[HIDDEN]', password_confirmation: '[HIDDEN]' });
            console.log('Current auth token:', localStorage.getItem('auth-token'));
            console.log('Available roles:', roles);

            const response = await userApi.createUser(createRequest);
            
            console.log('Create user response:', response);
            console.log('Response success:', response.success);
            console.log('Response data:', response.data);
            console.log('Response message:', response.message);
            console.log('Response errors:', response.errors);
            
            if (response.success && response.data) {
                // Add the new user to the list
                setUsers(prevUsers => [...prevUsers, response.data!]);
                resetForm();
                setShowAddUserModal(false);
                setSuccess('User created successfully! They can now log in with their credentials.');
                setTimeout(() => setSuccess(null), 5000);
            } else {
                // Handle different types of errors
                if (response.errors) {
                    // Handle validation errors from Laravel
                    const errorMessages = Object.values(response.errors).flat();
                    setError(errorMessages.join(', '));
                } else if (response.message) {
                    setError(response.message);
                } else {
                    setError('Failed to create user. Please check your input and try again.');
                }
            }
        } catch (err) {
            console.error('Error creating user:', err);
            setError('An unexpected error occurred while creating user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

        const resetForm = () => {
        setNewUser({
            name: '',
            email: '',
            phone: '',
            role_id: '',
            status: 'active',
            password: '',
            password_confirmation: ''
        });
        setError(null); // Clear any previous errors
    };

    const handleEditUser = (user: User) => {
        if (!hasPermission('users', 'edit')) {
            setError('You do not have permission to edit users.');
            setTimeout(() => setError(null), 5000);
            return;
        }
        
        setEditingUser(user);
        setNewUser({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role_id: user.role_id || '',
            status: user.status,
            password: '',
            password_confirmation: ''
        });
        setShowAddUserModal(true);
    };

    const handleUpdateUser = async () => {
        if (!hasPermission('users', 'edit')) {
            setError('You do not have permission to edit users.');
            setTimeout(() => setError(null), 5000);
            return;
        }
        
        if (editingUser && newUser.name && newUser.email && newUser.role_id) {
            setLoading(true);
            try {
                const updateRequest: UpdateUserRequest = {
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone || undefined,
                    role_id: parseInt(newUser.role_id, 10),
                    status: newUser.status
                };

                // Only include password if it was provided
                if (newUser.password) {
                    updateRequest.password = newUser.password;
                    updateRequest.password_confirmation = newUser.password_confirmation;
                }

                const response = await userApi.updateUser(editingUser.id, updateRequest);
                
                if (response.success && response.data) {
            const updatedUsers = users.map(user =>
                        user.id === editingUser.id ? response.data! : user
            );
            setUsers(updatedUsers);
            setEditingUser(null);
                    resetForm();
            setShowAddUserModal(false);
                    setSuccess('User updated successfully!');
                    setTimeout(() => setSuccess(null), 5000);
                } else {
                    setError(response.message || 'Failed to update user');
                }
            } catch (err) {
                setError('An unexpected error occurred while updating user');
                console.error('Error updating user:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!hasPermission('users', 'delete')) {
            setError('You do not have permission to delete users.');
            setTimeout(() => setError(null), 5000);
            return;
        }
        
        if (confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            try {
                const response = await userApi.deleteUser(userId);
                
                if (response.success) {
        setUsers(users.filter(user => user.id !== userId));
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
                    setSuccess('User deleted successfully!');
                    setTimeout(() => setSuccess(null), 5000);
                } else {
                    setError(response.message || 'Failed to delete user');
                }
            } catch (err) {
                setError('An unexpected error occurred while deleting user');
                console.error('Error deleting user:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!hasPermission('users', 'delete')) {
            setError('You do not have permission to delete users.');
            setTimeout(() => setError(null), 5000);
            return;
        }
        
        if (selectedUsers.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
            setLoading(true);
            try {
                const response = await userApi.bulkDeleteUsers(selectedUsers);
                
                if (response.success) {
        setUsers(users.filter(user => !selectedUsers.includes(user.id)));
                    const deletedCount = selectedUsers.length;
        setSelectedUsers([]);
                    setSuccess(`${deletedCount} user(s) deleted successfully!`);
                    setTimeout(() => setSuccess(null), 5000);
                } else {
                    setError(response.message || 'Failed to delete users');
                }
            } catch (err) {
                setError('An unexpected error occurred while deleting users');
                console.error('Error deleting users:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Filter and sort users
    const filteredUsers = users
        .filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = !filterRole || user.role_name === filterRole;
            const matchesStatus = !filterStatus || user.status === filterStatus;
            return matchesSearch && matchesRole && matchesStatus;
        })
        .sort((a, b) => {
            let aVal: string | number = a[sortField as keyof User] as string | number;
            let bVal: string | number = b[sortField as keyof User] as string | number;

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (sortOrder === 'asc') {
                return (aVal || '') > (bVal || '') ? 1 : -1;
            } else {
                return (aVal || '') < (bVal || '') ? 1 : -1;
            }
        });

    const getRoleColor = (roleColor: string) => {
        // Use the role color from the backend, fallback to default colors for known roles
        const colorMap: Record<string, string> = {
            purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            green: 'bg-green-500/20 text-green-400 border-green-500/30',
            yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            red: 'bg-red-500/20 text-red-400 border-red-500/30',
            gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        };
        
        return colorMap[roleColor] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading && users.length === 0) {
        return (
            <Layout currentPage="users-management" breadcrumb={['Users Management']}>
                <div className="p-4 lg:p-6 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading users...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentPage="users-management" breadcrumb={['Users Management']}>
            <div className="p-4 lg:p-6">
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <button 
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-300"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="mb-6 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span>{success}</span>
                            <button 
                                onClick={() => setSuccess(null)}
                                className="text-green-400 hover:text-green-300"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
                    <div className="space-y-6">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">Users Management</h1>
                                <p className="text-gray-400">Manage your team members and their access permissions</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={testApi}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                                >
                                    🔧 Debug API
                                </button>
                                <PermissionGuard moduleId="users" permission="create">
                                    <button
                                        onClick={() => {
                                            setEditingUser(null);
                                            resetForm();
                                            setShowAddUserModal(true);
                                        }}
                                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Add New User
                                    </button>
                                </PermissionGuard>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Total Users</p>
                                        <h3 className="text-white text-2xl font-bold">{users.length}</h3>
                                    </div>
                                    <div className="p-3 bg-blue-500/20 rounded-xl">
                                        <Users className="h-6 w-6 text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Active Users</p>
                                        <h3 className="text-white text-2xl font-bold">{users.filter(u => u.status === 'active').length}</h3>
                                    </div>
                                    <div className="p-3 bg-green-500/20 rounded-xl">
                                        <Shield className="h-6 w-6 text-green-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Admins</p>
                                        <h3 className="text-white text-2xl font-bold">{users.filter(u => u.role_name?.toLowerCase().includes('admin')).length}</h3>
                                    </div>
                                    <div className="p-3 bg-purple-500/20 rounded-xl">
                                        <Settings className="h-6 w-6 text-purple-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">New This Month</p>
                                        <h3 className="text-white text-2xl font-bold">2</h3>
                                    </div>
                                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                                        <UserPlus className="h-6 w-6 text-yellow-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Actions */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                    {/* Search */}
                                    <div className="relative flex-1 min-w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    {/* Role Filter */}
                                    <div className="relative">
                                        <select
                                            value={filterRole}
                                            onChange={(e) => setFilterRole(e.target.value)}
                                            className="appearance-none bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pr-8 text-white focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="">All Roles</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.name}>{role.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="relative">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="appearance-none bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 pr-8 text-white focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="">All Status</option>
                                            {statusOptions.map(status => (
                                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {selectedUsers.length > 0 && (
                                        <PermissionGuard moduleId="users" permission="delete">
                                            <button
                                                onClick={handleBulkDelete}
                                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete ({selectedUsers.length})
                                            </button>
                                        </PermissionGuard>
                                    )}
                                    <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
                                        <Download className="h-4 w-4" />
                                        Export
                                    </button>
                                    <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200">
                                        <Upload className="h-4 w-4" />
                                        Import
                                    </button>
                                    <button 
                                        onClick={loadData}
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                                />
                                            </th>
                                            <th
                                                className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                                                onClick={() => handleSort('name')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    User
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </th>
                                            <th
                                                className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                                                onClick={() => handleSort('role')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Role
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </th>
                                            <th
                                                className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                                                onClick={() => handleSort('status')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Status
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </th>
                                            <th
                                                className="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                                                onClick={() => handleSort('joinDate')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    Join Date
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </th>
                                            <th className="text-left p-4 text-gray-300 font-medium">Last Active</th>
                                            <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => handleSelectUser(user.id)}
                                                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">{user.name}</p>
                                                            <p className="text-gray-400 text-sm">{user.email}</p>
                                                            {user.phone && <p className="text-gray-500 text-xs">{user.phone}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role_color)}`}>
                                                        {user.role_name}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-300">{user.created_at}</td>
                                                <td className="p-4 text-gray-400">{user.last_login_at}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <PermissionGuard moduleId="users" permission="edit">
                                                            <button
                                                                onClick={() => handleEditUser(user)}
                                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                                                                title="Edit user"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </button>
                                                        </PermissionGuard>
                                                        <PermissionGuard moduleId="users" permission="delete">
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                                                title="Delete user"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </PermissionGuard>
                                                        <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-lg transition-all duration-200">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center">
                                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-2">No users found</p>
                                    <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                                </div>
                            )}
                        </div>
                    </div>
            </div>
            
            {/* Add/Edit User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <p className="text-gray-400 mt-1">
                                {editingUser ? 'Update user information and permissions' : 'Create a new user account for your team'}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 ${
                                            !newUser.name.trim() ? 'border-red-500/50' : 'border-gray-600'
                                        }`}
                                        placeholder="John Smith"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 ${
                                            !newUser.email.trim() ? 'border-red-500/50' : 'border-gray-600'
                                        }`}
                                        placeholder="john@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={newUser.phone}
                                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Role *
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={newUser.role_id}
                                            onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                                            className={`w-full appearance-none px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:border-purple-500 ${
                                                !newUser.role_id ? 'border-red-500/50' : 'border-gray-600'
                                            }`}
                                            required
                                        >
                                            <option value="">Select a role *</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={newUser.status}
                                        onChange={(e) => setNewUser({ ...newUser, status: e.target.value as 'active' | 'inactive' | 'pending' })}
                                        className="w-full appearance-none px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {!editingUser && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 ${
                                                !newUser.password.trim() ? 'border-red-500/50' : 'border-gray-600'
                                            }`}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Confirm Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={newUser.password_confirmation}
                                            onChange={(e) => setNewUser({ ...newUser, password_confirmation: e.target.value })}
                                            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 ${
                                                !newUser.password_confirmation.trim() || newUser.password !== newUser.password_confirmation ? 'border-red-500/50' : 'border-gray-600'
                                            }`}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Role Permissions Info */}
                            {newUser.role_id && (
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <h4 className="text-white font-medium mb-2">Role Permissions</h4>
                                <div className="text-sm text-gray-400 space-y-1">
                                        {(() => {
                                            const selectedRole = roles.find(r => r.id === newUser.role_id);
                                            if (selectedRole) {
                                                return (
                                                    <>
                                                        <p>• <strong>{selectedRole.name}</strong></p>
                                                        {selectedRole.description && (
                                                            <p>• {selectedRole.description}</p>
                                                        )}
                                                        {selectedRole.is_custom && (
                                                            <p>• Custom role with specific permissions</p>
                                                        )}
                                                    </>
                                                );
                                            }
                                            return <p>Select a role to see permissions</p>;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowAddUserModal(false);
                                    setEditingUser(null);
                                    resetForm();
                                }}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingUser ? handleUpdateUser : handleAddUser}
                                disabled={loading || (!editingUser && (!newUser.name || !newUser.email || !newUser.password || !newUser.password_confirmation || !newUser.role_id))}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        {editingUser ? 'Updating...' : 'Creating...'}
                                    </div>
                                ) : (
                                    editingUser ? 'Update User' : 'Create User'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UsersManagementPage;
