export default (editor, config = {}) => {
  const bm = editor.BlockManager;
  var comps = editor.DomComponents;

  bm.add('tilt-responsive-table', {
   // id: 'tilt-responsive-table',
    label: 'Responsive Table',
    category: 'TILT Suite',
    attributes: {
      class:'fa fa-table'
    },
    // content: {
    //   editable: false,
    //   droppable: true,
    //   type: 'default',
    //   content:` <div class="table-responsive">
    //               <table class="table">
    //                 <thead>
    //                   <tr data-gjs-type="row">
    //                     <th data-gjs-type="cell">Insert Column Heading</th>
    //                     <th data-gjs-type="cell">Insert Column Heading</th>
    //                   </tr>
    //                 </thead>
    //                 <tbody>
    //                   <tr data-gjs-type="row">
    //                   <td data-gjs-type="cell">Insert Cell Content</td>
    //                   <td data-gjs-type="cell">Insert Cell Content</td>
    //                 </tbody>
    //               </table>
    //               </div>
    //             `,
    //     //Content:policyinfo['0'],  //to be added on editor when this block is dropped on editor
    //     style: {padding: '10px' },
    //     activeOnRender: 1
    // }
    content: `<div class="table-responsive">
                  <table class="table" data-gjs-type="Table">
                    <thead>
                      <tr data-gjs-custom-name="HeaderRow" data-gjs-type="Row">
                        <th data-gjs-type="Cell"><p>Header Text</p></th>
                        <th data-gjs-type="Cell"><p>Header Text</p></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr data-gjs-type="Row">
                        <td data-gjs-type="Cell"><p>Cell Text</p></td>
                        <td data-gjs-type="Cell"><p>Cell Text</p></td>
                      </tr>
                    </tbody>
                  </table>
                </div>`
  });

  bm.add('tilt-image', {
    label: 'Image',
    category: 'TILT Suite',
    attributes: {
      class:'fa fa-picture-o'
    },
    content: { type: 'image', activeOnRender: 1 },
  });

  bm.add('tiltvideo', {
    label: 'Video',
    category: 'TILT Suite',
    attributes: {
      class:'fa fa-youtube-play'
    },
    content: { type: 'video', activeOnRender: 1 },
  });
  // bm.add('text', {
  //   label: 'text',
  //   category: 'TILT Suite',
  //   attributes: {class:'gjs-fonts gjs-f-text'},
  //   content: {
  //     type:'text',
  //     content:'Insert your text here',
  //     style: {padding: '10px' },
  //     activeOnRender: 1
  //   },
  // });

  // bm.get('my-first-block').set({
  //   label: 'updated simple block',
  //   attributes: {
  //     title: 'My title'
  //   }
  // });

  // bm.add('my-map-block', {
  //   label: 'simple map block',
  //   content: {
  //     type: 'map',
  //     style: {
  //       height: '350px'
  //     },
  //     removable: false
  //   }
  // });

  //var bm = editor.BlockManager;

}
