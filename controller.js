
//* --- *//


var LAYERS_DICT = {};
var STATES = {}
var GROUPS = {}
var STATE_COLORS = [
    '#fc0',
    '#cf0',
    '#0fc',
    '#c0f', 
    '#f0c',
    '#0fc',
    '#cf0',
    '#0fc',
]

function setState(idState) {

    idState = parseInt(idState)
    
    var _targets = [];
    var _values = [];

    STATES[idState].map(function(s) {
        _targets.push('#'+LAYERS_DICT[s.layerId]);
        _values.push(s.endValue)
    })

    // console.log(STATES[idState])

    // var TEST = 9
    // _targets = _targets.slice(TEST, TEST+1)
    // _values = _values.slice(TEST, TEST+1)
    

    
    for (var i=0; i<_targets.length; i++ ) {
        console.log(_targets[i]);
        var a= anime({
            targets: _targets[i],
            d : _values[i],
            easing: 'easeOutQuad',
            duration : 100,        
            
        })
    }

    // change colors

    var color = STATE_COLORS[idState]

    for (var g in GROUPS) {
        for (var c in GROUPS[g]) {
            var ca = anime({
                targets: '#'+GROUPS[g][c],
                stroke : color,
                easing : 'easeOutQuad',
                duration: 100,        
            })

            // console.log(document.getElementById(GROUPS[g][c]))
        }
    }
}

function getJsonObject(url) {

    loadJSON(url, init)
}


function init(json_obj) {
    
    
    var JSON_layers = jsonQ(json_obj['layers']['vectorLayer'])

    
    var paths = JSON_layers.find("type", function(){
        return this == 'path'
    }).parent().value()

    // create LAYERS_DICT (animations are based on layerId. SVG objects use a 'name' ID. This dict connects boths. Key => layerId, value : 'name' ID)
    paths.map(function (p) {        
        LAYERS_DICT[p.id] = p.name
    });

    // save 'name' by GROUPS
    // 1. Get Group Names
    var JSON_groups = JSON_layers.find("type", function() {
        return this == 'group'
    }).sibling('name').value()

    // 2. Get Children names per group
    for (var g of JSON_groups) 
    {
        var children = JSON_layers.find('name', function() {
            return this == g
        }).sibling('children').value()[0]

        GROUPS[g] = [];

        for (var c in children) {
            GROUPS[g].push(children[c].name)            
        }                
    }
    
    // console.log(GROUPS)

    // -------------------------------------------------------------------------------------

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

    // // reset svg with 0 state
    // STATES[0].map(function(s0) {
    //     console.log(s0.layerId, LAYERS_DICT[s0.layerId])
    //     try {
    //         // document.getElementById(LAYERS_DICT[s0.layerId]).setAttribute('d', s0.endValue)
    //     }
    //     catch(e) {
    //         throw Error('not found ' + s0.layerId)
    //     }
        
    // })

    // console.log(STATES)
}



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


  getJsonObject('./data/data7.json?'+Math.random());
