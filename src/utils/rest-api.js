/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { APP_NAME, getAppName } from './config-params';

const PREFIX_ACTIONS_QUERIES = process.env.REACT_APP_API_GATEWAY + '/actions';
const PREFIX_FILTERS_QUERIES =
    process.env.REACT_APP_API_GATEWAY + '/filter/v1/filters/';

const PREFIX_CONFIG_NOTIFICATION_WS =
    process.env.REACT_APP_WS_GATEWAY + '/config-notification';
const PREFIX_CONFIG_QUERIES = process.env.REACT_APP_API_GATEWAY + '/config';

function getToken() {
    const state = store.getState();
    return state.user.id_token;
}

function backendFetch(url, init) {
    if (!(typeof init == 'undefined' || typeof init == 'object')) {
        throw new TypeError(
            'Argument 2 of backendFetch is not an object' + typeof init
        );
    }
    const initCopy = Object.assign({}, init);
    initCopy.headers = new Headers(initCopy.headers || {});
    initCopy.headers.append('Authorization', 'Bearer ' + getToken());

    return fetch(url, initCopy);
}

export function fetchAppsAndUrls() {
    console.info(`Fetching apps and urls...`);
    return fetch('env.json')
        .then((res) => res.json())
        .then((res) => {
            return fetch(
                res.appsMetadataServerUrl + '/apps-metadata.json'
            ).then((response) => {
                return response.json();
            });
        });
}

export function connectNotificationsWsUpdateConfig() {
    const webSocketBaseUrl = document.baseURI
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://');
    const webSocketUrl =
        webSocketBaseUrl +
        PREFIX_CONFIG_NOTIFICATION_WS +
        '/notify?appName=' +
        APP_NAME;

    let webSocketUrlWithToken;
    webSocketUrlWithToken = webSocketUrl + '&access_token=' + getToken();

    const reconnectingWebSocket = new ReconnectingWebSocket(
        webSocketUrlWithToken
    );
    reconnectingWebSocket.onopen = function (event) {
        console.info(
            'Connected Websocket update config ' + webSocketUrl + ' ...'
        );
    };
    return reconnectingWebSocket;
}

export function fetchConfigParameters(appName) {
    console.info('Fetching UI configuration params for app : ' + appName);
    const fetchParams =
        PREFIX_CONFIG_QUERIES + `/v1/applications/${appName}/parameters`;
    return backendFetch(fetchParams).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function fetchConfigParameter(name) {
    const appName = getAppName(name);
    console.info(
        "Fetching UI config parameter '%s' for app '%s' ",
        name,
        appName
    );
    const fetchParams =
        PREFIX_CONFIG_QUERIES +
        `/v1/applications/${appName}/parameters/${name}`;
    return backendFetch(fetchParams).then((response) =>
        response.ok
            ? response.json()
            : response.text().then((text) => Promise.reject(text))
    );
}

export function updateConfigParameter(name, value) {
    const appName = getAppName(name);
    console.info(
        "Updating config parameter '%s=%s' for app '%s' ",
        name,
        value,
        appName
    );
    const updateParams =
        PREFIX_CONFIG_QUERIES +
        `/v1/applications/${appName}/parameters/${name}?value=` +
        encodeURIComponent(value);
    return backendFetch(updateParams, { method: 'put' }).then((response) =>
        response.ok
            ? response
            : response.text().then((text) => Promise.reject(text))
    );
}

/**
 * Get all contingency lists
 * @returns {Promise<Response>}
 */
export function getContingencyLists() {
    const url = PREFIX_ACTIONS_QUERIES + '/v1/contingency-lists';
    return backendFetch(url)
        .then((response) => response.json())
        .then((res) => res.sort((a, b) => a.name.localeCompare(b.name)));
}

/**
 * Get contingency list by type
 * @returns {Promise<Response>}
 */
export function getContingencyList(type, name) {
    let url = PREFIX_ACTIONS_QUERIES;
    if (type === 'SCRIPT') {
        url += '/v1/script-contingency-lists/';
    } else {
        url += '/v1/filters-contingency-lists/';
    }
    url += name;

    return backendFetch(url).then((response) => response.json());
}

/**
 * Add new contingency list
 * @returns {Promise<Response>}
 */
export function addScriptContingencyList(scriptContingencyList) {
    const url = PREFIX_ACTIONS_QUERIES + '/v1/script-contingency-lists/';
    return backendFetch(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptContingencyList),
    });
}

/**
 * Add new contingency list
 * @returns {Promise<Response>}
 */
export function saveScriptContingencyList(scriptContingencyList) {
    const url =
        PREFIX_ACTIONS_QUERIES +
        '/v1/script-contingency-lists/' +
        scriptContingencyList.id;
    return backendFetch(url, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptContingencyList),
    });
}

/**
 * Replace filters contingency list with script contingency list
 * @returns {Promise<Response>}
 */
export function replaceFiltersWithScriptContingencyList(name) {
    const url =
        PREFIX_ACTIONS_QUERIES +
        '/v1/filters-contingency-lists/' +
        encodeURIComponent(name) +
        '/replace-with-script';
    return backendFetch(url, {
        method: 'post',
    });
}

/**
 * Save new script contingency list from filters contingency list
 * @returns {Promise<Response>}
 */
export function newScriptFromFiltersContingencyList(id, newName) {
    const url =
        PREFIX_ACTIONS_QUERIES +
        '/v1/filters-contingency-lists/' +
        id +
        '/new-script/' +
        encodeURIComponent(newName);

    return backendFetch(url, {
        method: 'post',
    });
}

/**
 * Delete contingency list by name
 * @param id
 * @returns {Promise<Response>}
 */
export function deleteListByName(id) {
    const url =
        PREFIX_ACTIONS_QUERIES +
        '/v1/contingency-lists/' +
        encodeURIComponent(id);
    return backendFetch(url, {
        method: 'delete',
    });
}

/**
 * Add new Filter contingency list
 * @returns {Promise<Response>}
 */
export function addFiltersContingencyList(newFilter) {
    const { nominalVoltage, ...rest } = newFilter;
    const url = PREFIX_ACTIONS_QUERIES + '/v1/filters-contingency-lists/';
    return backendFetch(url, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...rest,
            nominalVoltage: nominalVoltage === '' ? -1 : nominalVoltage,
        }),
    });
}

/**
 * Add new Filter contingency list
 * @returns {Promise<Response>}
 */
export function saveFiltersContingencyList(filter) {
    const { nominalVoltage, ...rest } = filter;
    const url =
        PREFIX_ACTIONS_QUERIES + '/v1/filters-contingency-lists/' + filter.id;
    return backendFetch(url, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...rest,
            nominalVoltage: nominalVoltage === '' ? -1 : nominalVoltage,
        }),
    });
}

/**
 * Create Filter
 * @returns {Promise<Response>}
 */
export function createFilter(newFilter) {
    return backendFetch(PREFIX_FILTERS_QUERIES, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFilter),
    }).then((response) => response.json());
}

/**
 * Save Filter
 */
export function saveFilter(filter) {
    return backendFetch(PREFIX_FILTERS_QUERIES + filter.id, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter),
    });
}

/**
 * Get all filters (name & type)
 * @returns {Promise<Response>}
 */
export function getFilters() {
    return backendFetch(PREFIX_FILTERS_QUERIES)
        .then((response) => response.json())
        .then((res) => res.sort((a, b) => a.name.localeCompare(b.name)));
}

/**
 * Delete filter by id
 * @param id
 * @returns {Promise<Response>}
 */
export function deleteFilterById(id) {
    const url = PREFIX_FILTERS_QUERIES + encodeURIComponent(id);
    return backendFetch(url, {
        method: 'delete',
    });
}

/**
 * Get filter by id
 * @returns {Promise<Response>}
 */
export function getFilterById(id) {
    const url = PREFIX_FILTERS_QUERIES + id;
    return backendFetch(url).then((response) => response.json());
}

/**
 * Replace filter with script filter
 * @returns {Promise<Response>}
 */
export function replaceFilterWithScript(id) {
    const url = PREFIX_FILTERS_QUERIES + id + '/replace-with-script';
    return backendFetch(url, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
    }).then((response) => response.json());
}

/**
 * Save new script from filter
 * @returns {Promise<Response>}
 */
export function newScriptFromFilter(id, newName) {
    const url =
        PREFIX_FILTERS_QUERIES +
        id +
        '/new-script/' +
        encodeURIComponent(newName);
    return backendFetch(url, {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
    }).then((response) => response.json());
}
