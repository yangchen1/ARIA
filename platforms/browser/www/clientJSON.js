module.exports = function(app, db) {
  
// construct an HTTP request
        var request = new XMLHttpRequest();
        request.open("GET", "http://192.168.0.31:8080/ariadata");
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      
        //resultDiv.innerHTML = resultDiv.innerHTML + "Request Error: " + e.message + "<br/>";
      
        // send the collected data as JSON
        request.send(json);
      
        request.onloadend = function () {
          resultDiv.innerHTML = resultDiv.innerHTML + "Data sent to server: " + json + "<br/>";
        };
}