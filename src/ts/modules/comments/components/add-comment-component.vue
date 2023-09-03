<template>
    <div class="card mb-4">
        <div class="card-header">
            Add comment:
        </div>
        <div class="card-body">
            <form @submit.prevent="submitAddComment">
                <div class="form-floating mb-3">
                    <textarea class="form-control vue" v-model="form.comment_body" ref="commentBody"
                              name="Comment" placeholder="Comment"></textarea>
                </div>
                <button class="btn btn-success col-5 col-lg-3 float-end" type="submit">Add comment</button>
            </form>
        </div>
    </div>
</template>

<script lang="ts" src="./add-comment-component.ts"></script>