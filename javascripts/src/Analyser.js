function Analyser() {
    var analytics = [];
    var validKeys = ['word1', 'word2', 'sentence','date','timestamp'];
    function validItem(item) {
        if (Object.keys(item).length != validKeys.length) {
            return false;
        }
        for(var key in item) {
            if (! (validKeys.includes(key))) {
                return false;
            }
        }
        return true;
    }

    this.pushItem = function(item) {
        if (validItem(item)) {
            analytics.push(item);
        }
    };

    this.addItem = this.pushItem;

    this.getData = function(num) {
        num = typeof num !== 'undefined' ? num : 1;
        return analytics.slice(0, num);
    };

    this.saveCSV = function() {
        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "word1,word2,sentence,date,timestamp\n";
        analytics.forEach(function(wordItem, index) {
            var dataString = wordItem.word1 + "," + wordItem.word2 + "," + wordItem.sentence + "," + wordItem.date.replace(",", "-") + "," + wordItem.timestamp;
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