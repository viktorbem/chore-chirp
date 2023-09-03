<template>
    <template v-if="isInitialized">
        <comment-card-component v-for="comment in comments" :comment="comment" :is-edited="comment.isEdited"
                                :key="comment.id" @comment-edited="handleCommentEdit(comment.id)" />
    </template>
    <loading-component v-else />
</template>

<script lang="ts" src="./comment-list-component.ts"></script>