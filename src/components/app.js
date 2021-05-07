/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
    Redirect,
    Route,
    Switch,
    useHistory,
    useLocation,
} from 'react-router-dom';

import {
    LIGHT_THEME,
    selectTheme,
    selectLanguage,
    selectComputedLanguage,
} from '../redux/actions';

import {
    TopBar,
    AuthenticationRouter,
    logout,
    getPreLoginPath,
    initializeAuthenticationProd,
} from '@gridsuite/commons-ui';

import { useRouteMatch } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import ContingencyLists from './contingency-list';

import Box from '@material-ui/core/Box';
import Parameters, { useParameterState } from './parameters';

import { ReactComponent as GridActionsLogoDark } from '../images/GridActions_logo_dark.svg';
import { ReactComponent as GridActionsLogoLight } from '../images/GridActions_logo_light.svg';
import {
    connectNotificationsWsUpdateConfig,
    fetchAppsAndUrls,
    fetchConfigParameter,
    fetchConfigParameters,
} from '../utils/rest-api';
import {
    APP_NAME,
    COMMON_APP_NAME,
    PARAM_THEME,
    PARAM_LANGUAGE,
} from '../utils/config-params';
import { getComputedLanguage } from '../utils/language';
import { useSnackbar } from 'notistack';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';

const noUserManager = { instance: null, error: null };

const App = () => {
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const user = useSelector((state) => state.user);

    const [languageLocal, handleChangeLanguage] = useParameterState(
        PARAM_LANGUAGE
    );

    const theme = useSelector((state) => state[PARAM_THEME]);

    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);

    const [appsAndUrls, setAppsAndUrls] = useState([]);

    const signInCallbackError = useSelector(
        (state) => state.signInCallbackError
    );

    const [userManager, setUserManager] = useState(noUserManager);

    const [showParameters, setShowParameters] = useState(false);

    const history = useHistory();

    const dispatch = useDispatch();

    const location = useLocation();

    // Can't use lazy initializer because useRouteMatch is a hook
    const [initialMatchSilentRenewCallbackUrl] = useState(
        useRouteMatch({
            path: '/silent-renew-callback',
            exact: true,
        })
    );

    useEffect(() => {
        document.addEventListener('contextmenu', (event) => {
            if (event.target.className !== 'ace_text-input') {
                event.preventDefault();
            }
        });
    });

    useEffect(() => {
        initializeAuthenticationProd(
            dispatch,
            initialMatchSilentRenewCallbackUrl != null,
            fetch('idpSettings.json')
        )
            .then((userManager) => {
                setUserManager({ instance: userManager, error: null });
                userManager.getUser().then((user) => {
                    if (
                        user == null &&
                        initialMatchSilentRenewCallbackUrl == null
                    ) {
                        userManager.signinSilent().catch((error) => {
                            const oidcHackReloaded =
                                'gridsuite-oidc-hack-reloaded';
                            if (
                                !sessionStorage.getItem(oidcHackReloaded) &&
                                error.message ===
                                    'authority mismatch on settings vs. signin state'
                            ) {
                                sessionStorage.setItem(oidcHackReloaded, true);
                                window.location.reload();
                            }
                        });
                    }
                });
            })
            .catch(function (error) {
                setUserManager({ instance: null, error: error.message });
                console.debug('error when importing the idp settings');
            });
        // Note: initialMatchSilentRenewCallbackUrl and dispatch don't change
    }, [initialMatchSilentRenewCallbackUrl, dispatch]);

    useEffect(() => {
        if (user !== null) {
            fetchAppsAndUrls().then((res) => {
                setAppsAndUrls(res);
            });
        }
    }, [user]);

    const updateParams = useCallback(
        (params) => {
            console.debug('received UI parameters : ', params);
            params.forEach((param) => {
                switch (param.name) {
                    case PARAM_THEME:
                        dispatch(selectTheme(param.value));
                        break;
                    case PARAM_LANGUAGE:
                        dispatch(selectLanguage(param.value));
                        dispatch(
                            selectComputedLanguage(
                                getComputedLanguage(param.value)
                            )
                        );
                        break;
                    default:
                }
            });
        },
        [dispatch]
    );

    const connectNotificationsUpdateConfig = useCallback(() => {
        const ws = connectNotificationsWsUpdateConfig();

        ws.onmessage = function (event) {
            let eventData = JSON.parse(event.data);
            if (eventData.headers && eventData.headers['parameterName']) {
                fetchConfigParameter(eventData.headers['parameterName'])
                    .then((param) => updateParams([param]))
                    .catch((errorMessage) =>
                        displayErrorMessageWithSnackbar(
                            errorMessage,
                            'paramsChangingError',
                            enqueueSnackbar,
                            intlRef
                        )
                    );
            }
        };
        ws.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        return ws;
    }, [updateParams, enqueueSnackbar, intlRef]);

    useEffect(() => {
        if (user !== null) {
            fetchConfigParameters(COMMON_APP_NAME)
                .then((params) => updateParams(params))
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar(
                        errorMessage,
                        'paramsChangingError',
                        enqueueSnackbar,
                        intlRef
                    )
                );

            fetchConfigParameters(APP_NAME)
                .then((params) => updateParams(params))
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar(
                        errorMessage,
                        'paramsChangingError',
                        enqueueSnackbar,
                        intlRef
                    )
                );
            const ws = connectNotificationsUpdateConfig();
            return function () {
                ws.close();
            };
        }
    }, [
        user,
        dispatch,
        updateParams,
        connectNotificationsUpdateConfig,
        enqueueSnackbar,
        intlRef,
    ]);

    function onLogoClicked() {
        history.replace('/');
    }

    function hideParameters() {
        setShowParameters(false);
    }

    return (
        <>
            <TopBar
                appName="Actions"
                appColor="#DA0063"
                appLogo={
                    theme === LIGHT_THEME ? (
                        <GridActionsLogoLight />
                    ) : (
                        <GridActionsLogoDark />
                    )
                }
                onLogoutClick={() => logout(dispatch, userManager.instance)}
                onLogoClick={() => onLogoClicked()}
                user={user}
                appsAndUrls={appsAndUrls}
                onThemeClick={handleChangeTheme}
                theme={themeLocal}
                onLanguageClick={handleChangeLanguage}
                language={languageLocal}
                onAboutClick={() => console.debug('about')}
            />
            <Parameters
                showParameters={showParameters}
                hideParameters={hideParameters}
            />
            {user !== null ? (
                <Switch>
                    <Route exact path="/">
                        <Box mt={20}>
                            <ContingencyLists />
                        </Box>
                    </Route>
                    <Route exact path="/sign-in-callback">
                        <Redirect to={getPreLoginPath() || '/'} />
                    </Route>
                    <Route exact path="/logout-callback">
                        <h1>Error: logout failed; you are still logged in.</h1>
                    </Route>
                    <Route>
                        <h1>
                            <FormattedMessage id="PageNotFound" />
                        </h1>
                    </Route>
                </Switch>
            ) : (
                <AuthenticationRouter
                    userManager={userManager}
                    signInCallbackError={signInCallbackError}
                    dispatch={dispatch}
                    history={history}
                    location={location}
                />
            )}
        </>
    );
};

export default App;
