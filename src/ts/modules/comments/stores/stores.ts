import { createStore } from 'vuex';

import choreDataModule from './modules/choredata-store';
import commentsModule from './modules/comments-store';

export default createStore({
   modules: {
      choreData: choreDataModule,
      comments: commentsModule,
   },
});
