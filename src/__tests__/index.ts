import remarkEmbedder from '@remark-embedder/core'
import {http, HttpResponse} from 'msw'
import {setupServer} from 'msw/node'
import {remark} from 'remark'
import remarkHTML from 'remark-html'
import {expect, test, beforeAll, afterEach, afterAll} from 'vitest'

import transformer, {type Config} from '../'

// this removes the quotes around strings...
const unquoteSerializer = {
  serialize: (val: string) => val.trim(),
  test: (val: unknown) => typeof val === 'string',
}

expect.addSnapshotSerializer(unquoteSerializer)

const server = setupServer(
  http.get('http://oembed.com/providers.json', () =>
    HttpResponse.json([
      {
        provider_name: 'Beautiful.AI',
        provider_url: 'http://www.beautiful.ai',
        endpoints: [
          {
            url: 'http://www.beautiful.ai/api/oembed',
            // no scheme 😱
            discovery: true,
          },
        ],
      },
      {
        provider_name: 'Twitter',
        provider_url: 'http://www.twitter.com',
        endpoints: [
          {
            schemes: [
              'http://twitter.com/*/status/*',
              'http://*.twitter.com/*/status/*',
              'http://twitter.com/*/moments/*',
              'http://*.twitter.com/*/moments/*',
            ],
            url: 'http://publish.twitter.com/oembed',
          },
        ],
      },
    ]),
  ),
  http.get('http://publish.twitter.com/oembed', () =>
    HttpResponse.json({
      html: '<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark"><p lang="en" dir="ltr">I spent a few minutes working on this, just for you all. I promise, it wont disappoint. Though it may surprise 🎉<br><br>🙏 <a href="http://t.co/wgTJYYHOzD">http://t.co/wgTJYYHOzD</a></p>— Kent C. Dodds (@kentcdodds) <a href="http://twitter.com/kentcdodds/status/783161196945944580?ref_src=twsrc%5Etfw">October 4, 2016</a></blockquote>',
    }),
  ),
)

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('smoke test', async () => {
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [
        [
          transformer,
          {params: {dnt: true, omit_script: true, theme: 'dark'}} as Config,
        ],
      ],
    })
    .use(remarkHTML, {sanitize: false})
    .process(
      `
Here's a great tweet:

http://twitter.com/kentcdodds/status/783161196945944580

And here's an example of no provider:

http://example.com
      `.trim(),
    )

  expect(result.toString()).toMatchInlineSnapshot(`
    <p>Here's a great tweet:</p>
    <blockquote class="twitter-tweet" data-dnt="true" data-theme="dark"><p lang="en" dir="ltr">I spent a few minutes working on this, just for you all. I promise, it wont disappoint. Though it may surprise 🎉<br><br>🙏 <a href="http://t.co/wgTJYYHOzD">http://t.co/wgTJYYHOzD</a></p>— Kent C. Dodds (@kentcdodds) <a href="http://twitter.com/kentcdodds/status/783161196945944580?ref_src=twsrc%5Etfw">October 4, 2016</a></blockquote>
    <p>And here's an example of no provider:</p>
    <p>http://example.com</p>
  `)
})

test('no config required', async () => {
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [transformer],
    })
    .use(remarkHTML, {sanitize: false})
    .process(`http://twitter.com/kentcdodds/status/783161196945944580`)

  expect(result.toString()).toMatchInlineSnapshot(
    `<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark"><p lang="en" dir="ltr">I spent a few minutes working on this, just for you all. I promise, it wont disappoint. Though it may surprise 🎉<br><br>🙏 <a href="http://t.co/wgTJYYHOzD">http://t.co/wgTJYYHOzD</a></p>— Kent C. Dodds (@kentcdodds) <a href="http://twitter.com/kentcdodds/status/783161196945944580?ref_src=twsrc%5Etfw">October 4, 2016</a></blockquote>`,
  )
})

test('config can be a function', async () => {
  const config: Config = () => ({
    params: {dnt: true},
  })
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [[transformer, config]],
    })
    .use(remarkHTML, {sanitize: false})
    .process(`http://twitter.com/kentcdodds/status/783161196945944580`)

  expect(result.toString()).toMatchInlineSnapshot(
    `<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark"><p lang="en" dir="ltr">I spent a few minutes working on this, just for you all. I promise, it wont disappoint. Though it may surprise 🎉<br><br>🙏 <a href="http://t.co/wgTJYYHOzD">http://t.co/wgTJYYHOzD</a></p>— Kent C. Dodds (@kentcdodds) <a href="http://twitter.com/kentcdodds/status/783161196945944580?ref_src=twsrc%5Etfw">October 4, 2016</a></blockquote>`,
  )
})

test('config function does not need to return anything', async () => {
  const config: Config = () => null
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [[transformer, config]],
    })
    .use(remarkHTML, {sanitize: false})
    .process(`http://twitter.com/kentcdodds/status/783161196945944580`)

  expect(result.toString()).toMatchInlineSnapshot(
    `<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark"><p lang="en" dir="ltr">I spent a few minutes working on this, just for you all. I promise, it wont disappoint. Though it may surprise 🎉<br><br>🙏 <a href="http://t.co/wgTJYYHOzD">http://t.co/wgTJYYHOzD</a></p>— Kent C. Dodds (@kentcdodds) <a href="http://twitter.com/kentcdodds/status/783161196945944580?ref_src=twsrc%5Etfw">October 4, 2016</a></blockquote>`,
  )
})

test('sends the correct search params', async () => {
  let request: Request

  server.use(
    http.get('http://publish.twitter.com/oembed', ({request: req}) => {
      request = req
      return HttpResponse.json({
        html: 'whatever',
      })
    }),
  )

  await remark()
    .use(remarkEmbedder, {
      transformers: [
        [
          transformer,
          {params: {dnt: true, omit_script: true, theme: 'dark'}} as Config,
        ],
      ],
    })
    .use(remarkHTML, {sanitize: false})
    .process(`http://twitter.com/kentcdodds/status/783161196945944580`)

  // @ts-expect-error it doesn't think request will be assigned by now... But it will!
  expect(request.url.toString()).toMatchInlineSnapshot(
    `http://publish.twitter.com/oembed?url=http%3A%2F%2Ftwitter.com%2Fkentcdodds%2Fstatus%2F783161196945944580&dnt=true&omit_script=true&theme=dark&format=json`,
  )
})
