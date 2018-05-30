$.get("http://localhost:5000/api/facts", function (facts) {

    $("#num-of-facts").text(facts.length);

    const area = $("#chuck-facts-area");

    for (let fact of facts) {
        area.append(
            `<section class='chuck-fact'>
                <p>${fact.description}</p>
            </section>`);
    }
});
