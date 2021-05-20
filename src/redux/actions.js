/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PARAM_LANGUAGE, PARAM_THEME } from '../utils/config-params';

export const SELECT_THEME = 'SELECT_THEME';
export const LIGHT_THEME = 'Light';

export function selectTheme(theme) {
    return { type: SELECT_THEME, [PARAM_THEME]: theme };
}

export const SELECT_LANGUAGE = 'SELECT_LANGUAGE';

export function selectLanguage(language) {
    return { type: SELECT_LANGUAGE, [PARAM_LANGUAGE]: language };
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

export const UPDATE_FILTER_LIST = 'UPDATE_FILTER_LIST';

export function updateFilterList(filterList) {
    console.info(filterList);
    return {
        type: UPDATE_FILTER_LIST,
        filterList: filterList,
    };
}
