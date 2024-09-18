const state = {
    status: 'awake',
    callID: null,
    events: [],
    initializedAgent: false
};

const BASE_URL = 'https://bedrock-open-enrollment-server.glitch.me';
const baseConfig = {
    type: "SettingsConfiguration",
    audio: {
        input: {
            encoding: "linear16",
            sample_rate: 16000
          },
          output: {
            encoding: "linear16",
            sample_rate: 48000,
            container: "none",
            buffer_size: 250,
          }
    },
    agent: {
        listen: { model: "nova-2" },
        speak: { model: "aura-athena-en" },
    },
}

function getStsConfig(callID) {
    return {
        ...baseConfig,
        agent: {
            ...baseConfig.agent,
            think: {
                provider: {
                    type: "custom",
                    url: "http://Bedroc-Proxy-3R3wyfMzoB0J-189585684.us-east-1.elb.amazonaws.com/api/v1/chat/completions",
                    key: "a5gf-fjn7-oi92-cg54",
                },
                model: "anthropic.claude-3-sonnet-20240229-v1:0",
                instructions: `
Keep your responses short max 1-2 sentenes.

Provide high-level options, then drill into details based on user responses.

Coverage Examples help visualize how the plan works in scenarios like having a baby or managing diabetes, showing what costs are covered and what users pay out-of-pocket.

When discussing options, ask about network providers, prescription coverage, and handling unexpected events. Use the provided Glossary for unfamiliar insurance terms. I'm here to assist, and customer service contacts are available for further questions.

You are an expert in health coverage. Your task is to define and explain health insurance and medical terms clearly. The terms may vary based on the user’s plan.

Examples:

Allowed Amount: Max payment the plan will cover for a service.
Appeal: Request to review a denied benefit or payment.
Balance Billing: When billed for the difference between the billed amount and the allowed amount.
Coinsurance: Percentage of costs you pay for a service.
Copayment: Fixed amount you pay at the time of service.
Deductible: Amount you owe before the plan starts paying.
Formulary: List of prescription drugs covered by the plan.
In-network Provider: Contracted providers with lower out-of-pocket costs.
Out-of-pocket Limit: Max you pay during a coverage period.
Assist users in completing a Summary of Benefits and Coverage (SBC) form, ensuring questions are clear and focus on necessary details.

Sections:

Plan Information: Insurance company name, plan option, coverage period, coverage type, and plan type.
Common Medical Events: Services included and costs.
Prescription Drugs: Coverage for drug tiers, copayments, or coinsurance.
Excluded & Other Covered Services: Ask about non-covered and limited services.
Rights and Access: Coverage continuation, grievances, essential coverage, value standards, and language access.
Pricing info:

Deductible: $500 individual/$1,000 family.
Services Before Deductible: Preventive care, primary care.
Out-of-Pocket Limit: $2,500/$5,000 in-network, $4,000/$8,000 out-of-network.
Provider Network: In-network providers cost less.
Specialist Referral: Required.
Example of specific services:

Primary Care Visit: $35 copay, 20% coinsurance, deductible doesn’t apply.
Generic Drugs: $10 copay, 40% coinsurance.
Ensure all sections are completed accurately and prompt users for additional information as needed.
`,
                functions: [
                    {
                        name: "add_meeting",
                        description: "Add a meeting to the schedule.",
                        parameters: {                            
                            type: "object",
                            properties: {
                                item: {
                                    type: "string",
                                    description: `
                                        The time and date of the meeting.
                                    `,
                                },
                            },
                            required: ["item"],
                        },
                        url: BASE_URL + "/calls/" + callID + "/events/items",
                        method: "post",   
                    }
                ],
            }
        },
    };
}
