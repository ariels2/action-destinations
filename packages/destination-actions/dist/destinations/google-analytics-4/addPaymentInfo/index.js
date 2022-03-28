"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_core_1 = require("@segment/actions-core");
const constants_1 = require("../constants");
const ga4_properties_1 = require("../ga4-properties");
const action = {
    title: 'Add Payment Info',
    description: 'Send event when a user submits their payment information',
    defaultSubscription: 'type = "track" and event = "Payment Info Entered"',
    fields: {
        client_id: { ...ga4_properties_1.client_id },
        user_id: { ...ga4_properties_1.user_id },
        currency: { ...ga4_properties_1.currency },
        value: { ...ga4_properties_1.value },
        coupon: { ...ga4_properties_1.coupon },
        payment_type: { ...ga4_properties_1.payment_type },
        items: {
            ...ga4_properties_1.items_multi_products,
            required: true
        },
        params: ga4_properties_1.params
    },
    perform: (request, { payload }) => {
        if (payload.items && !payload.items.length) {
            throw new actions_core_1.IntegrationError('Google requires one or more products in add_payment_info events.', 'Misconfigured required field', 400);
        }
        if (payload.currency && !constants_1.CURRENCY_ISO_CODES.includes(payload.currency)) {
            throw new actions_core_1.IntegrationError(`${payload.currency} is not a valid currency code.`, 'Incorrect value format', 400);
        }
        if (payload.value && payload.currency === undefined) {
            throw new actions_core_1.IntegrationError('Currency is required if value is set.', 'Misconfigured required field', 400);
        }
        if (payload.currency === undefined && payload.items[0].currency === undefined) {
            throw new actions_core_1.IntegrationError('One of item-level currency or top-level currency is required.', 'Misconfigured required field', 400);
        }
        let googleItems = [];
        if (payload.items) {
            googleItems = payload.items.map((product) => {
                if (product.item_name === undefined && product.item_id === undefined) {
                    throw new actions_core_1.IntegrationError('One of product name or product id is required for product or impression data.', 'Misconfigured required field', 400);
                }
                if (product.currency && !constants_1.CURRENCY_ISO_CODES.includes(product.currency)) {
                    throw new actions_core_1.IntegrationError(`${product.currency} is not a valid currency code.`, 'Incorrect value format', 400);
                }
                return product;
            });
        }
        return request('https://www.google-analytics.com/mp/collect', {
            method: 'POST',
            json: {
                client_id: payload.client_id,
                user_id: payload.user_id,
                events: [
                    {
                        name: 'add_payment_info',
                        params: {
                            currency: payload.currency,
                            value: payload.value,
                            coupon: payload.coupon,
                            payment_type: payload.payment_type,
                            items: googleItems,
                            ...payload.params
                        }
                    }
                ]
            }
        });
    }
};
exports.default = action;
//# sourceMappingURL=index.js.map