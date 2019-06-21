var viewerApp;

function launchViewer(urn) {
  if (viewerApp != null) {
    var thisviewer = viewerApp.getCurrentViewer();
    if (thisviewer) {
      thisviewer.tearDown()
      thisviewer.finish()
      thisviewer = null
      $("#forgeViewer").empty();
    }
  }

  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken
  };
  var documentId = 'urn:' + urn;
  console.log(urn);
  
  Autodesk.Viewing.Initializer(options, function onInitialized() {
    viewerApp = new Autodesk.Viewing.ViewingApplication('forgeViewer');
    //viewerApp.registerViewer(viewerApp.k3D,Autodesk.Viewing.Private.GuiViewer3D,{ extensions:['Autodesk.ADN.Viewing.Extension.Explorer','Autodesk.ADN.Viewing.Extension.Chart.RGraph']});
    viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D, { extensions: ['Autodesk.ADN.Viewing.Extension.MetaProperties', 'Autodesk.ADN.Viewing.Extension.Voice', 'MyColorExtension', 'Autodesk.ADN.Viewing.Extension.Chart.RGraph','Autodesk.ADN.Viewing.Extension.UIComponent','MyAwesomeExtension','IssueExtension']});
   //viewer.loadExtension('Autodesk.Viewing.WebVR', { experimental: ['webVR_orbitModel'] });
   
    viewerApp.loadDocument(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    //viewerApp.registerViewer(viewerApp.k3D,Autodesk.Viewing.Private.GuiViewer3D,{ extensions:['Autodesk.ADN.Viewing.Extension.Chart.RGraph','Autodesk.ADN.Viewing.Extension.MetaProperties']});
   
  });
}
console.log(urn);
function onDocumentLoadSuccess(doc) {
  // We could still make use of Document.getSubItemsWithProperties()
  // However, when using a ViewingApplication, we have access to the **bubble** attribute,
  // which references the root node of a graph that wraps each object from the Manifest JSON.
  var viewables = viewerApp.bubble.search({ 'type': 'geometry' });
  if (viewables.length === 0) {
    console.error('Document contains no viewables.');
    
    return;
  }

  // Choose any of the available viewables
  viewerApp.selectItem(viewables[0].data, onItemLoadSuccess, onItemLoadFail);
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

function onItemLoadSuccess(viewer, item) {
  // item loaded, any custom action?

}

function onItemLoadFail(errorCode) {
  console.error('onItemLoadFail() - errorCode:' + errorCode);
}



//Code for Excel Extractor
var sampleURN
    // wait until the document is ready...
    //$(document).ready(function () {
     // jQuery.ajax({
        //url: '/uploads',
        //success: function (uploads) {
         // if (uploads) {
            $('#downloadExcel').click(downloadExcel);
            //sampleURN = documentId.urn;
           // showModel(sampleURN);
        //  }
        //}
     // });
   // });
    
    // this will prepare and download the XLS file
    function downloadExcel() {
      $('#downloadExcel').prop("disabled", true);
      getForgeToken(function (access_token, expires_in) {
        ForgeXLS.downloadXLSX(sampleURN, access_token, statusCallback /*Optional*/);
      });
    }
    function statusCallback(completed, message) {
      $.notify(message, 'info');
      $('#downloadExcel').prop("disabled", !completed);
    }
    // get Forge token (use your data:read endpoint here)
    // this sample is using client-side JavaScript only, so no
    // back-end that authenticate with Forge nor files, therefore
    // is using files from another sample. On your implementation,
    // you should replace this with your own Token endpoint
   /* function getForgeToken(callback) {
      jQuery.ajax({
        url: '/forge/oauth/token',
        success: function (oauth) {
          if (callback)
            callback(oauth.access_token, oauth.expires_in);
        }
      });
    }*/
    function getForgeToken(callback) {
      jQuery.ajax({
        url: '/api/forge/oauth/token',
        success: function (res) {
          callback(res.access_token, res.expires_in)
        }
      });
    }
    
    
    Autodesk.Viewing.UI.PropertyPanel.prototype.onPropertyClick = onPropertyClick
    // ...


function getSubset(dbIds, name, value, callback) {
    console.log("getSubset, dbIds.length before = " + dbIds.length)
    viewerApp.model.getBulkProperties(dbIds, {
        propFilter: [name],
        ignoreHidden: true
    }, function(data) {
        var newDbIds = []
        for (var key in data) {
            var item = data[key]
            if (item.properties[0].displayValue === value) {
                newDbIds.push(item.dbId)
            }
        }

        console.log("getSubset, dbIds.length after = " + newDbIds.length)

        callback(newDbIds)

    }, function(error) {})
}

function onPropertyClick(property, event) {
    console.log(property.name + " = " + property.value)
    viewerApp.search('"' + property.value + '"', function(dbIds) {
        console.log(dbIds.length);
        getSubset(dbIds, property.name, property.value, function(dbIds) {
          viewerApp.isolate(dbIds)
        })
    }, function(error) {}, [property.attributeName])
}