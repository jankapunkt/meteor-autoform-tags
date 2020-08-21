/* global AutoForm */
import { Template } from 'meteor/templating'
import { ReactiveDict } from 'meteor/reactive-dict'
import './autoform-tags.css'
import './autoform-tags.html'

// extend autoform with bpmn modeler
AutoForm.addInputType('tags', {
  template: 'afTags',
  valueOut () {
    const val = this.val()
    return val && JSON.parse(val)
  },
  valueIn (initialValue) {
    return initialValue
  }
})

Template.afTags.onCreated(function () {
  const instance = this
  instance.state = new ReactiveDict()
  instance.state.set('target', null)
  instance.state.set('value', [])
  instance.state.set('double', null)
  instance.state.set('editMode', false)
  instance.state.set('showSelectOptions', true)
  instance.state.set('dataSchemaKey', instance.data.atts['data-schema-key'])

  instance.autorun(function () {
    const data = Template.currentData()
    const { atts } = data

    // create dict of select options
    let optionsMap
    if (data.selectOptions) {
      optionsMap = {}
      data.selectOptions.forEach((entry) => {
        optionsMap[entry] = true
      })
    }

    // length of overall tags defined by
    // minCount: minimum required number
    // maxCount: maximum allowed number
    const runtimeData = {}
    runtimeData.min = atts.minCount || 1
    runtimeData.max = atts.maxCount || 10
    runtimeData.showTagLen = atts.showTagLength && atts.minCount > 0 && atts.maxCount > 0

    // length of chars per tag
    runtimeData.minLength = (atts.min || atts.minChars) || 1
    runtimeData.maxLength = (atts.max || atts.maxChars) || 524288
    runtimeData.showCharLen = atts.showCharLength && (atts.min || atts.minChars) > 0 && (atts.max || atts.maxChars) > 0

    runtimeData.selectOptions = data.selectOptions
    runtimeData.optionsMap = optionsMap
    runtimeData.placeholder = atts.placeholder
    runtimeData.onlyOptions = !!atts.onlyOptions

    const className = data.atts.class || ''
    runtimeData.invalid = className.includes('is-invalid')
    runtimeData.loadComplete = true

    instance.state.set(runtimeData)
  })
})

Template.afTags.onRendered(function () {
  const instance = this
  const { data } = instance

  // if, and only if, we pass in a value AND the internal state has
  // not a value (due it's already set or updated)
  const currentValue = instance.state.get('value') || []
  const dataValue = data.value || []
  if (currentValue.length === 0 && dataValue.length > 0) {
    instance.state.set('value', dataValue)
    const stringValue = JSON.stringify(dataValue)
    instance.$('#afTags-hiddenInput').val(stringValue)
  }

  instance.autorun(() => {
    const editMode = instance.state.get('editMode')
    if (editMode) {
      setTimeout(() => instance.$('.aftags-input').focus(), 50)
    }
  })
})

Template.afTags.onDestroyed(function () {
  const instance = this
  instance.state.clear()
})

Template.afTags.helpers({
  loadComplete () {
    return Template.instance().state.get('loadComplete')
  },
  dataSchemaKey () {
    return Template.instance().state.get('dataSchemaKey')
  },
  isSelected (index) {
    return Template.instance().state.get('target') === index
  },
  tags () {
    return Template.instance().state.get('value')
  },
  onlyOptions () {
    return Template.instance().state.get('onlyOptions')
  },
  showSelectOptions () {
    return Template.instance().state.get('selectOptions') && Template.instance().state.get('showSelectOptions')
  },
  selectOptions () {
    return Template.instance().state.get('selectOptions')
  },
  selected (tag) {
    const value = Template.instance().state.get('value')
    return value && value.indexOf(tag) > -1
  },
  editMode () {
    return Template.instance().state.get('editMode')
  },
  placeholder () {
    return Template.instance().state.get('placeholder')
  },
  isDouble (index) {
    const double = Template.instance().state.get('double')
    return double > -1 && double === index
  },
  showTagLimits () {
    const instance = Template.instance()
    return instance.state.get('showTagLen')
  },
  showCharLimits () {
    const instance = Template.instance()
    return instance.state.get('showCharLen') && instance.state.get('editMode')
  },
  min () {
    const len = Template.instance().state.get('min')
    return len > -1 ? len : null
  },
  max () {
    const len = Template.instance().state.get('max')
    return len > -1 ? len : null
  },
  minLength () {
    const len = Template.instance().state.get('minLength')
    return len > -1 ? len : null
  },
  maxLength () {
    return Template.instance().state.get('maxLength')
  },
  limitsExceeded () {
    return Template.instance().state.get('limitsExceeded')
  },
  currentLenth () {
    return Template.instance().state.get('currentLength') || 0
  },
  currentTags () {
    const value = Template.instance().state.get('value')
    return (value && value.length) || 0
  },
  invalid () {
    return Template.instance().state.get('invalid')
  }
})

function getTag (text = '') {
  return text.replace(/\s\s+/g, ' ').trim()
}

function applyInput ({ templateInstance }) {
  const input = templateInstance.$('.aftags-input')
  const index = parseInt(input.attr('data-index'), 10)
  const target = templateInstance.state.get('target')
  const value = templateInstance.state.get('value')
  const tag = getTag(input.val())

  const doubleIndex = templateInstance.state.get('double')
  if (doubleIndex > -1 && doubleIndex !== index) return

  if (tag.length === 0 || tag === '') {
    return
  }

  const minLength = templateInstance.state.get('minLength')
  if (minLength > -1 && tag.length < minLength) {
    templateInstance.state.set('limitsExceeded', true)
    return
  }

  const maxLength = templateInstance.state.get('maxLength')
  if (maxLength > -1 && tag.length > maxLength) {
    templateInstance.state.set('limitsExceeded', true)
    return
  }

  const onlyOptions = templateInstance.state.get('onlyOptions')
  const optionsMap = templateInstance.state.get('optionsMap')

  if (onlyOptions && optionsMap && !optionsMap[tag]) {
    // TODO show err msg
    return
  }

  if (index === -1) {
    value.push(tag)
  } else if (index === target) {
    value[index] = tag
  } else {
    value.splice(index, 0, tag)
  }

  templateInstance.$('#afTags-hiddenInput').val(JSON.stringify(value))
  templateInstance.state.set('value', value)
  templateInstance.state.set('target', null)
  input.val('')

  setTimeout(() => {
    templateInstance.$('.aftags-input').focus()
  }, 30)
}

Template.afTags.events({
  'focus .aftags-input' (event, templateInstance) {
    const $input = templateInstance.$(event.currentTarget)
    const length = $input.val().trim().length
    templateInstance.state.set('currentLength', length)
  },

  'blur .aftags-input' (event, templateInstance) {
    // cancel on blur
    const input = templateInstance.$(event.currentTarget)
    const index = parseInt(input.attr('data-index'), 10)
    const target = templateInstance.state.get('target')

    if (index === target) {
      templateInstance.state.set('target', null)
    }

    const tagLength = input.val().trim().length
    if (tagLength === 0 || index > -1) {
      templateInstance.state.set('editMode', false)
      templateInstance.state.set('currentLength', 0)
      templateInstance.state.set('target', null)
      templateInstance.state.set('double', -1)
    }
  },
  'click/touchstart #aftags-input-add-tag-button' (event, templateInstance) {
    event.preventDefault()
    if (templateInstance.data.atts.min) {
      templateInstance.state.set('limitsExceeded', true)
    }
    templateInstance.state.set('editMode', true)
  },
  'mousedown/touchstart #aftags-input-applybutton' (event, templateInstance) {
    event.stopPropagation()
    event.preventDefault()
    applyInput({ templateInstance })
  },
  'input .aftags-input' (event, templateInstance) {
    // detect the current input and immediately
    // cache it to be a double if true
    const input = templateInstance.$(event.target)
    const tag = getTag(input.val())
    const index = parseInt(input.attr('data-index'), 10)
    const value = templateInstance.state.get('value')

    templateInstance.state.set('currentLength', tag.length)

    const minLength = templateInstance.state.get('minLength')
    if (minLength > -1 && tag.length < minLength) {
      templateInstance.state.set('limitsExceeded', true)
      return
    }

    const maxLength = templateInstance.state.get('maxLength')
    if (maxLength > -1 && tag.length > maxLength) {
      templateInstance.state.set('limitsExceeded', true)
      return
    }

    templateInstance.state.set('limitsExceeded', false)

    // if there is a double found
    // and it's index is not the current index
    // which may be the case if we edit the
    // current tag
    const doubleIndex = value.indexOf(tag)
    const isDouble = doubleIndex > -1 && doubleIndex !== index
    templateInstance.state.set('double', isDouble ? doubleIndex : -1)
  },

  'keydown .aftags-input' (event, templateInstance) {
    // if typing... return
    if (event.key !== 'Enter' && event.key !== 'Escape' && event.key !== 'Tab') {
      return
    }

    const input = templateInstance.$(event.target)
    const index = parseInt(input.attr('data-index'), 10)

    event.preventDefault()
    event.stopPropagation()

    // ESC -> cancel
    if (event.key === 'Escape') {
      templateInstance.state.set('target', null)
      templateInstance.state.set('double', -1)

      if (index === -1) {
        input.val('')
      }

      input.blur()
      return
    }

    applyInput({ templateInstance })
  },

  'click/touchstart .aftags-close' (event, templateInstance) {
    event.preventDefault()
    event.stopPropagation()
    // delete tag
    const input = templateInstance.$(event.currentTarget)
    const doubleIndex = templateInstance.state.get('double')
    const index = parseInt(input.attr('data-index'), 10)

    // if item to delete
    // is stored in double's cache
    if (doubleIndex === index) {
      templateInstance.state.set('double', -1)
    }

    const value = templateInstance.state.get('value')
    value.splice(index, 1)

    templateInstance.$('#afTags-hiddenInput').val(JSON.stringify(value))
    templateInstance.state.set('value', value)

    setTimeout(() => {
      templateInstance.$('.aftags-input').focus()
    }, 30)
  },

  'mousedown/touchstart .aftags-tag' (event, templateInstance) {
    event.preventDefault()

    const $target = templateInstance.$(event.currentTarget)
    const index = $target.attr('data-index')

    setTimeout(() => {
      templateInstance.state.set({
        editMode: true,
        target: parseInt(index, 10)
      })
      setTimeout(() => {
        templateInstance.$('.aftags-input').focus()
      }, 20)
    }, 30)
  },

  'mousedown/touchstart .aftags-option' (event, templateInstance) {
    event.preventDefault()
    event.stopPropagation()

    const input = templateInstance.$(event.currentTarget)
    const target = input.attr('data-target')
    const value = templateInstance.state.get('value')

    value.push(target)
    input.val('')
    templateInstance.$('#afTags-hiddenInput').val(JSON.stringify(value))

    setTimeout(() => {
      templateInstance.state.set({
        value: value,
        target: null,
        editMode: false
      })
    }, 30)
  }
})
