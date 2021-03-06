export function createStore(reducer, enhancer) {
    if (enhancer) {
        return enhancer(createStore)(reducer)
    }
    // 定义初始的state
    let currentState = {};
    //定义初始的监听器
    const currentListeners = [];

    //定义访问state的方法
    function getState() {
        return currentState;
    }

    //订阅 监听函数
    function subscribe(listener) {
        currentListeners.push(listener);
    }

    //定义一个简单的dispatch
    function dispatch(action) {
        currentState = reducer(currentState, action);
        currentListeners.forEach(func => func())
        return action
    }

    //初始化先init
    dispatch({type: 'PROJECT_INIT'})
    return {getState, dispatch, subscribe}
}

//将dispatch绑定到每一个action
const bindActionCreator = (creator, dispatch) => {
    return (...args) => {
        return dispatch(creator(dispatch))
    }
}
//creators 需要传入的action方法
export const bindActionCreators = (creators, dispatch) => {
    // const bindCreators = {};
    // Object.keys(creators).forEach(creator => {
    //     let _creator = creators[creator]
    //     bindCreators[creator] = bindActionCreator(_creator, dispatch)
    // })
    // return bindCreators
    return Object.keys(creators).reduce((_creator, creator) => {
        _creator[creator] = bindActionCreator(creators[creator], dispatch);
        return _creator
    }, {})
}

export const applyMiddleware = (...middleWares) => {
    return createStore => (...args) => {
        const store = createStore(...args);
        let dispatch = store.dispatch;
        const middleWareApi = {
            getState: store.getState,
            dispatch: (...args) => dispatch(...args)
        }
        const middleWaresChain = middleWares.map(middleWare => middleWare(middleWareApi))
        dispatch = compose(...middleWaresChain)(store.dispatch)
        // dispatch = middleWare(middleWareApi)(store.dispatch)
        return {
            ...store,
            dispatch
        }
    }
}

const compose = (...funcs) => {
    if (funcs.length == 0) {
        return arg => arg
    }
    if (funcs.length == 1) {
        return funcs[0]
    }
    return funcs.reduce((result, item) => (...args) => result(item(...args)))
}