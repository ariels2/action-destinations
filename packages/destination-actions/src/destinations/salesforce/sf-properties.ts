import { InputField } from '@segment/actions-core/src/destination-kit/types'
import { IntegrationError } from '@segment/actions-core'

export const operation: InputField = {
  label: 'Operation',
  description:
    'The Salesforce operation performed. The available operations are Create, Update or Upsert records in Salesforce.',
  type: 'string',
  required: true,
  choices: [
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Upsert', value: 'upsert' },
    { label: 'Bulk Upsert', value: 'bulkUpsert' },
    { label: 'Bulk Update', value: 'bulkUpdate' }
  ]
}

export const bulkUpsertExternalId: InputField = {
  label: 'Bulk Upsert External Id',
  description: 'The external id field name and mapping to use for bulk upsert.',
  type: 'object',
  defaultObjectUI: 'keyvalue:only',
  additionalProperties: false,
  properties: {
    externalIdName: {
      label: 'External Id Name',
      description: 'The external id field name as defined in Salesforce.',
      type: 'string'
    },
    externalIdValue: {
      label: 'External Id Value',
      description: 'The external id field value to use for bulk upsert.',
      type: 'string'
    }
  }
}

export const bulkUpdateRecordId: InputField = {
  label: 'Bulk Update Record Id',
  description: 'The record id value to use for bulk update.',
  type: 'string'
}

export const traits: InputField = {
  label: 'Record Matchers',
  description: `The fields used to find Salesforce records for updates. **This is required if the operation is Update or Upsert.**

  Any field can function as a matcher, including Record ID, External IDs, standard fields and custom fields. On the left-hand side, input the Salesforce field API name. On the right-hand side, map the Segment field that contains the value.  
  
  If multiple records are found, no updates will be made. **Please use fields that result in unique records.**
  
  ---

  `,
  type: 'object',
  defaultObjectUI: 'keyvalue:only'
}

export const customFields: InputField = {
  label: 'Other Fields',
  description: `
  Additional fields to send to Salesforce. On the left-hand side, input the Salesforce field API name. On the right-hand side, map the Segment field that contains the value.

  This can include standard or custom fields. Custom fields must be predefined in your Salesforce account and the API field name should have __c appended.
  
  ---
  
  `,
  type: 'object',
  defaultObjectUI: 'keyvalue'
}

interface Payload {
  operation?: string
  traits?: object
}

export const validateLookup = (payload: Payload) => {
  if (payload.operation === 'update' || payload.operation === 'upsert') {
    if (!payload.traits) {
      throw new IntegrationError(
        'Undefined lookup traits for update or upsert operation',
        'Misconfigured Required Field',
        400
      )
    }
  }
}
