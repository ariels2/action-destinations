import nock from 'nock'
import { createTestEvent, createTestIntegration } from '@segment/actions-core'
import ga4 from '../index'

const testDestination = createTestIntegration(ga4)
const apiSecret = 'b287432uhkjHIUEL'
const measurementId = 'G-TESTTOKEN'

describe('GA4', () => {
  describe('View Item List', () => {
    it('should append user_properties correctly', async () => {
      nock('https://www.google-analytics.com/mp/collect')
        .post(`?measurement_id=${measurementId}&api_secret=${apiSecret}`)
        .reply(201, {})

      const event = createTestEvent({
        event: 'Product List Viewed',
        userId: 'abc123',
        anonymousId: 'anon-2134',
        type: 'track',
        properties: {
          products: [
            {
              product_id: '12345abcde',
              name: 'Quadruple Stack Oreos, 52 ct',
              currency: 'USD',
              price: 12.99,
              quantity: 1
            }
          ]
        }
      })
      const responses = await testDestination.testAction('viewItemList', {
        event,
        settings: {
          apiSecret,
          measurementId
        },
        mapping: {
          client_id: {
            '@path': '$.anonymousId'
          },
          engagement_time_msec: 2,
          user_properties: {
            hello: 'world',
            a: '1',
            b: '2',
            c: '3'
          },
          items: [
            {
              item_name: {
                '@path': `$.properties.products.0.name`
              },
              item_id: {
                '@path': `$.properties.products.0.product_id`
              },
              currency: {
                '@path': `$.properties.products.0.currency`
              },
              price: {
                '@path': `$.properties.products.0.price`
              },
              quantity: {
                '@path': `$.properties.products.0.quantity`
              }
            }
          ]
        }
      })

      expect(responses.length).toBe(1)
      expect(responses[0].status).toBe(201)

      expect(responses[0].options.body).toMatchInlineSnapshot(
        `"{\\"client_id\\":\\"anon-2134\\",\\"events\\":[{\\"name\\":\\"view_item_list\\",\\"params\\":{\\"items\\":[{\\"item_name\\":\\"Quadruple Stack Oreos, 52 ct\\",\\"item_id\\":\\"12345abcde\\",\\"currency\\":\\"USD\\",\\"price\\":12.99,\\"quantity\\":1}],\\"engagement_time_msec\\":2}}],\\"user_properties\\":{\\"hello\\":{\\"value\\":\\"world\\"},\\"a\\":{\\"value\\":\\"1\\"},\\"b\\":{\\"value\\":\\"2\\"},\\"c\\":{\\"value\\":\\"3\\"}}}"`
      )
    })

    it('should allow currency to be lowercase', async () => {
      nock('https://www.google-analytics.com/mp/collect')
        .post(`?measurement_id=${measurementId}&api_secret=${apiSecret}`)
        .reply(201, {})

      const event = createTestEvent({
        event: 'Product List Viewed',
        userId: 'abc123',
        anonymousId: 'anon-2134',
        type: 'track',
        properties: {
          products: [
            {
              product_id: '12345abcde',
              name: 'Quadruple Stack Oreos, 52 ct',
              currency: 'usd',
              price: 12.99,
              quantity: 1
            }
          ]
        }
      })
      const responses = await testDestination.testAction('viewItemList', {
        event,
        settings: {
          apiSecret,
          measurementId
        },
        mapping: {
          client_id: {
            '@path': '$.anonymousId'
          },
          engagement_time_msec: 2,
          user_properties: {
            hello: 'world',
            a: '1',
            b: '2',
            c: '3'
          },
          items: [
            {
              item_name: {
                '@path': `$.properties.products.0.name`
              },
              item_id: {
                '@path': `$.properties.products.0.product_id`
              },
              currency: {
                '@path': `$.properties.products.0.currency`
              },
              price: {
                '@path': `$.properties.products.0.price`
              },
              quantity: {
                '@path': `$.properties.products.0.quantity`
              }
            }
          ]
        }
      })

      expect(responses.length).toBe(1)
      expect(responses[0].status).toBe(201)

      expect(responses[0].options.body).toMatchInlineSnapshot(
        `"{\\"client_id\\":\\"anon-2134\\",\\"events\\":[{\\"name\\":\\"view_item_list\\",\\"params\\":{\\"items\\":[{\\"item_name\\":\\"Quadruple Stack Oreos, 52 ct\\",\\"item_id\\":\\"12345abcde\\",\\"currency\\":\\"usd\\",\\"price\\":12.99,\\"quantity\\":1}],\\"engagement_time_msec\\":2}}],\\"user_properties\\":{\\"hello\\":{\\"value\\":\\"world\\"},\\"a\\":{\\"value\\":\\"1\\"},\\"b\\":{\\"value\\":\\"2\\"},\\"c\\":{\\"value\\":\\"3\\"}}}"`
      )
    })

    it('should throw an error for invalid currency values', async () => {
      nock('https://www.google-analytics.com/mp/collect')
        .post(`?measurement_id=${measurementId}&api_secret=${apiSecret}`)
        .reply(201, {})
      const event = createTestEvent({
        event: 'Product List Viewed',
        userId: '3456fff',
        type: 'track',
        properties: {
          order_id: '5678dd9087-78',
          list_id: '12345',
          name: 'Wishlist',
          products: [
            {
              product_id: '12345',
              name: 'Monopoly',
              currency: '1234'
            }
          ]
        }
      })
      try {
        await testDestination.testAction('viewItemList', {
          event,
          settings: {
            apiSecret,
            measurementId
          },
          mapping: {
            items: [
              {
                item_name: {
                  '@path': `$.properties.products.0.name`
                },
                item_id: {
                  '@path': `$.properties.products.0.product_id`
                },
                currency: {
                  '@path': `$.properties.products.0.currency`
                }
              }
            ]
          },
          useDefaultMappings: true
        })
        fail('the test should have thrown an error')
      } catch (e) {
        expect(e.message).toBe('1234 is not a valid currency code.')
      }
    })

    it('should throw an error if there is no products array', async () => {
      nock('https://www.google-analytics.com/mp/collect')
        .post(`?measurement_id=${measurementId}&api_secret=${apiSecret}`)
        .reply(201, {})
      const event = createTestEvent({
        event: 'Product List Viewed',
        userId: '3456fff',
        anonymousId: 'anon-567890',
        type: 'track',
        properties: {
          order_id: '5678dd9087-78',
          list_id: '12345',
          name: 'Wishlist'
        }
      })
      try {
        await testDestination.testAction('viewItemList', {
          event,
          settings: {
            apiSecret,
            measurementId
          },
          mapping: {
            clientId: {
              '@path': '$.anonymousId'
            },
            item_list_id: {
              '@path': '$.properties.list_id'
            }
          },
          useDefaultMappings: true
        })
        fail('the test should have thrown an error')
      } catch (e) {
        expect(e.message).toBe("The root value is missing the required field 'items'.")
      }
    })

    it('should throw an error for products missing name and id', async () => {
      nock('https://www.google-analytics.com/mp/collect')
        .post(`?measurement_id=${measurementId}&api_secret=${apiSecret}`)
        .reply(201, {})
      const event = createTestEvent({
        event: 'Product List Viewed',
        userId: '3456fff',
        type: 'track',
        properties: {
          order_id: '5678dd9087-78',
          list_id: '12345',
          name: 'Wishlist',
          products: [
            {
              quantity: 2,
              coupon: 'MOUNTAIN',
              brand: 'Canvas',
              category: 'T-Shirt',
              variant: 'Black',
              price: 19.98
            }
          ]
        }
      })
      try {
        await testDestination.testAction('viewItemList', {
          event,
          settings: {
            apiSecret,
            measurementId
          },
          mapping: {
            client_id: {
              '@path': '$.anonymousId'
            },
            item_list_id: {
              '@path': '$.properties.list_id'
            },
            item_list_name: {
              '@path': '$.properties.name'
            },
            items: [
              {
                item_brand: {
                  '@path': `$.properties.brand`
                }
              }
            ]
          },
          useDefaultMappings: true
        })
        fail('the test should have thrown an error')
      } catch (e) {
        expect(e.message).toBe('One of product name or product id is required for product or impression data.')
      }
    })
  })
})
