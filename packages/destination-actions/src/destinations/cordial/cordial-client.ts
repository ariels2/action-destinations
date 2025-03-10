import { Settings } from './generated-types'
import { RequestClient } from '@segment/actions-core'
import { Payload as AddContactToListPayload } from './addContactToList/generated-types'
import { Payload as CreateContactactivityPayload } from './createContactactivity/generated-types'
import { Payload as RemoveContactFromListPayload } from './removeContactFromList/generated-types'
import { Payload as UpsertContactPayload } from './upsertContact/generated-types'

class CordialClient {
  private readonly apiUrl: string
  private readonly request: RequestClient

  constructor(settings: Settings, request: RequestClient) {
    this.apiUrl = `${settings.endpoint}/api/segment`
    this.request = request
  }

  addContactActivity(payload: CreateContactactivityPayload) {
    return this.request(`${this.apiUrl}/createContactactivity`, {
      method: 'post',
      json: {
        userIdentities: payload.userIdentities,
        action: payload.action,
        time: payload.time,
        properties: payload.properties,
        context: payload.context
      }
    })
  }

  async upsertContact(payload: UpsertContactPayload) {
    return this.request(`${this.apiUrl}/upsertContact`, {
      method: 'post',
      json: {
        userIdentities: payload.userIdentities,
        attributes: payload.attributes
      }
    })
  }


  async addContactToList(payload: AddContactToListPayload) {
    return this.request(`${this.apiUrl}/addContactToList`, {
      method: 'post',
      json: {
        userIdentities: payload.userIdentities,
        groupId: payload.groupId,
        listName: payload.listName
      }
    })
  }

  async removeContactFromList(payload: RemoveContactFromListPayload) {
    return this.request(`${this.apiUrl}/removeContactFromList`, {
      method: 'post',
      json: {
        userIdentities: payload.userIdentities,
        groupId: payload.groupId
      }
    })
  }
}

export default CordialClient
