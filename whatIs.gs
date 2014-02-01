function chromebookInventory_whatIs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var url = 'https://drive.google.com/uc?export=download&id='+chromebookInventoryIconId;
  var app = UiApp.createApplication().setHeight(400);
  var grid = app.createGrid(1, 2);
  var image = app.createImage(url).setWidth("120px").setHeight("120px");
  var label = app.createLabel("chromebookInventory: Use a Google Sheet to export and update your Chromebook inventory in the Google Apps Chrome Device Management Console.").setStyleAttribute('verticalAlign', 'top').setStyleAttribute('fontSize', '16px');
  grid.setWidget(0, 0, image).setWidget(0, 1, label).setStyleAttribute(0, 1, 'verticalAlign', 'top');
  var html = "Features:";
  html += "<ul><li>Export your entire inventory of Chrome devices into a Google Sheet, including all of the following metadata: etag, Org Unit Path, Serial Number, Platform Version, Device Id, Status, Last Enrollment Time, Firmware Version, Last Sync, OS Version, Boot Mode, Annotated Location', Notes, and Annotated User</li>";
  html += "<li>Make edits to \"Annotated Location\",\"Notes\", and \"Annotated User\" and update your Chrome console directly from this spreadsheet.</li></ul>";
  var description = app.createHTML(html);
  var sponsorLabel = app.createLabel("Brought to you by");
  var sponsorImage = app.createImage('https://drive.google.com/uc?export=download&id=0B7-FEGXAo-DGWkt6LThPWnREU28').setHeight('85px');
  var supportLink = app.createAnchor('Learn more about chromebookInventory!', 'https://sites.google.com/a/newvisions.org/scripts_resources/scripts/chromebookinventory');
  var bottomGrid = app.createGrid(3, 1);
  bottomGrid.setWidget(0, 0, sponsorLabel);
  bottomGrid.setWidget(1, 0, sponsorImage);
  bottomGrid.setWidget(2, 0, supportLink);
  app.add(grid);
  app.add(description);
  app.add(bottomGrid);
  ss.show(app)
  return app;
}
