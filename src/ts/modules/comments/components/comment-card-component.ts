// @ts-nocheck

import {defineComponent} from 'vue';
import {mapState} from 'vuex';

import Toaster from '../../../utilities/toaster';

export default defineComponent({
    name: 'CommentCardComponent',
    emits: ['commentEdited'],
    props: ['comment', 'isEdited'],
    data() {
        return {
            editor: null,
            form: {
                user_id: App.userId,
                comment_body: '',
            },
        }
    },
    mounted() {
        this.form.comment_body = this.comment.raw_body;
    },
    computed: {
        ...mapState({
            choreData: state => state.choreData.choreData,
        }),
        isChoreOwner() {
            return this.choreData.ownerId === this.comment.user_id;
        },
        isCommentAuthor() {
            return App.userId === this.comment.user_id;
        },
    },
    methods: {
        handleEditCommentChange() {
            this.form.comment_body = this.editor.value();
        },
        submitEditComment() {
            if (this.form.comment_body.trim() === '') {
                Toaster.flash('The comment couldn\'t be empty.', 'warning');
                return;
            }

            if (this.form.comment_body === this.comment.raw_body) {
                this.comment.isEdited = false;
                return;
            }

            this.$store.dispatch('comments/updateComment', {
                ...this.form,
                comment_id: this.comment.id,
            });
        },
        toggleCommentVisible() {
            this.$store.dispatch('comments/updateCommentVisible', {
                user_id: App.userId,
                updates: [{
                    comment_id: this.comment.id,
                    hidden: !this.comment.hidden,
                }],
            }).then(() => {
                this.comment.hidden = !this.comment.hidden;
            });
        },
        toggleCommentEdit() {
            if (this.comment.isEdited) {
                this.comment.isEdited = false;
                return;
            }

            // TODO: It would be nice if we scroll to the top of the edited comment

            this.$emit('commentEdited');
            this.comment.isEdited = true;
        },
    },
    watch: {
        isEdited(newValue) {
            this.form.comment_body = this.comment.raw_body;

            if (this.editor) {
                // Destroy the previous instance of the editor
                this.editor.codemirror.off('change', this.handleEditCommentChange);
                this.editor.toTextArea();
                this.editor = null;
            }

            if (newValue) {
                // Create a new instance of the editor
                this.editor = new SimpleMDE({element: this.$refs.editComment, status: false});
                this.editor.codemirror.on('change', this.handleEditCommentChange);
            }
        }
    }
});