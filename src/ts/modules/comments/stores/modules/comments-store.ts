import {ActionTree, Module, MutationTree} from "vuex";

import Fetcher from '../../../../utilities/fetcher';

export interface IComment {
    body: string;
    chore_id: string;
    created_at: string;
    hidden: boolean;
    id: string;
    is_edited: boolean;
    last_update: string;
    raw_body: string;
    user: string;
    user_id: string;
}

export interface ICommentsState {
    comments: IComment[];
    isInitialized: boolean;
}

const ADD_COMMENT = 'ADD_COMMENT';
const INITIALIZE = 'INITIALIZE';
const UPDATE_COMMENT = 'UPDATE_COMMENT';

const state: ICommentsState = {
    comments: [],
    isInitialized: false,
};

const mutations: MutationTree<ICommentsState> = {
    [ADD_COMMENT](state, newComment: IComment) {
        state.comments.push(newComment);
    },
    [INITIALIZE](state, comments: IComment[]) {
        state.comments = comments;
        state.isInitialized = true;
    },
    [UPDATE_COMMENT](state, updatedComment: IComment) {
        state.comments = state.comments.map((comment): IComment => {
            if (comment.id === updatedComment.id) {
                return updatedComment;
            }
            return comment;
        });
    },
};

const actions: ActionTree<ICommentsState, any> = {
    async addComment({ commit }, payload) {
        try {
            const response = await Fetcher.post(App.endpoints.addComment, payload);
            const data = await response.json();
            const newComment = data.comment;
            if (newComment) {
                commit(ADD_COMMENT, {
                    ...newComment,
                    is_edited: false,
                });
            }
        } catch (err) {
            console.error('Unable to post a comment:', err);
        }
    },
    async getComments({ commit }, choreId) {
        try {
            // Read the comments from the API
            const response = await Fetcher.get(App.endpoints.getComments, {chore_id: choreId});
            const data = await response.json();
            if (data.comments) {
                commit(INITIALIZE, data.comments.map((comment: IComment): IComment => {
                    return {
                        ...comment,
                        is_edited: false,
                    };
                }));
            }
        } catch (err) {
            console.error('Unable to fetch the comments:', err);
            commit(INITIALIZE, []);
        }
    },
    async updateComment({ commit }, payload) {
        try {
            const response = await Fetcher.post(App.endpoints.editComment, payload);
            const data = await response.json();
            if (data.comment) {
                const updatedComment = data.comment;
                commit(UPDATE_COMMENT, {...updatedComment, is_edited: false});
            }
        } catch (err) {
            console.error('Unable to edit a comment:', err);
        }
    },
    async updateCommentVisible(_, payload) {
        try {
            await Fetcher.post(App.endpoints.updateComments, payload);
        } catch (err) {
            console.error('Unable to toggle the comment visibility:', err);
        }
    }
}

const commentsModule: Module<ICommentsState, any> = {
    namespaced: true,
    state,
    mutations,
    actions,
};

export default commentsModule;
