/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-groovy';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-clouds_midnight';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Alert from '@material-ui/lab/Alert';

import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import DescriptionIcon from '@material-ui/icons/Description';
import PanToolIcon from '@material-ui/icons/PanTool';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FiltersEditor from './filters-editor';
import { updateContingencyList } from '../redux/actions';
import { PopupWithInput, PopupInfo } from './popup';

import { makeStyles } from '@material-ui/core/styles';

import { FormattedMessage } from 'react-intl';
import {
    getContingencyLists,
    addScriptContingencyList,
    deleteListByName,
    renameListByName,
    addFiltersContingencyList,
    getContingencyList,
    replaceFiltersWithScriptContingencyList,
    newScriptFromFiltersContingencyList,
} from '../utils/rest-api';
import { ScriptTypes } from '../utils/script-types';
import { EquipmentTypes } from '../utils/equipment-types';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '0',
    },
    container: {
        display: 'flex',
        margin: '0',
        position: 'absolute',
        width: '100%',
        top: '70px',
        height: 'calc(100vh - 70px)',
    },
    containerLists: {
        width: '350px',
    },
    smallContainer: {
        minWidth: '80px',
        textAlign: 'center',
        marginTop: '10px',
    },
    contingencyTitle: {
        padding: '15px 10px 10px 15px',
        margin: '0 0 16px 0',
        textAlign: 'left',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    addNewList: {
        textAlign: 'center',
        padding: '10px 15px',
        borderBottom: '1px solid #ccc',
        minHeight: '80px',
        marginTop: '12px',
    },
    editor: {
        width: '100% !important',
        height: '100% !important',
        margin: 'auto',
    },
    containerAddNewList: {
        display: 'grid',
        cursor: 'pointer',
        float: 'left',
    },
    svgIcon: {
        cursor: 'pointer',
    },
    svgLabel: {
        fontSize: '12px',
        position: 'relative',
        top: '-3px',
    },
    alert: {
        color: 'rgb(97, 26, 21)',
        backgroundColor: 'rgb(253, 236, 234)',
        maxWidth: '325px',
        margin: '0 auto',
    },
    aceEditor: {
        marginTop: '4px',
        borderLeft: '1px solid #ccc',
        flexGrow: 1,
    },
    containerButtons: {
        position: 'fixed',
        bottom: '0',
        textAlign: 'center',
        padding: '15px 20px',
        width: '350px',
    },
    listItemText: {
        padding: '15px 25px 15px',
        margin: '0',
        overflow: 'hidden',
    },
    contingencyLists: {
        overflowY: 'auto',
        height: 'calc(100vh - 310px)',
        width: '350px',
    },
    chevronLeft: {
        float: 'right',
        margin: '8px 3px 0',
        color: theme.palette.type === 'light' ? '#000' : '#fff',
    },
    chevronRight: {
        color: theme.palette.type === 'light' ? '#000' : '#fff',
    },
    iconList: {
        margin: '0 15px 0 10px',
    },
}));

const CustomListItem = withStyles(() => ({
    root: {
        margin: '0',
        textTransform: 'capitalize',
        padding: '0',
    },
    selected: {
        backgroundColor: '#000',
        margin: '0',
    },
}))(ListItem);

const StyledMenu = withStyles({
    paper: {
        border: '1px solid #d3d4d5',
        marginTop: '67px',
        marginLeft: '-88px',
        boxShadow: 'none',
    },
})(Menu);

const emptyFiltersContingency = {
    equipmentID: '*',
    equipmentName: '*',
    equipmentType: EquipmentTypes.LINE,
    nominalVoltageOperator: '=',
    nominalVoltage: '',
    countries: [],
};

const ContingencyLists = () => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const selectedTheme = useSelector((state) => state.theme);

    const contingencyLists = useSelector((state) => state.contingencyLists);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentScriptContingency, setCurrentScriptContingency] = useState(
        null
    );
    const [currentFiltersContingency, setCurrentFiltersContingency] = useState(
        null
    );

    const [selectedIndex, setSelectedIndex] = useState(null);

    const [btnSaveListDisabled, setBtnSaveListDisabled] = useState(true);

    const [aceEditorContent, setAceEditorContent] = useState('');

    const [alertEmptyList, setAlertEmptyList] = useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const [openPopupNewList, setOpenPopupNewList] = useState(false);
    const [openPopupRenameList, setOpenPopupRenameList] = useState(false);
    const [openPopupConfirmDelete, setOpenPopupConfirmDelete] = useState(false);

    const [newFiltersContingency, setNewFiltersContingency] = useState(
        emptyFiltersContingency
    );

    const [
        openPopupReplaceWithScriptList,
        setOpenPopupReplaceWithScriptList,
    ] = useState(false);
    const [openPopupCopyToScriptList, setOpenPopupCopyToScriptList] = useState(
        false
    );

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

    /**
     * On click on contingency list item
     * @param item
     * @param index
     */
    const handleContingencyListItemClicked = (item, index) => {
        setSelectedIndex(index);
        setCurrentItem(item);
        setBtnSaveListDisabled(true);
    };

    /**
     * Add new list handler
     */
    const handleAddNewListClicked = (val) => {
        setOpenPopupNewList(val);
    };

    /**
     * Rename exist list
     * @param oldName
     * @param newName
     */
    const renameList = (oldName, newName) => {
        renameListByName(oldName, newName)
            .then((response) => {
                if (response.ok) {
                    getAllContingencyLists();
                    setCurrentItem({ name: newName, type: currentItem.type });
                } else {
                    showSnackBarNotification(response.statusText);
                }
            })
            .catch((error) => {
                showSnackBarNotification(error.message);
            });
        setOpenPopupRenameList(false);
    };

    /**
     * Save new list response if list type is filters or script
     * @param name
     * @param type
     * @param isNewList
     * @returns {Promise<Response>}
     */
    const saveListResponse = (name, type, isNewList) => {
        if (isNewList) {
            if (type === ScriptTypes.FILTERS) {
                setCurrentFiltersContingency(null);
                return addFiltersContingencyList(name, emptyFiltersContingency);
            } else {
                setAceEditorContent('');
                setCurrentScriptContingency(null);
                return addScriptContingencyList(name, '');
            }
        } else {
            if (type === ScriptTypes.FILTERS) {
                return addFiltersContingencyList(name, newFiltersContingency);
            } else {
                return addScriptContingencyList(name, aceEditorContent);
            }
        }
    };

    /**
     * Save list
     * @param name
     * @param type
     * @param isNewList
     */
    const saveList = (name, type, isNewList) => {
        saveListResponse(name, type, isNewList).then(() => {
            getContingencyLists()
                .then((data) => {
                    const index = data.findIndex((element) => {
                        if (element.name === name) {
                            setCurrentItem(element);
                            return element;
                        }
                        return null;
                    });
                    setSelectedIndex(index);
                    setBtnSaveListDisabled(true);
                    setOpenPopupNewList(false);
                    dispatch(updateContingencyList(data));
                })
                .catch((error) => {
                    showSnackBarNotification(error.message);
                });
        });
    };

    /**
     * Cancel update list
     */
    const cancelSaveList = () => {
        if (
            currentItem.type === ScriptTypes.FILTERS &&
            currentFiltersContingency !== null
        ) {
            setNewFiltersContingency(currentFiltersContingency);
        }

        if (
            currentItem.type === ScriptTypes.SCRIPT &&
            currentScriptContingency !== null
        ) {
            setAceEditorContent(currentScriptContingency.script);
        }

        setBtnSaveListDisabled(true);
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
     * Show popup to confirm list deletion
     */
    const handleDeleteList = () => {
        setAnchorEl(null);
        setOpenPopupConfirmDelete(true);
    };

    /**
     * Delete list by name
     */
    const confirmDeleteList = () => {
        setAnchorEl(null);
        if (currentItem) {
            setOpenPopupConfirmDelete(false);
            deleteListByName(currentItem.name)
                .then(() => {
                    getContingencyLists()
                        .then((data) => {
                            dispatch(updateContingencyList(data));
                            if (data.length > 0) {
                                dispatch(updateContingencyList(data));
                                setSelectedIndex(0);
                                setCurrentItem(data[0]);
                            } else {
                                setCurrentItem(null);
                                setAlertEmptyList(true);
                            }
                        })
                        .catch((error) => {
                            showSnackBarNotification(error.message);
                        });
                })
                .catch((error) => {
                    showSnackBarNotification(error.message);
                });
        }
    };

    /**
     * Replace list with groovy script
     */
    const confirmReplaceWithScriptList = () => {
        setAnchorEl(null);
        replaceFiltersWithScriptContingencyList(currentItem.name)
            .then((response) => {
                if (response.ok) {
                    getContingencyLists().then((data) => {
                        setCurrentItem({
                            name: currentItem.name,
                            type: ScriptTypes.SCRIPT,
                        });
                        setBtnSaveListDisabled(true);
                        dispatch(updateContingencyList(data));
                    });
                } else {
                    showSnackBarNotification(response.statusText);
                }
            })
            .catch((error) => {
                showSnackBarNotification(error.message);
            });
        setOpenPopupReplaceWithScriptList(false);
    };

    const cancelReplaceWithScriptList = () => {
        setOpenPopupReplaceWithScriptList(false);
    };

    /**
     * Copy to script list
     * @param name
     * @param newName
     */
    const copyToScriptList = (name, newName) => {
        newScriptFromFiltersContingencyList(name, newName)
            .then((response) => {
                if (response.ok) {
                    getContingencyLists().then((data) => {
                        const index = data.findIndex((element) => {
                            if (
                                element.name === newName &&
                                element.type === ScriptTypes.SCRIPT
                            ) {
                                setCurrentItem({
                                    name: newName,
                                    type: ScriptTypes.SCRIPT,
                                });
                                return element;
                            }
                            return null;
                        });
                        setSelectedIndex(index);
                        setBtnSaveListDisabled(true);
                        dispatch(updateContingencyList(data));
                    });
                } else {
                    showSnackBarNotification(response.statusText);
                }
            })
            .catch((error) => {
                showSnackBarNotification(error.message);
            });
        setOpenPopupCopyToScriptList(false);
    };

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleRenameList = () => {
        setAnchorEl(null);
        setOpenPopupRenameList(true);
    };

    const cancelDeleteList = () => {
        setOpenPopupConfirmDelete(false);
    };

    const handleReplaceWithScriptList = () => {
        setAnchorEl(null);
        setOpenPopupReplaceWithScriptList(true);
    };

    const handleCopyToScriptList = () => {
        setAnchorEl(null);
        setOpenPopupCopyToScriptList(true);
    };

    /**
     * On change editor, check if data is the same to disabled submit button
     * @param newScript
     * @param newScript
     */
    const onChangeAceEditor = (newScript) => {
        setAceEditorContent(newScript);
        if (
            currentScriptContingency !== null &&
            newScript !== currentScriptContingency.script
        ) {
            setBtnSaveListDisabled(false);
        } else {
            setBtnSaveListDisabled(true);
        }
    };

    function onChangeFiltersContingency(newFiltersContingency) {
        if (currentFiltersContingency !== null) {
            if (
                newFiltersContingency.equipmentID !==
                    currentFiltersContingency.equipmentID ||
                newFiltersContingency.equipmentName !==
                    currentFiltersContingency.equipmentName ||
                newFiltersContingency.equipmentType !==
                    currentFiltersContingency.equipmentType ||
                newFiltersContingency.nominalVoltageOperator !==
                    currentFiltersContingency.nominalVoltageOperator ||
                newFiltersContingency.nominalVoltage !==
                    currentFiltersContingency.nominalVoltage + '' ||
                newFiltersContingency.countries.sort().join(',') !==
                    currentFiltersContingency.countries.sort().join(',')
            ) {
                setBtnSaveListDisabled(false);
            } else {
                setBtnSaveListDisabled(true);
            }
        } else {
            setBtnSaveListDisabled(false);
        }
        setNewFiltersContingency(newFiltersContingency);
    }

    /**
     * Get all contingency lists on load page
     **/
    const getAllContingencyLists = useCallback(() => {
        getContingencyLists()
            .then((data) => {
                if (data) {
                    dispatch(updateContingencyList(data));
                }
            })
            .catch((error) => {
                showSnackBarNotification(error.message);
            });
    }, [dispatch, showSnackBarNotification]);

    const getCurrentContingencyList = useCallback(
        (currentItemType, currentItemName) => {
            getContingencyList(currentItemType, currentItemName)
                .then((data) => {
                    if (data) {
                        if (currentItemType === ScriptTypes.SCRIPT) {
                            setCurrentScriptContingency(data);
                            setAceEditorContent(data.script);
                        } else {
                            setCurrentFiltersContingency(data);
                            setNewFiltersContingency(data);
                        }
                    }
                })
                .catch((error) => {
                    showSnackBarNotification(error.message);
                });
        },
        [showSnackBarNotification]
    );

    const collapseList = () => {
        setShowContainerList(!showContainerList);
    };

    useEffect(() => {
        getAllContingencyLists();
    }, [getAllContingencyLists]);

    useEffect(() => {
        if (currentItem !== null) {
            getCurrentContingencyList(currentItem.type, currentItem.name);
        }
    }, [getCurrentContingencyList, currentItem]);

    return (
        <div className={classes.container}>
            <div
                className={
                    showContainerList
                        ? classes.containerLists
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
                {showContainerList && (
                    <>
                        <div className={classes.addNewList}>
                            <div
                                className={classes.containerAddNewList}
                                onClick={() => handleAddNewListClicked(true)}
                            >
                                <label className={classes.svgIcon}>
                                    <AddIcon
                                        aria-label="New file"
                                        style={{ fontSize: 36 }}
                                    />
                                </label>
                                <span className={classes.svgLabel}>
                                    <FormattedMessage id="newList" />
                                </span>
                            </div>
                        </div>
                        <h3 className={classes.contingencyTitle}>
                            <FormattedMessage id="contingencyTitle" />
                        </h3>
                        <div className={classes.contingencyLists}>
                            {contingencyLists.length > 0 ? (
                                <List className={classes.root}>
                                    {contingencyLists.map((item, index) => (
                                        <div key={item.name + 'div'}>
                                            <CustomListItem
                                                button
                                                key={item.name}
                                                selected={
                                                    selectedIndex === index
                                                }
                                                onClick={() =>
                                                    handleContingencyListItemClicked(
                                                        item,
                                                        index
                                                    )
                                                }
                                            >
                                                <div
                                                    className={classes.iconList}
                                                >
                                                    {item.type ===
                                                        ScriptTypes.FILTERS && (
                                                        <PanToolIcon />
                                                    )}
                                                    {item.type ===
                                                        ScriptTypes.SCRIPT && (
                                                        <DescriptionIcon />
                                                    )}
                                                </div>
                                                <ListItemText
                                                    className={
                                                        classes.listItemText
                                                    }
                                                    primary={item.name}
                                                />
                                                <IconButton
                                                    aria-label="settings"
                                                    aria-controls="list-menu"
                                                    aria-haspopup="true"
                                                    variant="contained"
                                                    onClick={(event) =>
                                                        handleOpenMenu(event)
                                                    }
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </CustomListItem>
                                            <StyledMenu
                                                id="list-menu"
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl)}
                                                onClose={handleCloseMenu}
                                            >
                                                <MenuItem
                                                    onClick={() =>
                                                        handleRenameList()
                                                    }
                                                >
                                                    <ListItemIcon>
                                                        <EditIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <FormattedMessage id="rename" />
                                                        }
                                                    />
                                                </MenuItem>
                                                <MenuItem
                                                    onClick={handleDeleteList}
                                                >
                                                    <ListItemIcon>
                                                        <DeleteIcon fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <FormattedMessage id="delete" />
                                                        }
                                                    />
                                                </MenuItem>
                                                {currentItem !== null &&
                                                    currentItem.type ===
                                                        ScriptTypes.FILTERS && (
                                                        <div>
                                                            <MenuItem
                                                                onClick={() =>
                                                                    handleReplaceWithScriptList()
                                                                }
                                                            >
                                                                <ListItemIcon>
                                                                    <InsertDriveFileIcon fontSize="small" />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={
                                                                        <FormattedMessage id="replaceWithScript" />
                                                                    }
                                                                />
                                                            </MenuItem>

                                                            <MenuItem
                                                                onClick={() =>
                                                                    handleCopyToScriptList()
                                                                }
                                                            >
                                                                <ListItemIcon>
                                                                    <FileCopyIcon fontSize="small" />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    primary={
                                                                        <FormattedMessage id="copyToScript" />
                                                                    }
                                                                />
                                                            </MenuItem>
                                                        </div>
                                                    )}
                                            </StyledMenu>
                                        </div>
                                    ))}
                                </List>
                            ) : alertEmptyList ? (
                                <Alert
                                    severity="error"
                                    className={classes.alert}
                                >
                                    <FormattedMessage id="contingencyListIsEmpty" />
                                </Alert>
                            ) : (
                                ''
                            )}
                        </div>
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
                                onClick={() =>
                                    saveList(
                                        currentItem.name,
                                        currentItem.type,
                                        false
                                    )
                                }
                            >
                                <FormattedMessage id="save" />
                            </Button>
                        </div>
                    </>
                )}

                {/* Dialog */}
                <div>
                    {/* Popup for add new list */}
                    <PopupWithInput
                        open={openPopupNewList}
                        onClose={() => handleAddNewListClicked(false)}
                        title={<FormattedMessage id="addNewContencyFile" />}
                        inputLabelText={<FormattedMessage id="listName" />}
                        customTextValidationBtn={
                            <FormattedMessage id="create" />
                        }
                        customTextCancelBtn={<FormattedMessage id="cancel" />}
                        handleSaveNewList={saveList}
                        newList={true}
                    />
                    {/* Popup for rename exist list */}
                    <PopupWithInput
                        open={openPopupRenameList}
                        onClose={() => setOpenPopupRenameList(false)}
                        title={<FormattedMessage id="renameList" />}
                        inputLabelText={<FormattedMessage id="newNameList" />}
                        customTextValidationBtn={
                            <FormattedMessage id="rename" />
                        }
                        customTextCancelBtn={<FormattedMessage id="cancel" />}
                        handleRenameExistList={renameList}
                        selectedListName={currentItem ? currentItem.name : ''}
                        newList={false}
                    />
                    {/* Alert to confirm delete list */}
                    <PopupInfo
                        open={openPopupConfirmDelete}
                        onClose={() => setOpenPopupConfirmDelete(false)}
                        title={<FormattedMessage id="deleteList" />}
                        customAlertMessage={
                            <FormattedMessage id="alertBeforeDeleteList" />
                        }
                        customTextValidationBtn={
                            <FormattedMessage id="delete" />
                        }
                        handleBtnSave={confirmDeleteList}
                        handleBtnCancel={cancelDeleteList}
                    />
                    {/* Alert to confirm replacing filters list to script list */}
                    <PopupInfo
                        open={openPopupReplaceWithScriptList}
                        onClose={() => setOpenPopupReplaceWithScriptList(false)}
                        title={<FormattedMessage id="replaceList" />}
                        customAlertMessage={
                            <FormattedMessage
                                id="alertBeforeReplaceWithScript"
                                values={{ br: <br /> }}
                            />
                        }
                        customTextValidationBtn={
                            <FormattedMessage id="remplacer" />
                        }
                        handleBtnSave={confirmReplaceWithScriptList}
                        handleBtnCancel={cancelReplaceWithScriptList}
                    />
                    {/* Popup for copy filters list to script list */}
                    <PopupWithInput
                        open={openPopupCopyToScriptList}
                        onClose={() => setOpenPopupCopyToScriptList(false)}
                        title={<FormattedMessage id="copyToScript" />}
                        inputLabelText={<FormattedMessage id="newNameList" />}
                        customTextValidationBtn={<FormattedMessage id="copy" />}
                        customTextCancelBtn={<FormattedMessage id="cancel" />}
                        handleCopyToScriptList={copyToScriptList}
                        selectedListName={currentItem ? currentItem.name : ''}
                        newList={false}
                    />
                </div>
            </div>

            <div className={classes.aceEditor}>
                {currentItem && currentItem.type === ScriptTypes.FILTERS && (
                    <FiltersEditor
                        filtersContingency={newFiltersContingency}
                        onChange={onChangeFiltersContingency}
                    />
                )}

                {currentItem && currentItem.type === ScriptTypes.SCRIPT && (
                    <AceEditor
                        className={classes.editor}
                        mode="groovy"
                        placeholder="Insert your groovy script here"
                        theme={themeForAceEditor()}
                        onChange={(val) => onChangeAceEditor(val)}
                        value={aceEditorContent}
                        fontSize="18px"
                        editorProps={{ $blockScrolling: true }}
                    />
                )}
            </div>
        </div>
    );
};

export default ContingencyLists;
