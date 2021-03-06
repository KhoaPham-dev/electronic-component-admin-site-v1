import apiConfig from './apiConfig';

export const sitePathConfig = {
    login: {
        path: '/login'
    },
    profile: {
        path: '/profile'
    },
    admin: {
        path: '/admins',
        permissions: [
            apiConfig.user.getAdminList.path,
            apiConfig.user.getAdminById.path,
            apiConfig.user.createAdmin.path,
            apiConfig.user.updateAdmin.path,
            apiConfig.user.deleteAdmin.path
        ]
    },
    forbidden: {
        path: '/forbidden'
    },
    setting: {
        path: '/settings',
        permissions: [
            apiConfig.setting.getSettingsList.path,
            apiConfig.setting.getSettingById.path,
            apiConfig.setting.createSetting.path,
            apiConfig.setting.updateSetting.path,
            apiConfig.setting.deleteSetting.path,
        ]
    },
    groupPermission: {
        path: '/groupPermission',
        permissions: [
            apiConfig.groupPermission.getList.path,
            apiConfig.groupPermission.getById.path,
            apiConfig.groupPermission.create.path,
            apiConfig.groupPermission.update.path,
            'not_have_delete',
            apiConfig.groupPermission.getPermissionList.path,
        ]
    },
    customer: {
        path: '/customer',
        permissions: [
            apiConfig.customer.getCustomerList.path,
            apiConfig.customer.getCustomerById.path,
            apiConfig.customer.createCustomer.path,
            apiConfig.customer.updateCustomer.path,
            apiConfig.customer.deleteCustomer.path,
        ]
    },
    categoryImport: {
        path: '/category-import',
        childrenKeys: ['/category-import-child'],
        permissions: [
            apiConfig.category.getList.path,
            apiConfig.category.getById.path,
            apiConfig.category.create.path,
            apiConfig.category.update.path,
            apiConfig.category.delete.path,
        ]
    },
    categoryExport: {
        path: '/category-export',
        childrenKeys: ['/category-export-child'],
        permissions: [
            apiConfig.category.getList.path,
            apiConfig.category.getById.path,
            apiConfig.category.create.path,
            apiConfig.category.update.path,
            apiConfig.category.delete.path,
        ]
    },
    categoryProduct: {
        path: '/category-product',
        childrenKeys: ['/category-product-child'],
        permissions: [
            apiConfig.category.getList.path,
            apiConfig.category.getById.path,
            apiConfig.category.create.path,
            apiConfig.category.update.path,
            apiConfig.category.delete.path,
        ]
    },
    product: {
        path: '/product',
        permissions: [
            apiConfig.product.getList.path,
            apiConfig.product.getById.path,
            apiConfig.product.create.path,
            apiConfig.product.update.path,
            apiConfig.product.delete.path,
        ]
    },
}