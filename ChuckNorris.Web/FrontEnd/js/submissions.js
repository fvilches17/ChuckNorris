const submitFactForApproval = function () {
    const factDescription = $("#fact-description").text();

    const url = `${chuckNorrisAppSettings.apiBaseUrl}/submissions/`;
    const data = { description: factDescription };

    $.post(url, data, "json", function (result) {
        debugger;

    }, "application/json");
};