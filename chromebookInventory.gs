var scriptTitle = "chromebookInventory Script V1.0.1 (2/1/14)";
var scriptName = "chromebookInventory";
var scriptTrackingId = "UA-47686431-1";
var chromebookInventoryIconId = "0B7-FEGXAo-DGVVBJZ1RtWFlDVVE";

// Written by Andrew Stillman for New Visions for Public Schools
// Published under GNU General Public License, version 3 (GPL-3.0)
// See restrictions at http://www.opensource.org/licenses/gpl-3.0.html

function specialAuthorization() {
  var customerId = fetchCustomerId();
  ScriptProperties.setProperty('scriptAuthorized', 'true');
  onOpen();
}

var headers = ['etag','Org Unit Path','Serial Number','Platform Version','Device Id','Status','Last Enrollment Time','Firmware Version','Last Sync','OS Version','Boot Mode','Annotated Location','Notes','Annotated User'];
var specialauthId = '0B7-FEGXAo-DGVklteGtFT2trOFU';
var image1Id = '0B7-FEGXAo-DGZ2txTWFnZ05SVVU';
var image2Id = '0B7-FEGXAo-DGeTUydWNHTjVDUVE';
var image3Id = '0B7-FEGXAo-DGRFNxX054S3p4QUE';
var imageBase = 'https://drive.google.com/uc?export=download&id=';


function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var menuItems = [];
  var scriptAuthorized = ScriptProperties.getProperty('scriptAuthorized');
  var adminSDKAuthorized = ScriptProperties.getProperty('adminSDKAuthorized');
  menuItems.push({name:'What is chromebookInventory?', functionName:'chromebookInventory_whatIs'});
  menuItems.push(null);
  if ((!scriptAuthorized)||(!adminSDKAuthorized)) {
    menuItems.push({name:'Chromebook inventory export/update tool', functionName:'inventoryHowTo'});
    ss.addMenu('chromebookInventory', menuItems);
    return;
  }
  menuItems.push({name:'Export full Chromebook inventory to sheet', functionName:'fetchInventory'});
  menuItems.push({name:'Update Chromebook location, user, notes fields', functionName: 'updateInventory'});
  ss.addMenu('chromebookInventory', menuItems)
}


function inventoryHowTo() {
  var institutionalTrackingString = NVSL.checkInstitutionalTrackingCode();
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var app = UiApp.createApplication().setTitle('Setting up the Chromebook Inventory Fetcher');
  var outerScrollPanel = app.createScrollPanel().setHeight('300px');
  var panel = app.createVerticalPanel();
  var instructionsGrid = app.createGrid(8, 2);
  
  instructionsGrid.setStyleAttribute(0, 0, 'backgroundColor', 'grey').setStyleAttribute(0, 1, 'backgroundColor', 'grey');
  var step0HTML = app.createHTML('You must be a domain super administrator on a Google Apps domain with Chrome Device Management Console licenses in order to run this tool. Go to <strong>Tools->Script editor</strong>. In the <strong>Run</strong> menu, select <strong>specialAuthorization</strong> and authorize the Directory API to fetch your Google Apps customer Id.');
  var step0Image = app.createImage(imageBase + specialauthId).setWidth('300px');
  instructionsGrid.setWidget(1, 0, step0HTML).setWidget(1, 1, step0Image);
  
  
  instructionsGrid.setStyleAttribute(2, 0, 'backgroundColor', 'grey').setStyleAttribute(2, 1, 'backgroundColor', 'grey');
  var step1HTML = app.createHTML('In the <strong>Script editor</strong>, go to the <strong>Resources</strong> menu, and select <strong>Advanced Google Services</strong>');
  var step1Image = app.createImage(imageBase + image1Id).setWidth('300px');
  instructionsGrid.setWidget(3, 0, step1HTML).setWidget(3, 1, step1Image);
  
  
  instructionsGrid.setStyleAttribute(4, 0, 'backgroundColor', 'grey').setStyleAttribute(4, 1, 'backgroundColor', 'grey');
  var step2HTML = app.createHTML('Ensure that the <strong>Admin Directory API</strong> is enabled, then click to visit the <strong>Google Developers Console</strong>');
  var step2Image = app.createImage(imageBase + image2Id).setWidth('300px');
  instructionsGrid.setWidget(5, 0, step2HTML).setWidget(5, 1, step2Image);
  
  instructionsGrid.setStyleAttribute(6, 0, 'backgroundColor', 'grey').setStyleAttribute(6, 1, 'backgroundColor', 'grey');
  var step3HTML = app.createHTML('In the <strong>Google Developers Console</strong>, enable the <strong>Admin SDK</strong>. Congrats. The Chromebook Inventory Export/Update tool should now be ready to use!');
  var step3Image = app.createImage(imageBase + image3Id).setWidth('300px');
  instructionsGrid.setWidget(7, 0, step3HTML).setWidget(7, 1, step3Image);
  
  panel.add(instructionsGrid);
  
  var clickHandler = app.createServerHandler('refreshMenu');
  var button = app.createButton('Got it!  I\'ve completed these steps', clickHandler);
  panel.add(button);
  
  outerScrollPanel.add(panel);
  app.add(outerScrollPanel);
  ss.show(app);
  return app;
}



function refreshMenu() {
  try {
    setSid();
    var customerId = fetchCustomerId();
    var test = AdminDirectory.Chromeosdevices.list(customerId);
    ScriptProperties.setProperty('adminSDKAuthorized', 'true');
    var app = UiApp.getActiveApplication();
    app.close();
    onOpen();
    return app;
  } catch(err) {
    Browser.msgBox("Something was wrong with your setup... Please review the instructions and try again.");
    inventoryHowTo()
  }
}


function updateInventory() {
  var ok = Browser.msgBox('Are you sure?  This will update the Annotated User, Annotated Location, and Notes for all devices listed in the sheet', Browser.Buttons.OK_CANCEL);
  if (ok == "ok") {
    try {
      var updatedCount = 0;
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheets()[0];
      sheet.setName('Inventory Sheet');
      if (sheet.getLastRow()>1) {
        var data = NVSL.getRowsData(sheet);
        var customerId = fetchCustomerId();
        for (var i=0; i<data.length; i++) {
          AdminDirectory.Chromeosdevices.update(data[i], customerId, data[i].deviceId);
          updatedCount++;
        }
      }
      Browser.msgBox(updatedCount + " Chrome devices were updated in the inventory...")
    } catch (err) {
      Browser.msgBox(err.message);
    }
  }
}


function fetchInventory() {
  try {
    var allDevices = [];
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    sheet.clearContents();
    var customerId = fetchCustomerId();
    var response = AdminDirectory.Chromeosdevices.list(customerId, {maxResults: 100});
    allDevices = allDevices.concat(response.chromeosdevices);
    while (response.nextPageToken) {
      response = AdminDirectory.Chromeosdevices.list(customerId, {maxResults: 100, pageToken: response.nextPageToken});
      allDevices = allDevices.concat(response.chromeosdevices);
    }    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    SpreadsheetApp.flush();
    NVSL.setRowsData(sheet, allDevices);
    Browser.msgBox("Chromebook inventory download complete!");
  } catch(err) {
    Browser.msgBox(err.message);
  }
}



function fetchCustomerId() {
  var oauthConfig = UrlFetchApp.addOAuthService("google");
  var scope = "https://apps-apis.google.com/a/feeds/policies/";
  oauthConfig.setRequestTokenUrl("https://www.google.com/accounts/OAuthGetRequestToken?scope="+scope);         
  oauthConfig.setAuthorizationUrl("https://www.google.com/accounts/OAuthAuthorizeToken");
  oauthConfig.setAccessTokenUrl("https://www.google.com/accounts/OAuthGetAccessToken");
  
  oauthConfig.setConsumerKey("anonymous");
  oauthConfig.setConsumerSecret("anonymous");
  var requestData = {
    "method": "get",
    "contentType": "application/atom+xml",
    "oAuthServiceName": "google",
    "oAuthUseToken": "always"
  };
  
  var url = 'https://apps-apis.google.com/a/feeds/customer/2.0/customerId';
  var result = UrlFetchApp.fetch(url, requestData).getContentText();
  var resultXml = Xml.parse(result);
  var properties = resultXml.entry.property;
  for (var i=0; i<properties.length; i++) {
    if (properties[i].name == "customerId") {
      return properties[i].value;
    }
  }
}
