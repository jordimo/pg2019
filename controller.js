function setState(idState) {

    idState = parseInt(idState)
    
    var _targets = [];
    var _values = [];

    STATES[idState].map(function(s) {
        _targets.push('#'+LAYERS_DICT[s.layerId]);
        _values.push(s.endValue)
    })

    
    
    var _testID = 2;
    
    var t = _targets[_testID]
    var v = _values[_testID]

    console.log(_targets)
    for (var i=0; i<_targets.length; i++ ) {
        var a= anime({
            targets: _targets[i],
            d : _values[i],
            easing: 'easeOutQuad',
            duration : 100,        
            
        })
    }
        
}

function getJsonObject(url) {

    loadJSON(url, init)
}

var LAYERS_DICT = {};
var STATES = {}



function init(json_obj) {
    
    
    var JSON_layers = jsonQ(json_obj['layers']['vectorLayer'])

    
    var paths = JSON_layers.find("type", function(){
        return this == 'path'
    }).parent().value()

    // create LAYERS_DICT (animations are based on layerId. SVG objects use a 'name' ID. This dict connects boths. Key => layerId, value : 'name' ID)
    paths.map(function (p) {        
        LAYERS_DICT[p.id] = p.name
    });

      

    // and then get from timeline (endtime property / 100)

    var JSON_states = json_obj['timeline']['animation']['blocks']
    
    
    JSON_states.map(function(a) {
        var state = a.endTime/100;
        var layerId = a.layerId;
        var endValue = a.toValue;

        
        if (!STATES[state]) STATES[state] = [];

        STATES[state].push({
            layerId : layerId,
            endValue : endValue
        })

        // add state 0 (kind of hacky for now)
        if (state==1) {
            if (!STATES[0]) STATES[0] = []
            
            STATES[0].push({
                layerId : layerId,
                endValue : a.fromValue
            })
        }
    })

    // reset svg with 0 state
    STATES[0].map(function(s0) {
        console.log(s0.layerId, LAYERS_DICT[s0.layerId])
        try {
            // document.getElementById(LAYERS_DICT[s0.layerId]).setAttribute('d', s0.endValue)
        }
        catch(e) {
            throw Error('not found ' + s0.layerId)
        }
        
    })

    console.log(STATES)
}

getJsonObject('./data/data3.json');


// ------------- UTILS (not sure what libs you using. Tried to keep it all Vanilla except animejs )

function loadJSON(url, callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        callback(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);  
  }