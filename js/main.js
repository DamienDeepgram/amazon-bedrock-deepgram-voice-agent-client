const audioContextOut = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive", sampleRate: 48000 });
const audioContext = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
let startTime = -1;

window.onload = function () {
  prepareAgentConfig();
  const voice = document.getElementById("voice");
  const model = document.getElementById("model");
  document.getElementById("startConversationBtn").addEventListener("click", () => {
    startConversaton(model, voice);
  });
};

function startConversaton(model, voice) {
  const config = configureSettings(model, voice);
  let ws = new WebSocket("wss://sts-demo.deepgram.com/agent");
  // let ws = new WebSocket("wss://sts.sandbox.deepgram.com/agent", ["token", "<your-api-key-here>"]);
  ws.binaryType = 'arraybuffer';

  ws.onopen = function () {
    console.log("WebSocket connection established.");
    // Send initial config on connection
    ws.send(JSON.stringify(config)); 
    // Send the microphone audio to the websocket
    captureAudio((data)=>{
      ws.send(data);
    });
  };

  ws.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  ws.onmessage = function (event) {
    if (typeof event.data === "string") {
      console.log("Text message received:", event.data);
      // Handle text messages
      handleMessageEvent(event.data);
    } else if (event.data instanceof ArrayBuffer) {
      // Update the animation
      updateBlobSize(0.25);
      // Play the audio
      receiveAudio(event.data);
    } else {
      console.error("Unsupported message format.");
    }
  };

  updateUI();

  updateVoices((voice_selection) => {
    ws.send(JSON.stringify({
      "type": "UpdateSpeak",
      "model": voice_selection
    }));
  });

  updateInstructions((instructions) => {
    ws.send(JSON.stringify({
      "type": "UpdateInstructions",
      "instructions": instructions
    }))
  });
}

function updateVoices(callback) {
  document.querySelectorAll(".circle-button").forEach((button) => {
    button.addEventListener("click", function () {
      document
        .querySelector(".circle-button.selected")
        .classList.remove("selected");
      this.classList.add("selected");
      const voice_selection = this.id;
      console.log("Voice selection changed to:", voice_selection);

      callback(voice_selection);
    });
  });
}

function updateInstructions(callback) {
  // Update the instructions when a button is clicked
  document
    .getElementById("updateInstructionsBtn")
    .addEventListener("click", function () {
      let instructions = document.getElementById("instructionsInput").value;
      callback(instructions);
    });
}

function updateQuestions(){
  const itemsDiv = document.querySelector('#items');
  let questions = [
    "Can you schedule a meeting for September 30th 2024 at 10am?",
    "What is the overall deductible for an individual and for a family?",
    "Are there services covered before meeting the deductible? If yes, which services?",
    "Are there other deductibles for specific services? If yes, what are they?",
    "What is the out-of-pocket limit for this plan for both network and out-of-network providers?",
    "What is not included in the out-of-pocket limit?",
    "Will the user pay less if they use a network provider? How can they find a list of network providers?",
    "Does the plan cover prescription drugs?",
    "What is the coverage for preventive care services?",
    "How does the plan handle out-of-network care, and what are the costs associated with that?",
    "Can I keep my current doctor under the new plan?",
    "What is the process for filing a claim, and how long does it typically take to get reimbursed?"
  ];
  questions.forEach((item) => {
    let itemLi = document.createElement('li');
    itemLi.innerHTML = item;
    itemLi.className = 'no-bullets items';
    itemsDiv.appendChild(itemLi);
});
}

function updateUI() {
  document.getElementById("startContainer").style.display = "none";
  document.getElementById("blobCanvas").style.display = "flex";
  document.getElementById("buttonContainer").style.display = "flex";

  animateBlob();
}

function configureSettings(model, voice) {
  const voiceSelection = voice.options[voice.selectedIndex].value;
  const providerAndModel = model.options[model.selectedIndex].value.split("+");

  // Configuration settings for the agent
  let config_settings = getStsConfig(state.callID);
  config_settings.agent.think.provider = providerAndModel[0];
  config_settings.agent.think.model = providerAndModel[1];
  console.log('config_settings', JSON.stringify(config_settings))

  // Update the text area to match the initial instructions
  document.getElementById("instructionsInput").value = config_settings.agent.think.instructions;
  document.getElementById(voiceSelection).classList.add("selected");
  return config_settings;
}

async function handleMessageEvent(data){
  let msgObj = JSON.parse(data);
  if (msgObj["type"] === "UserStartedSpeaking") {
    clearScheduledAudio();
  }
  if (!state.callID || state.status === 'sleeping') return;

  const events = await service.getEvents(state.callID);
  if (events) {
      // Consolidate order needed because sometimes server can send back duplicate items
      state.events = events;
      let eventItems = document.querySelector('#eventItems');
      eventItems.innerHTML = '';
      let total = 0;
      state.events.forEach((item) => {
          let itemLi = document.createElement('li');
          itemLi.innerHTML = item;
          itemLi.className = 'no-bullets';
          eventItems.appendChild(itemLi);
      });
  }
}

async function prepareAgentConfig() {
  state.initializedAgent = true;
  try {
    updateQuestions();
    state.callID = await service.getCallID();
    let button = document.querySelector('#startConversationBtn');
    button.innerHTML = 'Start Conversation';
    button.removeAttribute('disabled');
  } catch (error) {
    console.error("Config error:", error);
  }
}