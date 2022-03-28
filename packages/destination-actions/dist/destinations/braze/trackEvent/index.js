"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_core_1 = require("@segment/actions-core");
const dayjs_1 = __importDefault(require("../../../lib/dayjs"));
const userAlias_1 = require("../userAlias");
function toISO8601(date) {
    if (date === null || date === undefined) {
        return date;
    }
    const d = dayjs_1.default(date);
    return d.isValid() ? d.toISOString() : undefined;
}
const action = {
    title: 'Track Event',
    description: 'Record custom events in Braze',
    defaultSubscription: 'type = "track" and event != "Order Completed"',
    fields: {
        external_id: {
            label: 'External User ID',
            description: 'The unique user identifier',
            type: 'string',
            default: {
                '@path': '$.userId'
            }
        },
        user_alias: {
            label: 'User Alias Object',
            description: 'A user alias object. See [the docs](https://www.braze.com/docs/api/objects_filters/user_alias_object/).',
            type: 'object',
            properties: {
                alias_name: {
                    label: 'Alias Name',
                    type: 'string'
                },
                alias_label: {
                    label: 'Alias Label',
                    type: 'string'
                }
            }
        },
        braze_id: {
            label: 'Braze User Identifier',
            description: 'The unique user identifier',
            type: 'string',
            allowNull: true,
            default: {
                '@path': '$.properties.braze_id'
            }
        },
        name: {
            label: 'Event Name',
            description: 'The event name',
            type: 'string',
            required: true,
            default: {
                '@path': '$.event'
            }
        },
        time: {
            label: 'Time',
            description: 'When the event occurred.',
            type: 'datetime',
            required: true,
            default: {
                '@path': '$.receivedAt'
            }
        },
        properties: {
            label: 'Event Properties',
            description: 'Properties of the event',
            type: 'object',
            default: {
                '@path': '$.properties'
            }
        },
        _update_existing_only: {
            label: 'Update Existing Only',
            description: 'Setting this flag to true will put the API in "Update Only" mode. When using a "user_alias", "Update Only" mode is always true.',
            type: 'boolean',
            default: false
        }
    },
    perform: (request, { settings, payload }) => {
        const { braze_id, external_id } = payload;
        const user_alias = userAlias_1.getUserAlias(payload.user_alias);
        if (!braze_id && !user_alias && !external_id) {
            throw new actions_core_1.IntegrationError('One of "external_id" or "user_alias" or "braze_id" is required.', 'Missing required fields', 400);
        }
        return request(`${settings.endpoint}/users/track`, {
            method: 'post',
            json: {
                events: [
                    {
                        braze_id,
                        external_id,
                        user_alias,
                        app_id: settings.app_id,
                        name: payload.name,
                        time: toISO8601(payload.time),
                        properties: payload.properties,
                        _update_existing_only: payload._update_existing_only
                    }
                ]
            }
        });
    }
};
exports.default = action;
//# sourceMappingURL=index.js.map