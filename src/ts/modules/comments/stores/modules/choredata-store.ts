import {ActionTree, Module, MutationTree} from 'vuex';

export interface IChoreData {
    id: string,
    ownerId: string,
}

export interface IChoreDataState {
    choreData: null | IChoreData;
}

const SET_CHORE_DATA = 'SET_CHORE_DATA';

const state: IChoreDataState = {
    choreData: null,
};

const mutations: MutationTree<IChoreDataState> = {
    [SET_CHORE_DATA](state, choreData: IChoreData) {
        state.choreData = choreData;
    },
};

const actions: ActionTree<IChoreDataState, any> = {
    getChoreData({ commit }, choreData: IChoreData) {
        commit(SET_CHORE_DATA, choreData);
    },
};

const choreDataModule: Module<IChoreDataState, any> = {
    namespaced: true,
    state,
    mutations,
    actions,
};

export default choreDataModule;
