function ConversationApp() {
    var analyser = new Analyser();
    var view = new ConversationView(analyser);
    var conversation = new Conversation(view, analyser);

    return {
        init: function(argument) {
            conversation.setStartup();
        }
    };

}