# Dynamic Permission System Implementation Guide

## Overview

This guide explains the implementation of the dynamic role-based permission system for the SME Business Operating System (BOS). The system allows for granular control over what users can see and do based on their assigned roles.

## System Architecture

### Backend Components

#### 1. Database Structure
- **Roles Table**: Stores role definitions with SME-specific scoping
- **Permissions Table**: Defines available modules and their descriptions
- **Role_Permissions Table**: Maps roles to specific module permissions with action types

#### 2. Models
- **Role Model** (`backend/app/Models/Role.php`): Handles role relationships and permission checks
- **Permission Model** (`backend/app/Models/Permission.php`): Manages module definitions
- **User Model** (`backend/app/Models/User.php`): Extended with permission checking methods

#### 3. API Endpoints
- `GET /api/user` - Returns user data with permissions included
- `GET /api/user/permissions` - Dedicated endpoint for fetching user permissions

### Frontend Components

#### 1. Permission Service (`client/src/services/permissionService.ts`)
Singleton service that manages user permissions on the frontend:

```typescript
// Check single permission
permissionService.hasPermission('users', 'create')

// Check multiple permissions
permissionService.hasAnyPermission('products', ['view', 'edit'])

// Check module access
permissionService.canAccessModule('dashboard')
```

#### 2. Permission Guard Component (`client/src/components/PermissionGuard.tsx`)
React component for conditional rendering based on permissions:

```jsx
// Basic usage
<PermissionGuard moduleId="users" permission="create">
  <Button>Add User</Button>
</PermissionGuard>

// Multiple permissions (any)
<PermissionGuard moduleId="products" permissions={['create', 'edit']}>
  <ProductForm />
</PermissionGuard>

// Multiple permissions (all required)
<PermissionGuard moduleId="analytics" permissions={['view', 'export']} requireAll>
  <ExportButton />
</PermissionGuard>

// With fallback
<PermissionGuard 
  moduleId="settings" 
  permission="view"
  fallback={<div>Access denied</div>}
>
  <SettingsPanel />
</PermissionGuard>
```

## Available Modules and Permissions

### Core Modules
- **dashboard**: Main dashboard and overview
- **analytics**: Business analytics and reports

### Customer Feedback Modules
- **reviews**: Customer reviews management
- **complaints**: Customer complaints handling
- **ai-analysis**: AI-powered feedback analysis
- **response-management**: Response management system

### Inventory Management Modules
- **products**: Product catalog management
- **stock**: Stock level monitoring
- **categories**: Product categorization
- **warehouses**: Warehouse management

### System & Admin Modules
- **users**: User management
- **roles**: Role and permission management
- **company-profile**: Company information management
- **settings**: System configuration
- **activity-logs**: Activity monitoring

### Permission Types
Each module supports four permission types:
- **view**: Read access to the module
- **create**: Create new records
- **edit**: Modify existing records
- **delete**: Remove records

## Default Roles

The system includes four default roles with pre-configured permissions:

### 1. Super Admin
- **Access**: Full access to all modules with all permissions
- **Color**: Purple
- **Use Case**: System administrators and business owners

### 2. Manager
- **Access**: Management-level access with most permissions
- **Restricted**: Cannot delete users or modify system settings
- **Color**: Blue
- **Use Case**: Department managers and supervisors

### 3. Employee
- **Access**: Standard employee access with basic permissions
- **Capabilities**: View dashboards, create complaints/responses, view products
- **Color**: Green
- **Use Case**: Regular staff members

### 4. Viewer
- **Access**: Read-only access to basic modules
- **Capabilities**: View dashboard, reviews, and products only
- **Color**: Gray
- **Use Case**: Temporary access, interns, or view-only stakeholders

## Implementation Examples

### 1. Navigation Menu (Layout.tsx)
Navigation items are automatically filtered based on user permissions:

```jsx
{mainNavigationItems.map((item) => (
  <PermissionGuard key={item.label} moduleId={item.moduleId} permission="view">
    <NavigationButton {...item} />
  </PermissionGuard>
))}
```

### 2. Action Buttons (Pages)
Buttons for creating, editing, or deleting are conditionally rendered:

```jsx
<PermissionGuard moduleId="users" permission="create">
  <button onClick={handleCreateUser}>
    Add New User
  </button>
</PermissionGuard>
```

### 3. Dashboard Components
Dashboard sections are shown based on relevant permissions:

```jsx
<PermissionGuard moduleId="analytics" permission="view">
  <AnalyticsWidget />
</PermissionGuard>
```

## Custom Roles

### Creating Custom Roles
1. Navigate to Role Management page
2. Click "Create New Role"
3. Define role name, description, and color
4. Select permissions for each module
5. Save the role

### Assigning Roles
1. Navigate to User Management page
2. Edit or create a user
3. Select the appropriate role from the dropdown
4. Save changes

## Security Considerations

### Backend Security
- All API endpoints require authentication
- Multi-tenant scoping ensures data isolation
- Role permissions are verified server-side
- Sensitive operations have additional validation

### Frontend Security
- Permission checks are enforced on the frontend for UX
- Backend validation provides the actual security layer
- Tokens are managed securely
- Permission state is synchronized with authentication

## Troubleshooting

### Common Issues

#### 1. Permissions Not Loading
- Check if user is properly authenticated
- Verify API endpoints are accessible
- Check browser console for errors
- Ensure permission service is initialized

#### 2. UI Elements Not Hiding
- Verify PermissionGuard is properly imported
- Check module IDs match database values
- Ensure permission service is initialized in AuthContext

#### 3. Role Changes Not Reflecting
- Users need to refresh or re-login for role changes to take effect
- Check if permission refresh is called after role updates

### Debug Tools

#### Permission Summary
Use the permission service to debug current permissions:

```javascript
// In browser console
permissionService.getPermissionSummary()
```

#### Role Information
Check current user role:

```javascript
// In React component
const { getRole } = usePermission();
const userRole = getRole();
console.log('Current role:', userRole);
```

## Best Practices

### 1. Consistent Module IDs
- Use kebab-case for module IDs (e.g., 'user-management')
- Keep module IDs consistent between backend and frontend
- Document any new modules in the permission seeder

### 2. Granular Permissions
- Don't over-permission - start with basic view/create/edit/delete
- Consider workflow-based permissions for complex operations
- Group related functionality under the same module

### 3. User Experience
- Provide fallback content for denied access when appropriate
- Hide navigation items the user cannot access
- Show role information to help users understand their permissions

### 4. Testing
- Test with different role types during development
- Verify permission changes take effect properly
- Test edge cases like users with no roles

## Future Enhancements

### Planned Features
- Dynamic permission creation through UI
- Time-based permissions (temporary access)
- Advanced permission conditions
- Permission inheritance and delegation
- Audit logging for permission changes

### Integration Points
- Connect with workflow systems
- API-based permission management
- External identity providers
- Advanced role hierarchies

## API Reference

### Get User Permissions
```http
GET /api/user/permissions
Authorization: Bearer {token}

Response:
{
  "success": true,
  "permissions": [
    {
      "module_id": "users",
      "module_name": "Users Management",
      "permissions": ["view", "create", "edit"]
    }
  ],
  "role": {
    "id": 1,
    "name": "Manager",
    "description": "Management level access",
    "color": "blue",
    "is_custom": false
  }
}
```

### Permission Service Methods

```typescript
// Check permissions
hasPermission(moduleId: string, permission: 'view'|'create'|'edit'|'delete'): boolean
hasAnyPermission(moduleId: string, permissions: string[]): boolean
hasAllPermissions(moduleId: string, permissions: string[]): boolean
canAccessModule(moduleId: string): boolean
canPerformAction(moduleId: string, action: string): boolean

// Get data
getRole(): UserRole | null
getModulePermissions(moduleId: string): string[]
getAllPermissions(): UserPermissions
getAccessibleModules(): string[]

// Management
initialize(permissions?: Permission[], role?: UserRole): Promise<void>
refresh(): Promise<void>
clear(): void
```

This dynamic permission system provides a robust foundation for managing user access throughout the SME Business Operating System while maintaining flexibility for future requirements and custom business rules.




