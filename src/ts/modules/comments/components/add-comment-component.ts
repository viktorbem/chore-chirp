// @ts-nocheck

import {defineComponent} from 'vue';
import {mapState} from 'vuex';

import Toaster from '../../../utilities/toaster';

export default defineComponent({
    name: 'AddCommentComponent',
    data() {
        return {
            form: {
                user_id: App.userId,
                comment_body: '',
            },
            editor: null,
        }
    },
    mounted() {
        // Initialize SimpleMDE instance of the add-comment section
        this.editor = new SimpleMDE({element: this.$refs.commentBody, status: false});
        this.editor.codemirror.on('change', () => {
            this.form.comment_body = this.editor.value();
        });
    },
    computed: {
        ...mapState({
            choreData: state => state.choreData.choreData,
        }),
    },
    methods: {
        async submitAddComment() {
            if (this.form.comment_body.trim() === '') {
                Toaster.flash('The comment couldn\'t be empty.', 'warning');
                return;
            }

            const payload = {
                ...this.form,
                chore_id: this.choreData.id
            }

            this.$store.dispatch('comments/addComment', payload).then(() => {
                this.editor.value('');
            });
        },
    }
});