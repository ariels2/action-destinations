import camelCase from 'lodash/camelCase';
import { segmentEventSource } from '..';
const action = {
    title: 'Identify User',
    description: 'Sets user identity variables',
    platform: 'web',
    defaultSubscription: 'type = "identify"',
    fields: {
        userId: {
            type: 'string',
            required: false,
            description: "The user's id",
            label: 'User ID',
            default: {
                '@path': '$.userId'
            }
        },
        anonymousId: {
            type: 'string',
            required: false,
            description: "The user's anonymous id",
            label: 'Anonymous ID',
            default: {
                '@path': '$.anonymousId'
            }
        },
        displayName: {
            type: 'string',
            required: false,
            description: "The user's display name",
            label: 'Display Name',
            default: {
                '@path': '$.traits.name'
            }
        },
        email: {
            type: 'string',
            required: false,
            description: "The user's email",
            label: 'Email',
            default: {
                '@path': '$.traits.email'
            }
        },
        traits: {
            type: 'object',
            required: false,
            description: 'The Segment traits to be forwarded to FullStory',
            label: 'Traits',
            default: {
                '@path': '$.traits'
            }
        }
    },
    perform: (FS, event) => {
        let newTraits = {};
        if (event.payload.traits) {
            newTraits = Object.entries(event.payload.traits).reduce((acc, [key, value]) => ({
                ...acc,
                [camelCaseField(key)]: value
            }), {});
        }
        if (event.payload.anonymousId) {
            newTraits.segmentAnonymousId_str = event.payload.anonymousId;
        }
        if (event.payload.userId) {
            FS.identify(event.payload.userId, newTraits, segmentEventSource);
        }
        else {
            FS.setUserVars({
                ...newTraits,
                ...(event.payload.email !== undefined && { email: event.payload.email }),
                ...(event.payload.displayName !== undefined && { displayName: event.payload.displayName })
            }, segmentEventSource);
        }
    }
};
function camelCaseField(fieldName) {
    const parts = fieldName.split('_');
    if (parts.length > 1) {
        const typeSuffix = parts.pop();
        switch (typeSuffix) {
            case 'str':
            case 'int':
            case 'date':
            case 'real':
            case 'bool':
            case 'strs':
            case 'ints':
            case 'dates':
            case 'reals':
            case 'bools':
                return camelCase(parts.join('_')) + '_' + typeSuffix;
            default:
        }
    }
    return camelCase(fieldName);
}
export default action;
//# sourceMappingURL=index.js.map