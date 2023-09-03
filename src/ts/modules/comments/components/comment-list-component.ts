// @ts-nocheck

import {defineComponent} from 'vue';
import {mapState} from 'vuex';

import CommentCardComponent from './comment-card-component.vue';
import LoadingComponent from './loading-component.vue';

export default defineComponent({
    name: 'CommentListComponent',
    components: {
        CommentCardComponent,
        LoadingComponent,
    },
    data() {
        return {}
    },
    mounted() {
        // Populate the comments from the backend database
        this.$store.dispatch('comments/getComments', this.choreData.id);
        this.isInitialized = true;
    },
    computed: {
        ...mapState({
            choreData: state => state.choreData.choreData,
            comments: state => state.comments.comments,
            isInitialized: state => state.comments.isInitialized,
        }),
    },
    methods: {
        handleCommentEdit(commentId) {
            this.comments.forEach((comment) => {
                if (comment.id !== commentId) {
                    comment.isEdited = false;
                }
            });
        }
    }
});