import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { ReactiveDict } from 'meteor/reactive-dict';
import { $ } from 'meteor/jquery';

import './autoform-tags.css';
import './autoform-tags.html';

// extend autoform with bpmn modeler
AutoForm.addInputType('tags', {
	template: 'afTags',
	valueOut() {
		const val = this.val();
		return val && JSON.parse(val);
	},
	valueIn(initialValue) {
		return initialValue;
	},
});

// SRC: https://stackoverflow.com/a/6150060/3098783
function selectElementContents(el) {
	var range = document.createRange();
	range.selectNodeContents(el);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

Template.afTags.onCreated(function () {
	const instance = this;
	instance.state = new ReactiveDict();
	instance.state.set('target', null);
	instance.state.set('value', []);
	instance.state.set('double', null);
	instance.state.set('showPlaceholder', true);

	instance.autorun(function () {

		const { data } = instance;
		const { atts } = data;
		console.log(data);

		// create dict of select options
		let optionsMap;
		if (data.selectOptions) {
			optionsMap = {};
			data.selectOptions.forEach(entry => {
				optionsMap[entry] = true;
			});
		}

		instance.state.set('minLength', atts.min || -1);
		instance.state.set('maxLength', atts.max || -1);
		instance.state.set('selectOptions', data.selectOptions);
		instance.state.set('optionsMap', optionsMap);
		instance.state.set('placeholder', atts.placeholder || '...');
		instance.state.set('onlyOptions', !!atts.onlyOptions);
		instance.state.set('dataSchemaKey', atts['data-schema-key']);

		const { value } = data;
		if (value && instance.state.get('value').length === 0) {
			$('#afTags-hiddenInput').val(JSON.stringify(value));
			instance.state.set('value', value);
		}

		instance.state.set('loadComplete', true);
	});
});

Template.afTags.helpers({
	loadComplete() {
		return Template.instance().state.get('loadComplete');
	},
	dataSchemaKey() {
		return Template.instance().state.get('dataSchemaKey');
	},
	isSelected(index) {
		return Template.instance().state.get('target') === index;
	},
	tags() {
		return Template.instance().state.get('value');
	},
	onlyOptions() {
		return Template.instance().state.get('onlyOptions');
	},
	showSelectOptions() {
		return Template.instance().state.get('selectOptions') && Template.instance().state.get('showSelectOptions');
	},
	selectOptions() {
		return Template.instance().state.get('selectOptions');
	},
	selected(tag) {
		const value = Template.instance().state.get('value');
		return value && value.indexOf(tag) > -1;
	},
	showPlaceholder() {
		return Template.instance().state.get('placeholder') && Template.instance().state.get('showPlaceholder');
	},
	placeholder() {
		return Template.instance().state.get('placeholder');
	},
	isDouble(index) {
		const double = Template.instance().state.get('double');
		return double > -1 && double === index;
	},
	hasLimits() {
		return Template.instance().state.get('minLength') > -1 || Template.instance().state.get('maxLength') > -1
	},
	minLength() {
		const len = Template.instance().state.get('minLength');
		return len > -1 ? len : null;
	},
	maxLength() {
		const len = Template.instance().state.get('maxLength');
		return len > -1 ? len : null;
	},
	limitsExceeded(){
		return Template.instance().state.get('limitsExceeded')
	},
});

function getTag(text = '') {
	return text.replace(/\s\s+/g, ' ').trim();
}

function applyInput({ templateInstance }) {
	const input = $('#aftags-input');
	const index = parseInt(input.attr('data-index'), 10);
	const target = templateInstance.state.get('target');
	const value = templateInstance.state.get('value');
	const tag = getTag(input.text());


	const doubleIndex = templateInstance.state.get('double');
	if (doubleIndex > -1 && doubleIndex !== index) return;

	if (tag.length === 0 || tag === "") {
		return;
	}

	const minLength = templateInstance.state.get('minLength');
	if (minLength > -1 && tag.length < minLength) {
		templateInstance.state.set('limitsExceeded', true);
		return;
	}

	const maxLength = templateInstance.state.get('maxLength');
	if (maxLength > -1 && tag.length > maxLength) {
		templateInstance.state.set('limitsExceeded', true);
		return;
	}

	const onlyOptions = templateInstance.state.get('onlyOptions');
	const optionsMap = templateInstance.state.get('optionsMap');

	if (onlyOptions && optionsMap && !optionsMap[tag]) {
		// TODO show err msg
		return;
	}


	if (index === -1) {
		value.push(tag);
	} else if (index === target) {
		value[index] = tag;
	} else {
		value.splice(index, 0, tag);
	}

	$('#afTags-hiddenInput').val(JSON.stringify(value));
	templateInstance.state.set('value', value);
	templateInstance.state.set('target', null);
	input.text('');

	setTimeout(() => {
		$('#aftags-input').focus();
	}, 30);
}

Template.afTags.events({

	'focus #aftags-input'(event, templateInstance) {
		event.preventDefault();
		templateInstance.state.set('showSelectOptions', true);
		templateInstance.state.set('showPlaceholder', false);
	},

	'blur #aftags-input'(event, templateInstance) {
		//event.preventDefault();
		//event.stopPropagation();


		// cancel on blur
		const input = $(event.currentTarget);
		const index = parseInt(input.attr('data-index'), 10);
		const target = templateInstance.state.get('target');
		if (index === target) {
			templateInstance.state.set('target', null);
		}
		const tagLength = input.text().length;
		templateInstance.state.set('showSelectOptions', tagLength !== 0);
		templateInstance.state.set('showPlaceholder', tagLength === 0);

	},

	'click #aftags-input-showenterbutton'(event) {
		event.preventDefault();
		$('#aftags-input').focus();
	},

	'click #aftags-input-applybutton'(event, templateInstance) {
		event.preventDefault();
		applyInput({ templateInstance });
	},

	'input #aftags-input'(event, templateInstance) {


		// detect the current input and immediately
		// cache it to be a double if true
		const input = $(event.target);
		const tag = getTag(input.text());
		const index = parseInt(input.attr('data-index'), 10);
		const value = templateInstance.state.get('value');


		const minLength = templateInstance.state.get('minLength');
		if (minLength > -1 && tag.length < minLength) {
			templateInstance.state.set('limitsExceeded', true);
			return;
		}

		const maxLength = templateInstance.state.get('maxLength');
		if (maxLength > -1 && tag.length > maxLength) {
			templateInstance.state.set('limitsExceeded', true);
			return;
		}

		templateInstance.state.set('limitsExceeded', false);

		// if there is a double found
		// and it's index is not the current index
		// which may be the case if we edit the
		// current tag
		const doubleIndex = value.indexOf(tag);
		const isDouble = doubleIndex > -1 && doubleIndex !== index;
		templateInstance.state.set('double', isDouble ? doubleIndex : -1);
	},

	'keydown #aftags-input'(event, templateInstance) {

		// if typing... return
		if (event.key !== "Enter" && event.key !== "Escape" && event.key !== "Tab") {
			return;
		}

		const input = $(event.target);
		const index = parseInt(input.attr('data-index'), 10);

		event.preventDefault();
		event.stopPropagation();


		// ESC -> cancel
		if (event.key === "Escape") {
			templateInstance.state.set('target', null);
			templateInstance.state.set('double', -1);

			if (index === -1) {
				input.text('');
			}

			input.blur();
			return;
		}

		applyInput({ templateInstance });
	},

	'click .aftags-close'(event, templateInstance) {
		event.preventDefault();
		event.stopPropagation();
		//delete tag

		const input = $(event.currentTarget);
		const doubleIndex = templateInstance.state.get('double');
		const index = parseInt(input.attr('data-index'), 10);

		// if item to delete
		// is stored in double's cache
		if (doubleIndex === index) {
			templateInstance.state.set('double', -1);
		}

		const value = templateInstance.state.get('value');
		value.splice(index, 1);

		$('#afTags-hiddenInput').val(JSON.stringify(value));
		templateInstance.state.set('value', value);

		setTimeout(() => {
			$('#aftags-input').focus();
		}, 30);
	},

	'click .aftags-tag'(event, templateInstance) {
		event.preventDefault();
		event.stopPropagation();

		//edit tag
		const index = $(event.currentTarget).attr('data-index');
		templateInstance.state.set('target', parseInt(index, 10));
		templateInstance.state.set('showSelectOptions', true);
		templateInstance.state.set('showPlaceholder', false);

		setTimeout(() => {
			$('#aftags-input').focus();
		}, 30);
	},

	'mousedown .aftags-option'(event, templateInstance) {
		event.preventDefault();
		event.stopPropagation();

		const input = $(event.currentTarget);
		const target = input.attr('data-target');
		const value = templateInstance.state.get('value');

		value.push(target);

		input.text('');
		$('#afTags-hiddenInput').val(JSON.stringify(value));
		templateInstance.state.set('value', value);
		templateInstance.state.set('target', null);
		templateInstance.state.set('showSelectOptions', true);

	}
});
