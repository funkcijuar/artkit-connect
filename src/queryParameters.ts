export function parseQueryParameters(
  encodedParameters: string
): Record<string, string> {
  if (!encodedParameters) return {}

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
    .reduce<Record<string, string>>((parameters, item) => {
      const [key, value] = item.split('=')
      parameters[decodeURIComponent(key)] = decodeURIComponent(value)
      return parameters
    }, {})

  return params
}
