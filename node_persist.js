var redis = require('redis');
var rediSearch  = require('redisearchclient');
var subscriber = redis.createClient();
//var client = redis.createClient(6380, 'localhost');
var myRediSearch        = rediSearch(redis,'mentions',{ clientOptions : {host:'127.0.0.1',port:6380} });
  //var myRediSearch        = rediSearch(client,'mentions');  

  myRediSearch.client.on("error",function(err) {
    console.log("error");
    console.log(err);
});



myRediSearch.client.monitor(function(err, res) {
    console.log("Entering monitoring mode.");
  });
  
  myRediSearch.client.set("foo", "bar");
  
  myRediSearch.client.on("monitor", function(time, args, rawReply) {
    console.log(time + ": " + args); // 1458910076.446514:['set', 'foo', 'bar']
  });

// create an instance of the abstraction module using the index 'the-bard'
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
myRediSearch.createIndex([                                   // create the index using the following fields
    myRediSearch.fieldDefinition.text('textPhrase', true),                                  // field named 'line' that holds text values and will be sortable later on
    myRediSearch.fieldDefinition.text('source', true, { noStem : true }),  
    myRediSearch.fieldDefinition.text('locationName'),     
    myRediSearch.fieldDefinition.geo('location')     
 ],(err)=>{
     if(err){
        console.log("could not create index.");
        console.log(err);
     }
    });                              // execute the pipeline

     console.log("index created.");
subscriber.on('message', function(chan, message){
    let date_ob = new Date();
    // current hours
    let hours = date_ob.getHours();
    
    // current minutes
    let minutes = date_ob.getMinutes();
    
    // current seconds
    let seconds = date_ob.getSeconds();
    
    console.log(chan+" "+hours+":"+minutes+":"+seconds+" ~:"+message);
    JSON.parse(message).message.results.forEach(msg=>{
        if(typeof msg.name == "undefined"){
            msg.name = "unknown"
        }
        msg.text = JSON.parse(message).message.text
        console.log('~~~~~~~~~~~~~~~~~~~~~~~!!!!!!!!!!!!');console.log(message);
        msg.result.forEach(res => {

        let locationCoords = "";
        if(typeof msg.lat+","+msg.long ==="undefined" || typeof res.long ==="undefined" ){
            locationCoords = "0,0"; //HACK: add a flag for unkown coordinates
        }else{
            locationCoords =res.long+","+res.lat;
        }
        myRediSearch .batch() .rediSearch                                                                 // Start a 'batch' pipeline
    .add(getRandomInt(99999999), {                                                // index the object at the ID 57956
        textPhrase     : msg.text,
        source      : msg.source,
        locationName      : res.name,
        location      : locationCoords
    }).exec(function(err,results) {                           // execute the pipeline
        if (err) { console.log( err); }else{
            console.log(results);
        }
                                  });    

        }); 
console.log("done");
});
    


}.bind(this));
subscriber.subscribe('notification');

