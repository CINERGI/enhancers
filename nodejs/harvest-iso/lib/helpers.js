var serviceTypes = [
    'OGC:WMS'
  , 'OGC:WFS'
  , 'OGC:WCS'
  , 'esri'
  , 'opendap'
];

var capServiceTypes = (function () {
  var types
    , type
    , caps
    , i
    ;

  caps = [];
  types = serviceTypes;
  for (i = 0; i < types.length; i++) {
    type = types[i];
    caps.push(type.toUpperCase());
  }

  return caps;
})();

function objGet (obj, prop, defVal) {
  var props
    , count
    , i
    , p;

  if (!obj) return defVal;

  props = prop.split('.');
  count = 0;

  for (i = 0; i < props.length; i++) {
    p = props[i];
    if (obj[p]) {
      obj = obj[p];
      count++;
      if (count === props.length) {
        return obj;
      }
    } else {
      return defVal;
    }
  }
}

function setProperty (obj, prop, value) {
  var count
    , p
    , props
    , i
    , results
    ;

  props = prop.split('.');
  count = 0;
  results = [];

  for (i = 0; i < props.length; i ++) {
    p = props[i];
    if (obj[p]) {
      obj = obj[p];
      results.push(count++);
    } else {
      if (count + 1 === props.length) {
        results.push(obj[p] = value);
      } else {
        obj[p] = {};
        obj = obj[p];
        results.push(count++);
      }
    }
  }
  return results;
}

function guessServiceType (url) {
  var condition
    , conditions
    , conditionSet
    , i
    , j
    , satisfied
    , types
    , type
    ;

  types = serviceTypes;
  conditions = [
      [/getcapabilities/i, /wms/i]
    , [/getcapabilities/i, /wfs/i]
    , [/getcapabilities/i, /wcs/i]
    , [/\/services\//i, /\/mapserver\/?$/i]
    , [/\.dds$/]
  ];

  for (i = 0; i < types.length; i++) {
    type = types[i];
    conditionSet = conditions[i];
    satisfied = true;
    for (j = 0; j < conditionSet.length; j++) {
      condition = conditionSet[j];
      if (!url.match(condition)) satisfied = false;
    }
    if (satisfied) return type;
  }
  return null;
}

exports.capServiceTypes = capServiceTypes;
exports.objGet = objGet;
exports.setProperty = setProperty;
exports.guessServiceType = guessServiceType;