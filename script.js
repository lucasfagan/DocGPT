var systemMessage = `You are a ${doctorType}. You are talking to a patient. 
You will receive a message from a patient, and must decide whether to ask a follow-up question to get more information or give a diagnosis.
Unless you have high confidence in your diagnosis, you should always lean towards asking a question.
Your response should always be formatted as either 
"Question: [your question]"
or 
"Diagnosis: [your diagnosis]"
with no additional text.`;

var messagesToGiveToAPI = [{ role: 'system', content: systemMessage }];

document.getElementById("send").addEventListener("click", function () {
    // make <select name="user" id="doctorType"> uneditable 
    document.getElementById("doctorType").disabled = true;
    document.getElementById("modelType").disabled = true;
    const message = document.getElementById("message").value;
    const chatHistory = document.getElementById("chatHistory");
    const doctorType = document.getElementById("doctorType").value;
    const modelType = document.getElementById("modelType").value;

    if (message.trim() !== "") {
        chatHistory.innerHTML += `<p><b>User:</b> ${message}</p>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;
        document.getElementById("message").value = "";


        var userMessage = message;

        // add user message to messagesToGiveToAPI
        messagesToGiveToAPI.push({ role: 'user', content: userMessage });

        console.log(messagesToGiveToAPI);

        // prepare a request to the openai api to rewrite the text and return json 
        const OPENAI_API_KEY = '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';

        const apiUrl = 'https://api.openai.com/v1/chat/completions';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        };
        const body = {
            model: modelType,
            messages: messagesToGiveToAPI,
        };

        fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            const completion = data.choices[0].message.content;
            const responseType = completion.split(": ")[0];
            const responseContent = completion.split(": ")[1];
            // completed prompt is a string, so we need to parse it into a json object
            //const completionJson = JSON.parse(completion);
            chatHistory.innerHTML += `<p><b>${doctorType}:</b> ${responseContent}</p>`;
            // add response to messagesToGiveToAPI
            messagesToGiveToAPI.push({ role: "assistant", content: responseContent });

        })
        .catch(error => {
            chatHistory.innerHTML += `<p><b>${doctorType}:</b> There was a problem with the text you entered or the API. Please try again with different text, or try again later.</p>`;
            console.error(error)
        });
    }
});

document.getElementById("message").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("send").click();
    }
});
