# Meteor AutoForm Tags (Bootstrap 4)

[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)

![GitHub](https://img.shields.io/github/license/jankapunkt/meteor-autoform-tags.svg)

AutoForm add-on, that provides an interactive tag input.
Optimized for Bootstrap 4. See installation for getting a BS4 theme for your AutoForm.

### Example Project

You can check out the latest published state of this package using [this example project](https://github.com/jankapunkt/meteor-autoform-tags-examples).

### Changelog

**2.0.0**

* Breaking change: default export is a module with dynamic import, see documentation on how to import

**1.3.0**
* use `textarea` instead of `contenteditable` to fix iOS input bug
* redesign layout for better ux
* add explicit mobile events to the Template's event map
* fix select logic
* removed direct jquery dependency

**1.2.3**

* aftags-input is now a class attribute instead of id
* aftags-input has min-width of 5rem
* events use new aftags-input class attribute
* show tag length and char length hints using showTagLength and showCharLength flags

**1.2.2**

* Fixed compatibility for multiple template instances in same form 

**1.2.1**

* Fixed missing update on hidden input when value is passed via data

**1.2**

* Implemented passing an existing value reactively

**1.1**

* Fixed word wrapping failure on mobile devices
* Fix missing display of current characters in some cases

**1.0**

* Moved to Bootstrap 4 theme, use 'card' as base for template
* Range display default text is 'text-muted'
* Display min/max range of tags when no tag is edited (and minCount/maxCount values are set via schema)
* Display min/max range of characters if tag is edited (and min/max values are set via schema)
* Cancel edit when hitting ESC or clicking outside of tag also on editing existing tags
* Correct display of select options

### Installation

You need `aldeed:autoform` >= 6 to use this package.  
You can then install this package via 

`meteor add jkuester:autoform-tags`

You manually need to install [imajus:autoform-bootstrap4](https://github.com/imajus/autoform-bootstrap4) (AutoForm 6.X)
or [jkuester:autoform-bootstrap4](https://github.com/jkuester/autoform-bootstrap4) (AutoForm 7.X) in order to use this package.
See the installation manual in the repo for setting up BS4 for your AutoForm.

### Import the package

By default the package now exports an async function to initialize the extension:

```javascript
const AFTags = (await import('meteor/jkuester:autoform-tags')).default
await AFTags.load()
```

### Static import

You can still import this package as with versions < 2.0.0 by adding an evironment flag when running Meteor:

```javascript
$ AFTAGS_DYNAMIC=0 meteor
```

Then the package will be automatically added to your initial client bundle

### Creating a Tag-Field by Schema

##### Minimal

There are many options to configure this component. The most minimal approach is to define the `autoform` type to be `'tags'`:

```javascript
{
  tags: {
    type: Array,      // all tags will be saved in an array
      autoform: {
        type: 'tags'  // indicate to use tags add-on
      }
    'tags.$': {
      type: String
    }
  }
}
```

##### With Boundaries

You can limit the amount of tags as you can do with any array in autoform. 
Furthermore you can limit the min/max length of the characters that are valid for each tag.

Validation for array size will be done by `AutoForm` while validation of character length is done within the component.

```javascript
{
  tags: {
    type: Array,      // all tags will be saved in an array
    autoform: {
      type: 'tags',   // indicate to use tags add-on
      minCount: 2,    // minimum number of tags
      maxCount: 8,    // maximum number of tags
      max: 16,        // max length of a tag in chars
      min: 4          // min length of a tag in chars
    }
  },
  'tags.$': {
    type: String,
  }
}
```
 
 Note that `max`, `min`, `maxCount` and `minCount` need **all** to be defined within the `autoform` property of the array in order to behave properly.
 
 
 ##### With Support
 
 You can declare a placeholder text as call to action as well define a list of suggestions. 
 If a user clicks a tag in the list, it is immediately added to the tag stack. 
 This list can also be used as source for allowed values.
 
```javascript
{
  tags: {
    type: Array,            // all tags will be saved in an array
    autoform: {
      placeholder: 'Enter a tag...',
      type: 'tags',         // indicate to use tags add-on
      options: () => [      // list of tags to be suggested
        'apple', 
        'cherry', 
        'orange'
        ],
      onlyOptions: false    // if true only values in options are accepted
    },
    'tags.$': {
      type: String
    }
  }
}
```
 
 ##### Full Example
 
 You can also combine the above mentioned options:
 
```javascript
{
  tags: {
    type: Array,          // all tags will be saved in an array
    autoform: {
      placeholder: 'Enter a tag...',
      type: 'tags',       // indicate to use tags add-on
      max: 16,            // max length of a tag in chars
      min: 4,             // min length of a tag in chars
      minCount: 2,          // minimum number of tags
      maxCount: 8,          // maximum number of tags
      options: () => [    // list of tags to be suggested
        'apple',
        'cherry',
        'orange'
        ],
      onlyOptions: true   // if true only values in options are allowed
    },
    'tags.$': {
      type: String,
    }
  }
}
```
   
### Component Behavior and Interacting with Tags


* You can click on the input or on the edit button to activate editing.
* The input supports spaces between characters but trims whitespace to single space between characters.
* To apply the entered tag hit either `Enter`, `Tab` or click the button with the check mark.
* The entered text will remain, if the component looses focus but will not be applied.    
* If the same tag already exists in the stack, it will be highlighted on input. 
  In this state the input is not accepted to be added to the stack.
* If `max` or `min` are defined and the entered tag does not fulfill the requirements it will be highlighted together 
  with the allowed text-size range, that appears in the upper-right part of the component. 

* Each tag can be edited by clicking the tag. Same functionality applies to the edited tag as for a new tag.
* Each applies tag can be removed from the stack.

* Clicking suggestions will add them immediatly to the stack and disable the selected ones.

### Roadmap and Future Features

* Enable/disable whitespaces via schema
* Define bootstrap color-classes for highlighting doubles or insufficient character size via schema
* Replace html icons with a library if such is installed
* Support emojis / auto-transform tags into emojis

