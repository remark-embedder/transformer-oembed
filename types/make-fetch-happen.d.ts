declare module 'make-fetch-happen' {
  type ConfigurableFetch = {
    defaults: ({cacheManager: string}) => void
  }
  declare const MakeFetchHappen: typeof fetch & ConfigurableFetch
  export default MakeFetchHappen
}
