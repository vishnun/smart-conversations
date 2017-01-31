describe("ConversationApp", function () {
    var app;

    it("should initialize the conversation startup", function () {
        var ConversationConstructor = Conversation, spiedObject;
        var AnalyserConstructor = Analyser, ConversationViewConstructor = ConversationView;
        spyOn(window, 'Analyser').and.callFake(function () {
            return {};
        });
        spyOn(window, 'ConversationView').and.callFake(function () {
            return {
                setupLanguages: function () {
                    return true;
                },
                setConversation: function () {
                    return true;
                }
            };

        });
        spyOn(window, 'Conversation').and.callFake(function () {
            var analyser = new Analyser();
            var view = new ConversationView();
            spiedObject = new ConversationConstructor(view, analyser);
            spyOn(spiedObject, 'setStartup');
            return spiedObject;
        });

        var convApp = new ConversationApp();
        convApp.init();

        expect(spiedObject.setStartup).toHaveBeenCalled();
    });


});