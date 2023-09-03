// @ts-nocheck

import Fetcher from '../../../../utilities/fetcher';

export default {
    namespaced: true,
    state() {
        return {
            comments: [],
            isInitialized: false,
        };
    },
    actions: {
        async addComment({ commit }, payload) {
            try {
                const response = await Fetcher.post(App.endpoints.addComment, payload);

                const data = await response.json();
                const newComment = data.comment;
                if (newComment) {
                    commit('addComment', {
                        ...newComment,
                        isEdited: false,
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
                    commit('initialize', data.comments.map((comment) => {
                        return {
                            ...comment,
                            isEdited: false
                        };
                    }));
                }
            } catch (err) {
                console.error('Unable to fetch the comments:', err);
            }
        },
        async updateComment({ commit }, payload) {
            try {
                const response = await Fetcher.post(App.endpoints.editComment, payload);
                const data = await response.json();
                if (data.comment) {
                    const updatedComment = data.comment;
                    commit('updateComment', {...updatedComment, isEdited: false});
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
    },
    mutations: {
        addComment(state, newComment) {
            state.comments.push(newComment);
        },
        initialize(state, comments) {
            state.comments = comments;
            state.isInitialized = true;
        },
        updateComment(state, updatedComment) {
            state.comments = state.comments.map((comment) => {
                if (comment.id === updatedComment.id) {
                    return updatedComment;
                }
                return comment;
            });
        },
    }
}
