const action = {
    title: 'Track Event',
    description: 'Reports that the current user performed a custom named event.',
    defaultSubscription: 'type = "track" and event != "Order Completed"',
    platform: 'web',
    fields: {
        eventName: {
            type: 'string',
            required: true,
            description: 'The identifier for the event to track.',
            label: 'Event Name',
            default: {
                '@path': '$.event'
            }
        },
        eventProperties: {
            type: 'object',
            required: false,
            description: 'Hash of properties for this event.',
            label: 'Event Properties',
            default: {
                '@path': '$.properties'
            }
        }
    },
    perform: (client, event) => {
        client.logCustomEvent(event.payload.eventName, event.payload.eventProperties);
    }
};
export default action;
//# sourceMappingURL=index.js.map