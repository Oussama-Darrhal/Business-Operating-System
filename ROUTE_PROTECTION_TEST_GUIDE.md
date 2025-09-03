# Route Protection Testing Guide

## Overview
This guide explains how to test the newly implemented route protection system that prevents unauthorized URL access based on user roles and permissions.

## What Was Fixed
- **Before**: Users could access any page by typing the URL directly, even if they didn't have permissions
- **After**: All routes are now protected with permission checks that prevent unauthorized access

## New Security Features

### 1. Permission-Based Route Protection
Every route now checks specific module permissions before allowing access:

```typescript
// Example: Users Management page requires 'users' module 'view' permission
<ProtectedRoute moduleId="users" permission="view">
  <UsersManagementPage />
</ProtectedRoute>
```

### 2. Comprehensive Route Coverage
All possible URLs are now protected:
- **Existing Pages**: `/dashboard`, `/users-management`, `/role-management`, `/company-profile`
- **Module Routes**: `/products`, `/analytics`, `/reviews`, `/complaints`, etc.
- **Alias Routes**: `/users` → `/users-management`, `/roles` → `/role-management`
- **404 Handling**: Permission-aware not found page

### 3. User-Friendly Error Pages
- **Unauthorized Access**: Shows specific module and permission requirements
- **Not Found**: Lists pages the user CAN access based on their role
- **Loading States**: Proper loading indicators during permission checks

## Testing Scenarios

### Test 1: Super Admin Access (Full Access)
**Setup**: Login as Super Admin
**Expected**: Can access all URLs without restrictions

1. Navigate to `/dashboard` ✅ Should work
2. Navigate to `/users-management` ✅ Should work  
3. Navigate to `/role-management` ✅ Should work
4. Navigate to `/company-profile` ✅ Should work
5. Navigate to `/products` ✅ Should show "Coming Soon" page
6. Navigate to `/analytics` ✅ Should show "Coming Soon" page
7. Navigate to `/invalid-page` ✅ Should show 404 with all available pages

### Test 2: Manager Access (Limited Access)
**Setup**: Login as Manager
**Expected**: Can access most pages except some restricted areas

1. Navigate to `/dashboard` ✅ Should work
2. Navigate to `/users-management` ❌ Should show "Access Denied" (if manager doesn't have users view permission)
3. Navigate to `/role-management` ❌ Should show "Access Denied" 
4. Navigate to `/company-profile` ✅ Should work
5. Navigate to `/products` ✅ Should work (if has products permission)
6. Navigate to `/analytics` ✅ Should work
7. Navigate to `/settings` ❌ Should show "Access Denied"

### Test 3: Employee Access (Basic Access)
**Setup**: Login as Employee
**Expected**: Can access basic functionality only

1. Navigate to `/dashboard` ✅ Should work
2. Navigate to `/users-management` ❌ Should show "Access Denied"
3. Navigate to `/role-management` ❌ Should show "Access Denied"
4. Navigate to `/company-profile` ❌ Should show "Access Denied"
5. Navigate to `/products` ✅ Should work (view only)
6. Navigate to `/reviews` ✅ Should work
7. Navigate to `/analytics` ❌ Should show "Access Denied"

### Test 4: Viewer Access (Read-Only)
**Setup**: Login as Viewer
**Expected**: Very limited access, mostly read-only

1. Navigate to `/dashboard` ✅ Should work
2. Navigate to `/users-management` ❌ Should show "Access Denied"
3. Navigate to `/role-management` ❌ Should show "Access Denied"
4. Navigate to `/company-profile` ❌ Should show "Access Denied"
5. Navigate to `/products` ✅ Should work (view only)
6. Navigate to `/reviews` ✅ Should work (view only)
7. Navigate to any other page ❌ Should show "Access Denied"

### Test 5: Unauthenticated Access
**Setup**: Not logged in
**Expected**: Redirect to login for all protected routes

1. Navigate to `/dashboard` → Should redirect to `/login`
2. Navigate to `/users-management` → Should redirect to `/login`
3. Navigate to any protected route → Should redirect to `/login`
4. Navigate to `/login` ✅ Should work
5. Navigate to `/signup` ✅ Should work

## How to Test

### 1. Manual URL Testing
1. Login with different user roles
2. Manually type URLs in the browser address bar
3. Verify appropriate access/denial responses
4. Check that error pages show correct information

### 2. Browser Console Testing
```javascript
// Check current user permissions
permissionService.getPermissionSummary()

// Test specific permissions
permissionService.hasPermission('users', 'view')
permissionService.canAccessModule('products')

// Get accessible modules
permissionService.getAccessibleModules()
```

### 3. Navigation Testing
1. Use the sidebar navigation (should only show allowed items)
2. Try to access restricted pages via direct URL
3. Verify redirects work correctly
4. Test back/forward browser buttons

### 4. Edge Cases to Test
- **Session Expiry**: Try accessing pages after token expires
- **Role Changes**: Access pages, change user role, try again
- **Invalid Routes**: Try completely invalid URLs
- **Case Sensitivity**: Try `/Users-Management` vs `/users-management`
- **Trailing Slashes**: Try `/dashboard/` vs `/dashboard`

## Expected Error Messages

### Access Denied Page
- Shows "Access Denied" with warning icon
- Displays required module and permission
- Shows user's current role information
- Provides "Go Back" and "Return to Dashboard" buttons
- Shows admin contact message

### Not Found Page
- Shows "404 Page Not Found" 
- Lists pages the user CAN access based on their role
- Provides navigation to accessible pages
- Shows "Go Back" and "Return Home" buttons

## Debugging Tools

### Browser Console Commands
```javascript
// Debug permission service
window.permissionService.getPermissionSummary()

// Check specific route access
window.permissionService.hasPermission('users', 'view')

// Get all accessible modules
window.permissionService.getAccessibleModules()

// Check current user role
window.permissionService.getRole()
```

### Network Tab
- Check API calls to `/api/user/permissions`
- Verify permission data is loaded correctly
- Check for authentication failures

## Security Validation Checklist

### ✅ Route-Level Protection
- [ ] All existing pages require proper permissions
- [ ] Module routes are protected even without pages
- [ ] Alias routes redirect properly
- [ ] 404 page is permission-aware

### ✅ Authentication Integration  
- [ ] Unauthenticated users redirected to login
- [ ] Permission checks wait for authentication
- [ ] Token expiry handles gracefully

### ✅ User Experience
- [ ] Loading states during permission checks
- [ ] Clear error messages for denied access
- [ ] Helpful navigation in error pages
- [ ] Role information displayed appropriately

### ✅ Edge Cases
- [ ] Invalid URLs handled properly
- [ ] Navigation works after permission changes
- [ ] Browser back/forward buttons work correctly
- [ ] Deep linking respects permissions

## Common Issues and Solutions

### Issue: "Permission service not initialized"
**Solution**: Ensure user is fully authenticated before accessing routes

### Issue: Route shows loading indefinitely
**Solution**: Check if permission service initialization failed in console

### Issue: Access denied for Super Admin
**Solution**: Verify role assignments and permission seeding in database

### Issue: Can still access page after role change
**Solution**: User needs to refresh or re-login for permission changes to take effect

## Implementation Details

### Protected Route Component
```typescript
<ProtectedRoute moduleId="users" permission="view">
  <UsersManagementPage />
</ProtectedRoute>
```

### Route Protection Features
- **Permission Checking**: Validates module and permission requirements
- **Loading States**: Shows loading while checking permissions
- **Error Handling**: Graceful fallback for permission failures
- **User Feedback**: Clear messages about access requirements

### Security Layers
1. **Frontend Route Protection**: Prevents UI access and provides UX
2. **Backend API Protection**: All API endpoints validate permissions server-side
3. **Token Validation**: Authentication tokens verified on each request
4. **Multi-tenant Scoping**: Permissions scoped to user's SME

This comprehensive route protection system ensures that users can only access the functionality they're authorized to use, both through the UI and via direct URL access.




