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


Template.afTags.onCreated(function () {
	const instance = this;
	instance.state = new ReactiveDict();
	instance.state.set('target', null);
	instance.state.set('value', []);
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

		instance.state.set('selectOptions', data.selectOptions.sort());
		instance.state.set('optionsMap', optionsMap);
		instance.state.set('onlyOptions', !!atts.onlyOptions);
		instance.state.set('dataSchemaKey', atts['data-schema-key']);

		const { value } = data;
		if (value) {
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
		return Template.instance().state.get('showSelectOptions');
	},
	selectOptions() {
		return Template.instance().state.get('selectOptions');
	},
	selected(tag) {
		const value = Template.instance().state.get('value');
		return value && value.indexOf(tag) > -1;
	}
});

Template.afTags.events({

	'blur #aftags-input'(event, templateInstance) {
		event.preventDefault();
		// cancel on blur

		const input = $(event.currentTarget);
		const index = parseInt(input.attr('data-index'), 10);
		const target = templateInstance.state.get('target');

		if (index === target) {
			templateInstance.state.set('target', null);
		}
	},

	'keydown #aftags-input'(event, templateInstance) {


		// if typing...
		if (event.keyCode !== 13 && event.keyCode !== 27) {
			templateInstance.state.set('showSelectOptions', true);
			return;
		}

		templateInstance.state.set('showSelectOptions', false);

		event.preventDefault();
		event.stopPropagation();


		const input = $(event.currentTarget);
		const tag = input.text().trim();
		if (tag.length === 0 || tag === "") {
			return;
		}

		const index = parseInt(input.attr('data-index'), 10);
		const target = templateInstance.state.get('target');
		const value = templateInstance.state.get('value');
		const onlyOptions = templateInstance.state.get('onlyOptions');
		const optionsMap = templateInstance.state.get('optionsMap');

		// ESC -> cancel
		if (event.keyCode === 27) {

			if (index === -1) {
				input.text('');
			}
			templateInstance.state.set('target', null);
			return;
		}

		if (value.indexOf(tag) > -1) {
			//show err msg
			console.log("tag already exists")
			return;
		}

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
		//edit tag

		const index = $(event.currentTarget).attr('data-index');
		templateInstance.state.set('target', parseInt(index, 10));

		setTimeout(() => {
			$('#aftags-input').focus();
		}, 150);
	},
});
