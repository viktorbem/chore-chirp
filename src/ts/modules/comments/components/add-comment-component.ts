import {computed, defineComponent, onMounted, ref} from 'vue';
import {useStore} from 'vuex';

import Toaster from '../../../utilities/toaster';

import {IChoreData} from '../stores/modules/choredata-store';

export default defineComponent({
    name: 'AddCommentComponent',
    setup() {
        const store = useStore();

        let editor: (typeof SimpleMDE) | null = null;
        const commentBody = ref<HTMLTextAreaElement>();
        const form = ref({
            user_id: App.userId,
            comment_body: '',
        });

        const choreData = computed<IChoreData>(() => store.state.choreData.choreData);

        const submitAddComment = async () => {
            if (form.value.comment_body.trim() === '') {
                Toaster.flash('The comment couldn\'t be empty.', 'warning');
                return;
            }

            const payload = {
                ...form.value,
                chore_id: choreData.value.id,
            };

            store.dispatch('comments/addComment', payload).then(() => {
                editor?.value('');
            });
        };

        onMounted(() => {
            // Initialize SimpleMDE instance of the add-comment section
            editor = new SimpleMDE({element: commentBody.value, status: false});
            editor.codemirror.on('change', () => {
                form.value.comment_body = editor.value();
            });
        });

        return {
            commentBody,
            form,
            submitAddComment,
        };
    },
});
