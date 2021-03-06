﻿const errorMessage = "hmm...something went wrong, try again";
const sucessMessage = "Your fact has been submitted for approval";
const offlineSubmissionMessage = "Thank you, your submission will be sent next time you go online";

const submitFactForApproval = function (event) {
    //Prevent form from default submit behavior
    event.preventDefault();

    //Validate
    const factDescription = $("#fact-description").val();
    if (!factDescription || factDescription.length === 0) return;

    //Display status indicators
    $("#confirmation-area").empty();
    $("#loader").show();

    //Process submission
    if (navigator.onLine) {
        const url = `${chuckNorrisAppSettings.apiBaseUrl}/submissions/`;
        const data = { description: factDescription };
        postData(url, data)
            .then(handleSubmissionSuccess)
            .catch(error => console.error(error))
            .finally(() => { $("#loader").hide(); });
    } else {
        //Store for later synching
        storeSubmissionInIndexedDb(factDescription);
    }
};

const handleSubmissionSuccess = function (data) {
    clearTextArea();
    $("#confirmation-area").html(sucessMessage);
    console.log(`The following fact has been submitted: ${JSON.stringify(data)}`);
};

const handleSubmissionError = function (error) {
    console.error(error);
    $("#confirmation-area").text(errorMessage);
};

const clearTextArea = function () {
    $("#fact-description").val("");
};

const storeSubmissionInIndexedDb = function (factDescription) {
    // Open the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = () => {
        const db = open.result;
        const tableName = dbStores.factSubmissions.name;
        const tx = db.transaction(tableName, "readwrite");
        const store = tx.objectStore(tableName);

        try {
            store.add({ description: factDescription, synched: false }).onsuccess = () => {
                console.log(`Added new fact to fact submissions db: ${factDescription}`);
            };
        } catch (error) {
            $("#loader").hide();
            $("#confirmation-area").html(errorMessage);
            console.error(error);
        }

        tx.oncomplete = () => {
            db.close();
            $("#loader").hide();
        };

        tx.onerror = (error) => {
            $("#loader").hide();
            $("#confirmation-area").text(errorMessage);
            console.error(error);
        };
    };

    open.onerror = (event) => {
        $("#loader").hide();
        $("#confirmation-area").text(errorMessage);
        console.error(event);
    };
};