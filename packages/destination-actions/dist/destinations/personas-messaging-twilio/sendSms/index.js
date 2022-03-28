"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mustache_1 = __importDefault(require("mustache"));
const actions_core_1 = require("@segment/actions-core");
const getProfileApiEndpoint = (environment) => {
    return `https://profiles.segment.${environment === 'production' ? 'com' : 'build'}`;
};
const fetchProfileTraits = async (request, settings, profileId) => {
    const endpoint = getProfileApiEndpoint(settings.profileApiEnvironment);
    const response = await request(`${endpoint}/v1/spaces/${settings.spaceId}/collections/users/profiles/user_id:${profileId}/traits?limit=200`, {
        headers: {
            authorization: `Basic ${Buffer.from(settings.profileApiAccessToken + ':').toString('base64')}`,
            'content-type': 'application/json'
        }
    });
    const body = await response.json();
    return body.traits;
};
const EXTERNAL_ID_KEY = 'phone';
const DEFAULT_CONNECTION_OVERRIDES = 'rp=all&rc=5';
const action = {
    title: 'Send SMS',
    description: 'Send SMS using Twilio',
    defaultSubscription: 'type = "track" and event = "Audience Entered"',
    fields: {
        userId: {
            label: 'User ID',
            description: 'User ID in Segment',
            type: 'string',
            required: true,
            default: { '@path': '$.userId' }
        },
        toNumber: {
            label: 'Test Number',
            description: 'Number to send SMS to when testing',
            type: 'string'
        },
        from: {
            label: 'From',
            description: 'The Twilio Phone Number, Short Code, or Messaging Service to send SMS from.',
            type: 'string',
            required: true
        },
        body: {
            label: 'Message',
            description: 'Message to send',
            type: 'text',
            required: true
        },
        customArgs: {
            label: 'Custom Arguments',
            description: 'Additional custom arguments that will be opaquely sent back on webhook events',
            type: 'object',
            required: false
        },
        connectionOverrides: {
            label: 'Connection Overrides',
            description: 'Connection overrides are configuration supported by twilio webhook services. Must be passed as fragments on the callback url',
            type: 'string',
            required: false
        },
        send: {
            label: 'Send Message',
            description: 'Whether or not the message should actually get sent.',
            type: 'boolean',
            required: false,
            default: false
        },
        externalIds: {
            label: 'External IDs',
            description: 'An array of user profile identity information.',
            type: 'object',
            multiple: true,
            properties: {
                id: {
                    label: 'ID',
                    description: 'A unique identifier for the collection.',
                    type: 'string'
                },
                type: {
                    label: 'type',
                    description: 'The external ID contact type.',
                    type: 'string'
                },
                subscriptionStatus: {
                    label: 'ID',
                    description: 'The subscription status for the identity.',
                    type: 'string'
                }
            },
            default: {
                '@arrayPath': [
                    '$.external_ids',
                    {
                        id: {
                            '@path': '$.id'
                        },
                        type: {
                            '@path': '$.type'
                        },
                        subscriptionStatus: {
                            '@path': '$.isSubscribed'
                        }
                    }
                ]
            }
        }
    },
    perform: async (request, { settings, payload }) => {
        if (!payload.send) {
            return;
        }
        const externalId = payload.externalIds?.find(({ type }) => type === 'phone');
        if (!externalId?.subscriptionStatus || ['unsubscribed', 'did not subscribed', 'false'].includes(externalId.subscriptionStatus)) {
            return;
        }
        else if (['subscribed', 'true'].includes(externalId.subscriptionStatus)) {
            const traits = await fetchProfileTraits(request, settings, payload.userId);
            const phone = payload.toNumber || externalId.id;
            if (!phone) {
                return;
            }
            const profile = {
                user_id: payload.userId,
                phone,
                traits
            };
            const token = Buffer.from(`${settings.twilioAccountId}:${settings.twilioAuthToken}`).toString('base64');
            const body = new URLSearchParams({
                Body: mustache_1.default.render(payload.body, { profile }),
                From: payload.from,
                To: phone
            });
            const webhookUrl = settings.webhookUrl;
            const connectionOverrides = settings.connectionOverrides;
            const customArgs = {
                ...payload.customArgs,
                __segment_internal_external_id_key__: EXTERNAL_ID_KEY,
                __segment_internal_external_id_value__: phone
            };
            if (webhookUrl && customArgs) {
                const webhookUrlWithParams = new URL(webhookUrl);
                for (const key of Object.keys(customArgs)) {
                    webhookUrlWithParams.searchParams.append(key, String(customArgs[key]));
                }
                webhookUrlWithParams.hash = connectionOverrides || DEFAULT_CONNECTION_OVERRIDES;
                body.append('StatusCallback', webhookUrlWithParams.toString());
            }
            return request(`https://api.twilio.com/2010-04-01/Accounts/${settings.twilioAccountId}/Messages.json`, {
                method: 'POST',
                headers: {
                    authorization: `Basic ${token}`
                },
                body
            });
        }
        else {
            throw new actions_core_1.IntegrationError(`Failed to recognize the subscriptionStatus in the payload: "${externalId.subscriptionStatus}".`, 'Invalid subscriptionStatus value', 400);
        }
    }
};
exports.default = action;
//# sourceMappingURL=index.js.map