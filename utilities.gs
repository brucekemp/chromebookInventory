// This code was borrowed and modified from the Flubaroo Script author Dave Abouav
// It anonymously tracks script usage to Google Analytics, allowing our non-profit to report our impact to funders
// For original source see http://www.edcode.org


function chromebookInventory_logExport() {
  NVSL.log("Chrome%20Device%20Inventory%20Exported%20to%20Sheet", scriptName, scriptTrackingId)
}

function chromebookInventory_logUpdate() {
  NVSL.log("Chrome%20Device%20Inventory%20Updated%20from%20Sheet", scriptName, scriptTrackingId)
}

function logRepeatInstall() {
  NVSL.log("Repeat%20Install", scriptName, scriptTrackingId)
}

function logFirstInstall() {
  NVSL.log("First%20Install", scriptName, scriptTrackingId)
}


function setSid() { 
  var scriptNameLower = scriptName.toLowerCase();
  var sid = ScriptProperties.getProperty(scriptNameLower + "_sid");
  if (sid == null || sid == "")
  {
    var dt = new Date();
    var ms = dt.getTime();
    var ms_str = ms.toString();
    ScriptProperties.setProperty(scriptNameLower + "_sid", ms_str);
    var uid = UserProperties.getProperty(scriptNameLower + "_uid");
    if (uid) {
      logRepeatInstall();
    } else {
      logFirstInstall();
      UserProperties.setProperty(scriptNameLower + "_uid", ms_str);
    }      
  }
}


function formRat_extractorWindow () {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var properties = ScriptProperties.getProperties();
  var propertyString = '';
  var excludedKeys = ['formrat_sid','fileId','ssId','preconfigStatus'];
  for (var key in properties) {
    if ((properties[key]!='')&&(excludedKeys.indexOf(key)==-1)) {
      var keyProperty = properties[key].replace(/[/\\*]/g, "\\\\");                                     
      propertyString += "   ScriptProperties.setProperty('" + key + "','" + keyProperty + "');\n";
    }
  }  
  var app = UiApp.createApplication().setHeight(500).setTitle("Export preconfig() settings");
  var panel = app.createVerticalPanel().setWidth("100%").setHeight("100%");
  var labelText = "Copying a Google Spreadsheet copies scripts along with it, but without any of the script settings saved.  This normally makes it hard to share full, script-enabled Spreadsheet systems. ";
  labelText += " You can solve this problem by pasting the code below into a script function in the script editor called \"formRat_preconfig\" prior to publishing your Spreadsheet for others to copy. \n";
  labelText += " After a user copies your spreadsheet, they will select \"Run initial configuration.\"  This will preconfigure all needed script settings.  If you got this workflow from someone as a copy of a spreadsheet, this has probably already been done for you.";
  var label = app.createLabel(labelText);
  var window = app.createTextArea();
  var codeString = "//This section sets all script properties associated with this formRat profile \n";
  codeString += "var preconfigStatus = ScriptProperties.getProperty('preconfigStatus');\n";
  codeString += "if (preconfigStatus!='true') {\n";
  codeString += propertyString; 
  codeString += "};\n";
  codeString += "var fileName = '" + properties.fileName +"';\n";
  codeString += "var thisSSId = SpreadsheetApp.getActiveSpreadsheet().getId();\n";
  codeString += "var found = false;\n";
  codeString += "var parentFolders = DriveApp.getFileById(thisSSId).getParents();\n";
  codeString += "while (parentFolders.hasNext()) {\n";
  codeString += "  var thisParent = parentFolders.next();\n";
  codeString += "  var theseDestSSs = thisParent.getFilesByName(fileName);\n";
  codeString += "  while (theseDestSSs.hasNext()) {\n";
  codeString += "    var destSS = theseDestSSs.next();\n";
  codeString += "    ScriptProperties.setProperty('fileId',destSS.getId());\n";
  codeString += "    found = true;\n";
  codeString += "    break;\n";
  codeString += "  }\n";
  codeString += "break;\n"
  codeString += "}\n";
  codeString += "formRat_Trigger()\n";
  codeString += "if (found) {\n";
  codeString += "  ss.toast('Custom formRat preconfiguration ran successfully. Please check formRat menu options to confirm system settings.');\n";
  codeString += "} else {\n";
  codeString += "  ss.toast('Unable to find the destination spreadsheet for this system. Please check your settings');\n";
  codeString += "}\n";
  window.setText(codeString).setWidth("100%").setHeight("350px");
  app.add(label);
  panel.add(window);
  app.add(panel);
  ss.show(app);
  return app;
}
