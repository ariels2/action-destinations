import { segmentEventSource } from '..';
const action = {
    title: 'Track Event',
    description: 'Track events',
    platform: 'web',
    defaultSubscription: 'type = "track"',
    fields: {
        name: {
            description: 'The name of the event.',
            label: 'Name',
            required: true,
            type: 'string',
            default: {
                '@path': '$.event'
            }
        },
        properties: {
            description: 'A JSON object containing additional information about the event that will be indexed by FullStory.',
            label: 'Properties',
            required: false,
            type: 'object',
            default: {
                '@path': '$.properties'
            }
        }
    },
    perform: (FS, event) => {
        FS.event(event.payload.name, event.payload.properties ?? {}, segmentEventSource);
    }
};
export default action;
//# sourceMappingURL=index.js.map