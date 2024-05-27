function doGet() {
  return HtmlService.createHtmlOutputFromFile('Form');
}

function fetchOptions(type, value) {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(type + '-' + value);

  if (cached) {
    return JSON.parse(cached);
  }

  var sheet = SpreadsheetApp.openById('1Mksi5fMhs8HHQ2TD4eYhpDv-hwFR7GmTWcBE6cjnXOs').getSheetByName('Dropdown');
  var data = sheet.getDataRange().getValues();

  var options = [];
  if (type === 'division') {
    var divisions = new Set(data.map(row => row[0]));
    options = Array.from(divisions).filter(option => option && option !== "Division");
  } else if (type === 'district') {
    var districts = new Set(data.filter(row => row[0] === value).map(row => row[1]));
    options = Array.from(districts);
  } else if (type === 'tehsil') {
    var tehsils = new Set(data.filter(row => row[1] === value).map(row => row[2]));
    options = Array.from(tehsils);
  } else if (type === 'uc') {
    var ucs = new Set(data.filter(row => row[2] === value).map(row => row[4]));
    options = Array.from(ucs);
  } else if (type === 'venue') {
    var venues = new Set(data.filter(row => row[2] === value).map(row => row[5]));
    options = Array.from(venues);
    options.push("Other");
  } else if (type === 'cadre') {
    var cadres = new Set(data.map(row => row[3]));
    options = Array.from(cadres).filter(option => option && option !== "Cadre");
  }

  cache.put(type + '-' + value, JSON.stringify(options), 600); // Cache for 10 minutes
  return options;
}


function submitForm(data) {
  var response = {
    success: false,
    message: ''
  };

  try {
    var sheet = SpreadsheetApp.openById('1Mksi5fMhs8HHQ2TD4eYhpDv-hwFR7GmTWcBE6cjnXOs').getSheetByName('WebForm Responses');
    
    // Check if UC should be set to 'N/A'
    var specialCadres = ["UC Ops", "UC Comms", "AIC/UCMOs"];
    if (specialCadres.includes(data.cadre)) {
      data.uc = "N/A";
    }

    // Check for Other venue
    if (data.venue === "Other") {
      data.otherVenue = data.otherVenueText;
    } else {
      data.otherVenue = "N/A";
    }

    sheet.appendRow([
      data.division,
      data.district,
      data.tehsil,
      data.cadre,
      data.uc,
      data.venue,
      data.otherVenue,
      data.date,
      data.time,
      data.facilitator,
      data.coFacilitator,
      data.monitor,
      data.monitorEmail,
      data.expectedMale,
      data.expectedFemale
    ]);

    response.success = true;
    response.message = 'Form submitted successfully!';
  } catch (error) {
    response.message = 'Error submitting form: ' + error.message;
  }

  return response;
}
