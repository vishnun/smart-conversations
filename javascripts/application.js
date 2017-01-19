$(function () {

    function getLang() {
        return $('.lang-select option:selected').text();
    }

    function initSelect() {
        $('select').material_select();
    }

    function setupLanguages(langs) {
        $('.lang-select').html('');
        langs.forEach(function (lang, index) {
            $('.lang-select').append('<option value="' + lang + '">' + lang + '</option>');
        });
    }

    function setupTopics() {
        var topics = window.lcl.topics,
            topicSelect = $('.topic-select');
        for (topic in topics) {
            topicSelect.append('<option value="' + topic + '">' + topic + '</option>');
        }
    }

    function getInterestWords() {
        var selectedTopic = $('.topic-select option:selected').val();
        return window.lcl.topics[selectedTopic];
    }

    function getGrammar() {
        var interestWords = getInterestWords();
        return '#JSGF V1.0; grammar interest_words; public <interest_words> = ' + interestWords.join(' | ') + ' ;';
    }

    function setupTwoWords($twoWordModeEl, criticalWord1, criticalWord2) {
        $twoWordModeEl.on('change', function (e) {
            if ($(this).prop("checked") == true) {
                criticalWord1.removeClass('s12');
                criticalWord2.removeClass('hide');
            } else {
                criticalWord1.addClass('s12');
                criticalWord2.addClass('hide');
            }
            focusOnWindow(this);
        });
    }

    function focusOnWindow(el){
        $(el).blur();
        $(window).focus();
    }


    function init() {
        var started = false,
            reset = true;
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
        var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
        var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
        var criticalWord1 = $('.critical-word-1');
        var criticalWord2 = $('.critical-word-2');
        var wordContainer = $('.word-container');
        var $twoWordModeEl = $("#two-word-mode");

        var analytics = [];

        var languages_supported = ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU', 'en-NZ', 'en-ZA'];


        var recognition = new SpeechRecognition();
        var speechRecognitionList = new SpeechGrammarList();

        var word1 = "";

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        var dataItem = {};
        var identified = false;
        recognition.onresult = function (event) {
            var last = event.results.length - 1;
            var lastSentence = event.results[last][0].transcript;
            var mode = $twoWordModeEl.prop("checked");
            getInterestWords().forEach(function (element, index) {
                if (lastSentence.indexOf(element) != -1 && reset == true) {
                    if (criticalWord1.text() == '') {
                        criticalWord1.text(element);
                        word1 = element;
                        dataItem.word1 = word1;
                        identified = true;
                    } else if (mode && criticalWord2.text() == '' && element !== word1 && reset == true) {
                        criticalWord2.text(element);
                        dataItem.word2 = element;
                        identified = true;
                    }
                }
            });
            if (event.results[last].isFinal) {
                if (identified) {
                    var sentence = event.results[last][0].transcript;
                    var date = new Date(event.timeStamp);
                    dataItem.sentence = sentence;
                    dataItem.date = date.toGMTString();
                    dataItem.timestamp = event.timeStamp;
                    analytics.push(dataItem);
                    dataItem = {};
                    identified = false;
                }
                reset = true;
            }
        };

        function clearWords(){
            if(criticalWord1.text() == '') {
                return;
            }
            criticalWord1.text('');
            criticalWord2.text('');
            reset = false;
        }

        $(window).keyup(function (evt) {
            evt = evt || window.event;
            var space = '32';
            if (evt.keyCode == space) {
                clearWords();
            }
        });

        function saveCSV(analytics) {
            var csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "word,sentence,date,timestamp\n";
            analytics.forEach(function (wordItem, index) {
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

        $('#start-btn').on('click', function (e) {
            recognition.lang = getLang();
            var grammar = getGrammar();
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;
            if (started) {
                started = false;
                console.log(analytics);
                saveCSV(analytics);
                recognition.stop();
                $(this).find('.text').text("Start");
            } else {
                started = true;
                recognition.start();
                $(this).find('.text').text("Stop");
            }
            focusOnWindow(this);
        });

        $('#full-screen').on('click', function () {
            if (wordContainer[0].webkitRequestFullscreen) {
                wordContainer[0].webkitRequestFullscreen();
            }
        });

        setupTopics();
        setupLanguages(languages_supported);
        initSelect();
        setupTwoWords($twoWordModeEl, criticalWord1, criticalWord2);
    }

    init();
});