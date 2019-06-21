///////////////////////////////////////////////////////////////////////////////
// Meta Properties Panel Extension
// by Philippe Leefsma, May 2015
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.MetaProperties = function (viewer, options) {
  
  // base constructor
  Autodesk.Viewing.Extension.call(this, viewer, options);

  var _self = this;

  
  ///////////////////////////////////////////////////////////////////////////
  // load callback
  //
  ///////////////////////////////////////////////////////////////////////////
  _self.load = function () {

    var panel = new Autodesk.ADN.Viewing.Extension.MetaPropertyPanel(
      viewer);
    
    viewer.setPropertyPanel(panel);

    viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelection);

    console.log("Autodesk.ADN.Viewing.Extension.MetaProperties loaded");

    
    
    return true;
  };

  
  
  ///////////////////////////////////////////////////////////////////////////
  // unload callback
  //
  ///////////////////////////////////////////////////////////////////////////
  _self.unload = function () {
    
    viewer.setPropertyPanel(null);
    
    console.log("Autodesk.ADN.Viewing.Extension.MetaProperties unloaded");
    
    return true;
  };
  
  ///////////////////////////////////////////////////////////////////////////
  // MetaPropertyPanel
  // Overrides native viewer property panel
  ///////////////////////////////////////////////////////////////////////////
  Autodesk.ADN.Viewing.Extension.MetaPropertyPanel = function (viewer) {

    var _panel = this;

    Autodesk.Viewing.Extensions.ViewerPropertyPanel.call(
      _panel,
      viewer);

    /////////////////////////////////////////////////////////////////
    // setNodeProperties override
    //
    /////////////////////////////////////////////////////////////////
    _panel.setNodeProperties = function(nodeId) {

      Autodesk.Viewing.Extensions.ViewerPropertyPanel.
        prototype.setNodeProperties.call(
        _panel,
        nodeId);

      _panel.nodeId = nodeId;
    };

    
    _self.onSelection = function(event){

     //var it = NOP_VIEWER.model.getData().instanceTree;

      var keys = event.dbIdArray[0];
      _panel.key = keys
      
      //var it = NOP_VIEWER.model.getData().instanceTree;
     // var nodeFinalName = it.getNodeName(_panel.key)
      //console.log(nodeFinalName)
      
     // var indexinNames = it.nodeAccess.dbIdToIndex[_panel.key];
      //var indexinStrings = it.nodeAccess.names[indexinNames];
      //var nodeMainString = it.nodeAccess.strings[indexinStrings];
      //var nodeSuffixString = it.nodeAccess.nameSuffixes[indexinStrings];
     // _panel.suffix = nodeSuffixString;
      //console.log(nodeSuffixString)
    }

   

    /////////////////////////////////////////////////////////////////
    // Adds new meta property to panel
    //
    /////////////////////////////////////////////////////////////////
    _panel.addMetaProperty = function (metaProperty, options) {

      var element = this.tree.getElementForNode({
        name: metaProperty.name,
        value: metaProperty.value,
        category: metaProperty.category
      });

      if (element) {
        return false;
      }

      var parent = null;

      if (metaProperty.category) {

        parent = this.tree.getElementForNode({name: metaProperty.category});

        if (!parent) {
          parent = this.tree.createElement_({
              name: metaProperty.category,
              type: 'category'},
            this.tree.myRootContainer, options && options.localizeCategory ? {localize: true} : null);
        }

      } else {

        parent = this.tree.myRootContainer;
      }

      this.tree.createElement_(
        metaProperty,
        parent,
        options && options.localizeProperty ? {localize: true} : null);

      return true;
    };

    /////////////////////////////////////////////////////////////////
    // setProperties override                                      
    //
    /////////////////////////////////////////////////////////////////

    _panel.setProperties = function (properties) {

      Autodesk.Viewing.Extensions.ViewerPropertyPanel.
        prototype.setProperties.call(
        _panel,
        properties);

      var jsn;
      $.ajax({
        url: "/json/data.json",
        async: false,
        dataType: 'json',
        success: function (json) {
          jsn = json ;
        }
      });

      var instanceTree = _panel.viewer.impl.model.getData().instanceTree;
      var instanceName = instanceTree.getNodeName(_panel.key)
      var elmntId = instanceName.substring(
instanceName.lastIndexOf("[") + 1, 
instanceName.lastIndexOf("]")
);

console.log(elmntId)

      var date = '';
      for(let i = 0; i <jsn[2].data.length; i++){
        if(elmntId.toString() == jsn[2].data[i].part_id.toString()){
          var InfObj = (jsn[2].data[i]);
            if(InfObj.date == ''){
              date = 'Nicht Installiert'
            }
            else{
              date = InfObj.date
            }
          break;
        }
        else{
          date = 'Installation complete'
        }
      }
       
      var empytobj = {"name": " ", "value": " " , "category": " ","dataType": " "}
      empytobj.name = 'Status'
      empytobj.value = date;
      empytobj.category = 'Meta Properties';
      empytobj.dataType = 'text';

      var linkProp = {
        name: 'Link Property',
        value: 'Room Location Link',
        category: 'Meta Properties',
        dataType: 'link',
        href: 'https://www.ethz.ch/services/en/service/rooms-and-buildings/orientierung/gebaeude.html?args0=HIL'
      };

      var fileProp = {
        name: 'File Property',
        value: 'Floor Plan',
        category: 'Meta Properties',
        dataType: 'file',
        href: 'img/hil_e_floor_plan.pdf',
        filename: 'hil_e_floor_plan.pdf'
      };

      var imgProp = {
        name: 'Image Property',
        category: 'Meta Properties',
        dataType: 'img',
        href: 'img/classroom.jpg',
        filename: 'classroom.jpg'
      };

      _panel.addMetaProperty(empytobj);
      _panel.addMetaProperty(linkProp)
      _panel.addMetaProperty(fileProp);
      _panel.addMetaProperty(imgProp);
    };

    /////////////////////////////////////////////////////////////////
    // displayProperty override
    //
    /////////////////////////////////////////////////////////////////
    _panel.displayProperty = function (property, parent, options) {

      var name = document.createElement('div');

      var text = property.name;

      if (options && options.localize) {
        name.setAttribute('data-i18n', text);
        text = Autodesk.Viewing.i18n.translate(text);
      }

      name.textContent = text;
     name.title = text;
      name.className = 'propertyName';

      var separator = document.createElement('div');
      separator.className = 'separator';

      parent.appendChild(name);
      parent.appendChild(separator);

      var value = null;
      
      //native properties dont have a dataType
      //display them just as text
      if(!property.dataType) {
        value = createTextProperty(property, parent);
        return [name, value];
      }

      switch (property.dataType) {

        case 'text':
          value = createTextProperty(property, parent);
          break;

        case 'link':
          value = createLinkProperty(property, parent);
          break;

        case 'img':
          value = createImageProperty(property, parent);
          break;

        case 'file':
          value = createFileProperty(property, parent);
          break;

        default :
          break;
      }

      // Make the property name and value highlightable.
      return [name, value];
    }

    /////////////////////////////////////////////////////////////////
    // Creates a text property
    //
    /////////////////////////////////////////////////////////////////
    function createTextProperty(property, parent){

      var value = document.createElement('div');
      value.textContent = property.value;
      value.title = property.value;
      value.className = 'propertyValue';

      parent.appendChild(value);

      return value;
    }

    /////////////////////////////////////////////////////////////////
    // Creates a link property
    //
    /////////////////////////////////////////////////////////////////
    function createLinkProperty(property, parent){

      var id = guid();

      var html = [

        '<div id="' + id + '" class="propertyValue">',
          '<a  href="' + property.href + '" target="_blank"> ' + property.value + '</a>',
        '</div>'

      ].join('\n');

      $(parent).append(html);

      return $('#' + id)[0];
    }

    /////////////////////////////////////////////////////////////////
    // Creates an image property
    //
    /////////////////////////////////////////////////////////////////
    function createImageProperty(property, parent){

      var id = guid();

     var html = [

        '<div id="' + id + '" class="propertyValue">' +
          '<a href="' + property.href +'">',
            '<img src="' + property.href +'" width="128" height="128"> </img>' +
          '</a>',
        '</div>'

      ].join('\n');

      $(parent).append(html);

      return $('#' + id)[0];
    }

    /////////////////////////////////////////////////////////////////
    // Creates a file property
    //
    /////////////////////////////////////////////////////////////////
    function createFileProperty(property, parent){

      var id = guid();

      var html = [

        '<div id="' + id + '" class="propertyValue">' +
          '<a href="' + property.href +'">',
            property.value,
          '</a>',
        '</div>'

      ].join('\n');

      $(parent).append(html);

      return $('#' + id)[0];
    }

    /////////////////////////////////////////////////////////////////
    // onPropertyClick handle
    //
    /////////////////////////////////////////////////////////////////
    _panel.onPropertyClick = function (property, event) {

      if(!property.dataType)
        return;

      switch(property.dataType){

        case 'text':
          //nothing to do for text
          break;

        // opens link in new tab
        case 'link':
          window.open(property.href, '_blank');
          break;

        // download image or file
        case 'img':
        case 'file':
          downloadURI(property.href, property.filename);
          break;

        default :
          break;
      }
    };

    
    /////////////////////////////////////////////////////////////////
    // Download util
    //
    /////////////////////////////////////////////////////////////////
    function downloadURI(uri, name) {

      var link = document.createElement("a");
      link.download = name;
      link.href = uri;
      link.click();
    }

    /////////////////////////////////////////////////////////////////
    // New random guid util
    //
    /////////////////////////////////////////////////////////////////
    function guid() {

      var d = new Date().getTime();

      var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
        /[xy]/g,
        function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });

      return guid;
    };
    // New function for isolating on selecion

    
    
  };

  Autodesk.ADN.Viewing.Extension.MetaPropertyPanel.prototype =
    Object.create(
      Autodesk.Viewing.Extensions.ViewerPropertyPanel.prototype);

  Autodesk.ADN.Viewing.Extension.MetaPropertyPanel.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.MetaPropertyPanel;
};

Autodesk.ADN.Viewing.Extension.MetaProperties.prototype =
  Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.MetaProperties.prototype.constructor =
  Autodesk.ADN.Viewing.Extension.MetaProperties;

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Autodesk.ADN.Viewing.Extension.MetaProperties',
  Autodesk.ADN.Viewing.Extension.MetaProperties);

