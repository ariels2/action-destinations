// Generated file. DO NOT MODIFY IT BY HAND.

export interface Payload {
  /**
   * Uniquely identifies a user instance of a web client.
   */
  clientId: string
  /**
   * A unique identifier for a user. See Google's [User-ID for cross-platform analysis](https://support.google.com/analytics/answer/9213390) and [Reporting: deduplicate user counts](https://support.google.com/analytics/answer/9355949?hl=en) documentation for more information on this identifier.
   */
  user_id?: string
  /**
   * The unique name of the custom event created in GA4. GA4 does not accept spaces in event names so Segment will replace any spaces with underscores. More information about GA4 event name rules is available in [their docs](https://support.google.com/analytics/answer/10085872?hl=en&ref_topic=9756175#event-name-rules&zippy=%2Cin-this-article.%2Cin-this-article).
   */
  name: string
  /**
   * If true, the event name will be converted to lowercase before sending to Google. Event names are case sensitive in GA4 so enable this setting to avoid distinct events for casing differences. More information about GA4 event name rules is available in [their docs](https://support.google.com/analytics/answer/10085872?hl=en&ref_topic=9756175#event-name-rules&zippy=%2Cin-this-article.%2Cin-this-article).
   */
  lowercase?: boolean
  /**
   * The user properties to send to Google Analytics 4. You must create user-scoped dimensions to ensure custom properties are picked up by Google. See Google’s [Custom user properties](https://support.google.com/analytics/answer/9269570) to learn how to set and register user properties.
   */
  user_properties?: {
    [k: string]: unknown
  }
  /**
   * The amount of time a user interacted with your site, in milliseconds. Google only counts users who interact with your site for a non-zero amount of time. By default, Segment sets engagement time to 1 so users are counted.
   */
  engagement_time_msec?: number
  /**
   * The event parameters to send to Google Analytics 4.
   */
  params?: {
    [k: string]: unknown
  }
}
