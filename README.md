### Probot: Report Errors

A [Probot](https://probot.github.io) extension that reports errors by opening an issue on the target repository.


#### Setup

```shell
# Install this repo from GitHub
$ npm install tcbyrd/probot-report-error
```

To allow you to customize the Title and Body of the Issue, this extension takes a configuration object with `before`, `after`, and `title` properties. Before is a message above the error. After is a message below the error.

##### Example
```javascript
const reportErr = require('probot-report-error')

reportErr(context, err, {
        before: "An error occurred while trying to check this repository for stale issues.",
        after: "Check the syntax of `.github/stale.yml` and make sure it's valid.\
                For more information or questions, see [probot/stale](https://github.com/probot/stale/)",
        title: "Error parsing .github/stale.yml"
      })
```

This will open an issue titled `Error parsing .github/stale.yml` that looks like this:
![image](https://user-images.githubusercontent.com/13207348/39201388-ea1662cc-47bc-11e8-92e2-480991e803df.png)

To prevent duplicate issues, it checks for an open issue with the same title on the target repository. If the user has closed the issue and the error has not been fixed, it will open another issue. For this reason, only use this extension to report errors where the owner of the repository needs to take action to resolve the error.

#### Usage
The most common use case for this extension is to report errors from invalid configurations. These errors are typically caused by repository owners creating a yaml file with an invalid syntax. As a developer of a Probot App, without this package, the user has no way to know if their config is being picked up by your App.

As an example, here's how to use this with [probot-config](https://github.com/getsentry/probot-config) to inform users of an invalid `stale.yaml`

```javascript
const getConfig = require('probot-config')
const reportErr = require('probot-report-error')

async function forRepository (context) {
  // Catch the error message in a try/catch block
  // In this example, an error will be reported if `getConfig` fails to parse `stale.yml`
  try {
    let config = await getConfig(context, 'stale.yml')
  } catch (err) {
    reportErr(context, err, {
      before: "An error occurred while trying to check this repository for stale issues.",
      after: "Check the syntax of `.github/stale.yml` and make sure it's valid.\
              For more information or questions, see [probot/stale](https://github.com/probot/stale/)",
      title: "Error parsing `.github/stale.yml`"
    })
....
}
```
