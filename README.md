# amazon-bedrock-deepgram-voice-agent-client

Simple web interface for the Deepgram Voice AI Agent API showing an Open Enrolement Voice Bot

* LLM Configuration
* LLM Function Calling
* Websocket Interface
  * Sending browser microphone audio
  * Receiving audio response
 
## Server For Function Calling

If you wish to use your own API for function calling you can host a pulic API that the LLM can reach. Locally this can be done with NGrok

- [API URL Config](https://github.com/DamienDeepgram/amazon-bedrock-deepgram-voice-agent-client/blob/main/js/config.js#L8)
- [Server Repo](https://github.com/DamienDeepgram/amazon-bedrock-deepgram-voice-agent-server)

## Setup

Set your Deepgram API Key in main.js [here](https://github.com/DamienDeepgram/amazon-bedrock-deepgram-voice-agent-client/blob/main/js/main.js#L16)

```
let ws = new WebSocket("wss://agent.deepgram.com/agent", ["token", "<your-api-key-here>"]);
```

## Installation

```
npm install -g http-server
```

## Running

In the root of the repo run

```
http-server
```
