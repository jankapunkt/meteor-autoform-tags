# meteor-autoform-tags
AutoForm add-on, that provides an interactive tag input.

### Example Project

You can check out the latest published state of this package using [this example project](https://github.com/jankapunkt/meteor-autoform-tags-examples).


### Installation

You need `aldeed:autoform` >= 6 to use this package.

You can then install this package via 

`meteor add jkuester:autoform-tags`

### Creating a Tag-Field by Schema

##### Minimal

There are many options to configure this component. The most minimal approach is to define the `autoform` type to be `'tags'`:

```javascript
{
	tags: {
		type: Array,			// all tags will be saved in an array
		autoform: {
			type: 'tags',		// indicate to use tags add-on
		},
	},
	'tags.$': {
		type: String,
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
		type: Array,			// all tags will be saved in an array
		minCount: 2,			// minimum number of tags
		maxCount: 8,			// maximum number of tags
		autoform: {
			type: 'tags',		// indicate to use tags add-on
			max: 16,			// max length of a tag in chars
			min: 4,				// min length of a tag in chars
		},
	},
	'tags.$': {
		type: String,
	}
}
 ```
 
 Note that `max` and `min` need to be defined within the `autoform` property of the array in order to behave properly.
 
 ##### With Support
 
 You can declare a placeholder text as call to action as well define a list of suggestions. 
 If a user clicks a tag in the list, it is immediately added to the tag stack. 
 This list can also be used as source for allowed values.
 
  ```javascript
 {
	tags: {
		type: Array,			// all tags will be saved in an array
		autoform: {
			placeholder: 'Enter a tag...',
			type: 'tags',		// indicate to use tags add-on
			options: () => ['apple', 'cherry', 'orange'],	// list of tags to be suggested
			onlyOptions: false,  // if true only values in options are accepted
		},
	},
	'tags.$': {
		type: String,
	}
}
  ```
 
 ##### Full Example
 
 You can also combine the above mentioned options:
 
 ```javascript
 {
   tags: {
		type: Array,			// all tags will be saved in an array
		minCount: 2,			// minimum number of tags
		maxCount: 8,			// maximum number of tags
		autoform: {
			placeholder: 'Enter a tag...',
			type: 'tags',		// indicate to use tags add-on
			max: 16,			// max length of a tag in chars
			min: 4,				// min length of a tag in chars
			options: () => ['apple', 'cherry', 'orange'],	// list of tags to be suggested
			onlyOptions: true,  // if true only values in options are allowed
		},
	},
	'tags.$': {
		type: String,
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

