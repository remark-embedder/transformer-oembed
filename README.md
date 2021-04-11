<div align="center">
<h1>@remark-embedder/transformer-oembed</h1>

<p><a href="https://github.com/remark-embedder">@remark-embedder</a> transformer for oEmbed supported links</p>
</div>

---

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]
[![All Contributors][all-contributors-badge]](#contributors-)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]
<!-- prettier-ignore-end -->

## The problem

You're using [`@remark-embedder/core`][@remark-embedder/core] to automatically
convert URLs in your markdown to the embedded version of those URLs and want to
have a transform for providers that support an oEmbed API. [Learn more about
oEmbed from oembed.com][oembed.com]

## This solution

This is a [`@remark-embedder`][@remark-embedder/core] transform for supported
oembed API providers. Find the list of supported providers on
[oembed.com][oembed.com].

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [Config](#config)
  - [Config as a function](#config-as-a-function)
- [Inspiration](#inspiration)
- [Other Solutions](#other-solutions)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)
- [Contributors ✨](#contributors-)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `dependencies`:

```shell
npm install @remark-embedder/transformer-oembed
```

## Usage

```ts
import remarkEmbedder from '@remark-embedder/core'
import oembedTransformer from '@remark-embedder/transformer-oembed'
// or, if you're using CommonJS require:
// const {default: oembedTransformer} = require('@remark-embedder/transformer-oembed')
import remark from 'remark'
import html from 'remark-html'

const exampleMarkdown = `
# My favorite YouTube video

[This](https://www.youtube.com/watch?v=dQw4w9WgXcQ) is a great YouTube video.
Watch it here:

https://www.youtube.com/watch?v=dQw4w9WgXcQ

Isn't it great!?
`

async function go() {
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [oembedTransformer],
    })
    .use(html)
    .process(exampleMarkdown)

  console.log(result.toString())
}

go()
```

This will result in:

```html
<h1>My favorite YouTube video</h1>
<p>
  <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">This</a> is a great
  YouTube video. Watch it here:
</p>
<iframe
  width="200"
  height="113"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
<p>Isn't it great!?</p>
```

### Config

Some oembed providers offer special configuration via query parameters. You can
provide those via config:

```ts
// ...
import type {Config} from '@remark-embedder/transformer-oembed'

// ...

async function go() {
  const result = await remark()
    .use(remarkEmbedder, {
      transformers: [
        [
          oembedTransformer,
          {params: {theme: 'dark', dnt: true, omit_script: true}} as Config,
        ],
      ],
    })
    .use(html)
    .process(`https://twitter.com/kentcdodds/status/783161196945944580`)

  console.log(result.toString())
}

// ...
```

That results in (notice the `data-` attributes which are specific to [twitter's
oEmbed API][twitter-oembed-docs]):

```html
<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark">
  <p lang="en" dir="ltr">
    I spent a few minutes working on this, just for you all. I promise, it wont
    disappoint. Though it may surprise 🎉<br /><br />🙏
    <a href="https://t.co/wgTJYYHOzD">https://t.co/wgTJYYHOzD</a>
  </p>
  — Kent C. Dodds (@kentcdodds)
  <a
    href="https://twitter.com/kentcdodds/status/783161196945944580?ref_src=twsrc%5Etfw"
    >October 4, 2016</a
  >
</blockquote>
```

This could also be used to provide an access token for providers that require
this (like [Instagram][instagram-oembed-docs]).

### Config as a function

You can also provide configuration as a function so you can determine what
configuration to give based on the provider and/or the URL. Like so:

```ts
const oembedConfig: Config = ({url, provider}) => {
  if (provider.provider_name === 'Instagram') {
    return {
      params: {access_token: '{app-id}|{client-token}'},
    }
  }
}
const remarkEmbedderConfig = {
  transformers: [[oembedTransformer, oembedConfig]],
}
// ... etc...
```

## Inspiration

It's a long story... Check out the inspiration on
[`@remark-embedder/core`][@remark-embedder/core]

## Other Solutions

- [`remark-oembed`][remark-oembed]: This one requires client-side JS to work
  which was unacceptable for our use cases.

## Issues

_Looking to contribute? Look for the [Good First Issue][good-first-issue]
label._

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]

## Contributors ✨

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://kentcdodds.com"><img src="https://avatars.githubusercontent.com/u/1500684?v=3?s=100" width="100px;" alt=""/><br /><sub><b>Kent C. Dodds</b></sub></a><br /><a href="https://github.com/remark-embedder/transformer-oembed/commits?author=kentcdodds" title="Code">💻</a> <a href="https://github.com/remark-embedder/transformer-oembed/commits?author=kentcdodds" title="Documentation">📖</a> <a href="#infra-kentcdodds" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/remark-embedder/transformer-oembed/commits?author=kentcdodds" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://michaeldeboey.be"><img src="https://avatars3.githubusercontent.com/u/6643991?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michaël De Boey</b></sub></a><br /><a href="https://github.com/remark-embedder/transformer-oembed/commits?author=MichaelDeBoey" title="Code">💻</a> <a href="https://github.com/remark-embedder/transformer-oembed/commits?author=MichaelDeBoey" title="Documentation">📖</a> <a href="#maintenance-MichaelDeBoey" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

MIT

<!-- prettier-ignore-start -->
[npm]: https://www.npmjs.com
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/github/workflow/status/remark-embedder/transformer-oembed/validate?logo=github&style=flat-square
[build]: https://github.com/remark-embedder/transformer-oembed/actions?query=workflow%3Avalidate
[coverage-badge]: https://img.shields.io/codecov/c/github/remark-embedder/transformer-oembed.svg?style=flat-square
[coverage]: https://codecov.io/github/remark-embedder/transformer-oembed
[version-badge]: https://img.shields.io/npm/v/@remark-embedder/transformer-oembed.svg?style=flat-square
[package]: https://www.npmjs.com/package/@remark-embedder/transformer-oembed
[downloads-badge]: https://img.shields.io/npm/dm/@remark-embedder/transformer-oembed.svg?style=flat-square
[npmtrends]: https://www.npmtrends.com/@remark-embedder/transformer-oembed
[license-badge]: https://img.shields.io/npm/l/@remark-embedder/transformer-oembed.svg?style=flat-square
[license]: https://github.com/remark-embedder/transformer-oembed/blob/main/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: https://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/remark-embedder/transformer-oembed/blob/main/CODE_OF_CONDUCT.md
[emojis]: https://github.com/all-contributors/all-contributors#emoji-key
[all-contributors]: https://github.com/all-contributors/all-contributors
[all-contributors-badge]: https://img.shields.io/github/all-contributors/remark-embedder/transformer-oembed?color=orange&style=flat-square
[bugs]: https://github.com/remark-embedder/transformer-oembed/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Acreated-desc+label%3Abug
[requests]: https://github.com/remark-embedder/transformer-oembed/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement
[good-first-issue]: https://github.com/remark-embedder/transformer-oembed/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement+label%3A%22good+first+issue%22

[@remark-embedder/core]: https://github.com/remark-embedder/core
[instagram-oembed-docs]: https://developers.facebook.com/docs/instagram/oembed
[oembed.com]: https://oembed.com
[remark-oembed]: https://github.com/sergioramos/remark-oembed
[twitter-oembed-docs]: https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-statuses-oembed
<!-- prettier-ignore-end -->
