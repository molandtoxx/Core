"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global globalRootUrl,globalTranslate, ace, Form, Extensions */
// Проверка нет ли ошибки занятого другой учеткой номера
$.fn.form.settings.rules.existRule = function (value, parameter) {
  return $("#".concat(parameter)).hasClass('hidden');
};

var dialplanApplication = {
  $number: $('#extension'),
  defaultExtension: '',
  $formObj: $('#dialplan-application-form'),
  $dirrtyField: $('#dirrty'),
  editor: '',
  validateRules: {
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.da_ValidateNameIsEmpty
      }]
    },
    extension: {
      identifier: 'extension',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.da_ValidateExtensionIsEmpty
      }, {
        type: 'existRule[extension-error]',
        prompt: globalTranslate.da_ValidateExtensionDouble
      }]
    }
  },
  initialize: function () {
    function initialize() {
      $('#application-code-menu .item').tab();

      if (dialplanApplication.$formObj.form('get value', 'name').length === 0) {
        $('#application-code-menu .item').tab('change tab', 'main');
      }

      $('.type-select').dropdown({
        onChange: dialplanApplication.changeAceMode
      }); // Динамическая проверка свободен ли внутренний номер

      dialplanApplication.$number.on('change', function () {
        var newNumber = dialplanApplication.$formObj.form('get value', 'extension');
        Extensions.checkAvailability(dialplanApplication.defaultExtension, newNumber);
      });
      dialplanApplication.initializeAce();
      dialplanApplication.initializeForm();
      dialplanApplication.changeAceMode();
      dialplanApplication.defaultExtension = dialplanApplication.$formObj.form('get value', 'extension');
    }

    return initialize;
  }(),
  initializeAce: function () {
    function initializeAce() {
      dialplanApplication.editor = ace.edit('application-code');
      dialplanApplication.editor.setTheme('ace/theme/monokai');
      dialplanApplication.editor.resize();
      dialplanApplication.editor.getSession().on('change', function () {
        dialplanApplication.$dirrtyField.val(Math.random());
        dialplanApplication.$dirrtyField.trigger('change');
      });
    }

    return initializeAce;
  }(),
  changeAceMode: function () {
    function changeAceMode() {
      var mode = dialplanApplication.$formObj.form('get value', 'type');
      var NewMode;

      if (mode === 'php') {
        NewMode = ace.require('ace/mode/php').Mode;
      } else {
        NewMode = ace.require('ace/mode/julia').Mode;
      }

      dialplanApplication.editor.session.setMode(new NewMode());
      dialplanApplication.editor.setTheme('ace/theme/monokai');
    }

    return changeAceMode;
  }(),
  cbBeforeSendForm: function () {
    function cbBeforeSendForm(settings) {
      var result = settings;
      result.data = dialplanApplication.$formObj.form('get values');
      result.data.applicationlogic = dialplanApplication.editor.getValue();
      return result;
    }

    return cbBeforeSendForm;
  }(),
  cbAfterSendForm: function () {
    function cbAfterSendForm() {}

    return cbAfterSendForm;
  }(),
  initializeForm: function () {
    function initializeForm() {
      Form.$formObj = dialplanApplication.$formObj;
      Form.url = "".concat(globalRootUrl, "dialplan-applications/save");
      Form.validateRules = dialplanApplication.validateRules;
      Form.cbBeforeSendForm = dialplanApplication.cbBeforeSendForm;
      Form.cbAfterSendForm = dialplanApplication.cbAfterSendForm;
      Form.initialize();
    }

    return initializeForm;
  }()
};
$(document).ready(function () {
  dialplanApplication.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9EaWFscGxhbkFwcGxpY2F0aW9ucy9kaWFscGxhbi1hcHBsaWNhdGlvbnMtbW9kaWZ5LmpzIl0sIm5hbWVzIjpbIiQiLCJmbiIsImZvcm0iLCJzZXR0aW5ncyIsInJ1bGVzIiwiZXhpc3RSdWxlIiwidmFsdWUiLCJwYXJhbWV0ZXIiLCJoYXNDbGFzcyIsImRpYWxwbGFuQXBwbGljYXRpb24iLCIkbnVtYmVyIiwiZGVmYXVsdEV4dGVuc2lvbiIsIiRmb3JtT2JqIiwiJGRpcnJ0eUZpZWxkIiwiZWRpdG9yIiwidmFsaWRhdGVSdWxlcyIsIm5hbWUiLCJpZGVudGlmaWVyIiwidHlwZSIsInByb21wdCIsImdsb2JhbFRyYW5zbGF0ZSIsImRhX1ZhbGlkYXRlTmFtZUlzRW1wdHkiLCJleHRlbnNpb24iLCJkYV9WYWxpZGF0ZUV4dGVuc2lvbklzRW1wdHkiLCJkYV9WYWxpZGF0ZUV4dGVuc2lvbkRvdWJsZSIsImluaXRpYWxpemUiLCJ0YWIiLCJsZW5ndGgiLCJkcm9wZG93biIsIm9uQ2hhbmdlIiwiY2hhbmdlQWNlTW9kZSIsIm9uIiwibmV3TnVtYmVyIiwiRXh0ZW5zaW9ucyIsImNoZWNrQXZhaWxhYmlsaXR5IiwiaW5pdGlhbGl6ZUFjZSIsImluaXRpYWxpemVGb3JtIiwiYWNlIiwiZWRpdCIsInNldFRoZW1lIiwicmVzaXplIiwiZ2V0U2Vzc2lvbiIsInZhbCIsIk1hdGgiLCJyYW5kb20iLCJ0cmlnZ2VyIiwibW9kZSIsIk5ld01vZGUiLCJyZXF1aXJlIiwiTW9kZSIsInNlc3Npb24iLCJzZXRNb2RlIiwiY2JCZWZvcmVTZW5kRm9ybSIsInJlc3VsdCIsImRhdGEiLCJhcHBsaWNhdGlvbmxvZ2ljIiwiZ2V0VmFsdWUiLCJjYkFmdGVyU2VuZEZvcm0iLCJGb3JtIiwidXJsIiwiZ2xvYmFsUm9vdFVybCIsImRvY3VtZW50IiwicmVhZHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7O0FBUUE7QUFFQTtBQUNBQSxDQUFDLENBQUNDLEVBQUYs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QWtDLFlBQWxDLENBQWQ7QUFDQW1ELE1BQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZQyxnQkFBWixHQUErQjlDLG1CQUFtQixDQUFDSyxNQUFwQixDQUEyQjBDLFFBQTNCLEVBQS9CO0FBQ0EsYUFBT0gsTUFBUDtBQUNBOztBQTFFMEI7QUFBQTtBQTJFM0JJLEVBQUFBLGVBM0UyQjtBQUFBLCtCQTJFVCxDQUVqQjs7QUE3RTBCO0FBQUE7QUE4RTNCckIsRUFBQUEsY0E5RTJCO0FBQUEsOEJBOEVWO0FBQ2hCc0IsTUFBQUEsSUFBSSxDQUFDOUMsUUFBTCxHQUFnQkgsbUJBQW1CLENBQUNHLFFBQXBDO0FBQ0E4QyxNQUFBQSxJQUFJLENBQUNDLEdBQUwsYUFBY0MsYUFBZDtBQUNBRixNQUFBQSxJQUFJLENBQUMzQyxhQUFMLEdBQXFCTixtQkFBbUIsQ0FBQ00sYUFBekM7QUFDQTJDLE1BQUFBLElBQUksQ0FBQ04sZ0JBQUwsR0FBd0IzQyxtQkFBbUIsQ0FBQzJDLGdCQUE1QztBQUNBTSxNQUFBQSxJQUFJLENBQUNELGVBQUwsR0FBdUJoRCxtQkFBbUIsQ0FBQ2dELGVBQTNDO0FBQ0FDLE1BQUFBLElBQUksQ0FBQ2pDLFVBQUw7QUFDQTs7QUFyRjBCO0FBQUE7QUFBQSxDQUE1QjtBQXdGQXpCLENBQUMsQ0FBQzZELFFBQUQsQ0FBRCxDQUFZQyxLQUFaLENBQWtCLFlBQU07QUFDdkJyRCxFQUFBQSxtQkFBbUIsQ0FBQ2dCLFVBQXBCO0FBQ0EsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgKEMpIE1JS08gTExDIC0gQWxsIFJpZ2h0cyBSZXNlcnZlZFxuICogVW5hdXRob3JpemVkIGNvcHlpbmcgb2YgdGhpcyBmaWxlLCB2aWEgYW55IG1lZGl1bSBpcyBzdHJpY3RseSBwcm9oaWJpdGVkXG4gKiBQcm9wcmlldGFyeSBhbmQgY29uZmlkZW50aWFsXG4gKiBXcml0dGVuIGJ5IE5pa29sYXkgQmVrZXRvdiwgMTIgMjAxOVxuICpcbiAqL1xuXG4vKiBnbG9iYWwgZ2xvYmFsUm9vdFVybCxnbG9iYWxUcmFuc2xhdGUsIGFjZSwgRm9ybSwgRXh0ZW5zaW9ucyAqL1xuXG4vLyDQn9GA0L7QstC10YDQutCwINC90LXRgiDQu9C4INC+0YjQuNCx0LrQuCDQt9Cw0L3Rj9GC0L7Qs9C+INC00YDRg9Cz0L7QuSDRg9GH0LXRgtC60L7QuSDQvdC+0LzQtdGA0LBcbiQuZm4uZm9ybS5zZXR0aW5ncy5ydWxlcy5leGlzdFJ1bGUgPSAodmFsdWUsIHBhcmFtZXRlcikgPT4gJChgIyR7cGFyYW1ldGVyfWApLmhhc0NsYXNzKCdoaWRkZW4nKTtcblxuY29uc3QgZGlhbHBsYW5BcHBsaWNhdGlvbiA9IHtcblx0JG51bWJlcjogJCgnI2V4dGVuc2lvbicpLFxuXHRkZWZhdWx0RXh0ZW5zaW9uOiAnJyxcblx0JGZvcm1PYmo6ICQoJyNkaWFscGxhbi1hcHBsaWNhdGlvbi1mb3JtJyksXG5cdCRkaXJydHlGaWVsZDogJCgnI2RpcnJ0eScpLFxuXHRlZGl0b3I6ICcnLFxuXHR2YWxpZGF0ZVJ1bGVzOiB7XG5cdFx0bmFtZToge1xuXHRcdFx0aWRlbnRpZmllcjogJ25hbWUnLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUuZGFfVmFsaWRhdGVOYW1lSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHRleHRlbnNpb246IHtcblx0XHRcdGlkZW50aWZpZXI6ICdleHRlbnNpb24nLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdlbXB0eScsXG5cdFx0XHRcdFx0cHJvbXB0OiBnbG9iYWxUcmFuc2xhdGUuZGFfVmFsaWRhdGVFeHRlbnNpb25Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2V4aXN0UnVsZVtleHRlbnNpb24tZXJyb3JdJyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5kYV9WYWxpZGF0ZUV4dGVuc2lvbkRvdWJsZSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblx0aW5pdGlhbGl6ZSgpIHtcblx0XHQkKCcjYXBwbGljYXRpb24tY29kZS1tZW51IC5pdGVtJykudGFiKCk7XG5cdFx0aWYgKGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgJ25hbWUnKS5sZW5ndGggPT09IDApIHtcblx0XHRcdCQoJyNhcHBsaWNhdGlvbi1jb2RlLW1lbnUgLml0ZW0nKS50YWIoJ2NoYW5nZSB0YWInLCAnbWFpbicpO1xuXHRcdH1cblx0XHQkKCcudHlwZS1zZWxlY3QnKS5kcm9wZG93bih7XG5cdFx0XHRvbkNoYW5nZTogZGlhbHBsYW5BcHBsaWNhdGlvbi5jaGFuZ2VBY2VNb2RlLFxuXHRcdH0pO1xuXHRcdC8vINCU0LjQvdCw0LzQuNGH0LXRgdC60LDRjyDQv9GA0L7QstC10YDQutCwINGB0LLQvtCx0L7QtNC10L0g0LvQuCDQstC90YPRgtGA0LXQvdC90LjQuSDQvdC+0LzQtdGAXG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi4kbnVtYmVyLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG5cdFx0XHRjb25zdCBuZXdOdW1iZXIgPSBkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICdleHRlbnNpb24nKTtcblx0XHRcdEV4dGVuc2lvbnMuY2hlY2tBdmFpbGFiaWxpdHkoZGlhbHBsYW5BcHBsaWNhdGlvbi5kZWZhdWx0RXh0ZW5zaW9uLCBuZXdOdW1iZXIpO1xuXHRcdH0pO1xuXG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplQWNlKCk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplRm9ybSgpO1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uY2hhbmdlQWNlTW9kZSgpO1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uZGVmYXVsdEV4dGVuc2lvbiA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgJ2V4dGVuc2lvbicpO1xuXHR9LFxuXHRpbml0aWFsaXplQWNlKCkge1xuXHRcdGRpYWxwbGFuQXBwbGljYXRpb24uZWRpdG9yID0gYWNlLmVkaXQoJ2FwcGxpY2F0aW9uLWNvZGUnKTtcblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5zZXRUaGVtZSgnYWNlL3RoZW1lL21vbm9rYWknKTtcblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5yZXNpemUoKTtcblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5nZXRTZXNzaW9uKCkub24oJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdGRpYWxwbGFuQXBwbGljYXRpb24uJGRpcnJ0eUZpZWxkLnZhbChNYXRoLnJhbmRvbSgpKTtcblx0XHRcdGRpYWxwbGFuQXBwbGljYXRpb24uJGRpcnJ0eUZpZWxkLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHRcdH0pO1xuXHR9LFxuXHRjaGFuZ2VBY2VNb2RlKCkge1xuXHRcdGNvbnN0IG1vZGUgPSBkaWFscGxhbkFwcGxpY2F0aW9uLiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsICd0eXBlJyk7XG5cdFx0bGV0IE5ld01vZGU7XG5cdFx0aWYgKG1vZGUgPT09ICdwaHAnKSB7XG5cdFx0XHROZXdNb2RlID0gYWNlLnJlcXVpcmUoJ2FjZS9tb2RlL3BocCcpLk1vZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE5ld01vZGUgPSBhY2UucmVxdWlyZSgnYWNlL21vZGUvanVsaWEnKS5Nb2RlO1xuXHRcdH1cblx0XHRkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5zZXNzaW9uLnNldE1vZGUobmV3IE5ld01vZGUoKSk7XG5cdFx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5lZGl0b3Iuc2V0VGhlbWUoJ2FjZS90aGVtZS9tb25va2FpJyk7XG5cdH0sXG5cdGNiQmVmb3JlU2VuZEZvcm0oc2V0dGluZ3MpIHtcblx0XHRjb25zdCByZXN1bHQgPSBzZXR0aW5ncztcblx0XHRyZXN1bHQuZGF0YSA9IGRpYWxwbGFuQXBwbGljYXRpb24uJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlcycpO1xuXHRcdHJlc3VsdC5kYXRhLmFwcGxpY2F0aW9ubG9naWMgPSBkaWFscGxhbkFwcGxpY2F0aW9uLmVkaXRvci5nZXRWYWx1ZSgpO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGNiQWZ0ZXJTZW5kRm9ybSgpIHtcblxuXHR9LFxuXHRpbml0aWFsaXplRm9ybSgpIHtcblx0XHRGb3JtLiRmb3JtT2JqID0gZGlhbHBsYW5BcHBsaWNhdGlvbi4kZm9ybU9iajtcblx0XHRGb3JtLnVybCA9IGAke2dsb2JhbFJvb3RVcmx9ZGlhbHBsYW4tYXBwbGljYXRpb25zL3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IGRpYWxwbGFuQXBwbGljYXRpb24udmFsaWRhdGVSdWxlcztcblx0XHRGb3JtLmNiQmVmb3JlU2VuZEZvcm0gPSBkaWFscGxhbkFwcGxpY2F0aW9uLmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBkaWFscGxhbkFwcGxpY2F0aW9uLmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0ZGlhbHBsYW5BcHBsaWNhdGlvbi5pbml0aWFsaXplKCk7XG59KTtcblxuIl19