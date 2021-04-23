/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const SELECT_THEME = 'SELECT_THEME';
export const DARK_THEME = 'Dark';
export const LIGHT_THEME = 'Light';

export function selectTheme(theme) {
    return { type: SELECT_THEME, theme: theme };
}

export const SELECT_LANGUAGE = 'SELECT_LANGUAGE';

export function selectLanguage(language) {
    return { type: SELECT_LANGUAGE, language: language };
}

export const SELECT_COMPUTED_LANGUAGE = 'SELECT_COMPUTED_LANGUAGE';

export function selectComputedLanguage(computedLanguage) {
    return {
        type: SELECT_COMPUTED_LANGUAGE,
        computedLanguage: computedLanguage,
    };
}

export const UPDATE_CONTINGENCY_LIST = 'UPDATE_CONTINGENCY_LIST';

export function updateContingencyList(contingencyLists) {
    return {
        type: UPDATE_CONTINGENCY_LIST,
        contingencyLists: contingencyLists,
    };
}
