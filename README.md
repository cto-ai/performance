![](https://raw.githubusercontent.com/cto-ai/aws/master/assets/banner.png)

# Performance - Website Performance

Performance Op utilizes opensource tools such WebPageTest and Lighthouse to check your website's performance.

> **WebPageTest** is an open source performance testing tool, maintained primarily by Google. It consists of one or multiple servers that act as web browsing robots, visiting websites and automatically collecting data about the experience in the form of a detailed performance report.


> **Lighthouse** analyzes web apps and web pages, collecting modern performance metrics and insights on developer best practices.

## Requirements

To run this or any other Op, install the [Ops Platform](https://cto.ai/platform).

Find information about how to run and build Ops via the [Ops Platform Documentation](https://cto.ai/docs/overview)

This Op also requires API Key for WebPageTest.

- To Create one, visit <https://www.webpagetest.org/getkey.php>
- Set WebPageTest API Key to `WEBPAGETEST_APIKEY` in team secrets by running `ops secrets:set`
- Once you've set your API Key in secrets, the Op will skip API Key Prompt as it will automatically fetch the key from your team's secret storage.

## Usage

In CLI:

```sh
ops run performance
```

In Slack:

```sh
/ops run performance
```

Running the Op gives you variety of locations/browsers/connection to select to test your website's performance.

## Features

- WebPageTest
  - Prints a summary of WebPageTest analysis to your site
- Lighthouse
  - Prints a link to lighthouse report to your website if your testing with Chrome

## Notes

### WebPageTest

- WebPageTest offers a RESTful API for public use. Because it's a shared instance, usage is limited to 200 page loads per day — repeat views count as a separate page load
- Test results are only kept on the servers for 30 days

### Lighthouse

- Lighthouse report is only printed when user selects `Chrome` related browser

## Testing

Run `npm test`

## Contributing

See the [contributing docs](CONTRIBUTING.md) for more information

## Contributors ✨

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<table>
  <tr>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

Contributions of any kind are welcome!

## LICENSE

[MIT](LICENSE.txt)
