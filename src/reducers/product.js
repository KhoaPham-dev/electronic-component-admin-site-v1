import { actionTypes, reduxUtil } from '../actions/product';

const { createReducer, defineActionSuccess, defineActionLoading, defineActionFailed } = reduxUtil;
const {
    GET_PRODUCT_LIST,
    DELETE_PRODUCT,
    GET_CATEGORY_TYPE_PRODUCTS
} = actionTypes;

const initialState = { 
    productData: [],
    productCategoryType: [],
    tbproductLoading: false,
};

const reducer = createReducer({
    [defineActionLoading(GET_PRODUCT_LIST)]: (state) => {
        return {
            ...state,
            tbproductLoading: true
        }
    },
    [defineActionSuccess(GET_PRODUCT_LIST)]: (state, { productData }) => {
        return {
            ...state,
            productData,
            tbproductLoading: false
        }
    },
    [defineActionLoading(GET_CATEGORY_TYPE_PRODUCTS)]: (state) => {
        return {
            ...state,
            tbproductLoading: true
        }
    },
    [defineActionSuccess(GET_CATEGORY_TYPE_PRODUCTS)]: (state, {productCategoryType}) => {
        return {
            ...state,
            productCategoryType,
            tbproductLoading: false,            
        }
    },
    [defineActionLoading(DELETE_PRODUCT)] : (state) =>{
        return {
            ...state,
            tbproductLoading: true,
        }
    },
    [defineActionFailed(DELETE_PRODUCT)] : (state) =>{
        return {
            ...state,
            tbproductLoading: false,
        }
    },
    initialState
})

export default {
    reducer
};
