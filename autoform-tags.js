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
		return this.val();
	},
	valueIn(initialValue) {
		return initialValue;
	},
});


Template.afTags.onCreated(function () {
	const instance = this;
	instance.state = new ReactiveDict();

	instance.autorun(function () {

		const { data } = instance;
		const { atts } = data;
		console.log(data);

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
});

Template.afTags.events({

	'blur #aftags-input'(event, templateInstance) {
		event.preventDefault();
		// cancel on blur
	},

	'keydown #aftags-input'(event, templateInstance) {
		event.preventDefault();
		// apply on enter

		const input = $(event.currentTarget);
		const tag = input.text().trim();
		if (tag.length === 0 || tag === "") {
			return;
		}

		//TODO check tag length here and show err msg if not satisfied

		const index = parseInt(input.attr('data-target'), 10);
		const value = templateInstance.state.get('value');
		if (index === -1) {
			value.push(tag);
		} else {
			value.splice(index, 0, tag);
		}
		$('#afTags-hiddenInput').val(JSON.stringify(value));
		templateInstance.state.set('value', value);
		input.text('');
	},

	'click .aftags-close'(event, templateInstance) {
		event.preventDefault();
		//delete tag

	}
});
