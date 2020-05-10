'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

function initializePage() {
    var context = SP.ClientContext.get_current();
    var user = context.get_web().get_currentUser();

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {
        getListColumns();
    });

    function getListColumns() {
        var list = context.get_web().get_lists().getByTitle('Visitors');
        var columns = list.get_fields();
        context.load(columns);
        context.executeQueryAsync(function () {
            var columnsStr = "";
            for (var i = 0, len = columns.get_count(); i < len; i++) {
                columnsStr += columns.get_item(i).get_title() + "<br />";
            }

            $('#message').html(columnsStr);
        }, function (sender, args) {
            alert('Failed to get columns. Error:' + args.get_message());
        });
    }
}
