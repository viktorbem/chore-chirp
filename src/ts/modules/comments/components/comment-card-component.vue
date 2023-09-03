<template>
    <div class="card mb-4">
        <div class="card-header" :class="comment.hidden && 'comment-header-hidden'">
            <h6 class="comment-title my-0 d-flex justify-content-between align-items-center">
                <template v-if="comment.hidden">
                    <div>
                        <span class="comment-hidden text-body-tertiary">
                            This comment was hidden by the chore owner.
                        </span>
                    </div>
                    <div>
                        <a href="#" v-if="isChoreOwner" @click.prevent="toggleCommentVisible"
                           class="ms-2 link-secondary" title="Show comment">
                            <i class="bi bi-eye"></i>
                        </a>
                    </div>
                </template>
                <template v-else>
                    <div>
                        <span>{{comment.user}}</span>
                        <span class="d-none d-lg-inline-block comment-timestamp text-body-tertiary">{{comment.created_at}}</span>
                    </div>
                    <div v-if="!comment.is_edited">
                        <a href="#" v-if="isCommentAuthor" @click.prevent="toggleCommentEdit"
                           class="ms-2 link-secondary" title="Edit comment">
                            <i class="bi bi-pencil-square"></i>
                        </a>
                        <a href="#" v-if="isChoreOwner" @click.prevent="toggleCommentVisible"
                           class="ms-2 link-secondary" title="Hide comment">
                            <i class="bi bi-eye-slash"></i>
                        </a>
                    </div>
                </template>
            </h6>
        </div>
        <template v-if="!comment.hidden">
            <div class="card-body" :class="comment.is_edited && 'is-hidden'" v-html="comment.body"></div>
            <div class="card-body" :class="!comment.is_edited && 'is-hidden'">
                <form @submit.prevent="submitEditComment">
                    <div class="form-floating mb-3">
                        <textarea class="form-control vue" v-model="form.comment_body"
                                  ref="editComment" name="Comment" placeholder="Comment"></textarea>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <a href="#" class="btn btn-outline-secondary col-5 col-lg-3"
                           @click.prevent="toggleCommentEdit">Cancel</a>
                        <button class="btn btn-success col-5 col-lg-3" type="submit">Save changes</button>
                    </div>
                </form>
            </div>
        </template>
    </div>
</template>

<script lang="ts" src="./comment-card-component.ts"></script>