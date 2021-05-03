/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-groovy';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-clouds_midnight';

import List from '@material-ui/core/List';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { updateFilterList } from '../redux/actions';
import { PopupInfo, PopupWithInput } from './popup';

import { FormattedMessage } from 'react-intl';
import {
    deleteFilterByName,
    getFilterByName,
    getFilters,
    renameFilterByName,
    saveFilter,
} from '../utils/rest-api';
import { ScriptTypes } from '../utils/script-types';
import { useSnackbar } from 'notistack';
import { CustomListItem } from './custom-list-item';
import { GenericFilter } from './generic-filter';
import { CircularProgress } from '@material-ui/core';

const useStyles = makeStyles(() => ({
    addNewList: {
        textAlign: 'center',
        padding: '10px 15px',
        minHeight: '80px',
        marginTop: '12px',
        display: 'inline',
        alignSelf: 'flex-start',
        flexGrow: '0',
        fontSize: '12px',
    },
    containerButtons: {
        display: 'inline',
        position: 'fixed',
        bottom: '0',
        textAlign: 'center',
        padding: '15px 20px',
        width: '350px',
    },
    aceEditor: {
        display: 'inline-flex',
        width: '100% !important',
        height: '100% !important',
        margin: '0',
    },
    root: {
        margin: '0',
        width: '100%',
        height: 'calc(100vh - 118px)', // TODO change for more elegant solution
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'row',
    },
    smallContainer: {
        display: 'flex',
        minWidth: '80px',
        textAlign: 'center',
        marginTop: '10px',
        flexGrow: 1,
        borderRight: '1px solid #ccc',
    },
    bigContainer: {
        display: 'flex',
        width: '350px',
        flexDirection: 'column',
        borderRight: '1px solid #ccc',
    },
    chevronLeft: {
        alignSelf: 'end',
        margin: '8px 3px 0',
        position: 'fixed',
    },
    chevronRight: {
        alignSelf: 'start',
        margin: '8px 3px 0',
        position: 'fixed',
    },
    editors: {
        display: 'block',
        position: 'relative',
        width: '100% !important',
        height: '100% !important',
    },
    list: {
        borderTop: '1px solid #ccc',
        height: '100%',
    },
}));

const FilterList = () => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const selectedTheme = useSelector((state) => state.theme);

    const filterList = useSelector((state) => state.filterList);
    const currentEdit = useRef(null);
    const [currentItemName, setCurrentItemName] = useState('');
    const [originalFilter, setOriginalFilter] = useState({});

    const [btnSaveListDisabled, setBtnSaveListDisabled] = useState(true);
    const [openPopupNewList, setOpenPopupNewList] = useState(false);
    const [showContainerList, setShowContainerList] = useState(true);

    /**
     * Show snackbar notification
     * @param messagedId
     * @param variant
     */
    const showSnackBarNotification = useCallback(
        (message) => {
            enqueueSnackbar(message, {
                variant: 'error',
            });
        },
        [enqueueSnackbar]
    );

    useEffect(() => setBtnSaveListDisabled(originalFilter.transient !== true), [
        originalFilter,
    ]);

    /*
     * Add new list handler
     */
    const handleAddNewFilterClicked = (val) => {
        setOpenPopupNewList(val);
    };

    const updateFilterListAndSelect = (selected) => {
        return getFilters().then((data) => {
            setCurrentItemName(selected);
            dispatch(updateFilterList(data));
            getFilter(selected);
        });
    };

    /**
     * Rename exist list
     * @param oldName
     * @param newName
     */
    const renameList = (oldName, newName) => {
        renameFilterByName(oldName, newName)
            .then((response) => {
                if (response.ok) {
                    updateFilterListAndSelect(newName).then();
                } else {
                    showSnackBarNotification(response.statusText);
                }
            })
            .catch((error) => {
                showSnackBarNotification(error.message);
            });
    };

    function setCurrentEdit(remoteFilter) {
        currentEdit.current = { ...remoteFilter };
        setOriginalFilter(remoteFilter);
    }

    /**
     * Save current list list
     */
    const save = () => {
        saveFilter(currentEdit.current)
            .then(() => updateFilterListAndSelect(currentEdit.current.name))
            .catch((error) => {
                showSnackBarNotification(error.message);
            });
    };

    /**
     * Cancel update list
     */
    const cancelSaveList = () => {
        if (originalFilter !== null) setCurrentEdit(originalFilter);
    };

    const newFilter = (name, type) => {
        let newFilterList = [...filterList];
        setCurrentItemName(name);
        const newFilter = {
            name: name,
            type: type === ScriptTypes.SCRIPT ? type : 'LINE',
            transient: true,
        };
        newFilterList.push(newFilter);
        dispatch(updateFilterList(newFilterList));
        setCurrentEdit(newFilter);
    };

    /**
     * Set name of for the Ace Editor : if theme is light set "github theme" else set "clouds_midnight theme"
     *
     * */
    let themeForAceEditor = () => {
        return selectedTheme === 'Light'
            ? 'github'
            : selectedTheme === 'Dark'
            ? 'clouds_midnight'
            : '';
    };

    /**
     * Delete list by name
     */
    const confirmDeleteFilter = () => {
        if (currentItemName) {
            deleteFilterByName(currentItemName)
                .then(() => {
                    updateFilterListAndSelect('').then();
                })
                .catch((error) => {
                    showSnackBarNotification(error.message);
                });
        }
    };

    /**
     * On change editor, check if data is the same to disabled submit button
     * @param newScript
     */
    const onChangeAceEditor = (newScript) => {
        currentEdit.current.script = newScript;
        setBtnSaveListDisabled(originalFilter.script === newScript);
    };

    function onChange(newVal) {
        currentEdit.current = newVal;
        currentEdit.current.name = currentItemName;
        setBtnSaveListDisabled(false);
    }

    const getFilter = useCallback(
        (name) => {
            getFilterByName(name)
                .then(setCurrentEdit)
                .catch((error) => {
                    showSnackBarNotification(error.message);
                });
        },
        [showSnackBarNotification]
    );

    const handleItemClicked = (item) => {
        setCurrentItemName(item.name);
        getFilter(item.name);
    };

    const collapseList = () => {
        setShowContainerList(!showContainerList);
    };

    useEffect(() => {
        getFilters()
            .then((filters) => dispatch(updateFilterList(filters)))
            .catch((e) => showSnackBarNotification(e.message));
    }, [dispatch, showSnackBarNotification]);

    const renderAddNewListPopup = () => (
        <PopupWithInput
            open={openPopupNewList}
            onClose={() => setOpenPopupNewList(false)}
            title={<FormattedMessage id="addNewFilter" />}
            inputLabelText={<FormattedMessage id="FilterName" />}
            customTextValidationBtn={<FormattedMessage id="create" />}
            customTextCancelBtn={<FormattedMessage id="cancel" />}
            existingList={filterList}
            action={({ name, type }) => newFilter(name, type)}
            newList={true}
        />
    );

    const actions = {
        renameFilter: ({ ...props }) => (
            <PopupWithInput
                title={<FormattedMessage id="renameFilter" />}
                inputLabelText={<FormattedMessage id="newFilterName" />}
                customTextValidationBtn={<FormattedMessage id="rename" />}
                customTextCancelBtn={<FormattedMessage id="cancel" />}
                newList={false}
                existingList={filterList}
                action={({ name }) => renameList(currentItemName, name)}
                {...props}
            />
        ),
        deleteFilter: ({ ...props }) => (
            <PopupInfo
                title={<FormattedMessage id="deleteFilter" />}
                customAlertMessage={
                    <FormattedMessage id="alertBeforeDeleteFilter" />
                }
                existingList={filterList}
                customTextValidationBtn={<FormattedMessage id="delete" />}
                handleBtnOk={confirmDeleteFilter}
                {...props}
            />
        ),
    };

    function renderList() {
        return (
            <>
                <Button
                    className={classes.addNewList}
                    onClick={() => handleAddNewFilterClicked(true)}
                    size={'large'}
                    startIcon={<AddIcon />}
                >
                    <FormattedMessage id="newFilter" />
                </Button>
                {filterList == null ? (
                    <CircularProgress />
                ) : (
                    <List className={classes.list}>
                        {filterList.map((item) => (
                            <CustomListItem
                                key={'cli' + item.name}
                                selected={item.name === currentItemName}
                                item={item}
                                handleItemClicked={handleItemClicked}
                                actions={actions}
                            />
                        ))}
                    </List>
                )}
                <div className={classes.containerButtons}>
                    <Button
                        style={{ marginRight: '15px' }}
                        disabled={btnSaveListDisabled}
                        onClick={() => cancelSaveList()}
                    >
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        variant="outlined"
                        disabled={btnSaveListDisabled}
                        onClick={() => save()}
                    >
                        <FormattedMessage id="save" />
                    </Button>
                </div>
            </>
        );
    }

    function renderEditor() {
        if (!originalFilter.name) return;
        /* we have item selected but original is not set so we are fetching */
        if (originalFilter.name !== currentItemName) {
            return <CircularProgress />;
        }
        if (originalFilter.type === ScriptTypes.SCRIPT)
            return (
                <AceEditor
                    className={classes.aceEditor}
                    mode="groovy"
                    placeholder="Insert your groovy script here"
                    theme={themeForAceEditor()}
                    onChange={(val) => onChangeAceEditor(val)}
                    defaultValue={originalFilter.script}
                    fontSize="18px"
                    editorProps={{ $blockScrolling: true }}
                />
            );
        return (
            <GenericFilter initialFilter={originalFilter} onChange={onChange} />
        );
    }

    return (
        <div className={classes.root}>
            <div
                className={
                    showContainerList
                        ? classes.bigContainer
                        : classes.smallContainer
                }
            >
                <IconButton
                    onClick={collapseList}
                    className={
                        showContainerList
                            ? classes.chevronLeft
                            : classes.chevronRight
                    }
                >
                    {showContainerList ? (
                        <ChevronLeftIcon style={{ fontSize: '40px' }} />
                    ) : (
                        <ChevronRightIcon style={{ fontSize: '40px' }} />
                    )}
                </IconButton>
                {showContainerList && renderList()}
                <div />
            </div>
            <div className={classes.editors}>
                {renderEditor()}
                {renderAddNewListPopup()}
            </div>
        </div>
    );
};

export default FilterList;
