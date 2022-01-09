export interface ConnectOptions {
  previewImageURL(): Promise<string>
  attributes(): Promise<Record<string, any>>
}

export interface IArtkitMessageEvent {
  data: any
}

export interface IArtkitHost {
  addEventListener(
    type: 'message',
    handler: (event: IArtkitMessageEvent) => void
  ): void
  postMessage(data: any, options: { targetOrigin: string }): void
  parent: IArtkitHost
}

export function connect(options: ConnectOptions): void
export function connect(host: IArtkitHost, options: ConnectOptions): void
export function connect(
  ...args:
    | [options: ConnectOptions]
    | [host: IArtkitHost, options: ConnectOptions]
) {
  const [host, options] =
    args.length === 1 ? [window as IArtkitHost, args[0]] : args

  host.addEventListener('message', async (event) => {
    // Ensure a valid data object
    if (typeof event.data !== 'object' || event.data === null) return

    switch (event.data.type) {
      case '@artkit:previewImage': {
        const url = await options.previewImageURL()

        host.parent.postMessage(
          { type: '@artkit:previewImage', url },
          { targetOrigin: '*' }
        )

        break
      }
      case '@artkit:attributes': {
        const attributes = await options.attributes()

        host.parent.postMessage(
          { type: '@artkit:attributes', attributes },
          { targetOrigin: '*' }
        )

        break
      }
    }
  })
}

export function previewReady(host: IArtkitHost = window) {
  host.parent.postMessage({ type: 'previewReady' }, { targetOrigin: '*' })
}
