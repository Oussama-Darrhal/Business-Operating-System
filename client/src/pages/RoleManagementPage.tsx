import { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Edit3,
    Trash2,
    Search,
    Users,
    Eye,
    Edit,
    UserPlus,
    Trash,
    Save,
    Copy,
    ArrowRight,
    AlertTriangle,
    X
} from 'lucide-react';
import Layout from '../components/Layout';
import { PermissionGuard } from '../components/PermissionGuard';
import { usePermission } from '../services/permissionService';
import { roleApi, Role, Module, PermissionType } from '../services/roleApi';



const RoleManagementPage = () => {
    const { hasPermission } = usePermission();
    const [roles, setRoles] = useState<Role[]>([]);
    const [availableModules, setAvailableModules] = useState<Module[]>([]);
    const [groupedModules, setGroupedModules] = useState<Record<string, Module[]>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [showInheritanceModal, setShowInheritanceModal] = useState(false);
    const [inheritingFromRole, setInheritingFromRole] = useState<Role | null>(null);
    
    // New state for delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    
    // New state for user reassignment modal
    const [showUserReassignmentModal, setShowUserReassignmentModal] = useState(false);
    const [roleForReassignment, setRoleForReassignment] = useState<Role | null>(null);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [selectedReassignmentRole, setSelectedReassignmentRole] = useState<string>('');
    const [reassignmentLoading, setReassignmentLoading] = useState(false);

    // New role form data
    const [newRole, setNewRole] = useState({
        name: '',
        description: '',
        color: 'blue',
        permissions: {} as Record<string, PermissionType[]>
    });

    // Load roles and modules on component mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load roles and modules in parallel
            const [rolesResponse, modulesResponse] = await Promise.all([
                roleApi.getRoles(),
                roleApi.getModules()
            ]);

            if (rolesResponse.success && rolesResponse.data) {
                setRoles(rolesResponse.data);
            } else {
                console.error('Failed to load roles:', rolesResponse.message);
            }

            if (modulesResponse.success && modulesResponse.data) {
                // Convert modules to flat array and set grouped modules
                const modulesByCategory = modulesResponse.data.modules;
                const flatModules: Module[] = [];
                
                Object.entries(modulesByCategory).forEach(([category, categoryModules]) => {
                    categoryModules.forEach(module => {
                        flatModules.push({ ...module, category });
                    });
                });

                setAvailableModules(flatModules);
                setGroupedModules(modulesByCategory);
            } else {
                console.error('Failed to load modules:', modulesResponse.message);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColorClasses = (color: string) => {
        const colorMap = {
            purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            green: 'bg-green-500/20 text-green-400 border-green-500/30',
            orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            red: 'bg-red-500/20 text-red-400 border-red-500/30',
            gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.blue;
    };

    const getPermissionIcon = (permission: PermissionType) => {
        switch (permission) {
            case 'view': return <Eye className="h-3 w-3" />;
            case 'create': return <UserPlus className="h-3 w-3" />;
            case 'edit': return <Edit className="h-3 w-3" />;
            case 'delete': return <Trash className="h-3 w-3" />;
        }
    };

    const getPermissionColor = (permission: PermissionType) => {
        switch (permission) {
            case 'view': return 'text-blue-400';
            case 'create': return 'text-green-400';
            case 'edit': return 'text-yellow-400';
            case 'delete': return 'text-red-400';
        }
    };

    const handleInheritRole = (role: Role) => {
        if (!hasPermission('roles', 'create')) {
            alert('You do not have permission to create roles.');
            return;
        }
        
        setInheritingFromRole(role);
        setShowInheritanceModal(true);
    };

    const handleConfirmInheritance = () => {
        if (!inheritingFromRole) return;

        // Set the new role data with inherited permissions
        const inheritedPermissions: Record<string, PermissionType[]> = {};
        
        // Copy all permissions from the inherited role
        inheritingFromRole.permissions.forEach(permission => {
            inheritedPermissions[permission.module_id] = [...permission.permissions];
        });

        setNewRole({
            name: '',
            description: '',
            color: inheritingFromRole.color, // Inherit the color too
            permissions: inheritedPermissions
        });

        setShowInheritanceModal(false);
        setInheritingFromRole(null);
        setShowRoleModal(true);
    };

    const handleCreateRole = () => {
        if (!hasPermission('roles', 'create')) {
            alert('You do not have permission to create roles.');
            return;
        }
        
        setEditingRole(null);
        setNewRole({
            name: '',
            description: '',
            color: 'blue',
            permissions: {}
        });
        setShowRoleModal(true);
    };

    const handleEditRole = (role: Role) => {
        if (!hasPermission('roles', 'edit')) {
            alert('You do not have permission to edit roles.');
            return;
        }
        
        setEditingRole(role);
        const permissionsMap: Record<string, PermissionType[]> = {};
        role.permissions.forEach(p => {
            permissionsMap[p.module_id] = p.permissions;
        });
        setNewRole({
            name: role.name,
            description: role.description,
            color: role.color,
            permissions: permissionsMap
        });
        setShowRoleModal(true);
    };

    const handleSaveRole = async () => {
        const requiredPermission = editingRole ? 'edit' : 'create';
        if (!hasPermission('roles', requiredPermission)) {
            alert(`You do not have permission to ${editingRole ? 'edit' : 'create'} roles.`);
            return;
        }
        
        if (!newRole.name.trim()) return;

        // Add loading state
        const saveButton = document.querySelector('[data-save-role]') as HTMLButtonElement;
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ${editingRole ? 'Updating...' : 'Creating...'}
            `;
        }

        try {
            if (editingRole) {
                // Update existing role
                const response = await roleApi.updateRole(editingRole.id, {
                    name: newRole.name,
                    description: newRole.description,
                    color: newRole.color,
                    permissions: newRole.permissions
                });

                if (response.success && response.data) {
                    setRoles(roles.map(role => 
                        role.id === editingRole.id ? response.data! : role
                    ));
                    setShowRoleModal(false);
                    setEditingRole(null);
                } else {
                    alert(response.message || 'Failed to update role');
                }
            } else {
                // Create new role
                const response = await roleApi.createRole({
                    name: newRole.name,
                    description: newRole.description,
                    color: newRole.color,
                    permissions: newRole.permissions
                });

                if (response.success && response.data) {
                    setRoles([...roles, response.data]);
                    setShowRoleModal(false);
                    setEditingRole(null);
                } else {
                    alert(response.message || 'Failed to create role');
                }
            }
        } catch (error) {
            console.error('Failed to save role:', error);
            alert('Failed to save role. Please try again.');
        } finally {
            // Reset button state
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.innerHTML = `
                    <Save className="h-4 w-4" />
                    ${editingRole ? 'Update Role' : 'Create Role'}
                `;
            }
        }
    };

    const handleDeleteRole = async (role: Role) => {
        if (!hasPermission('roles', 'delete')) {
            alert('You do not have permission to delete roles.');
            return;
        }
        
        // If role has users, show reassignment modal directly
        if (role.user_count > 0) {
            setRoleForReassignment(role);
            setAvailableRoles(roles.filter(r => r.id !== role.id && r.is_custom));
            setSelectedReassignmentRole('');
            setShowUserReassignmentModal(true);
            return;
        }
        
        // Show confirmation dialog
        setRoleToDelete(role);
        setDeleteError(null);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteRole = async () => {
        if (!roleToDelete) return;
        
        try {
            const response = await roleApi.deleteRole(roleToDelete.id);
            if (response.success) {
                setRoles(roles.filter(role => role.id !== roleToDelete.id));
                setSelectedRoles(selectedRoles.filter(id => id !== roleToDelete.id));
                setShowDeleteConfirm(false);
                setRoleToDelete(null);
                
                // Show success message
                alert('Role deleted successfully!');
            } else {
                setDeleteError(response.message || 'Failed to delete role');
            }
        } catch (error: unknown) {
            console.error('Failed to delete role:', error);
            let errorMessage = 'Failed to delete role';
            
            if (error && typeof error === 'object' && 'response' in error) {
                const response = (error as { response?: { data?: { message?: string } } }).response;
                if (response?.data?.message) {
                    errorMessage = response.data.message;
                }
            }
            
            setDeleteError(errorMessage);
        }
    };

    const handleUserReassignment = async () => {
        if (!roleForReassignment || !selectedReassignmentRole) return;
        
        setReassignmentLoading(true);
        try {
            // Call API to reassign users
            const response = await roleApi.reassignUsers(roleForReassignment.id, selectedReassignmentRole);
            
            if (response.success) {
                // Update the roles list to reflect the changes
                setRoles(roles.map(role => {
                    if (role.id === roleForReassignment.id) {
                        return { ...role, user_count: 0 };
                    }
                    if (role.id === selectedReassignmentRole) {
                        return { ...role, user_count: role.user_count + roleForReassignment.user_count };
                    }
                    return role;
                }));
                
                // Close modal and show success message
                setShowUserReassignmentModal(false);
                setRoleForReassignment(null);
                setSelectedReassignmentRole('');
                
                // Show success message
                alert(`Successfully reassigned ${roleForReassignment.user_count} user(s) to the new role.`);
                
                // Now show the delete confirmation again
                setRoleToDelete(roleForReassignment);
                setDeleteError(null);
                setShowDeleteConfirm(true);
            } else {
                alert(response.message || 'Failed to reassign users');
            }
        } catch (error) {
            console.error('Failed to reassign users:', error);
            alert('Failed to reassign users. Please try again.');
        } finally {
            setReassignmentLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!hasPermission('roles', 'delete')) {
            alert('You do not have permission to delete roles.');
            return;
        }
        
        if (selectedRoles.length === 0) return;

        // Determine which selected roles are eligible for deletion
        const selectedRoleObjects = roles.filter(r => selectedRoles.includes(r.id));
        const ineligibleRoles = selectedRoleObjects.filter(r => !r.is_custom || r.user_count > 0);
        const eligibleRoles = selectedRoleObjects.filter(r => r.is_custom && r.user_count === 0);

        if (ineligibleRoles.length > 0) {
            const reasons = ineligibleRoles.map(r => `- ${r.name}: ${!r.is_custom ? 'system role (cannot be deleted)' : `${r.user_count} user(s) assigned`}`).join('\n');
            alert(`Some selected roles cannot be deleted:\n\n${reasons}\n\nOnly roles with no assigned users and marked as custom can be deleted.`);
        }

        if (eligibleRoles.length === 0) {
            // Nothing to delete after filtering
            return;
        }

        // Show confirmation for bulk delete of only eligible roles
        if (window.confirm(`Are you sure you want to delete ${eligibleRoles.length} eligible role(s)? This will skip protected or assigned roles. This action cannot be undone.`)) {
            // Find the bulk delete button and show loading state
            const bulkDeleteButton = document.querySelector('[data-bulk-delete]') as HTMLButtonElement;
            if (bulkDeleteButton) {
                bulkDeleteButton.disabled = true;
                bulkDeleteButton.innerHTML = `
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                `;
            }

            try {
                const response = await roleApi.bulkDeleteRoles(eligibleRoles.map(r => r.id));
                if (response.success) {
                    setRoles(roles.filter(role => !eligibleRoles.some(er => er.id === role.id)));
                    setSelectedRoles([]);
                    
                    // Show success message
                    if (response.data?.deleted_count) {
                        alert(`Successfully deleted ${response.data.deleted_count} role(s).`);
                    }
                    
                    // Show any errors
                    if (response.data?.errors && response.data.errors.length > 0) {
                        alert(`Some roles could not be deleted:\n${response.data.errors.join('\n')}`);
                    }
                } else {
                    alert(response.message || 'Failed to delete roles');
                }
            } catch (error: unknown) {
                console.error('Failed to bulk delete roles:', error);
                alert('Failed to delete roles. Please try again.');
            } finally {
                // Reset button state
                if (bulkDeleteButton) {
                    bulkDeleteButton.disabled = false;
                    bulkDeleteButton.innerHTML = `
                        <Trash2 className="h-4 w-4" />
                        Delete (0)
                    `;
                }
            }
        }
    };

    const togglePermission = (moduleId: string, permission: PermissionType) => {
        const currentPerms = newRole.permissions[moduleId] || [];
        let newPerms: PermissionType[];

        if (currentPerms.includes(permission)) {
            newPerms = currentPerms.filter(p => p !== permission);
        } else {
            newPerms = [...currentPerms, permission];
        }

        setNewRole({
            ...newRole,
            permissions: {
                ...newRole.permissions,
                [moduleId]: newPerms
            }
        });
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );



    if (loading) {
        return (
            <Layout currentPage="role-management" breadcrumb={['System & Admin', 'Role Management']}>
                <div className="p-4 lg:p-6">
                    <div className="space-y-6">
                        {/* Loading Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="h-8 w-64 bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                                <div className="h-5 w-80 bg-gray-700 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="h-10 w-40 bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>

                        {/* Loading Rules Info */}
                        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-4 border border-blue-700/30">
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 bg-blue-400/30 rounded-full animate-pulse mt-0.5"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 w-48 bg-blue-400/20 rounded-lg animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-80 bg-blue-400/20 rounded-lg animate-pulse"></div>
                                        <div className="h-4 w-72 bg-blue-400/20 rounded-lg animate-pulse"></div>
                                        <div className="h-4 w-76 bg-blue-400/20 rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="h-4 w-24 bg-gray-700 rounded-lg animate-pulse"></div>
                                            <div className="h-8 w-16 bg-gray-700 rounded-lg animate-pulse"></div>
                                        </div>
                                        <div className="h-12 w-12 bg-gray-700 rounded-xl animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Loading Search Bar */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="h-10 w-full bg-gray-700 rounded-lg animate-pulse"></div>
                        </div>

                        {/* Loading Role Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
                                                <div className="h-6 w-24 bg-gray-700 rounded-full animate-pulse"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-8 bg-gray-700 rounded-lg animate-pulse"></div>
                                                <div className="h-8 w-8 bg-gray-700 rounded-lg animate-pulse"></div>
                                                <div className="h-8 w-8 bg-gray-700 rounded-lg animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="h-4 w-full bg-gray-700 rounded-lg animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-20 bg-gray-700 rounded-lg animate-pulse"></div>
                                            <div className="h-4 w-24 bg-gray-700 rounded-lg animate-pulse"></div>
                                            <div className="h-4 w-16 bg-gray-700 rounded-lg animate-pulse"></div>
                                        </div>
                                        <div className="h-4 w-32 bg-gray-700 rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout currentPage="role-management" breadcrumb={['System & Admin', 'Role Management']}>
            <div className="p-4 lg:p-6">
                <div className="space-y-6">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Role Management</h1>
                            <p className="text-gray-400">Create and manage user roles with granular permissions</p>
                        </div>
                        <PermissionGuard moduleId="roles" permission="create">
                            <button
                                onClick={handleCreateRole}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                            >
                                <Plus className="h-4 w-4" />
                                Create New Role
                            </button>
                        </PermissionGuard>
                    </div>

                    {/* Role Deletion Rules Info */}
                    <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-4 border border-blue-700/30">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-white font-medium mb-2">Role Deletion Rules</h3>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                        <span><strong>System Roles:</strong> Cannot be deleted (Super Admin, Manager, Employee, Viewer)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                        <span><strong>Roles with Users:</strong> Must reassign users before deletion</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span><strong>Custom Roles:</strong> Can be deleted if no users are assigned</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Total Roles</p>
                                    <h3 className="text-white text-2xl font-bold">{roles.length}</h3>
                                </div>
                                <div className="p-3 bg-purple-500/20 rounded-xl">
                                    <Shield className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Custom Roles</p>
                                    <h3 className="text-white text-2xl font-bold">{roles.filter(r => r.is_custom).length}</h3>
                                </div>
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <Edit3 className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Total Users</p>
                                    <h3 className="text-white text-2xl font-bold">{roles.reduce((sum, role) => sum + role.user_count, 0)}</h3>
                                </div>
                                <div className="p-3 bg-green-500/20 rounded-xl">
                                    <Users className="h-6 w-6 text-green-400" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Modules</p>
                                    <h3 className="text-white text-2xl font-bold">{availableModules.length}</h3>
                                </div>
                                <div className="p-3 bg-orange-500/20 rounded-xl">
                                    <Shield className="h-6 w-6 text-orange-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Actions */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            <div className="relative flex-1 min-w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search roles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                />
                            </div>

                            {selectedRoles.length > 0 && (
                                <PermissionGuard moduleId="roles" permission="delete">
                                    <button
                                        onClick={handleBulkDelete}
                                        data-bulk-delete
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete ({selectedRoles.length})
                                    </button>
                                </PermissionGuard>
                            )}
                        </div>
                    </div>

                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRoles.map((role) => (
                            <div key={role.id} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoles.includes(role.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedRoles([...selectedRoles, role.id]);
                                                        } else {
                                                            setSelectedRoles(selectedRoles.filter(id => id !== role.id));
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                                />
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClasses(role.color)}`}>
                                                {role.name}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <PermissionGuard moduleId="roles" permission="edit">
                                                <button
                                                    onClick={() => handleEditRole(role)}
                                                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                                                    title="Edit role"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                            </PermissionGuard>
                                            {role.is_custom && (
                                                <PermissionGuard moduleId="roles" permission="delete">
                                                    <button
                                                        onClick={() => handleDeleteRole(role)}
                                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                                        title={role.user_count > 0 
                                                            ? `Cannot delete: ${role.user_count} user(s) assigned. Reassign users first.`
                                                            : "Delete role"
                                                        }
                                                        disabled={role.user_count > 0}
                                                    >
                                                        <Trash2 className={`h-4 w-4 ${role.user_count > 0 ? 'opacity-50' : ''}`} />
                                                    </button>
                                                </PermissionGuard>
                                            )}
                                            <PermissionGuard moduleId="roles" permission="create">
                                                <button
                                                    onClick={() => handleInheritRole(role)}
                                                    className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                                                    title="Inherit from this role"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </PermissionGuard>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4">{role.description}</p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Users</span>
                                            <span className="text-white font-medium">{role.user_count}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Permissions</span>
                                            <span className="text-white font-medium">{role.permissions.length} modules</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Type</span>
                                            <span className="text-white font-medium">{role.is_custom ? 'Custom' : 'System'}</span>
                                        </div>
                                    </div>

                                    {/* Role deletion info */}
                                    {!role.is_custom && (
                                        <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
                                            <p className="text-blue-300">
                                                <span className="font-medium">System Role:</span> This role cannot be deleted as it's part of the core system.
                                            </p>
                                        </div>
                                    )}
                                    {role.is_custom && role.user_count > 0 && (
                                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs">
                                            <p className="text-yellow-300">
                                                <span className="font-medium">Users Assigned:</span> Reassign users before deleting this role.
                                            </p>
                                        </div>
                                    )}

                                    {/* Quick Permission Preview */}
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <p className="text-gray-400 text-xs mb-2">Quick Preview</p>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.slice(0, 4).map((permission) => {
                                                const module = availableModules.find(m => m.id === permission.module_id);
                                                return (
                                                    <span key={permission.module_id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700/50 text-gray-300">
                                                        {module?.name || permission.module_name}
                                                    </span>
                                                );
                                            })}
                                            {role.permissions.length > 4 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700/50 text-gray-300">
                                                    +{role.permissions.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredRoles.length === 0 && (
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                            <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">No roles found</p>
                            <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Role Creation/Edit Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">
                                {editingRole ? 'Edit Role' : 'Create New Role'}
                            </h2>
                            <p className="text-gray-400 mt-1">
                                {editingRole 
                                    ? 'Update role information and permissions' 
                                    : Object.keys(newRole.permissions).length > 0 
                                        ? 'Customize the inherited role with additional permissions and settings'
                                        : 'Define a new role with specific module permissions'
                                }
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Role Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Role Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newRole.name}
                                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        placeholder="e.g., Customer Support Manager"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Role Color
                                    </label>
                                    <select
                                        value={newRole.color}
                                        onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="blue">Blue</option>
                                        <option value="purple">Purple</option>
                                        <option value="green">Green</option>
                                        <option value="orange">Orange</option>
                                        <option value="red">Red</option>
                                        <option value="gray">Gray</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newRole.description}
                                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                    placeholder="Describe the role's responsibilities and scope..."
                                    rows={3}
                                />
                            </div>

                            {/* Permissions Matrix */}
                            <div>
                                {Object.keys(newRole.permissions).length > 0 && !editingRole && (
                                    <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-400 mb-2">
                                            <Copy className="h-4 w-4" />
                                            <span className="font-medium">Permissions Inherited</span>
                                        </div>
                                        <p className="text-green-300 text-sm">
                                            This role has inherited permissions from another role. You can modify these permissions or add new ones as needed.
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">Module Permissions</h3>
                                    {Object.keys(newRole.permissions).length > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-400">Total permissions:</span>
                                            <span className="text-white font-medium">
                                                {Object.values(newRole.permissions).reduce((sum, perms) => sum + perms.length, 0)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    {Object.entries(groupedModules).map(([category, modules]) => (
                                        <div key={category} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                            <h4 className="text-white font-medium mb-4">{category}</h4>
                                            <div className="space-y-3">
                                                {modules.map((module) => {
                                                    const hasPermissions = (newRole.permissions[module.id] || []).length > 0;
                                                    return (
                                                        <div key={module.id} className={`flex items-center justify-between py-2 ${hasPermissions ? 'bg-green-500/5 border-l-2 border-green-500/30 pl-3' : ''}`}>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-white font-medium">{module.name}</p>
                                                                    {hasPermissions && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                                                                            {newRole.permissions[module.id]?.length || 0} permissions
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-400 text-sm">{module.description}</p>
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                {(['view', 'create', 'edit', 'delete'] as PermissionType[]).map((permission) => (
                                                                    <button
                                                                        key={permission}
                                                                        onClick={() => togglePermission(module.id, permission)}
                                                                        className={`p-2 rounded-lg border transition-all duration-200 ${
                                                                            (newRole.permissions[module.id] || []).includes(permission)
                                                                                ? `bg-${permission === 'view' ? 'blue' : permission === 'create' ? 'green' : permission === 'edit' ? 'yellow' : 'red'}-500/20 border-${permission === 'view' ? 'blue' : permission === 'create' ? 'green' : permission === 'edit' ? 'yellow' : 'red'}-500/50 ${getPermissionColor(permission)}`
                                                                                : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                                                                        }`}
                                                                        title={permission.charAt(0).toUpperCase() + permission.slice(1)}
                                                                    >
                                                                        {getPermissionIcon(permission)}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Permission Legend */}
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <h4 className="text-white font-medium mb-3">Permission Types</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-400">
                                            <Eye className="h-3 w-3" />
                                        </div>
                                        <span className="text-gray-300 text-sm">View - Read access</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
                                            <UserPlus className="h-3 w-3" />
                                        </div>
                                        <span className="text-gray-300 text-sm">Create - Add new items</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400">
                                            <Edit className="h-3 w-3" />
                                        </div>
                                        <span className="text-gray-300 text-sm">Edit - Modify existing</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                                            <Trash className="h-3 w-3" />
                                        </div>
                                        <span className="text-gray-300 text-sm">Delete - Remove items</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRole}
                                disabled={!newRole.name.trim()}
                                data-save-role
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {editingRole ? 'Update Role' : 'Create Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Inheritance Modal */}
            {showInheritanceModal && inheritingFromRole && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-xl border border-gray-700 w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Copy className="h-5 w-5 text-green-400" />
                                Inherit from Role
                            </h2>
                            <p className="text-gray-400 mt-1">
                                Create a new role based on "{inheritingFromRole.name}" with all its permissions
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Source Role Info */}
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="text-white font-medium mb-3">Source Role: {inheritingFromRole.name}</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Description:</span>
                                        <span className="text-white">{inheritingFromRole.description}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Color:</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getColorClasses(inheritingFromRole.color)}`}>
                                            {inheritingFromRole.color}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Permissions:</span>
                                        <span className="text-white">{inheritingFromRole.permissions.length} modules</span>
                                    </div>
                                </div>
                            </div>

                            {/* What will be inherited */}
                            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                                <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4" />
                                    What will be inherited:
                                </h4>
                                <ul className="text-green-300 text-sm space-y-1">
                                    <li>• All module permissions from "{inheritingFromRole.name}"</li>
                                    <li>• Role color (can be changed later)</li>
                                    <li>• Permission structure and access levels</li>
                                </ul>
                            </div>

                            {/* What you can customize */}
                            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                                <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                                    <Edit className="h-4 w-4" />
                                    What you can customize:
                                </h4>
                                <ul className="text-blue-300 text-sm space-y-1">
                                    <li>• Role name and description</li>
                                    <li>• Add or remove specific permissions</li>
                                    <li>• Change role color</li>
                                    <li>• Modify permission levels</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowInheritanceModal(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmInheritance}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                Inherit & Customize
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && roleToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-xl border border-gray-700 w-full max-w-md">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                    Delete Role
                                </h2>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {deleteError ? (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-400 mb-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-medium">Cannot Delete Role</span>
                                    </div>
                                    <p className="text-red-300 text-sm">{deleteError}</p>
                                    {deleteError.includes('system') && (
                                        <p className="text-red-300 text-xs mt-2">
                                            System roles (Super Admin, Manager, Employee, Viewer) are protected and cannot be deleted.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border mb-4 ${getColorClasses(roleToDelete.color)}`}>
                                            {roleToDelete.name}
                                        </div>
                                        <p className="text-gray-300 mb-4">
                                            Are you sure you want to delete the role <span className="text-white font-medium">"{roleToDelete.name}"</span>?
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            This action cannot be undone. All permissions associated with this role will be permanently removed.
                                        </p>
                                    </div>

                                    {roleToDelete.user_count > 0 && (
                                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="text-white font-medium">Warning</span>
                                            </div>
                                            <p className="text-yellow-300 text-sm">
                                                This role has <span className="text-white font-medium">{roleToDelete.user_count} user(s)</span> assigned to it. 
                                                You must reassign these users to different roles before deleting this role.
                                            </p>
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => {
                                                        setRoleForReassignment(roleToDelete);
                                                        setAvailableRoles(roles.filter(r => r.id !== roleToDelete.id && r.is_custom));
                                                        setSelectedReassignmentRole('');
                                                        setShowDeleteConfirm(false);
                                                        setShowUserReassignmentModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                                >
                                                    <Users className="h-4 w-4" />
                                                    Reassign Users First
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                            >
                                Cancel
                            </button>
                            {!deleteError && (
                                <button
                                    onClick={confirmDeleteRole}
                                    disabled={roleToDelete.user_count > 0}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Role
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* User Reassignment Modal */}
            {showUserReassignmentModal && roleForReassignment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] rounded-xl border border-gray-700 w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-400" />
                                    Reassign Users
                                </h2>
                                <button
                                    onClick={() => setShowUserReassignmentModal(false)}
                                    className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Current Role Info */}
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <h3 className="text-white font-medium mb-3">Role to Delete</h3>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getColorClasses(roleForReassignment.color)}`}>
                                        {roleForReassignment.name}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        ({roleForReassignment.user_count} user(s) assigned)
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm">{roleForReassignment.description}</p>
                            </div>

                            {/* Warning Message */}
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="font-medium">Action Required</span>
                                </div>
                                <p className="text-yellow-300 text-sm">
                                    Before deleting the role <span className="font-medium">"{roleForReassignment.name}"</span>, 
                                    you must reassign all {roleForReassignment.user_count} user(s) to a different role.
                                </p>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Select New Role for Users
                                </label>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {availableRoles.length > 0 ? (
                                        availableRoles.map((role) => (
                                            <label key={role.id} className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="reassignmentRole"
                                                    value={role.id}
                                                    checked={selectedReassignmentRole === role.id}
                                                    onChange={(e) => setSelectedReassignmentRole(e.target.value)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClasses(role.color)}`}>
                                                            {role.name}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">
                                                            ({role.user_count} current users)
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">{role.description}</p>
                                                </div>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>No available roles for reassignment</p>
                                            <p className="text-sm">Create a new role first, then try again.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* What Happens Next */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4" />
                                    What happens next:
                                </h4>
                                <ul className="text-blue-300 text-sm space-y-1">
                                    <li>• All users from "{roleForReassignment.name}" will be moved to the selected role</li>
                                    <li>• Users will keep their accounts but with new permissions</li>
                                    <li>• The "{roleForReassignment.name}" role will then be available for deletion</li>
                                    <li>• This action cannot be undone</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowUserReassignmentModal(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUserReassignment}
                                disabled={!selectedReassignmentRole || reassignmentLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                            >
                                {reassignmentLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Reassigning...
                                    </>
                                ) : (
                                    <>
                                        <Users className="h-4 w-4" />
                                        Reassign Users
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default RoleManagementPage;
