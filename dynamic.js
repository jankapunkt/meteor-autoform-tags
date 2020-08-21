export default {
  name: 'afTags',
  typeName: 'tags',
  template: 'afTags',
  load: async function loadPackage () {
    return import('./autoform-tags')
  }
}
