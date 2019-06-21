// *******************************************
// Information Panel SBS 20.05.2019
// *******************************************


var value;



function MyAwesomePanel(viewer, container, id, title, options) {
    console.log('Value inside the class declration is:' + value)
    this.viewer = viewer;
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);

    // the style of the docking panel
    // use this built-in style to support Themes on Viewer 4+
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.style.top = "10px";
    this.container.style.left = "10px";
    this.container.style.width = "auto";
    this.container.style.height = "auto";
    this.container.style.resize = "auto";

    // this is where we should place the content of our panel
    var div = document.createElement('div');
    div.style.margin = '20px';

    fetch('./readdatainfo', {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
        },
    }).then(res => res.json()).then(res => {
        // value = JSON.stringify(res);
        console.log(JSON.stringify(res));
        console.log('Length of response: ' + res.length);
        for (i = 0; i < res.length; i++) {
            value += (JSON.stringify(res[i].value) + ",");
            console.log(JSON.stringify(res[i].value))
        }
    
        div.innerText = value.split(',').join("\r\n"); 
    }) 

   
    this.container.appendChild(div);
    // and may also append child elements...

}
MyAwesomePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
MyAwesomePanel.prototype.constructor = MyAwesomePanel;



// *******************************************
// My Awesome Extension
// *******************************************
function MyAwesomeExtension(viewer, options) {
    Autodesk.Viewing.Extension.call(this, viewer, options);
    this.panel = null;
}

MyAwesomeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
MyAwesomeExtension.prototype.constructor = MyAwesomeExtension;

MyAwesomeExtension.prototype.load = function () {
    if (this.viewer.toolbar) {
        // Toolbar is already available, create the UI
        this.createUI();
    } else {
        // Toolbar hasn't been created yet, wait until we get notification of its creation
        this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
        this.viewer.addEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    }
    return true;
};

MyAwesomeExtension.prototype.onToolbarCreated = function () {
    this.viewer.removeEventListener(av.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    this.onToolbarCreatedBinded = null;
    this.createUI();
};

    

MyAwesomeExtension.prototype.createUI = function () {
    var viewer = this.viewer;
    var panel = this.panel;

    //let val;

    // button to show the docking panel
    var toolbarButtonShowDockingPanel = new Autodesk.Viewing.UI.Button('showMyAwesomePanel');
    toolbarButtonShowDockingPanel.onClick = function (e) {

        console.log('Docking Panel clicked')
        
        
        
        // fetch('./readdatainfo', {
        //     method: 'get',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Accept': 'application/json, text/plain, */*',
        //     },
        // }).then(res => res.json()).then(res => {
        //     // value = JSON.stringify(res);
        //     console.log(JSON.stringify(res));
        //     console.log('Length of response: ' + res.length);
        //     for (i = 0; i < res.length; i++) {
        //         val += (JSON.stringify(res[i].value) + ",");
        //        // console.log(JSON.stringify(res[i].value))
        //        console.log('value inside for loop:'+ i + val)
        //     }
        
        // })

        console.log('Value inside the regular function for creation of panel:' )

        // if null, create it
        if (panel == null) 
        {   console.log('Value inside the IF function for creation of panel:' )
            panel = new MyAwesomePanel(viewer, viewer.container,
                'awesomeExtensionPanel', 'Information');}
                //viewer, container, id, title, options,val

        // show/hide docking panel
        panel.setVisible(!panel.isVisible());
    };
    // myAwesomeToolbarButton CSS class should be defined on your .css file
    // you may include icons, below is a sample class:
    /* 
    .myAwesomeToolbarButton {
        background-image: url(/img/myAwesomeIcon.png);
        background-size: 24px;
        background-repeat: no-repeat;
        background-position: center;
    }*/
    toolbarButtonShowDockingPanel.addClass('myAwesomeToolbarButton');
    toolbarButtonShowDockingPanel.setToolTip('Information');

    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('MyAwesomeAppToolbar');
    this.subToolbar.addControl(toolbarButtonShowDockingPanel);

    viewer.toolbar.addControl(this.subToolbar);
};

MyAwesomeExtension.prototype.unload = function () {
    this.viewer.toolbar.removeControl(this.subToolbar);
    return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);