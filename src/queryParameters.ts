export function parseQueryParameters(
  encodedParameters: string
): Record<string, string> {
  if (!encodedParameters) return {}

  const params = encodedParameters
    .split('&')
    .reduce<Record<string, string>>((parameters, item) => {
      const [key, value] = item.split('=')
      parameters[decodeURIComponent(key)] = decodeURIComponent(value)
      return parameters
    }, {})

  return params
}
