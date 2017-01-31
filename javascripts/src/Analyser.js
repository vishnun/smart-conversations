function Analyser() {
    var analytics = [];
    var validKeys = ['word1', 'word2', 'sentence', 'displayedOnScreen', 'date', 'timestamp'];

    function validItem(item) {
        if (Object.keys(item).length != validKeys.length) {
            return false;
        }
        for (var key in item) {
            if (item.hasOwnProperty(key) && !(validKeys.includes(key))) {
                return false;
            }
        }
        return true;
    }

    this.pushItem = function (item) {
        if (validItem(item)) {
            analytics.push(item);
        }
    };

    this.getData = function (num) {
        num = typeof num !== 'undefined' ? num : 1;
        return analytics.slice(0, num);
    };

    this.getCSV = function () {
        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "word1,word2,sentence,displayed on screen,date,timestamp\n";
        analytics.forEach(function (wordItem, index) {
            var dataString = wordItem.word1 + "," + wordItem.word2 + "," + wordItem.sentence + "," + wordItem.displayedOnScreen + "," + wordItem.date.replace(",", "-") + "," + wordItem.timestamp;
            csvContent += index < analytics.length ? dataString + "\n" : dataString;
        });
        return csvContent;
    };
}