import translate from 'counterpart';
import { createStore } from '../lib/BaseStore';
import Dispatcher from '../flux/Dispatcher';
import Constants from '../flux/Constants';

import cfg from '../config';
import en from '../locales/en';
import de from '../locales/de';
import es from '../locales/es';

translate.registerTranslations('en', en);
translate.registerTranslations('de', de);
translate.registerTranslations('es', es);

var data = {
	language: null
};

/**
 * Gets the user's preferred language.
 * Depends on the browser
 */
function getPreferredLanguages() {
	if (!navigator.languages) {
		return [ (navigator.language.split('-')[0] || 'en') ];
	}
	return navigator.languages.map(l => l.split('-')[0]);
}

/**
 * LanguageStore single object
 * (like a singleton)
 */
var LanguageStore = createStore(['change'], {

	getLanguage() {
		return data.language;
	},

	/**
	 * Change the language the UI is displayed in
	 */
	changeLanguage(language) {
		data.language = language;
		translate.setLocale(language);
	},

	/**
	 * Returns all available languages as a Map
	 */
	getAllLanguages() {
		return cfg.LANGUAGES;
	}

});
export default LanguageStore;

// Select default language
for (var lang of getPreferredLanguages()) {
	if (cfg.LANGUAGES.has(lang)) {
		LanguageStore.changeLanguage(lang);
		break;
	}
}

// Register for actions
LanguageStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {

		case Constants.CHANGE_UI_LANGUAGE:
			LanguageStore.changeLanguage(action.language);
			LanguageStore.emitChange();
		break;

	}
});