/* global Package */

Package.describe({
  name: 'jkuester:autoform-tags',
  version: '2.1.1',
  // Brief, one-line summary of the package.
  summary: 'Provides a form field to enter tags.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/jankapunkt/meteor-autoform-tags.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom(['1.6', '2.3'])

  api.use([
    'ecmascript',
    'reactive-dict',
    'templating@1.3.2',
    'aldeed:autoform@6.0.0 || 7.0.0'
  ])

  api.mainModule('dynamic.js', 'client')
})

Package.onTest(function (api) {
  api.use('ecmascript')
  api.use('tinytest')
  api.use('jkuester:autoform-tags')
  api.mainModule('autoform-tags-tests.js')
})
