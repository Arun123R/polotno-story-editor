
import { createStore } from 'polotno/model/store';
// import { setAnimationsEnabled } from 'polotno/config';

export const store = createStore({
  key: 'TXsh4gxnlODn4eJrqeDi',
  showCredit: true,
});

store.addPage();

// setAnimationsEnabled(true);
store.play();
store.stop();
// await store.saveAsGIF();

