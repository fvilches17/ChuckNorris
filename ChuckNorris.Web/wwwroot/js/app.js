const highlightPageIcon = function() {
    const urlPath = window.location.pathname;
    const className = "selected-icon";

    if (urlPath.toLowerCase().startsWith("/facts")) {
        $("#icon-home").addClass(className);
    } else if (urlPath.toLowerCase().startsWith("/favorites")) {
        $("#icon-favorites").addClass(className);
    } else if (urlPath.toLowerCase().startsWith("/bio")) {
        $("#icon-chuck").addClass(className);
    } else if (urlPath.toLowerCase().startsWith("/contact")) {
        $("#icon-contact").addClass(className);
    }
}

$(document).ready(function () {
    highlightPageIcon();
});