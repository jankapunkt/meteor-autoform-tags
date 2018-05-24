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
		return JSON.parse(this.val());
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
	}
});

Template.afTags.events({

	'blur #aftags-input'(event, templateInstance) {
		event.preventDefault();
		// cancel on blur


	},

	'keydown #aftags-input'(event, templateInstance) {

		// apply on enter
		if (event.keyCode !== 13) return;

		event.preventDefault();
		event.stopPropagation();

		const input = $(event.currentTarget);
		const tag = input.text().trim();
		if (tag.length === 0 || tag === "") {
			return;
		}

		//TODO check tag length here and show err msg if not satisfied
		//TODO check if tag already exists and show err msg if true

		const index = parseInt(input.attr('data-index'), 10);
		const target = templateInstance.state.get('target');
		const value = templateInstance.state.get('value');


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

		setTimeout(()=>{
			$('#aftags-input').focus();
		}, 150);
	},

	'click .aftags-tag'(event, templateInstance) {
		event.preventDefault();
		//edit tag

		const index = $(event.currentTarget).attr('data-index');
		templateInstance.state.set('target', parseInt(index, 10));

		setTimeout(()=>{
			$('#aftags-input').focus();
		}, 150);
	},
});
