import {computed, defineComponent, onMounted} from 'vue';
import {useStore} from 'vuex';

import CommentCardComponent from './comment-card-component.vue';
import LoadingComponent from './loading-component.vue';

import {IComment} from '../stores/modules/comments-store';
import {IChoreData} from '../stores/modules/choredata-store';

export default defineComponent({
    name: 'CommentListComponent',
    components: {
        CommentCardComponent,
        LoadingComponent,
    },
    setup() {
        const store = useStore();

        const choreData = computed<IChoreData>(() => store.state.choreData.choreData);
        const comments = computed<IComment[]>(() => store.state.comments.comments);
        const isInitialized = computed<boolean>(() => store.state.comments.isInitialized);

        const handleCommentEdit = (commentId: string) => {
            comments.value.forEach((comment) => {
                if (comment.id !== commentId) {
                    comment.is_edited = false;
                }
            });
        };

        onMounted(() => {
            // Populate the comments from the backend database
            store.dispatch('comments/getComments', choreData.value.id);
        });

        return {
            choreData,
            comments,
            isInitialized,
            handleCommentEdit,
        };
    },
});