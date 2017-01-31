describe("Analyser", function () {
    var analyser;

    beforeEach(function () {
        analyser = new Analyser();
    });

    it("should be able to push a valid item to it's dataset", function () {
        var date = new Date("12 jan 2017");
        var data = {
            word1: 'hi',
            word2: 'hello',
            sentence: 'Hi buddy. Hello sir',
            displayedOnScreen: true,
            date: date.toGMTString(),
            timestamp: "12 jan 2017"
        };

        analyser.pushItem(data);

        expect(analyser.getData(1)).toEqual([data]);
    });

    it("should not be able to push an invalid item to it's dataset", function () {
        var data = {"test": "push"};

        analyser.pushItem(data);

        expect(analyser.getData(1)).toEqual([]);
    });

    it("should give expected CSV format for the data", function () {
        var date = new Date("12 jan 2017");
        var data1 = {
            word1: 'hi',
            word2: 'hello',
            sentence: 'Hi buddy. Hello sir',
            displayedOnScreen: true,
            date: date.toGMTString(),
            timestamp: "12 jan 2017"
        }, data2 = {
            word1: 'morning',
            word2: '',
            sentence: 'good morning my friend',
            displayedOnScreen: false,
            date: date.toGMTString(),
            timestamp: "12 jan 2017"
        };
        analyser.pushItem(data1);
        analyser.pushItem(data2);

        var csv = analyser.getCSV();

        var expectedCSV = "data:text/csv;charset=utf-8,word1,word2,sentence,displayed on screen,date,timestamp\nhi,hello,Hi buddy. Hello sir,true,Thu- 12 Jan 2017 07:00:00 GMT,12 jan 2017\nmorning,,good morning my friend,false,Thu- 12 Jan 2017 07:00:00 GMT,12 jan 2017\n";
        expect(csv).toEqual(expectedCSV)
    });

});
