/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global PbxApi, globalTranslate, UserMessage */

class PbxExtensionStatus {
	constructor(uniqid, changeLabel = true) {
		this.$toggle = $(`.ui.toggle.checkbox[data-value="${uniqid}"]`);
		if (changeLabel) {
			this.$label = $(`.ui.toggle.checkbox[data-value="${uniqid}"]`).find('label');
		} else {
			this.$label = false;
		}
		this.uniqid = uniqid;
		this.$disabilityFields = $(`tr#${uniqid} .disability`);
		const cbOnChecked = $.proxy(this.cbOnChecked, this);
		const cbOnUnchecked = $.proxy(this.cbOnUnchecked, this);
		this.$toggle.checkbox({
			onChecked: cbOnChecked,
			onUnchecked: cbOnUnchecked,
		});
	}
	changeLabelText(newText) {
		if (this.$label) {
			this.$label.text(newText);
		}
	}
	cbOnChecked() {
		this.$toggle.addClass('disabled');
		this.changeLabelText(globalTranslate.ext_ModuleStatusChanging);
		const cbAfterModuleEnable = $.proxy(this.cbAfterModuleEnable, this);
		PbxApi.ModuleEnable(this.uniqid, cbAfterModuleEnable);
	}
	cbOnUnchecked() {
		this.$toggle.addClass('disabled');
		this.changeLabelText(globalTranslate.ext_ModuleStatusChanging);
		const cbAfterModuleDisable = $.proxy(this.cbAfterModuleDisable, this);
		PbxApi.ModuleDisable(this.uniqid, cbAfterModuleDisable);
	}
	cbAfterModuleDisable(response) {
		if (response.success) {
			this.$toggle.checkbox('set unchecked');
			PbxApi.SystemReloadModule(this.uniqid);
			this.changeLabelText(globalTranslate.ext_ModuleDisabledStatusDisabled);
			const event = document.createEvent('Event');
			event.initEvent('ModuleStatusChanged', false, true);
			window.dispatchEvent(event);
			this.$disabilityFields.addClass('disabled');
		} else {
			this.$toggle.checkbox('set checked');
			this.changeLabelText(globalTranslate.ext_ModuleDisabledStatusEnabled);
			this.$disabilityFields.removeClass('disabled');
		}
		if (response.message !== undefined) {
			UserMessage.showMultiString(response.message, globalTranslate.ext_ModuleChangeStatusError);
		} else if (response !== undefined) {
			UserMessage.showMultiString(response, globalTranslate.ext_ModuleChangeStatusError);
		}
		this.$toggle.removeClass('disabled');
	}
	cbAfterModuleEnable(response) {
		if (response.success) {
			this.$toggle.checkbox('set checked');
			PbxApi.SystemReloadModule(this.uniqid);
			this.changeLabelText(globalTranslate.ext_ModuleDisabledStatusEnabled);
			const event = document.createEvent('Event');
			event.initEvent('ModuleStatusChanged', false, true);
			window.dispatchEvent(event);
			this.$disabilityFields.removeClass('disabled');
		} else {
			this.$toggle.checkbox('set unchecked');
			this.changeLabelText(globalTranslate.ext_ModuleDisabledStatusDisabled);
			this.$disabilityFields.addClass('disabled');
		}
		if (response.message !== undefined) {
			UserMessage.showMultiString(response.message, globalTranslate.ext_ModuleChangeStatusError);
		} else if (response !== undefined) {
			UserMessage.showMultiString(response, globalTranslate.ext_ModuleChangeStatusError);
		}
		this.$toggle.removeClass('disabled');
	}
}

$(document).ready(() => {
	const uniqId = $('#module-status-toggle').attr('data-value');
	if (uniqId) {
		const pageStatus = new PbxExtensionStatus(uniqId, true);
	}
});
