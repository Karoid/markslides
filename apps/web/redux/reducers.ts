import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import appReducer from '@/redux/slices/appSlice';
import dialogReducer from '@/redux/slices/dialogSlice';
import slideConfigReducer from '@/redux/slices/slideConfigSlice';
import localReducer from '@/redux/slices/localSlice';
import dashboardReducer from '@/redux/slices/dashboardSlice';

const appReducerConfig = {
    key: 'app',
    storage: storage,
    blacklist: ['isSlideShowMode', 'currentFileHandle'],
};

const dashboardReducerConfig = {
    key: 'dashboard',
    storage: storage,
    whitelist: ['items', 'currentFolderId', 'currentPath', 'sortOrder', 'sortDirection'],
};

const rootReducer = combineReducers({
    app: persistReducer(appReducerConfig, appReducer),
    dialog: dialogReducer,
    slideConfig: slideConfigReducer,
    local: localReducer,
    dashboard: persistReducer(dashboardReducerConfig, dashboardReducer),
});

export default rootReducer;
