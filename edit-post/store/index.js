/**
 * WordPress Dependencies
 */
import {
	registerReducer,
	registerActions,
	registerSelectors,
	withRehydratation,
	loadAndPersist,
} from '@wordpress/data';

/**
 * Internal dependencies
 */
import reducer from './reducer';
import enhanceWithBrowserSize from './mobile';
import { BREAK_MEDIUM } from './constants';
import * as actions from './actions';
import * as selectors from './selectors';

/**
 * Module Constants
 */
const STORAGE_KEY = `WP_EDIT_POST_PREFERENCES_${ window.userSettings.uid }`;
const MODULE_KEY = 'core/edit-post';

const store = registerReducer( MODULE_KEY, withRehydratation( reducer, 'preferences', STORAGE_KEY ) );

loadAndPersist( store, reducer, 'preferences', STORAGE_KEY );
enhanceWithBrowserSize( store, BREAK_MEDIUM );

registerActions( MODULE_KEY, actions );
registerSelectors( MODULE_KEY, selectors );

export default store;
