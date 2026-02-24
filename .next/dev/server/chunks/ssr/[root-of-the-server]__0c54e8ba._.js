module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/services/MockDataService.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MockDataService",
    ()=>MockDataService
]);
const STORAGE_KEYS = {
    ORDERS: 'dp_orders',
    USERS: 'dp_users'
};
const MOCK_USERS = [
    {
        id: '1',
        username: 'dentista',
        role: 'dentista',
        name: 'Dr. Juan Pérez'
    },
    {
        id: '2',
        username: 'admin',
        role: 'admin',
        name: 'Administrador del Sistema'
    }
];
const INITIAL_ORDERS = [
    {
        id: 'ORD-001',
        patientName: 'María García',
        prosthesisType: 'corona',
        material: 'ceramica',
        specifications: 'Color A2, diente 11',
        deliveryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'pendiente',
        dentistId: '1',
        dentistName: 'Dr. Juan Pérez',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        priority: 'normal',
        notes: 'Paciente alérgico al látex'
    },
    {
        id: 'ORD-002',
        patientName: 'Carlos López',
        prosthesisType: 'puente',
        material: 'zirconia',
        specifications: '3 unidades, dientes 24-26',
        deliveryDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        status: 'en_proceso',
        dentistId: '1',
        dentistName: 'Dr. Juan Pérez',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        priority: 'urgente'
    },
    {
        id: 'ORD-003',
        patientName: 'Ana Martínez',
        prosthesisType: 'dentadura',
        material: 'resina',
        specifications: 'Superior completa',
        deliveryDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'completado',
        dentistId: '1',
        dentistName: 'Dr. Juan Pérez',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        priority: 'normal'
    }
];
class MockDataService {
    static initializeData() {
        const existingOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (!existingOrders) {
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        }
    }
    static getOrders(role, userId) {
        const ordersJson = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (!ordersJson) return [];
        const orders = JSON.parse(ordersJson);
        if (role === 'admin') {
            return orders.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            return orders.filter((order)=>order.dentistId === userId).sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }
    static createOrder(orderData, user) {
        const ordersJson = localStorage.getItem(STORAGE_KEYS.ORDERS);
        const orders = ordersJson ? JSON.parse(ordersJson) : [];
        const newOrder = {
            ...orderData,
            id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
            dentistId: user.id,
            dentistName: user.name
        };
        orders.unshift(newOrder);
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        return newOrder;
    }
    static updateOrderStatus(orderId, status) {
        const ordersJson = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (!ordersJson) return;
        const orders = JSON.parse(ordersJson);
        const orderIndex = orders.findIndex((o)=>o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        }
    }
    static getOrderById(orderId) {
        const ordersJson = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (!ordersJson) return null;
        const orders = JSON.parse(ordersJson);
        return orders.find((o)=>o.id === orderId) || null;
    }
    static authenticate(username) {
        // Simple mock authentication
        return MOCK_USERS.find((u)=>u.username === username) || null;
    }
}
}),
"[project]/src/contexts/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MockDataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/MockDataService.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Check for persisted session
        const storedUser = localStorage.getItem('dp_auth');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MockDataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MockDataService"].initializeData();
        setIsLoading(false);
    }, []);
    const login = async (username, password)=>{
        setIsLoading(true);
        // Simulate network delay
        await new Promise((resolve)=>setTimeout(resolve, 800));
        // Simple password validation (in real app, use hashing and proper auth)
        // For PoC: 'demo123' for dentista, 'admin123' for admin
        let isValid = false;
        if (username === 'dentista' && password === 'demo123') isValid = true;
        if (username === 'admin' && password === 'admin123') isValid = true;
        if (isValid) {
            const authenticatedUser = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MockDataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MockDataService"].authenticate(username);
            if (authenticatedUser) {
                setUser(authenticatedUser);
                localStorage.setItem('dp_auth', JSON.stringify(authenticatedUser));
                setIsLoading(false);
                return true;
            }
        }
        setIsLoading(false);
        return false;
    };
    const logout = ()=>{
        setUser(null);
        localStorage.removeItem('dp_auth');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuth = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
}),
"[project]/src/contexts/OrderContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderProvider",
    ()=>OrderProvider,
    "useOrders",
    ()=>useOrders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MockDataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/MockDataService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const OrderContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const OrderProvider = ({ children })=>{
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filters, setFilters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const fetchOrders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!user) return;
        setLoading(true);
        try {
            const data = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MockDataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MockDataService"].getOrders(user.role, user.id);
            let filteredData = data;
            if (filters.status) {
                filteredData = filteredData.filter((o)=>o.status === filters.status);
            }
            if (filters.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                filteredData = filteredData.filter((o)=>o.patientName.toLowerCase().includes(term) || o.id.toLowerCase().includes(term));
            }
            setOrders(filteredData);
            setError(null);
        } catch (err) {
            setError('Error al cargar pedidos');
        } finally{
            setLoading(false);
        }
    }, [
        user,
        filters
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetchOrders();
    }, [
        fetchOrders
    ]);
    const addOrder = async (orderData)=>{
        if (!user) return;
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve)=>setTimeout(resolve, 500));
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MockDataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MockDataService"].createOrder(orderData, user);
            fetchOrders();
        } catch (err) {
            setError('Error al crear pedido');
        } finally{
            setLoading(false);
        }
    };
    const updateOrderStatus = async (orderId, status)=>{
        setLoading(true);
        // Simulate API delay
        await new Promise((resolve)=>setTimeout(resolve, 300));
        try {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$MockDataService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MockDataService"].updateOrderStatus(orderId, status);
            fetchOrders();
        } catch (err) {
            setError('Error al actualizar estado');
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OrderContext.Provider, {
        value: {
            orders,
            loading,
            error,
            filters,
            setFilters,
            addOrder,
            updateOrderStatus,
            refreshOrders: fetchOrders
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/OrderContext.tsx",
        lineNumber: 100,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useOrders = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
}),
"[project]/src/hooks/use-toast.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
// Inspired by react-hot-toast library
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case "DISMISS_TOAST":
            {
                const { toastId } = action;
                // ! Side effects ! - This could be extracted into a dismissToast() action,
                // but I'll keep it here for simplicity
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast({ ...props }) {
    const id = genId();
    const update = (props)=>dispatch({
            type: "UPDATE_TOAST",
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: "DISMISS_TOAST",
            toastId: id
        });
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id: id,
        dismiss,
        update
    };
}
function useToast() {
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        listeners.push(setState);
        return ()=>{
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: "DISMISS_TOAST",
                toastId
            })
    };
}
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0c54e8ba._.js.map