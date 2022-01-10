export type QueryParameterType = 'string' | 'number' | 'boolean'

export type TypedQueryParameters<T> = {
  [Property in keyof T]: T[Property] extends 'boolean'
    ? boolean
    : T[Property] extends 'number'
    ? number
    : string
}

export function parseQueryParameters(): Record<string, string>
export function parseQueryParameters(
  encodedParameters: string
): Record<string, string>
export function parseQueryParameters<
  Schema extends Record<string, QueryParameterType>
>(schema: Schema): TypedQueryParameters<Schema>
export function parseQueryParameters<
  Schema extends Record<string, QueryParameterType>
>(encodedParameters: string, schema: Schema): TypedQueryParameters<Schema>
export function parseQueryParameters(
  ...args:
    | []
    | [encodedParameters: string]
    | [schema: Record<string, QueryParameterType>]
    | [encodedParameters: string, schema: Record<string, QueryParameterType>]
): Record<string, any> {
  let [encodedParameters, schema] =
    args.length === 0
      ? [window.location.search, undefined]
      : args.length === 1
      ? typeof args[0] === 'string'
        ? [args[0], undefined]
        : [window.location.search, args[0]]
      : args

  const questionMarkIndex = encodedParameters.indexOf('?')

  if (questionMarkIndex !== -1) {
    encodedParameters = encodedParameters.slice(questionMarkIndex + 1)

    const hashIndex = encodedParameters.indexOf('#')

    if (hashIndex !== -1) {
      encodedParameters = encodedParameters.slice(0, hashIndex)
    }
  }

  if (encodedParameters.startsWith('#')) {
    encodedParameters = encodedParameters.slice(1)
  }

  const params = encodedParameters
    .split('&')
    .reduce<Record<string, string | number | boolean>>((parameters, item) => {
      const [key, value] = item.split('=')

      if (!key || !value) return parameters

      parameters[decodeURIComponent(key)] = decodeURIComponent(value)
      return parameters
    }, {})

  if (typeof schema === 'object' && schema !== null) {
    const keys = new Set([...Object.keys(params), ...Object.keys(schema)])

    for (let key of keys) {
      switch (schema[key]) {
        case 'string': {
          params[key] = params[key] || ''
          break
        }
        case 'number': {
          const value = Number(params[key])
          params[key] = Number.isNaN(value) ? 0 : value
          break
        }
        case 'boolean': {
          const value = params[key] === 'true' || params[key] === '1'
          params[key] = value
          break
        }
        default: {
          delete params[key]
          break
        }
      }
    }
  }

  return params
}
