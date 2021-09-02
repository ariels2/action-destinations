import nock from 'nock'
import { createTestEvent, createTestIntegration } from '@segment/actions-core'
import Destination from '../../index'
import { token } from '/Users/nicholas.aguilar/Desktop/token'

const testDestination = createTestIntegration(Destination)

const settings = {
  pixelId: '123321',
  token: token.token
}

describe('purchase', () => {
  it('should handle a basic event', async () => {
    nock(`https://graph.facebook.com/v11.0/${settings.pixelId}`, {
      reqheaders: {
        bearer: settings.token
      }
    })
      .post('/events')
      .reply(201, {})

    const event = createTestEvent({
      event: 'Order Completed',
      userId: '7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068', // Pre -hashed for simplicity
      timestamp: '1629827640',
      properties: {
        action_source: 'email',
        currency: 'USD',
        value: 12.12,
        email: 'nicholas.aguilar@segment.com'
      }
    })

    const responses = await testDestination.testAction('purchase', {
      event,
      settings,
      mapping: {
        currency: {
          '@path': '$.properties.currency'
        },
        value: {
          '@path': '$.properties.value'
        },
        user_data: {
          email: {
            '@path': '$.properties.email'
          }
        }
      }
    })

    expect(responses.length).toBe(1)
    expect(responses[0].status).toBe(201)
  })

  it('should throw an error if no user_data keys are included', async () => {
    nock(`https://graph.facebook.com/v11.0/${settings.pixelId}`, {
      reqheaders: {
        bearer: settings.token
      }
    })
      .post('/events')
      .reply(200, {})

    const event = createTestEvent({
      event: 'Order Completed',
      userId: '7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068', // Pre -hashed for simplicity
      timestamp: '1629827640',
      properties: {
        action_source: 'email',
        currency: 'USD',
        value: 12.12
      }
    })

    try {
      await testDestination.testAction('purchase', {
        event,
        settings,
        mapping: {
          currency: {
            '@path': '$.properties.currency'
          },
          value: {
            '@path': '$.properties.value'
          }
          // No user data mapping included. This should cause action to fail.
        }
      })
      fail('Did not expect purchase action to succeed')
    } catch (e) {
      expect(e.message).toBe('Must include at least one user data property')
    }
  })
})
