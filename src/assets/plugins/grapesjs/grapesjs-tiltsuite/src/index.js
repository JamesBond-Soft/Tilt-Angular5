import grapesjs from 'grapesjs';
import loadComponents from './components';
import loadBlocks from './blocks';

export default grapesjs.plugins.add('grapesjs-tiltsuite', (editor, opts = {}) => {
  // const options = { ...{
  //   // default options
  //   category: 'TILT Suite',
  // },  ...opts };
  const options = {
    addBasicStyle: true,
    category: 'TILT Suite',
    ...opts
  };

  // Add components
  loadComponents(editor, options);

  // Add blocks
  loadBlocks(editor, options);

  // TODO Remove
 // editor.on('load', () => editor.addComponents(`<div style="margin:100px; padding:25px;">Content loaded from the plugin</div>`, { at: 0 }))
});
