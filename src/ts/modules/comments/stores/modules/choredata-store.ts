// @ts-nocheck

export default {
    namespaced: true,
    state() {
        return {
            choreData: null,
        };
    },
    actions: {
        getChoreData({ commit }, choreData) {
            commit('setChoreData', choreData);
        },
    },
    mutations: {
        setChoreData(state, choreData) {
            state.choreData = choreData;
        },
    }
}