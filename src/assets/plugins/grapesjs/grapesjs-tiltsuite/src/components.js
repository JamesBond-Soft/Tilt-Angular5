export default (editor, config = {}) => {
  const comps = editor.DomComponents;
  
  //const defaultType = domc.getType('default');
  var defaultType = comps.getType('video');
  const defaultModel = defaultType.model;
  const defaultView = defaultType.view;
  // ...

  
  comps.addType('video', {
    model: defaultModel.extend({
      toHTML() {
        var prov = this.get('provider');
        if(prov !== "so" && prov !== ""){
          if(this.view && this.view.el && this.view.el.innerHTML){
            return  this.view.el.innerHTML;//this.view.renderByProvider(prov);
          }
          
        } else {
          if(this.attributes.attributes && this.attributes.attributes['data-uuid']){
            return `<div id="rla-${this.attributes.attributes['data-uuid']}"><!-- RESOURCELIBARYASSET:${this.attributes.attributes['data-uuid']} --></div>`;
          } else {
            return '';
          }
        }
        
      }
    }),
    view: defaultType.view.extend({
      init(){
        // The 'active' is triggered by the 'activeOnRender' you've used inside your block
       this.listenTo(this.model, 'active', this.doStuff);
     },
      events: {
        // click: function(){
        //   this.model.set('active', 1);
        // },
        dblclick: function(){
          console.log('dbl click');
          this.doStuff();
        }
      },
      doStuff(){
        console.log('tada');
        this.opts.config.em.get('Editor').runCommand('open-assets', { target: this.model, types:['video'], accept: 'image/*'})
      }
    }),
  });
}
