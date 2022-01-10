import {
  ArtkitMessageToHost,
  IArtkitHost,
  Message,
  parseQueryParameters,
  saveMetadata,
} from '..'

it('parses query parameters', () => {
  expect(parseQueryParameters('a=123&b=456')).toEqual({
    a: '123',
    b: '456',
  })

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

it('parses query parameters with schema', () => {
  expect(
    parseQueryParameters('?a=123&b=456&c=true&d=1', {
      a: 'string',
      b: 'number',
      c: 'boolean',
      d: 'boolean',
    })
  ).toEqual({
    a: '123',
    b: 456,
    c: true,
    d: true,
  })

  expect(
    parseQueryParameters('?a=abc&b=def', {
      a: 'number',
      b: 'boolean',
    })
  ).toEqual({
    a: 0,
    b: false,
  })
})

it('parses malformated parameters', () => {
  expect(Object.keys(parseQueryParameters(''))).toEqual([])
  expect(Object.keys(parseQueryParameters('abc'))).toEqual([])
  expect(Object.keys(parseQueryParameters('abc='))).toEqual([])
  expect(Object.keys(parseQueryParameters('abc&def'))).toEqual([])

  expect(
    parseQueryParameters('', {
      a: 'string',
      b: 'number',
      c: 'boolean',
    })
  ).toEqual({
    a: '',
    b: 0,
    c: false,
  })
})

function createContext() {
  const messages: ArtkitMessageToHost[] = []

  const host: IArtkitHost = {
    postMessage(data) {
      messages.push(data)
    },
  }

  return { host, messages }
}

describe('features', () => {
  it('attributes & image', async () => {
    const { host, messages } = createContext()

    await saveMetadata({
      allowMultipleCalls: true,
      host,
      attributes: () => ({ foo: 'bar' }),
      image: () => 'hello',
    })

    expect(messages).toEqual([
      {
        type: Message.saveMetadata,
        attributes: { foo: 'bar' },
        image: 'hello',
      },
    ])
  })

  it('attributes only', async () => {
    const { host, messages } = createContext()

    await saveMetadata({
      allowMultipleCalls: true,
      host,
      attributes: () => ({ foo: 'bar' }),
    })

    expect(messages[0]).toEqual({
      type: Message.saveMetadata,
      attributes: { foo: 'bar' },
      image: undefined,
    })

    expect('image' in messages[0]).toEqual(false)
  })
})

export {}
