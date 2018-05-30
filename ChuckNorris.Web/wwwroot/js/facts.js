$(document).ready(function () {

    $.get("http://localhost:5000/api/facts", function (facts) {

        $("#num-of-facts").text(facts.length);

        const area = $("#chuck-facts-area");
        for (let fact of facts) {
            area.append(
                `<section class='chuck-fact'>
                    <p>${fact.description}</p>
                </section>`
            );
        }

        $("#chuck-facts-area .chuck-fact").on("click", function () {
            const clickedElement = $(this);
            const className = "chuck-fact-selected";

            clickedElement.hasClass(className)
                ? clickedElement.removeClass(className)
                : clickedElement.addClass(className); 
        });
    });

});

