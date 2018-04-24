const reportErr = require('./index')

const { fn } = jest


describe('probot-error-reporter', () => {
  let config
  let context
  let err
  beforeEach(() => {
    config = {
      before: "String before the error message",
      after: "String after the error message"
    }
    context = {
      event: 'test',
      payload: {
        action: 'test',
        repository: {
          html_url: "https://example.com/test/repository",
          full_name: "test/repository"
        }
      },
      log: fn(),
      repo: fn(),
      github: {
        issues: {
          create: fn().mockReturnValue(Promise.resolve({
            params: {
              "owner": "test",
              "repo": "repository",
              "title": "Title that already exists",
              "body": "\n String before the error message\n \
                        Some random error message\n \
                        String after the error message"
            }
          }))
        },
        query: fn().mockReturnValue(Promise.resolve({
          resource: {
            issues: {
              nodes: [
              {
                title: 'Title that already exists',
                number: 98
              },
              {
                title: 'Another random error message',
                number: 99
              }]
            }
          }
        }))
      }
    }
    err = "Some random error message"
  })

  describe('Create an Issue with Error Body', () => {

    it('Creates an Issue on GitHub when there is no existing open Issue', async () => {
      config.title = "Title that doesn't exist yet"

      await reportErr(context, err, config)

      expect(context.github.issues.create).toHaveBeenCalled()
    })

    it('Does not create a new Issue if an Issue already exists', async () => {
      config.title = "Title that already exists"

      await reportErr(context, err, config)

      expect(context.github.issues.create).not.toHaveBeenCalled()
    })
  })
})
