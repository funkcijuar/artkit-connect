type Thunk<T> = T | (() => T | Promise<T>)

export type MetadataAttribute = {
  trait_type: string
  value: string | number | boolean
}

export type MetadataAttributes = Record<string, any> | MetadataAttribute[]

export interface ConnectOptions {
  host?: IArtkitHost
  targetOrigin?: string
  image?: Thunk<string>
  attributes?: Thunk<MetadataAttributes>
  allowMultipleCalls?: boolean
}

export interface IArtkitHost {
  postMessage(
    data: ArtkitMessageToHost,
    options: { targetOrigin: string }
  ): void
}

export const Message = {
  saveMetadata: '@artkit:saveMetadata',
}

export type ArtkitMessageToHost = {
  type: typeof Message['saveMetadata']
  attributes?: MetadataAttributes
  image?: string
}

async function resolve<T>(value: Thunk<T> | undefined): Promise<T | undefined> {
  return value instanceof Function ? value() : value
}

let called = false

export async function saveMetadata(options: ConnectOptions) {
  if (!options) {
    throw new Error(`artkit.saveMetadata() was called without any options!`)
  }

  const { host = window as IArtkitHost, allowMultipleCalls = false } = options

  if (called && !allowMultipleCalls) return

  called = true

  const attributes = await resolve(options.attributes)
  const image = await resolve(options.image)

  host.postMessage(
    {
      type: Message.saveMetadata,
      ...(attributes && { attributes }),
      ...(image && { image }),
    },
    { targetOrigin: options.targetOrigin || '*' }
  )
}
