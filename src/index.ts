import {URL} from 'url'
import {type Transformer} from '@remark-embedder/core'

type Provider = {
  provider_name: string
  provider_url: string
  endpoints: Array<{
    schemes?: string[]
    discovery?: boolean
    url: string
  }>
}
type Providers = Array<Provider>

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace getProviders {
  let cache: Providers | undefined
}

async function getProviders(): Promise<Providers> {
  if (!getProviders.cache) {
    const res = await fetch('https://oembed.com/providers.json')
    getProviders.cache = (await res.json()) as Providers
  }

  return getProviders.cache
}

// TODO: Support providers that do not have schemes
async function getProviderEndpointURLForURL(
  url: string,
): Promise<{provider: Provider; endpoint: string} | null> {
  const providers = await getProviders()
  for (const provider of providers) {
    for (const endpoint of provider.endpoints) {
      if (
        endpoint.schemes?.some(scheme =>
          new RegExp(scheme.replace(/\*/g, '(.*)')).test(url),
        )
      ) {
        return {provider, endpoint: endpoint.url}
      }
    }
  }
  return null
}

type Config = {
  params?: {[key: string]: unknown}
}

type GetConfig = ({
  url,
  provider,
}: {
  url: string
  provider: Provider
}) => Config | null | undefined

type OEmbedData = {
  html: string
}

const transformer: Transformer<Config | GetConfig> = {
  name: '@remark-embedder/transformer-oembed',
  shouldTransform: async url => {
    const result = await getProviderEndpointURLForURL(url)
    return Boolean(result)
  },
  getHTML: async (urlString, getConfig = {}) => {
    const result = await getProviderEndpointURLForURL(urlString)

    // istanbul ignore if (shouldTransform prevents this, but if someone calls this directly then this would save them)
    if (!result) return null

    const {provider, endpoint} = result

    const url = new URL(endpoint)
    url.searchParams.set('url', urlString)

    let config: Config = getConfig as Config
    if (typeof getConfig === 'function') {
      // I really have no idea what's happening here:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      config = getConfig({url: urlString, provider}) ?? {}
    }

    for (const [key, value] of Object.entries(config.params ?? {})) {
      url.searchParams.set(key, String(value))
    }

    // format has to be json so it is not configurable
    url.searchParams.set('format', 'json')

    const res = await fetch(url.toString())
    const data = (await res.json()) as OEmbedData

    return data.html
  },
}

export default transformer
type ExportedConfig = Config | GetConfig
export type {ExportedConfig as Config}
