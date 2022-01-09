export interface ConnectOptions {
  host?: IArtkitHost
  targetOrigin?: string
  previewImageURL?: () => string | Promise<string>
  attributes?: () => Record<string, any> | Promise<Record<string, any>>
}

export interface IArtkitMessageEvent {
  data: ArtkitMessageToEmbedded
}

export interface IArtkitParent {
  postMessage(
    data: ArtkitMessageToHost,
    options: { targetOrigin: string }
  ): void
}

export interface IArtkitHost {
  addEventListener(
    type: 'message',
    handler: (event: IArtkitMessageEvent) => void
  ): void
  parent: IArtkitParent
}

export const Message = {
  connect: '@artkit:connect',
  previewReady: '@artkit:previewReady',
  attributes: '@artkit:attributes',
  previewImageURL: '@artkit:previewImageURL',
}

export type ArtkitMessageToEmbedded =
  | { type: typeof Message['attributes'] }
  | { type: typeof Message['previewImageURL'] }

export type ArtkitMessageToHost =
  | {
      type: typeof Message['connect']
      features: ('attributes' | 'previewImageURL')[]
    }
  | {
      type: typeof Message['previewReady']
    }
  | {
      type: typeof Message['attributes']
      attributes: Record<string, any>
    }
  | {
      type: typeof Message['previewImageURL']
      url: string
    }

export function connect(options: ConnectOptions) {
  const { host = window as IArtkitHost } = options

  const postMessageOptions = {
    targetOrigin: options.targetOrigin || '*',
  }

  host.parent.postMessage(
    {
      type: Message.connect,
      features: [
        ...(options.attributes ? ['attributes' as const] : []),
        ...(options.previewImageURL ? ['previewImageURL' as const] : []),
      ],
    },
    postMessageOptions
  )

  host.addEventListener('message', async (event) => {
    // Ensure a valid data object
    if (typeof event.data !== 'object' || event.data === null) return

    switch (event.data.type) {
      case '@artkit:previewImageURL': {
        const url = await options.previewImageURL!()

        host.parent.postMessage(
          { type: Message.previewImageURL, url },
          postMessageOptions
        )

        break
      }
      case '@artkit:attributes': {
        const attributes = await options.attributes!()

        host.parent.postMessage(
          { type: Message.attributes, attributes },
          postMessageOptions
        )

        break
      }
    }
  })
}

export interface PreviewReadyOptions {
  host?: IArtkitHost
  targetOrigin?: string
}

export function previewReady(options: PreviewReadyOptions = {}) {
  const { host = window as IArtkitHost, targetOrigin } = options

  host.parent.postMessage(
    { type: Message.previewReady },
    { targetOrigin: targetOrigin || '*' }
  )
}
