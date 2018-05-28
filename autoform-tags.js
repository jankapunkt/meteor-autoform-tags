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

		instance.state.set('selectOptions', data.selectOptions);
		instance.state.set('optionsMap', optionsMap);
		instance.state.set('placeholder', atts.placeholder);
		instance.state.set('onlyOptions', !!atts.onlyOptions);
		instance.state.set('dataSchemaKey', atts['data-schema-key']);

		const { value } = data;
		if (value && !nstance.state.get('value')) {
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
	focus() {
		return Template.instance().state.get('focus');
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
	isDouble(value) {
		return Template.instance().state.get('double') === value.trim();
	}
});


Template.afTags.events({

	'focus #aftags-input'(event, templateInstance) {
		event.preventDefault();
		console.log("focus #aftags-input");
		templateInstance.state.set('showSelectOptions', true);
		templateInstance.state.set('showPlaceholder', false);
	},

	'blur #aftags-input'(event, templateInstance) {
		//event.preventDefault();
		//event.stopPropagation();
		console.log("blur #aftags-input");

		// cancel on blur
		const input = $(event.currentTarget);
		const index = parseInt(input.attr('data-index'), 10);
		const target = templateInstance.state.get('target');
		if (index === target) {
			templateInstance.state.set('target', null);
		}
		templateInstance.state.set('showSelectOptions', false);
		templateInstance.state.set('showPlaceholder', $('#aftags-input').text().trim().length === 0);
	},

	'keydown #aftags-input'(event, templateInstance) {
		console.log("keydown #aftags-input");

		const input = $(event.currentTarget);
		const index = parseInt(input.attr('data-index'), 10);
		const target = templateInstance.state.get('target');
		const value = templateInstance.state.get('value');
		const tag = input.text().trim();

		// index !== means we are not editing a tag
		// which could lead a user to hit enter to imply
		// that the 'old' value should remain thus creating a false double
		const isDouble = index !== target && value.indexOf(tag) > -1;
		templateInstance.state.set('double', isDouble ? tag : null);

		// if typing...
		if (event.keyCode !== 13 && event.keyCode !== 27) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (isDouble) return;

		// ESC -> cancel
		if (event.keyCode === 27) {

			if (index === -1) {
				input.text('');
			}
			templateInstance.state.set('target', null);
			templateInstance.state.set('showPlaceholder', true);
			templateInstance.state.set('double', null);
			input.blur();
			return;
		}


		if (tag.length === 0 || tag === "") {
			//TODO show err msg
			return;
		}


		const onlyOptions = templateInstance.state.get('onlyOptions');
		const optionsMap = templateInstance.state.get('optionsMap');

		if (onlyOptions && optionsMap && !optionsMap[tag]) {
			// TODO show err msg
			console.log("tag not allowed")
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
	},

	'click .aftags-close'(event, templateInstance) {
		event.preventDefault();
		event.stopPropagation();
		console.log("click .aftags-close");
		//delete tag

		const input = $(event.currentTarget);

		const index = parseInt(input.attr('data-index'), 10);
		const value = templateInstance.state.get('value');

		value.splice(index, 1);

		$('#afTags-hiddenInput').val(JSON.stringify(value));
		templateInstance.state.set('value', value);

		setTimeout(() => {
			$('#aftags-input').focus();
		}, 150);
	},

	'click .aftags-tag'(event, templateInstance) {
		event.preventDefault();
		event.stopPropagation();
		console.log("click .aftags-tag");

		//edit tag
		const index = $(event.currentTarget).attr('data-index');
		templateInstance.state.set('target', parseInt(index, 10));
		templateInstance.state.set('showSelectOptions', true);
		templateInstance.state.set('showPlaceholder', false);

		setTimeout(() => {
			$('#aftags-input').focus();
		}, 150);
	},

	'mousedown .aftags-option'(event, templateInstance) {
		event.preventDefault();
		event.stopPropagation();
		console.log("click .aftags-option");

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
