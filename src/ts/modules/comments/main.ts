import {createApp} from 'vue';

import CommentsApp from './comments-app.vue';
import stores from './stores/stores';

const commentsAppContainer = document.getElementById('comments-app-container');

if (commentsAppContainer) {
    const commentsApp = createApp(CommentsApp);
    commentsApp.use(stores);
    commentsApp.mount(commentsAppContainer);
}