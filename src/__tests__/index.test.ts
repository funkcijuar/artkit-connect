import {
  connect,
  IArtkitHost,
  IArtkitMessageEvent,
  IArtkitParent,
  Message,
  parseQueryParameters,
} from '..'

it('parses query parameters', () => {
  expect(parseQueryParameters('a=123&b=456')).toEqual({
    a: '123',
    b: '456',
  })

  expect(parseQueryParameters('?a=123&b=456')).toEqual({
    a: '123',
    b: '456',
  })

  expect(parseQueryParameters('#a=123&b=456')).toEqual({
    a: '123',
    b: '456',
  })

  expect(parseQueryParameters('?a=123&b=456#abc')).toEqual({
    a: '123',
    b: '456',
  })

  expect(
    parseQueryParameters('https://example.com/foo/bar?a=123&b=456#abc')
  ).toEqual({
    a: '123',
    b: '456',
  })
})

function createContext() {
  const messages: any[] = []

  let listener: (event: IArtkitMessageEvent) => void

  let parent: IArtkitParent = {
    postMessage(data) {
      messages.push(data)
    },
  }

  let host: IArtkitHost = {
    parent,
    addEventListener(type, handler) {
      listener = handler
    },
  }

  const trigger = async (event: IArtkitMessageEvent) => listener(event)

  return { host, parent, messages, trigger }
}

describe('features', () => {
  it('attributes', async () => {
    const { host, messages, trigger } = createContext()

    connect({
      host,
      attributes() {
        return { foo: 'bar' }
      },
    })

    expect(messages).toEqual([
      { type: Message.connect, features: ['attributes'] },
    ])

    await trigger({
      data: {
        type: Message.attributes,
      },
    })

    expect(messages).toEqual([
      { type: Message.connect, features: ['attributes'] },
      { type: Message.attributes, attributes: { foo: 'bar' } },
    ])
  })

  it('previewImageURL', async () => {
    const { host, messages, trigger } = createContext()

    connect({
      host,
      previewImageURL() {
        return 'hello'
      },
    })

    expect(messages).toEqual([
      { type: Message.connect, features: ['previewImageURL'] },
    ])

    await trigger({
      data: {
        type: Message.previewImageURL,
      },
    })

    expect(messages).toEqual([
      { type: Message.connect, features: ['previewImageURL'] },
      { type: Message.previewImageURL, url: 'hello' },
    ])
  })

  it('register all features', () => {
    const { host, messages } = createContext()

    connect({
      host,
      previewImageURL() {
        return 'hello'
      },
      attributes() {
        return { foo: 'bar' }
      },
    })

    expect(messages).toEqual([
      { type: Message.connect, features: ['attributes', 'previewImageURL'] },
    ])
  })
})

export {}
