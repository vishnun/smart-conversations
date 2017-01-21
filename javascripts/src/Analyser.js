function Analyser() {
    var analytics = [];

    this.pushItem = function(item) {
        analytics.push(item);
    };

    this.addItem = this.pushItem;

    this.saveCSV = function() {
        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "word,sentence,date,timestamp\n";
        analytics.forEach(function(wordItem, index) {
            var dataString = wordItem.word1 + "," + wordItem.sentence + "," + wordItem.date.replace(",", "-") + "," + wordItem.timestamp;
            csvContent += index < analytics.length ? dataString + "\n" : dataString;
        });
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_data.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
    }

}