import {computed, defineComponent, onMounted, ref, watch} from 'vue';
import {useStore} from 'vuex';

import Toaster from '../../../utilities/toaster';
import {IChoreData} from '../stores/modules/choredata-store';

export default defineComponent({
    name: 'CommentCardComponent',
    emits: ['commentEdited'],
    props: ['comment', 'isEdited'],
    setup(props, {emit}) {
        const store = useStore();

        let editor: (typeof SimpleMDE) | null = null;
        const editComment = ref<HTMLTextAreaElement>();
        const form = ref({
            user_id: App.userId,
            comment_body: '',
        });

        const choreData = computed<IChoreData>(() => store.state.choreData.choreData);

        const isChoreOwner = computed(() => choreData.value.ownerId === props.comment.user_id);
        const isCommentAuthor = computed(() => App.userId === props.comment.user_id);

        const handleEditCommentChange = () => {
            form.value.comment_body = editor.value();
        };

        const submitEditComment = () => {
            if (form.value.comment_body.trim() === '') {
                Toaster.flash('The comment couldn\'t be empty.', 'warning');
                return;
            }

            if (form.value.comment_body === props.comment.raw_body) {
                props.comment.is_edited = false;
                return;
            }

            store.dispatch('comments/updateComment', {
                ...form.value,
                comment_id: props.comment.id,
            });
        };

        const toggleCommentVisible = () => {
            store.dispatch('comments/updateCommentVisible', {
                user_id: App.userId,
                updates: [{
                    comment_id: props.comment.id,
                    hidden: !props.comment.hidden,
                }],
            }).then(() => {
                props.comment.hidden = !props.comment.hidden;
            });
        };

        const toggleCommentEdit = () => {
            if (props.comment.is_edited) {
                props.comment.is_edited = false;
                return;
            }

            // TODO: It would be nice if we scroll to the top of the edited comment

            emit('commentEdited');
            props.comment.is_edited = true;
        };

        onMounted(() => {
            form.value.comment_body = props.comment.raw_body;
        });

        watch(() => props.isEdited, (newValue) => {
            form.value.comment_body = props.comment.raw_body;

            if (editor) {
                // Destroy the previous instance of the editor
                editor.codemirror.off('change', handleEditCommentChange);
                editor.toTextArea();
                editor = null;
            }

            if (newValue) {
                // Create a new instance of the editor
                editor = new SimpleMDE({element: editComment.value, status: false});
                editor.codemirror.on('change', handleEditCommentChange);
            }
        });

        return {
            editComment,
            form,
            isChoreOwner,
            isCommentAuthor,
            handleEditCommentChange,
            submitEditComment,
            toggleCommentVisible,
            toggleCommentEdit,
        };
    },
});
