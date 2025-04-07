const PERMISSIONS = {
    // Permissões da loja
    STORE: {
        VIEW: 'view_store',
        PURCHASE: 'make_purchase',
        REVIEW: 'write_review'
    },
    
    // Permissões administrativas
    ADMIN: {
        MANAGE_PRODUCTS: 'manage_products',
        MANAGE_ORDERS: 'manage_orders',
        VIEW_REPORTS: 'view_reports',
        MANAGE_USERS: 'manage_users',
        MANAGE_PROMOTIONS: 'manage_promotions'
    },
    
    // Permissões de conteúdo
    CONTENT: {
        CREATE: 'create_content',
        EDIT: 'edit_content',
        DELETE: 'delete_content'
    }
};

const ROLES = {
    ADMIN: {
        name: 'admin',
        permissions: Object.values(PERMISSIONS.ADMIN)
    },
    MANAGER: {
        name: 'manager',
        permissions: [
            PERMISSIONS.ADMIN.MANAGE_PRODUCTS,
            PERMISSIONS.ADMIN.MANAGE_ORDERS,
            PERMISSIONS.ADMIN.VIEW_REPORTS
        ]
    },
    USER: {
        name: 'user',
        permissions: [
            PERMISSIONS.STORE.VIEW,
            PERMISSIONS.STORE.PURCHASE
        ]
    }
}; 