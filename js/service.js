const service = {
 
    getCallID: async () => {
      const callID = await fetch(`${BASE_URL}/calls`, {
        method: "POST",
        headers: this.headers,
      });
      if (!callID.ok) {
        throw new Error("Failed to get call ID");
      }
  
      const callIDText = await callID.text();
      return callIDText;
    },
  
    getEvents: async (callID) => {
      const order = await fetch(`${BASE_URL}/calls/${callID}/events`, {
        method: "GET",
        headers: this.headers,
      });
      if (!order.ok) {
        throw new Error("Failed to get order");
      }
  
      const eventsJSON = await order.json();
      return eventsJSON.items;
    }
  }