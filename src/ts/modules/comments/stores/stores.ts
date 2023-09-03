// @ts-nocheck

import { createStore } from 'vuex';
import choreData from './modules/choredata-store';
import comments from './modules/comments-store';

export default createStore({
   modules: {
      choreData,
      comments,
   },
});
