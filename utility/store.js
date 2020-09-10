// Example Complex JSON

var testviews = {
    "Chris": { "foo": 5, "bar": 3, "show": 1 },
    "Dave": { "foo": 5, "bar": 3, "show": 1 }
}

console.log(testviews);

// Creating example complex with direct assignments
var replicate = {};

// JSON of list of elements with values
replicate["foo"] = 5;
replicate["bar"] = 3;
replicate["show"] = 1;

var together = {};

// Adding JSON to JSON 
together["Chris"] = replicate;
together["Dave"] = replicate;

console.log(together);


// Creating using loops
var i, j;

var views = {};

for(i=0; i<3; i++){
    var newUser = "user" + i;
    var content = {};

    for (j = 0; j < 4; j++){
        var pagename = "value" + j;
        var hits = Math.floor(Math.random() * 10); 
        
        content[pagename] = hits;
    }

    views[newUser] = content;
}

console.log(views);
console.log("=======");
console.log(views.user1);
console.log("=======");
console.log(views.user1.value1);