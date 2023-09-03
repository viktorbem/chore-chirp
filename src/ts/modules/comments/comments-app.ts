import {defineComponent, onBeforeMount, ref} from 'vue';
import {useStore} from 'vuex';

import AddCommentComponent from './components/add-comment-component.vue';
import CommentListComponent from './components/comment-list-component.vue';

import {IChoreData} from './stores/modules/choredata-store';

export default defineComponent({
    name: 'CommentsApp',
    components: {
        AddCommentComponent,
        CommentListComponent,
    },
    setup() {
        const choreData = ref<IChoreData>();
        const store = useStore();

        onBeforeMount(() => {
            // Get the data about the current chore from the element
            const choreRefElement = document.getElementById('comments-app-container');
            if (choreRefElement) {
                store.dispatch('choreData/getChoreData', {...choreRefElement.dataset});
            }
        });

        return {
            choreData,
        };
    },
});
