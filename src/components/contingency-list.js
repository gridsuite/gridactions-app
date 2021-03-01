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
} from '../utils/rest-api';
import { scriptTypes } from '../utils/script-types';
import { equipmentTypes } from '../utils/equipment-types';
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

const NewFileCreatedList = withStyles(() => ({
    root: {
        padding: '0',
    },
}))(List);

const StyledMenu = withStyles({
    paper: {
        border: '1px solid #d3d4d5',
        marginTop: '67px',
        marginLeft: '-88px',
        boxShadow: 'none',
    },
})(Menu);

const ContingencyLists = () => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const dispatch = useDispatch();
    const selectedTheme = useSelector((state) => state.theme);

    const contingencyLists = useSelector((state) => state.contingencyLists);
    const [currentItemType, setCurrentItemType] = useState(null);
    const [currentItemName, setCurrentItemName] = useState(null);
    const [currentScriptContingency, setCurrentScriptContingency] = useState(
        null
    );
    const [currentFiltersContingency, setCurrentFiltersContingency] = useState(
        null
    );
    const [selectedIndex, setSelectedIndex] = useState(null);

    const [btnSaveListDisabled, setBtnSaveListDisabled] = useState(true);

    const [aceEditorContent, setAceEditorContent] = useState('');

    const [newListCreated, setNewListCreated] = useState(false);
    const [newListName, setNewListName] = useState(null);

    const [alertEmptyList, setAlertEmptyList] = useState(true);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const [openPopupNewList, setOpenPopupNewList] = useState(false);
    const [openPopupRenameList, setOpenPopupRenameList] = useState(false);
    const [openPopupInfo, setOpenPopupInfo] = useState(false);
    const [openPopupConfirmDelete, setOpenPopupConfirmDelete] = useState(false);

    const [equipmentID, setEquipmentID] = useState('*');
    const [equipmentName, setEquipmentName] = useState('*');
    const [equipmentType, setEquipmentType] = useState(equipmentTypes.LINE);
    const [nominalVoltageOperator, setNominalVoltageOperator] = useState('=');
    const [nominalVoltage, setNominalVoltage] = useState('');
    const [countries, setCountries] = useState([]);
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
     * On click in item on the list
     * @param item
     * @param index
     */
    const handleListItemClicked = (item, index) => {
        if (newListCreated) {
            setOpenPopupInfo(true);
        } else {
            setSelectedIndex(index);
            setCurrentItemName(item.name);
            setCurrentItemType(item.type);
            setBtnSaveListDisabled(true);
        }
    };

    /**
     * Handler open dialog
     */
    const handleOpenPopupAddNewList = () => {
        setOpenPopupNewList(true);
    };

    /**
     * Add new list name
     * @param name
     * @param type
     */
    const addNewList = (name, type) => {
        if (type === 'SCRIPT') {
            setAceEditorContent('');
            setCurrentItemType('SCRIPT');
        } else {
            setCurrentFiltersContingency(null);
            setCurrentItemType(scriptTypes.FILTERS);
        }
        setNewListName(name);
        setNewListCreated(true);
        setSelectedIndex(null);
        setAlertEmptyList(false);
        setOpenPopupNewList(false);
        setBtnSaveListDisabled(false);
    };

    /**
     * Rename exist list
     * @param oldName
     * @param newName
     */
    const renameExistList = (oldName, newName) => {
        renameListByName(oldName, newName)
            .then((response) => {
                if (response.ok) {
                    getAllContingencyLists();
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
     * Alert : Add the script and save the new list
     */
    const createListBeforeExit = () => {
        saveNewList();
        setOpenPopupInfo(false);
    };

    /**
     * Alert : Cancel create new list
     */
    const cancelCreateListBeforeExit = () => {
        setNewListCreated(false);
        setOpenPopupInfo(false);
        setBtnSaveListDisabled(true);
        setCurrentItemType(null);
    };

    /**
     * Save new list added: submit name and script
     */
    const saveNewListResponse = () => {
        if (currentItemType === scriptTypes.FILTERS) {
            if (currentFiltersContingency !== null) {
                currentFiltersContingency.equipmentID = equipmentID;
                currentFiltersContingency.equipmentName = equipmentName;
                currentFiltersContingency.nominalVoltage = nominalVoltage;
                currentFiltersContingency.nominalVoltageOperator = nominalVoltageOperator;
                currentFiltersContingency.equipmentType = equipmentType;
                currentFiltersContingency.countries = countries;
            }
            return addFiltersContingencyList(
                newListCreated ? newListName : currentItemName,
                equipmentID,
                equipmentName,
                equipmentType,
                nominalVoltage,
                nominalVoltageOperator,
                countries
            );
        } else {
            return addScriptContingencyList(
                newListCreated ? newListName : currentItemName,
                aceEditorContent
            );
        }
    };

    const saveNewList = () => {
        saveNewListResponse().then(() => {
            getContingencyLists()
                .then((data) => {
                    const index = data.findIndex(
                        (element) => element.name === newListName
                    );
                    setSelectedIndex(index);
                    setBtnSaveListDisabled(true);
                    setNewListCreated(false);
                    dispatch(updateContingencyList(data));
                })
                .catch((error) => {
                    showSnackBarNotification(error.message);
                });
        });
    };

    /**
     * Cancel create list, reset editor and hide new name from list
     */
    const cancelNewList = () => {
        setCurrentItemType(null);
        setNewListCreated(false);
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
     * Fetch the script by name in contingency lists
     * @param itemIndex
     */
    const fetchScriptByNameList = (itemIndex) => {
        let script = '';
        contingencyLists.map((item, index) => {
            if (index + 1 === itemIndex + 1) {
                script = item.script;
            }
            return setAceEditorContent(script);
        });
    };

    /**
     * Show popup confirm delete list
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
        if (currentItemName) {
            if (
                contingencyLists !== null &&
                contingencyLists.length === selectedIndex + 1
            ) {
                setSelectedIndex(selectedIndex - 1);
                fetchScriptByNameList(selectedIndex - 1);
            } else {
                setSelectedIndex(selectedIndex);
                fetchScriptByNameList(selectedIndex + 1);
            }
            setOpenPopupConfirmDelete(false);
            deleteListByName(currentItemName)
                .then(() => {
                    getContingencyLists()
                        .then((data) => {
                            dispatch(updateContingencyList(data));
                            if (data.length > 0) {
                                dispatch(updateContingencyList(data));
                            } else {
                                setCurrentItemType(null);
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
     * Cancel delete list
     */
    const cancelDeleteList = () => {
        setOpenPopupConfirmDelete(false);
    };

    const handleOpenMenu = (event, name) => {
        setAnchorEl(event.currentTarget);
        setCurrentItemName(name);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleRenameList = () => {
        setAnchorEl(null);
        setOpenPopupRenameList(true);
    };

    /**
     * On change editor, check if data is the same to disabled submit button
     * @param newScript
     * @param newScript
     */
    const onChangeAceEditor = (newScript) => {
        setAceEditorContent(newScript);
        if (
            (newListName != null && newScript !== '') ||
            (currentScriptContingency !== null &&
                newScript !== currentScriptContingency.script)
        ) {
            setBtnSaveListDisabled(false);
        } else {
            setBtnSaveListDisabled(true);
        }
    };

    function onChangeFiltersContingency(
        equipmentID,
        equipmentName,
        equipmentType,
        nominalVoltageOperator,
        nominalVoltage,
        newCountries
    ) {
        if (currentFiltersContingency !== null) {
            if (
                equipmentID !== currentFiltersContingency.equipmentID ||
                equipmentName !== currentFiltersContingency.equipmentName ||
                equipmentType !== currentFiltersContingency.equipmentType ||
                nominalVoltageOperator !==
                    currentFiltersContingency.nominalVoltageOperator ||
                nominalVoltage !== currentFiltersContingency.nominalVoltage ||
                newCountries !== currentFiltersContingency.countries
            ) {
                setBtnSaveListDisabled(false);
            } else {
                setBtnSaveListDisabled(true);
            }
        } else {
            setBtnSaveListDisabled(false);
        }
        setEquipmentID(equipmentID);
        setEquipmentName(equipmentName);
        setEquipmentType(equipmentType);
        setNominalVoltageOperator(nominalVoltageOperator);
        setNominalVoltage(nominalVoltage);
        setCountries(newCountries);
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
                        if (currentItemType === scriptTypes.SCRIPT) {
                            setCurrentScriptContingency(data);
                        } else {
                            setCurrentFiltersContingency(data);
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
        if (currentScriptContingency !== null) {
            setAceEditorContent(currentScriptContingency.script);
        }
    }, [currentScriptContingency]);

    useEffect(() => {
        if (currentItemName !== null) {
            getCurrentContingencyList(currentItemType, currentItemName);
        }
    }, [getCurrentContingencyList, currentItemType, currentItemName]);

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
                                onClick={() => handleOpenPopupAddNewList()}
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
                                                    handleListItemClicked(
                                                        item,
                                                        index
                                                    )
                                                }
                                            >
                                                <div
                                                    className={classes.iconList}
                                                >
                                                    {item.type ===
                                                        scriptTypes.FILTERS && (
                                                        <PanToolIcon />
                                                    )}
                                                    {item.type ===
                                                        scriptTypes.SCRIPT && (
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
                                                        handleOpenMenu(
                                                            event,
                                                            item.name
                                                        )
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

                            {/* Temporary list : new file created */}
                            {newListCreated && (
                                <NewFileCreatedList>
                                    <CustomListItem button selected>
                                        <div className={classes.iconList}>
                                            {currentItemType ===
                                                scriptTypes.FILTERS && (
                                                <PanToolIcon />
                                            )}
                                            {currentItemType ===
                                                scriptTypes.SCRIPT && (
                                                <DescriptionIcon />
                                            )}
                                        </div>
                                        <ListItemText
                                            key={'temporary'}
                                            className={classes.listItemText}
                                            primary={newListName}
                                        />
                                    </CustomListItem>
                                </NewFileCreatedList>
                            )}
                        </div>
                        <div className={classes.containerButtons}>
                            <Button
                                style={{ marginRight: '15px' }}
                                disabled={btnSaveListDisabled}
                                onClick={() => cancelNewList()}
                            >
                                <FormattedMessage id="cancel" />
                            </Button>
                            <Button
                                variant="outlined"
                                disabled={btnSaveListDisabled}
                                onClick={() => saveNewList()}
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
                        onClose={() => setOpenPopupNewList(false)}
                        title={<FormattedMessage id="addNewContencyFile" />}
                        inputLabelText={<FormattedMessage id="listName" />}
                        customTextValidationBtn={
                            <FormattedMessage id="create" />
                        }
                        customTextCancelBtn={<FormattedMessage id="cancel" />}
                        handleSaveNewList={addNewList}
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
                        handleRenameExistList={renameExistList}
                        selectedListName={currentItemName}
                        newList={false}
                    />
                    {/* Alert to save temporary list before switch to another */}
                    <PopupInfo
                        open={openPopupInfo}
                        onClose={() => setOpenPopupInfo(false)}
                        title={<FormattedMessage id="saveNewListTitle" />}
                        customAlertMessage={
                            <FormattedMessage id="saveNewListMsg" />
                        }
                        customTextValidationBtn={
                            <FormattedMessage id="create" />
                        }
                        handleBtnSave={createListBeforeExit}
                        handleBtnCancel={cancelCreateListBeforeExit}
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
                </div>
            </div>

            <div className={classes.aceEditor}>
                {currentItemType === scriptTypes.FILTERS && (
                    <FiltersEditor
                        item={currentFiltersContingency}
                        onChange={onChangeFiltersContingency}
                    />
                )}

                {currentItemType === scriptTypes.SCRIPT && (
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
