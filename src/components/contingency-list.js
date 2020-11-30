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

import Grid from '@material-ui/core/Grid';

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

const useStyles = makeStyles(() => ({
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
    contentList: {
        marginTop: '20px',
    },
    treeItem: {
        textAlign: 'center !important',
        padding: '5px',
    },
    files: {
        fontSize: '18px',
    },
    contingencyTitle: {
        padding: '15px 10px 10px 15px',
        margin: '0 0 16px 0',
        textAlign: 'left',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    contingencyIcons: {
        textAlign: 'center',
        padding: '10px 10px 5px 10px',
        borderBottom: '1px solid #ccc',
    },
    editor: {
        width: '100% !important',
        height: '100% !important',
        margin: 'auto',
    },
    iconButton: {
        display: 'grid',
    },
    iconSvg: {
        cursor: 'pointer',
    },
    iconLabel: {
        fontSize: '11px',
        position: 'relative',
        top: '-3px',
    },
    addFile: {
        float: 'right',
        cursor: 'pointer',
        position: 'relative',
        top: '4px',
    },
    filesList: {
        listStyle: 'none',
        textAlign: 'left',
        paddingLeft: '15px',
    },
    alert: {
        color: 'rgb(97, 26, 21)',
        backgroundColor: 'rgb(253, 236, 234)',
        margin: '15px',
    },
    aceEditor: {
        marginTop: '4px',
        borderLeft: '1px solid #ccc',
    },
    containerButtons: {
        position: 'fixed',
        bottom: '0',
        textAlign: 'center',
        zIndex: '999',
        padding: 20,
        width: '25%',
    },
    listItemText: {
        padding: '15px 25px 15px',
        margin: '0',
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
    },
})(Menu);

const ContingencyLists = () => {
    const classes = useStyles();
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
    const [alertNotSelectedList, setAlertNotSelectedList] = useState(false);

    const [anchorEl, setAnchorEl] = React.useState(null);

    const [openPopupNewList, setOpenPopupNewList] = useState(false);
    const [openPopupRenameList, setOpenPopupRenameList] = useState(false);
    const [openPopupInfo, setOpenPopupInfo] = useState(false);

    const [equipmentID, setEquipmentID] = useState('*');
    const [equipmentName, setEquipmentName] = useState('*');
    const [equipmentType, setEquipmentType] = useState('*');
    const [nominalVoltageOperator, setNominalVoltageOperator] = useState('=');
    const [nominalVoltage, setNominalVoltage] = useState('*');

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
            setAlertNotSelectedList(false);
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
            setCurrentItemType('FILTERS');
        }
        setNewListName(name);
        setNewListCreated(true);
        setSelectedIndex(null);
        setAlertEmptyList(false);
        setOpenPopupNewList(false);
        setBtnSaveListDisabled(true);
    };

    /**
     * Rename exist list
     * @param oldName
     * @param newName
     */
    const renameExistList = (oldName, newName) => {
        renameListByName(oldName, newName).then((response) => {
            if (response.ok) {
                getAllContingencyLists();
            } else {
                console.error(response.statusText);
            }
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
        if (currentItemType === 'FILTERS') {
            currentFiltersContingency.equipmentID = equipmentID;
            currentFiltersContingency.equipmentName = equipmentName;
            currentFiltersContingency.nominalVoltage = nominalVoltage;
            currentFiltersContingency.nominalVoltageOperator = nominalVoltageOperator;
            currentFiltersContingency.equipmentType = equipmentType;
            return addFiltersContingencyList(
                newListCreated ? newListName : currentItemName,
                equipmentID,
                equipmentName,
                equipmentType,
                nominalVoltage,
                nominalVoltageOperator
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
            getContingencyLists().then((data) => {
                if (data) {
                    data.find((element, index) => {
                        if (element.name === newListName) {
                            setSelectedIndex(index);
                            return 'true';
                        }
                        return 'false';
                    });
                    setBtnSaveListDisabled(true);
                    setNewListCreated(false);
                    dispatch(updateContingencyList(data));
                }
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
     * Delete list by name
     */
    const handleDeleteList = () => {
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

            deleteListByName(currentItemName).then(() => {
                getContingencyLists().then((data) => {
                    dispatch(updateContingencyList(data));
                    if (data.length > 0) {
                        dispatch(updateContingencyList(data));
                    } else {
                        setCurrentItemType(null);
                        setAlertEmptyList(true);
                    }
                });
            });
        } else {
            setAlertNotSelectedList(true);
        }
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
        nominalVoltage
    ) {
        if (currentFiltersContingency !== null) {
            if (
                equipmentID !== currentFiltersContingency.equipmentID ||
                equipmentName !== currentFiltersContingency.equipmentName ||
                equipmentType !== currentFiltersContingency.equipmentType ||
                nominalVoltageOperator !==
                    currentFiltersContingency.nominalVoltageOperator ||
                nominalVoltage !== currentFiltersContingency.nominalVoltage
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
    }

    /**
     * Get all contingency lists on load page
     **/
    const getAllContingencyLists = useCallback(() => {
        getContingencyLists().then((data) => {
            if (data) {
                dispatch(updateContingencyList(data));
            }
        });
    }, [dispatch]);

    const getCurrentContingencyList = useCallback(
        (currentItemType, currentItemName) => {
            getContingencyList(currentItemType, currentItemName).then(
                (data) => {
                    if (data) {
                        if (currentItemType === 'SCRIPT') {
                            setCurrentScriptContingency(data);
                        } else {
                            setCurrentFiltersContingency(data);
                        }
                    }
                }
            );
        },
        []
    );

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
            <Grid container direction="row">
                <Grid xs={3} item={true} className={classes.files}>
                    <Grid
                        container
                        direction="row"
                        className={classes.contingencyIcons}
                        id="contingencyTitle"
                    >
                        <Grid
                            xs={3}
                            item={true}
                            className={classes.iconButton}
                            htmlFor="addContingencyList"
                            style={{ marginTop: '5px' }}
                        >
                            <label className={classes.iconSvg}>
                                <AddIcon
                                    aria-label="New file"
                                    style={{ fontSize: 36 }}
                                    onClick={() => handleOpenPopupAddNewList()}
                                />
                            </label>
                            <span className={classes.iconLabel}>
                                <FormattedMessage id="newList" />
                            </span>
                        </Grid>
                    </Grid>
                    <h3 className={classes.contingencyTitle}>
                        <FormattedMessage id="contingencyTitle" />
                    </h3>
                    {contingencyLists.length > 0 ? (
                        <>
                            <List className={classes.root}>
                                {contingencyLists.map((item, index) => (
                                    <div key={item.name + 'div'}>
                                        <CustomListItem
                                            button
                                            key={item.name}
                                            selected={selectedIndex === index}
                                            onClick={() =>
                                                handleListItemClicked(
                                                    item,
                                                    index
                                                )
                                            }
                                        >
                                            <ListItemText
                                                className={classes.listItemText}
                                                primary={item.name}
                                            />
                                            {item.type === 'FILTERS' && (
                                                <PanToolIcon />
                                            )}
                                            {item.type === 'SCRIPT' && (
                                                <DescriptionIcon />
                                            )}
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
                            {/* To be replaced with snackbar */}
                            {alertNotSelectedList && (
                                <Alert
                                    severity="error"
                                    className={classes.alert}
                                >
                                    <FormattedMessage id="alertDeleteList" />
                                </Alert>
                            )}
                        </>
                    ) : alertEmptyList ? (
                        <Alert severity="error" className={classes.alert}>
                            <FormattedMessage id="contingencyListIsEmpty" />
                        </Alert>
                    ) : (
                        ''
                    )}

                    {/* Temporary list : new file created */}
                    <>
                        {newListCreated && (
                            <NewFileCreatedList>
                                <CustomListItem button selected>
                                    <ListItemText
                                        key={'temporary'}
                                        className={classes.listItemText}
                                        primary={newListName}
                                    />
                                </CustomListItem>
                            </NewFileCreatedList>
                        )}
                    </>

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
                            customTextCancelBtn={
                                <FormattedMessage id="cancel" />
                            }
                            handleSaveNewList={addNewList}
                            newList={true}
                        />
                        {/* Popup for rename exist list */}
                        <PopupWithInput
                            open={openPopupRenameList}
                            onClose={() => setOpenPopupRenameList(false)}
                            title={<FormattedMessage id="renameList" />}
                            inputLabelText={
                                <FormattedMessage id="newNameList" />
                            }
                            customTextValidationBtn={
                                <FormattedMessage id="rename" />
                            }
                            customTextCancelBtn={
                                <FormattedMessage id="cancel" />
                            }
                            handleRenameExistList={renameExistList}
                            selectedListName={currentItemName}
                            newList={false}
                        />
                        {/* Alert to save temporary list before switch to another */}
                        <PopupInfo
                            open={openPopupInfo}
                            onClose={() => setOpenPopupInfo(false)}
                            handleSaveNewList={createListBeforeExit}
                            handleCancelNewList={cancelCreateListBeforeExit}
                        />
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
                </Grid>

                <Grid xs={9} item={true} className={classes.aceEditor}>
                    {currentItemType === 'FILTERS' && (
                        <FiltersEditor
                            item={currentFiltersContingency}
                            onChange={onChangeFiltersContingency}
                        />
                    )}

                    {currentItemType === 'SCRIPT' && (
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
                </Grid>
            </Grid>
        </div>
    );
};

export default ContingencyLists;
