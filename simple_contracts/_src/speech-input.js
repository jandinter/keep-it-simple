/*global webkitSpeechRecognition */
(function() {
	'use strict';

	// check for support (webkit only)
	if (!('webkitSpeechRecognition' in window)) return;

	var talkMsg = 'Speak now';
	// seconds to wait for more input after last
  	var patience = 3;

	function capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	var formBlocks = document.getElementsByClassName('form-wrapper');

	[].forEach.call(formBlocks, function(formBlock) {
		console.log(formBlock);
		var inputEl = formBlock.querySelector('.speech-input');
		var micBtn = formBlock.querySelector('.microphone-button');
		var textIndicator = formBlock.querySelector('.text-indicator');
		var shouldCapitalize = true;

		// setup recognition
		var prefix = '';
		var isSentence;
		var recognizing = false;
		var timeout;
		var oldPlaceholder = null;
		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;

		// if lang attribute is set on field use that
		// (defaults to use the lang of the root element)
		if (inputEl.lang) recognition.lang = inputEl.lang;

		function restartTimer() {
			timeout = setTimeout(function() {
				recognition.stop();
			}, patience * 1000);
		}

		recognition.onstart = function() {
			oldPlaceholder = inputEl.placeholder;
			inputEl.placeholder = inputEl.dataset.ready || talkMsg;
			recognizing = true;
			micBtn.classList.add('listening');
			restartTimer();
		};

		recognition.onend = function() {
			recognizing = false;
			clearTimeout(timeout);
			micBtn.classList.remove('listening');
			if (oldPlaceholder !== null) inputEl.placeholder = oldPlaceholder;

			inputEl.disabled = false;
		};

		recognition.onresult = function(event) {
			clearTimeout(timeout);

			// get SpeechRecognitionResultList object
			var resultList = event.results;

			// go through each SpeechRecognitionResult object in the list
			var finalTranscript = '';
			var interimTranscript = '';
			for (var i = event.resultIndex; i < resultList.length; ++i) {
				var result = resultList[i];

				// get this result's first SpeechRecognitionAlternative object
				var firstAlternative = result[0];

				if (result.isFinal) {
					finalTranscript = firstAlternative.transcript;
				} else {
					interimTranscript += firstAlternative.transcript;
				}
			}

			// capitalize transcript if start of new sentence
			var transcript = finalTranscript || interimTranscript;
			transcript = !prefix || isSentence ? capitalize(transcript) : transcript;

			// append transcript to cached input value
			inputEl.value = prefix + transcript;

			// set cursur and scroll to end
			// inputEl.focus();
			if (inputEl.tagName === 'INPUT') {
				inputEl.scrollLeft = inputEl.scrollWidth;
			} else {
				inputEl.scrollTop = inputEl.scrollHeight;
			}

			restartTimer();
		};

		micBtn.addEventListener('click', function(event) {
			event.preventDefault();

			// stop and exit if already going
			if (recognizing) {
				recognition.stop();
				return;
			}

			// Cache current input value which the new transcript will be appended to
			var endsWithWhitespace = inputEl.value.slice(-1).match(/\s/);
			prefix = !inputEl.value || endsWithWhitespace ? inputEl.value : inputEl.value + ' ';

			// check if value ends with a sentence
			isSentence = prefix.trim().slice(-1).match(/[\.\?\!]/);

			// restart recognition
			recognition.start();
		}, false);

		inputEl.addEventListener('change', function(event) {
			console.log("Los");
			textIndicator.content = inputEl.content.size;
		}, false);

	});
})();
