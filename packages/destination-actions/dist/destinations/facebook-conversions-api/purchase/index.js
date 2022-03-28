"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_core_1 = require("@segment/actions-core");
const constants_1 = require("../constants");
const fb_capi_properties_1 = require("../fb-capi-properties");
const fb_capi_user_data_1 = require("../fb-capi-user-data");
const action = {
    title: 'Purchase',
    description: 'Send event when a user completes a purchase',
    defaultSubscription: 'type = "track" and event = "Order Completed"',
    fields: {
        action_source: { ...fb_capi_properties_1.action_source, required: true },
        currency: { ...fb_capi_properties_1.currency, required: true },
        event_time: { ...fb_capi_properties_1.event_time, required: true },
        user_data: fb_capi_user_data_1.user_data_field,
        value: {
            ...fb_capi_properties_1.value,
            required: true,
            default: { '@path': '$.properties.revenue' }
        },
        content_ids: fb_capi_properties_1.content_ids,
        content_name: fb_capi_properties_1.content_name,
        content_type: fb_capi_properties_1.content_type,
        contents: {
            ...fb_capi_properties_1.contents,
            default: {
                '@arrayPath': [
                    '$.properties.products',
                    {
                        id: {
                            '@path': '$.product_id'
                        },
                        quantity: {
                            '@path': '$.quantity'
                        },
                        item_price: {
                            '@path': '$.price'
                        }
                    }
                ]
            }
        },
        event_id: fb_capi_properties_1.event_id,
        event_source_url: fb_capi_properties_1.event_source_url,
        num_items: fb_capi_properties_1.num_items,
        custom_data: fb_capi_properties_1.custom_data
    },
    perform: (request, { payload, settings }) => {
        if (!constants_1.CURRENCY_ISO_CODES.has(payload.currency)) {
            throw new actions_core_1.IntegrationError(`${payload.currency} is not a valid currency code.`, 'Misconfigured required field', 400);
        }
        if (!payload.user_data) {
            throw new actions_core_1.IntegrationError('Must include at least one user data property', 'Misconfigured required field', 400);
        }
        if (payload.action_source === 'website' && payload.user_data.client_user_agent === undefined) {
            throw new actions_core_1.IntegrationError('If action source is "Website" then client_user_agent must be defined', 'Misconfigured required field', 400);
        }
        if (payload.contents) {
            const err = fb_capi_properties_1.validateContents(payload.contents);
            if (err)
                throw err;
        }
        return request(`https://graph.facebook.com/v${constants_1.API_VERSION}/${settings.pixelId}/events`, {
            method: 'POST',
            json: {
                data: [
                    {
                        event_name: 'Purchase',
                        event_time: payload.event_time,
                        action_source: payload.action_source,
                        event_source_url: payload.event_source_url,
                        event_id: payload.event_id,
                        user_data: fb_capi_user_data_1.hash_user_data({ user_data: payload.user_data }),
                        custom_data: {
                            ...payload.custom_data,
                            currency: payload.currency,
                            value: payload.value,
                            content_ids: payload.content_ids,
                            content_name: payload.content_name,
                            content_type: payload.content_type,
                            contents: payload.contents,
                            num_items: payload.num_items
                        }
                    }
                ]
            }
        });
    }
};
exports.default = action;
//# sourceMappingURL=index.js.map