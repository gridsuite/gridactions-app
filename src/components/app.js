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

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { LIGHT_THEME, selectTheme } from '../redux/actions';

import {
    TopBar,
    AuthenticationRouter,
    logout,
    getPreLoginPath,
    initializeAuthenticationProd,
    SnackbarProvider,
} from '@gridsuite/commons-ui';

import { useRouteMatch } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import ContingencyLists from './contingency-list';

import Box from '@material-ui/core/Box';
import Parameters from './parameters';

import { ReactComponent as GridActionsLogoDark } from '../images/GridActions_logo_dark.svg';
import { ReactComponent as GridActionsLogoLight } from '../images/GridActions_logo_light.svg';
import {
    connectNotificationsWsUpdateConfig,
    fetchAppsAndUrls,
    fetchConfigParameters,
} from '../utils/rest-api';
import { PARAMS_THEME_KEY } from '../utils/config-params';

const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
    },
    mapboxStyle: 'mapbox://styles/mapbox/light-v9',
});

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    mapboxStyle: 'mapbox://styles/mapbox/dark-v9',
});

const getMuiTheme = (theme) => {
    if (theme === LIGHT_THEME) {
        return lightTheme;
    } else {
        return darkTheme;
    }
};

const noUserManager = { instance: null, error: null };

const App = () => {
    const theme = useSelector((state) => state.theme);

    const user = useSelector((state) => state.user);

    const [appsAndUrls, setAppsAndUrls] = React.useState([]);

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

    const connectNotificationsUpdateConfig = useCallback(() => {
        const ws = connectNotificationsWsUpdateConfig();

        ws.onmessage = function (event) {
            fetchConfigParameters().then((params) => {
                params.forEach((param) => {
                    if (param.name === PARAMS_THEME_KEY) {
                        dispatch(selectTheme(param.value));
                    }
                });
            });
        };
        ws.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        return ws;
    }, [dispatch]);

    useEffect(() => {
        if (user !== null) {
            fetchConfigParameters().then((params) => {
                console.debug('received UI parameters :');
                console.debug(params);
                params.forEach((param) => {
                    if (param.key === PARAMS_THEME_KEY) {
                        dispatch(selectTheme(param.value));
                    }
                });
            });
            const ws = connectNotificationsUpdateConfig();
            return function () {
                ws.close();
            };
        }
    }, [user, dispatch, connectNotificationsUpdateConfig]);

    function onLogoClicked() {
        history.replace('/');
    }

    function showParametersClicked() {
        setShowParameters(true);
    }

    function hideParameters() {
        setShowParameters(false);
    }

    return (
        <ThemeProvider theme={getMuiTheme(theme)}>
            <SnackbarProvider hideIconVariant={false}>
                <React.Fragment>
                    <CssBaseline />
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
                        onParametersClick={() => showParametersClicked()}
                        onLogoutClick={() =>
                            logout(dispatch, userManager.instance)
                        }
                        onLogoClick={() => onLogoClicked()}
                        user={user}
                        appsAndUrls={appsAndUrls}
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
                                <h1>
                                    Error: logout failed; you are still logged
                                    in.
                                </h1>
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
                </React.Fragment>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
