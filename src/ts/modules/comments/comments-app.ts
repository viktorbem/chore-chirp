// @ts-nocheck

import {defineComponent} from 'vue';

import AddCommentComponent from './components/add-comment-component.vue';
import CommentListComponent from './components/comment-list-component.vue';

export default defineComponent({
    name: 'CommentsApp',
    components: {
        AddCommentComponent,
        CommentListComponent,
    },
    data() {
        return {};
    },
    beforeMount() {
        // Get the data about the current chore from the element
        const choreRefElement = document.getElementById('comments-app-container');
        if (choreRefElement) {
            this.$store.dispatch('choreData/getChoreData', {...choreRefElement.dataset});
        }
    },
});
