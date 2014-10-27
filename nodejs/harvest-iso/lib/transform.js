var helpers = require('./helpers');

function isoMap (input, callback) {
  var doc
    , mdDesc
    , mdGeoExt
    , mdProps
    , iso
    , ident
    , extent
    , validExtents
    , ext
    , northBound
    , southBound
    , eastBound
    , westBound
    , metaContact
    , getGeoExt
    , getTemporalExt
    , constraints
    , freeTextConstraints
    , validFreeText
    , freeText
    , citationId
    , distributions
    , moreLinks
    , objGet
    , setProperty
    , guessServiceType
    , capServiceTypes
    , i
    , j
    ;

  guessServiceType = helpers.guessServiceType;
  capServiceTypes = helpers.capServiceTypes;
  objGet = helpers.objGet;
  setProperty = helpers.setProperty;

  iso = input;

  function buildRelatedAgent (input) {
    var agent
      , individual
      , organization
      , phone
      , email
      , street
      , city
      , state
      , zip
      , emails
      , singleEmail
      , i
      ;

    street = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:deliveryPoint.gco:CharacterString._$', 'No Street Address Was Given');
    city = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:city.gco:CharacterString._$', 'No City Was Given');
    state = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:administrativeArea.gco:CharacterString._$', 'No State Was Given');
    zip = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:postalCode.gco:CharacterString._$', 'No Zip Was Given');

    agent = {
      "cmd:relatedAgent": {
        "cmd:agentRole": {
          "cmd:agentRoleURI": "undefined",
          "cmd:agentRoleLabel": objGet(input, 'gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.codeListValue', '')
        },
        "cmd:organizationURI": "undefined",
        "cmd:contactAddress": [street, city, state, zip].join(' ')
      }
    };

    individual = {
      "cmd:PersonURI": "undefined",
      "cmd:personName": objGet(input, 'gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString._$', 'No Name Was Given'),
      "cmd:personPosition": objGet(input, 'gmd:CI_ResponsibleParty.gmd:positionName.gco:CharacterString._$', 'No Position Was Given')
    };

    organization = {
      "cmd:organizationName": [objGet(input, 'gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString._$', 'No Organization Name Was Given')]
    };

    phone = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString._$', 'No Phone Number Was Given');

    email = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:electronicMailAddress', 'No email Was Given');
    emails = [];
    if (email[0]) {
      for (i = 0; i < email.length; i++) {
        singleEmail = email[i];
        emails.push(objGet(singleEmail, 'gco:CharacterString._$', 'No Email Was Given'));
      }
    } else {
      emails.push(objGet(email, 'gco:CharacterString._$', 'No Email Was Given'));
    }

    agent['cmd:individual'] = individual;
    agent['cmd:organizationName'] = organization;
    agent['cmd:phoneNumber'] = phone;
    agent['cmd:contactEmail'] = emails;
    return agent;
  }

  function buildLinkObject (onlineResource, responsibleParty) {
    var url
      , protocol
      , guess
      , serviceType
      , description
      , name
      , title
      , resources
      , resource
      , linksArray
      , i
      ;

    linksArray = [];
    resources = objGet(onlineResource, 'gmd:MD_DigitalTransferOptions.gmd:onLine', []);
    for (i = 0; i < resources.length; i++) {
      resource = resources[i];
      url = objGet(resource, "gmd:CI_OnlineResource.gmd:linkage.gmd:URL._$", "No URL Was Given");
      description = objGet(resource, "gmd:CI_OnlineResource.gmd:description.gco:CharacterString._$", "No Description Was Given");
      protocol = objGet(resource, "gmd:CI_OnlineResource.gmd:protocol.gco:CharacterString._$", "No Protocol Was Given");
      title = objGet(resource, 'gmd:CI_OnlineResource.gmd:name.gco:CharacterString._$', 'No Title Was Given');
      protocol = protocol.toUpperCase();

      if (capServiceTypes.indexOf(protocol) >= 0) {
        serviceType = protocol;
      } else {
        guess = guessServiceType(url);
        if (guess) serviceType = guess;
      }

      name = null;
      if (responsibleParty) {
        name = objGet(responsibleParty, "gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString._$", "No Name Was Given");
        if (['Missing', 'missing', 'No Name Was Given'].indexOf(name) > -1) {
          name = objGet(responsibleParty, "gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString._$", "No Organization Name Was Given");
        }
      }

      linksArray.push({
        'cmd:LinkObject': {
          'cmd:url': url,
          'cmd:linkDescription': description,
          'cmd:linkTitle': title
        }
      })
    }

    return linksArray;
  }

  try {
    doc = {
      "cmd:CINERGI_MetadataObject": {
        "cmd:CINERGI_ID": "undefined",
        "cmd:HarvestInformation": {},
        "cmd:originalHarvestedDoc": {},
        "cmd:processingStatus": {},
        "cmd:metadataProperties": {},
        "cmd:resourceDescription": {},
        "cmd:extras": {}
      }
    };

    // cmd:resourceDescription
    mdDesc = doc['cmd:CINERGI_MetadataObject']['cmd:resourceDescription'];
    ident = objGet(iso, 'gmd:MD_Metadata.gmd:identificationInfo', {});
    ident = objGet(ident, '0', ident);
    ident = objGet(ident, 'gmd:MD_DataIdentification', objGet(ident, 'srv:SV_ServiceIdentification', {}));
    setProperty(mdDesc, 'cmd:resourceTitle', objGet(ident, 'gmd:citation.gmd:CI_Citation.gmd:title.gco:CharacterString._$', 'No Title Was Given'));
    setProperty(mdDesc, 'cmd:resourceDescription', objGet(ident, 'gmd:abstract.gco:CharacterString._$', 'No Description Was Given'));

    mdDesc['cmd:resourceURI'] = [];
    citationId = objGet(iso, 'gmd:MD_Metadata.gmd:dataSetURI.gco:CharacterString._$', null);
    mdDesc['cmd:resourceURI'].push({'cmd:citationIdentifier': citationId});

    mdDesc['cmd:geographicExtent'] = {};

    extent = objGet(ident, 'gmd:extent', objGet(ident, 'srv:extent', {}));
    if (extent['0']) {
      validExtents = [];
      for (i = 0; i < extent.length; i++) {
        ext = extent[i];
        getGeoExt = objGet(ext, 'gmd:EX_Extent.gmd:geographicElement', null);
        getTemporalExt = objGet(ext, 'gmd:EX_Extent.gmd:temporalElement', null);
        if (getGeoExt) {
          validExtents.push(ext);
        }
      }
    }
    extent = validExtents;

    extent = objGet(ident, "gmd:extent", objGet(ident, "srv:extent", {}));
    if (extent['0']) {
      validExtents = (function () {
        var i
          , results;
        results = [];
        for (i = 0; i < extent.length; i++) {
          ext = extent[i];
          getGeoExt = 'gmd:EX_Extent.gmd:geographicElement';
          getTemporalExt = 'gmd:EX_Extent.gmd:temporalElement';
          if (objGet(ext, getGeoExt, null) || objGet(ext, getTemporalExt, null)) {
            results.push(ext);
          }
        }
        return results;
      })();
      extent = validExtents[0];
    }

    northBound = parseFloat(objGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:northBoundLatitude.gco:Decimal._$', 89));
    southBound = parseFloat(objGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:southBoundLatitude.gco:Decimal._$', -89));
    eastBound = parseFloat(objGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:eastBoundLongitude.gco:Decimal._$', 179));
    westBound = parseFloat(objGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:westBoundLongitude.gco:Decimal._$', -179));
    mdGeoExt = mdDesc['cmd:geographicExtent'];
    mdGeoExt['cmd:extentLabel'] = [northBound, southBound, eastBound, westBound].join(',');
    mdGeoExt['cmd:boundingBoxWGS84'] = {
      'cmd:northBoundLatitude': northBound,
      'cmd:southBoundLatitude': southBound,
      'cmd:eastBoundLongitude': eastBound,
      'cmd:westBoundLongitude': westBound
    };

    mdDesc['cmd:resourceTemporalExtent'] = {
      'temporalExtentBegin': objGet(extent, 'gmd:EX_Extent.gmd:temporalElement.gmd:EX_TemporalExtent.gmd:extent.gml:TimePeriod.gml:beginPosition._$', null),
      'temporalExtentEnd': objGet(extent, 'gmd:EX_Extent.gmd:temporalElement.gmd:EX_TemporalExtent.gmd:extent.gml:TimePeriod.gml:endPosition._$', null)
    };

    mdDesc['cmd:resourceUsageConstraints'] = [];
    constraints = objGet(ident, 'gmd:resourceConstraints', {});
    freeTextConstraints = objGet(constraints, 'gmd:MD_LegalConstraints.gmd:otherConstraints', []);
    if (freeTextConstraints[0]) {
      for (j = 0; j < freeTextConstraints.length; j++) {
        freeText = freeTextConstraints[j];
        validFreeText = {'cmd:constraintStatement': objGet(freeText, 'gco:CharacterString._$')};
        mdDesc['cmd:resourceUsageConstraints'].push(validFreeText);
      }
    }

    distributions = objGet(iso, "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:transferOptions", []);
    if (distributions['gmd:MD_DigitalTransferOptions']) {
      distributions = [distributions];
    }

    moreLinks = (function () {
      var i
        , results
        , distOpt
        ;
      results = [];
      for (i = 0; i < distributions.length; i++) {
        distOpt = distributions[i];
        results.push(buildLinkObject(distOpt));
      }
      return results;
    })();

    mdDesc['cmd:resourceAccessOptions'] = {'cmd:accessLinks': moreLinks};

    // cmd:metadataProperties
    metaContact = objGet(iso, 'gmd:MD_Metadata.gmd:contact');
    mdProps = doc['cmd:CINERGI_MetadataObject']['cmd:metadataProperties'];
    mdProps['cmd:metadataContact'] = buildRelatedAgent(metaContact);
    mdProps['cmd:metadataUpdate'] = objGet(iso, 'gmd:MD_Metadata.gmd:dateStamp.gco:Date._$', 'Publication Date Not Given').trim();

    callback(null, doc);
  } catch (err) {
    callback(err);
  }
}

function czoMap (input, callback) {
  var doc
    , mdDesc
    , mdGeoExt
    , mdProps
    , iso
    , ident
    , extent
    , validExtents
    , ext
    , northBound
    , southBound
    , eastBound
    , westBound
    , metaContact
    , getGeoExt
    , getTemporalExt
    , constraints
    , freeTextConstraints
    , validFreeText
    , freeText
    , citationId
    , distributions
    , moreLinks
    , objGet
    , setProperty
    , guessServiceType
    , capServiceTypes
    , i
    , j
    ;

  guessServiceType = helpers.guessServiceType;
  capServiceTypes = helpers.capServiceTypes;
  objGet = helpers.objGet;
  setProperty = helpers.setProperty;

  iso = input;

  function buildRelatedAgent (input) {
    var agent
      , individual
      , organization
      , phone
      , email
      , street
      , city
      , state
      , zip
      , emails
      , singleEmail
      , i
      ;

    street = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:deliveryPoint.gco:CharacterString._$', 'No Street Address Was Given');
    city = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:city.gco:CharacterString._$', 'No City Was Given');
    state = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:administrativeArea.gco:CharacterString._$', 'No State Was Given');
    zip = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:postalCode.gco:CharacterString._$', 'No Zip Was Given');

    agent = {
      "cmd:relatedAgent": {
        "cmd:agentRole": {
          "cmd:agentRoleURI": "undefined",
          "cmd:agentRoleLabel": objGet(input, 'gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.codeListValue', '')
        },
        "cmd:organizationURI": "undefined",
        "cmd:contactAddress": [street, city, state, zip].join(' ')
      }
    };

    individual = {
      "cmd:PersonURI": "undefined",
      "cmd:personName": objGet(input, 'gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString._$', 'No Name Was Given'),
      "cmd:personPosition": objGet(input, 'gmd:CI_ResponsibleParty.gmd:positionName.gco:CharacterString._$', 'No Position Was Given')
    };

    organization = {
      "cmd:organizationName": [objGet(input, 'gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString._$', 'No Organization Name Was Given')]
    };

    phone = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString._$', 'No Phone Number Was Given');

    email = objGet(input, 'gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:electronicMailAddress', 'No email Was Given');
    emails = [];
    if (email[0]) {
      for (i = 0; i < email.length; i++) {
        singleEmail = email[i];
        emails.push(objGet(singleEmail, 'gco:CharacterString._$', 'No Email Was Given'));
      }
    } else {
      emails.push(objGet(email, 'gco:CharacterString._$', 'No Email Was Given'));
    }

    agent['cmd:individual'] = individual;
    agent['cmd:organizationName'] = organization;
    agent['cmd:phoneNumber'] = phone;
    agent['cmd:contactEmail'] = emails;
    return agent;
  }

  function buildLinkObject (onlineResource, responsibleParty) {
    var url
      , protocol
      , guess
      , serviceType
      , description
      , name
      , title
      , resources
      , resource
      , linksArray
      , i
      ;

    linksArray = [];
    resources = objGet(onlineResource, 'gmd:MD_DigitalTransferOptions.gmd:onLine', []);
    for (i = 0; i < resources.length; i++) {
      resource = resources[i];
      url = objGet(resource, "gmd:CI_OnlineResource.gmd:linkage.gmd:URL._$", "No URL Was Given");
      description = objGet(resource, "gmd:CI_OnlineResource.gmd:description.gco:CharacterString._$", "No Description Was Given");
      protocol = objGet(resource, "gmd:CI_OnlineResource.gmd:protocol.gco:CharacterString._$", "No Protocol Was Given");
      title = objGet(resource, 'gmd:CI_OnlineResource.gmd:name.gco:CharacterString._$', 'No Title Was Given');
      protocol = protocol.toUpperCase();

      if (capServiceTypes.indexOf(protocol) >= 0) {
        serviceType = protocol;
      } else {
        guess = guessServiceType(url);
        if (guess) serviceType = guess;
      }

      name = null;
      if (responsibleParty) {
        name = objGet(responsibleParty, "gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString._$", "No Name Was Given");
        if (['Missing', 'missing', 'No Name Was Given'].indexOf(name) > -1) {
          name = objGet(responsibleParty, "gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString._$", "No Organization Name Was Given");
        }
      }

      linksArray.push({
        'cmd:LinkObject': {
          'cmd:url': url,
          'cmd:linkDescription': description,
          'cmd:linkTitle': title
        }
      })
    }
    return linksArray;
  }

  try {
    doc = {
      "cmd:CINERGI_MetadataObject": {
        "cmd:CINERGI_ID": "undefined",
        "cmd:HarvestInformation": {},
        "cmd:originalHarvestedDoc": {},
        "cmd:processingStatus": {},
        "cmd:metadataProperties": {},
        "cmd:resourceDescription": {},
        "cmd:extras": {}
      }
    };

    // cmd:resourceDescription
    mdDesc = doc['cmd:CINERGI_MetadataObject']['cmd:resourceDescription'];
    ident = objGet(iso, 'gmd:MD_Metadata.gmd:identificationInfo', {});
    ident = objGet(ident, '0', ident);
    ident = objGet(ident, 'gmd:MD_DataIdentification', objGet(ident, 'srv:SV_ServiceIdentification', {}));
    setProperty(mdDesc, 'cmd:resourceTitle', objGet(ident, 'gmd:citation.gmd:CI_Citation.gmd:title.gco:CharacterString._$', 'No Title Was Given'));
    setProperty(mdDesc, 'cmd:resourceDescription', objGet(ident, 'gmd:abstract.gco:CharacterString._$', 'No Description Was Given'));

    mdDesc['cmd:resourceURI'] = [];
    citationId = objGet(iso, 'gmd:MD_Metadata.gmd:dataSetURI.gco:CharacterString._$', null);
    mdDesc['cmd:resourceURI'].push({'cmd:citationIdentifier': citationId});

    mdDesc['cmd:geographicExtent'] = {};

    extent = objGet(ident, 'gmd:extent', objGet(ident, 'srv:extent', {}));
    if (extent['0']) {
      validExtents = [];
      for (i = 0; i < extent.length; i++) {
        ext = extent[i];
        getGeoExt = objGet(ext, 'gmd:EX_Extent.gmd:geographicElement', null);
        getTemporalExt = objGet(ext, 'gmd:EX_Extent.gmd:temporalElement', null);
        if (getGeoExt) {
          validExtents.push(ext);
        }
      }
    }
    extent = validExtents;

    extent = objGet(ident, "gmd:extent", objGet(ident, "srv:extent", {}));
    if (extent['0']) {
      validExtents = (function () {
        var i
          , results;
        results = [];
        for (i = 0; i < extent.length; i++) {
          ext = extent[i];
          getGeoExt = 'gmd:EX_Extent.gmd:geographicElement';
          getTemporalExt = 'gmd:EX_Extent.gmd:temporalElement';
          if (objGet(ext, getGeoExt, null) || objGet(ext, getTemporalExt, null)) {
            results.push(ext);
          }
        }
        return results;
      })();
      extent = validExtents[0];
    }

    northBound = parseFloat(objGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:northBoundLatitude.gco:Decimal._$', 89));
    southBound = parseFloat(objGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:southBoundLatitude.gco:Decimal._$', -89));
    eastBound = parseFloat(objGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:eastBoundLongitude.gco:Decimal._$', 179));
    westBound = parseFloat(objGet(extent, 'gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:westBoundLongitude.gco:Decimal._$', -179));
    mdGeoExt = mdDesc['cmd:geographicExtent'];
    mdGeoExt['cmd:extentLabel'] = [northBound, southBound, eastBound, westBound].join(',');
    mdGeoExt['cmd:boundingBoxWGS84'] = {
      'cmd:northBoundLatitude': northBound,
      'cmd:southBoundLatitude': southBound,
      'cmd:eastBoundLongitude': eastBound,
      'cmd:westBoundLongitude': westBound
    };

    mdDesc['cmd:resourceTemporalExtent'] = {
      'temporalExtentBegin': objGet(extent, 'gmd:EX_Extent.gmd:temporalElement.gmd:EX_TemporalExtent.gmd:extent.gml:TimePeriod.gml:beginPosition._$', null),
      'temporalExtentEnd': objGet(extent, 'gmd:EX_Extent.gmd:temporalElement.gmd:EX_TemporalExtent.gmd:extent.gml:TimePeriod.gml:endPosition._$', null)
    };

    mdDesc['cmd:resourceUsageConstraints'] = [];
    constraints = objGet(ident, 'gmd:resourceConstraints', {});
    freeTextConstraints = objGet(constraints, 'gmd:MD_LegalConstraints.gmd:otherConstraints', []);
    if (freeTextConstraints[0]) {
      for (j = 0; j < freeTextConstraints.length; j++) {
        freeText = freeTextConstraints[j];
        validFreeText = {'cmd:constraintStatement': objGet(freeText, 'gco:CharacterString._$')};
        mdDesc['cmd:resourceUsageConstraints'].push(validFreeText);
      }
    }

    distributions = objGet(iso, "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:transferOptions", []);
    if (distributions['gmd:MD_DigitalTransferOptions']) {
      distributions = [distributions];
    }

    moreLinks = (function () {
      var i
        , results
        , distOpt
        ;
      results = [];
      for (i = 0; i < distributions.length; i++) {
        distOpt = distributions[i];
        results.push(buildLinkObject(distOpt));
      }
      return results;
    })();

    mdDesc['cmd:resourceAccessOptions'] = {'cmd:accessLinks': moreLinks};

    // cmd:metadataProperties
    metaContact = objGet(iso, 'gmd:MD_Metadata.gmd:contact');
    mdProps = doc['cmd:CINERGI_MetadataObject']['cmd:metadataProperties'];
    mdProps['cmd:metadataContact'] = buildRelatedAgent(metaContact);
    mdProps['cmd:metadataUpdate'] = objGet(iso, 'gmd:MD_Metadata.gmd:dateStamp.gco:Date._$', 'Publication Date Not Given').trim();

    callback(null, doc);
  } catch (err) {
    callback(err);
  }
}

exports.isoMap = isoMap;
exports.czoMap = czoMap;