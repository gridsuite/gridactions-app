/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
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
import AddIcon from '@material-ui/icons/Add';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DescriptionIcon from '@material-ui/icons/Description';
import PanToolIcon from '@material-ui/icons/PanTool';
import FiltersEditor from './filters-editor';
import {
    updateContingencyList, updateEquipmentID, updateEquipmentName, updateEquipmentType,
    updateGuiContingencyList, updateNominalVoltage, updateNominalVoltageOperator,
    updateScriptContingencyList
} from '../redux/actions';
import { PopupWithInput, PopupInfo } from './popup';

import { makeStyles } from '@material-ui/core/styles';

import { FormattedMessage } from 'react-intl';
import {
    getContingencyLists,
    addScriptContingencyList,
    deleteListByName,
    renameListByName, addFilterContingencyList
} from '../utils/rest-api';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '0',
        '& > *': {
            margin: theme.spacing(1),
        },
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

const CustomListItem = withStyles((theme) => ({
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

const NewFileCreatedList = withStyles((theme) => ({
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

const Contingency = ({ theme }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const aceEditorRef = useRef();

    const selectedTheme = useSelector((state) => state.theme);
    const scriptContingencyLists = useSelector((state) => state.scriptList);
    const guiContingencyLists = useSelector((state) => state.guiList);
    const listsContingency = useSelector((state) => state.contingencyLists);

    const [disableBtnSaveList, setDisableBtnSaveList] = useState(true);

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [selectedListName, setSelectedListName] = useState(null);

    const [guiMode, setGuiMode] = useState(false);

    const [alertEmptyList, setAlertEmptyList] = useState(true);
    const [alertNotSelectedList, setAlertNotSelectedList] = useState(false);

    const [anchorEl, setAnchorEl] = React.useState(null);

    const [aceEditorContent, setAceEditorContent] = useState('');

    const [openPopupNewList, setOpenPopupNewList] = useState(false);
    const [openPopupRenameList, setOpenPopupRenameList] = useState(false);
    const [openPopupInfo, setOpenPopupInfo] = useState(false);

    const [newListCreated, setNewListCreated] = useState(false);

    const [newListName, setNewListName] = useState(
        (listsContingency !== null && listsContingency.length > 0) ? listsContingency[0].name : ''
    );
    const [fileNameContent, setFileNameContent] = useState(
        (listsContingency !== null && listsContingency.length > 0) ? listsContingency[0].script : ''
    );

    const equipmentID = useSelector((state) => state.equipmentID);
    const equipmentName = useSelector((state) => state.equipmentName);
    const equipmentType = useSelector((state) => state.equipmentType);
    const nominalVoltageOperator = useSelector((state) => state.nominalVoltageOperator);
    const nominalVoltage = useSelector((state) => state.nominalVoltage);

    /**
     * On click in item of list set it actif
     * @param event
     * @param index
     */
    const handleListItemClick = (item, index) => {
        setSelectedListName(item.name);
        setAlertNotSelectedList(false);
        if (newListCreated) {
            setOpenPopupInfo(true);
            setAceEditorContent('');
        } else {
            setSelectedIndex(index);
            setNewListName(item.name);
            if (guiMode) {
            } else {
                setFileNameContent(item.script);
            }
            setDisableBtnSaveList(true);
        }
    };

    /**
     * Handler open dialog
     */
    const handleOpenPopupAddNewList = () => {
        setOpenPopupNewList(true);
    };

    /**
     * On change editor, check if data is the same to disabled submit button
     * @param newScript
     * @param newScript
     */
    const onChangeEditor = (newScript) => {
        if ((newListName && newScript) || newScript !== fileNameContent) {
            setDisableBtnSaveList(false);
            setAceEditorContent(newScript);
        }
    };

    /**
     * Add new list name
     * @param name
     */
    const addNewList = (name) => {
        if (guiMode) {
            console.log('add New List with name: ' + name + 'in the gui mode');
            dispatch(updateEquipmentName("*"));
            dispatch(updateEquipmentID("*"));
            dispatch(updateNominalVoltageOperator("="));
            dispatch(updateNominalVoltage("*"));
            dispatch(updateEquipmentType("*"));
        } else {
            console.log('add New List with name: ' + name + 'in the script mode');
            setAceEditorContent('');
            //aceEditorRef.current.editor.setValue('');
        }
        setNewListName(name);
        setNewListCreated(true);
        setSelectedIndex(null);
        setAlertEmptyList(false);
        setOpenPopupNewList(false);
        setDisableBtnSaveList(false);
    };

    /**
     * Rename exist list
     * @param oldName
     * @param newName
     */
    const renameExistList = (oldName, newName) => {
        renameListByName(oldName, newName).then((response) => {
            if (!response.ok) {
                console.error(response.statusText);
            }
        });
        setTimeout(function () {
            getAllContingencyLists();
        }, 50);
        setOpenPopupRenameList(false);
    };

    /**
     * Alert : Add the script and save the new list
     */
    const createListBeforeExit = () => {
        setAceEditorContent('');
        setOpenPopupInfo(false);
    };

    /**
     * Alert : Cancel create new list
     */
    const cancelCreateListBeforeExit = () => {
        setNewListCreated(false);
        setAceEditorContent('');
        setOpenPopupInfo(false);
    };

    /**
     * Save new list added: submit name and script
     */
    const saveNewList = () => {
        if (guiMode) {
            addFilterContingencyList(newListName, equipmentID, equipmentName, equipmentType, nominalVoltage, nominalVoltageOperator).then(() => {
                    getContingencyLists(guiMode).then((data) => {
                        if (data) {
                            console.log("TO DO" + data);

                            setNewListCreated(false);
                            dispatch(updateGuiContingencyList(data));
                            dispatch(updateContingencyList(data));
                        }
                    });
                    setDisableBtnSaveList(true);
                }
            )
        } else {
            const script = aceEditorRef.current.editor.getValue();
            let currentScript = '';
            if (script) {
                addScriptContingencyList(newListName, script).then(() => {
                    getContingencyLists(guiMode).then((data) => {
                        if (data) {
                            setNewListCreated(false);
                            dispatch(updateScriptContingencyList(data));
                            dispatch(updateContingencyList(data),
                                listsContingency.find((list) => {
                                    if (list.name === newListName) {
                                        currentScript = list.script;
                                    }
                                    return setAceEditorContent(currentScript);
                                })
                            );
                        }
                    });
                    setDisableBtnSaveList(true);
                });
            }
        }
    };

    /**
     * Cancel create list, reset editor and hide new name from list
     */
    const cancelNewList = () => {
        if (!guiMode) {
            setAceEditorContent('');
            //setAceEditorContent('');
            //aceEditorRef.current.editor.setValue('')
        }
        setNewListCreated(false);
        setDisableBtnSaveList(true);
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
        listsContingency.map((item, index) => {
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
        if (selectedListName) {
            if (
                listsContingency !== null &&
                listsContingency.length === selectedIndex + 1
            ) {
                setSelectedIndex(selectedIndex - 1);
                fetchScriptByNameList(selectedIndex - 1);
            } else {
                setSelectedIndex(selectedIndex);
                fetchScriptByNameList(selectedIndex + 1);
            }

            deleteListByName(selectedListName).then(() => {
                getContingencyLists().then((data) => {
                    dispatch(updateContingencyList(data));
                    if (data.length > 0) {
                        dispatch(updateScriptContingencyList(data));
                    } else {
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
        setSelectedListName(name);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleRenameList = () => {
        setAnchorEl(null);
        setOpenPopupRenameList(true);
    };

    const handleScriptModeChosen = () => {
        setGuiMode(false);
        setSelectedIndex(null);
    };

    const handleGuiModeChosen = () => {
        setAceEditorContent('');
        setGuiMode(true);
        setSelectedIndex(null);
    };

    /**
     * Get all contingency lists on load page
     **/
    const getAllContingencyLists = useCallback(
        (guiMode) => {
            getContingencyLists(guiMode).then((data) => {
                if (data) {
                    if (guiMode) {
                        dispatch(updateContingencyList(data));
                        dispatch(updateGuiContingencyList(data));
                    } else {
                        dispatch(updateContingencyList(data));
                        dispatch(updateScriptContingencyList(data));
                    }
                    dispatch(updateContingencyList(data));
                }
            });
        },
        [dispatch]
    );

    useEffect(() => {
        getAllContingencyLists(guiMode);
    }, [getAllContingencyLists, guiMode]);

    function setFilters(item) {
        return undefined;
    }

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
                            xs={6}
                            item={true}
                            className={classes.iconButton}
                            htmlFor="addScript"
                            style={{ marginTop: '5px', paddingLeft: '5px' }}
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
                        <Grid
                            xs={3}
                            item={true}
                            className={classes.iconButton}
                            htmlFor="GUI Mode"
                            style={{ marginTop: '5px' }}
                        >
                            <label className={classes.iconSvg}>
                                <PanToolIcon
                                    aria-label="New file"
                                    style={
                                        guiMode
                                            ? {
                                                  fontSize: 36,
                                                  color:
                                                      theme.palette.secondary
                                                          .light,
                                              }
                                            : { fontSize: 36 }
                                    }
                                    onClick={() => handleGuiModeChosen()}
                                />
                            </label>
                            <span className={classes.iconLabel}>
                                <FormattedMessage id="guiMode" />
                            </span>
                        </Grid>
                        <Grid
                            xs={3}
                            item={true}
                            className={classes.iconButton}
                            htmlFor="Script Mode"
                            style={{ marginTop: '5px' }}
                        >
                            <label className={classes.iconSvg}>
                                <DescriptionIcon
                                    aria-label="Script Mode"
                                    style={
                                        guiMode
                                            ? { fontSize: 36 }
                                            : {
                                                  fontSize: 36,
                                                  color:
                                                      theme.palette.secondary
                                                          .light,
                                              }
                                    }
                                    onClick={() => handleScriptModeChosen()}
                                />
                            </label>
                            <span className={classes.iconLabel}>
                                <FormattedMessage id="scriptMode" />
                            </span>
                        </Grid>
                    </Grid>
                    <h3 className={classes.contingencyTitle}>
                        <FormattedMessage id="contingencyTitle" />
                    </h3>
                    {listsContingency !== null &&
                    listsContingency.length > 0 ? (
                        <>
                            <List className={classes.root}>
                                {listsContingency.map((item, index) => (
                                    <>
                                        <CustomListItem
                                            button
                                            key={item.name}
                                            selected={selectedIndex === index}
                                            onClick={() =>
                                                handleListItemClick(item, index)
                                            }
                                        >
                                            <ListItemText
                                                className={classes.listItemText}
                                                primary={item.name}
                                                key={item.name}
                                                onClick={() =>
                                                    guiMode
                                                        ? setFilters(item)
                                                        : setAceEditorContent(
                                                              item.script
                                                          )
                                                }
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
                                    </>
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
                                        className={classes.listItemText}
                                        primary={newListName}
                                        onClick={() =>
                                            setAceEditorContent(
                                                aceEditorRef.current.editor.getValue()
                                            )
                                        }
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
                            selectedListName={selectedListName}
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
                            disabled={disableBtnSaveList}
                            onClick={() =>
                                cancelNewList()
                            }
                        >
                            <FormattedMessage id="cancel" />
                        </Button>
                        <Button
                            variant="outlined"
                            disabled={disableBtnSaveList}
                            onClick={() =>
                                saveNewList()
                            }
                        >
                            <FormattedMessage id="save" />
                        </Button>
                    </div>
                </Grid>

                <Grid xs={9} item={true} className={classes.aceEditor}>
                    {guiMode ? (
                        <FiltersEditor
                            item={
                                selectedIndex !== null
                                    ? listsContingency[selectedIndex]
                                    : null
                            }
                        />
                    ) : (
                        <AceEditor
                            className={classes.editor}
                            ref={aceEditorRef}
                            mode="groovy"
                            placeholder="Insert your groovy script here"
                            theme={themeForAceEditor()}
                            onChange={(val) => onChangeEditor(val)}
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

export default Contingency;
