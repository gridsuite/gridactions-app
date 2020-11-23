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
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { updateContingencyList } from '../redux/actions';
import { PopupWithInput, PopupInfo } from './popup';

import { makeStyles } from '@material-ui/core/styles';

import { FormattedMessage } from 'react-intl';
import {
    getContingencyLists,
    addContingencyList,
    deleteListByName,
    renameListByName,
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

const Contingency = () => {
    const classes = useStyles();
    const aceEditorRef = useRef();
    const dispatch = useDispatch();
    const selectedTheme = useSelector((state) => state.theme);

    const [newNameFileCreated, setNewNameFileCreated] = useState(false);
    const [disabledBtnSubmitList, setDisabledBtnSubmitList] = useState(false);
    const [alertEmptyList, setAlertEmptyList] = useState(true);
    const [alertNotSelectedList, setAlertNotSelectedList] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const [firstItemInList, setFirstItemInList] = useState([]);
    const [listsContingency, setListsContingency] = useState([]);
    const [fileContent, setFileContent] = useState('');
    const [selectedIndex, setSelectedIndex] = useState('');
    const [selectedListName, setSelectedListName] = useState([]);

    const [openPopupNewList, setOpenPopupNewList] = useState(false);
    const [openPopupRenameList, setOpenPopupRenameList] = useState(false);
    const [openPopupInfo, setOpenPopupInfo] = useState(false);

    const [newFileNameCreated, setNewFileNameCreated] = useState(
        firstItemInList ? firstItemInList.name : ''
    );
    const [fileNameContent, setFileNameContent] = useState(
        firstItemInList ? firstItemInList.script : ''
    );

    /**
     * On click in item of list set it actif
     * @param event
     * @param index
     */
    const handleListItemClick = (item, index) => {
        setSelectedListName(item.name);
        setAlertNotSelectedList(false);
        if (newNameFileCreated) {
            setOpenPopupInfo(true);
            setFileContent('');
        } else {
            setSelectedIndex(index);
            setNewFileNameCreated(item.name);
            setFileNameContent(item.script);
            setDisabledBtnSubmitList(false);
        }
    };

    /**
     * Handler open dialog
     */
    const handleOpenDialog = () => {
        setOpenPopupNewList(true);
    };

    /**
     * On change editor, check if data is the same to disabled submit button
     * @param newScript
     * @param newScript
     */
    const onChangeEditor = (newScript) => {
        if (
            (newFileNameCreated && newScript) ||
            newScript !== fileNameContent
        ) {
            setDisabledBtnSubmitList(true);
            setFileContent(newScript);
        }
    };

    /**
     * Add new list name
     * @param name
     */
    const addNewList = (name) => {
        aceEditorRef.current.editor.setValue('');
        setAlertEmptyList(false);
        setSelectedIndex('');
        setNewNameFileCreated(true);
        setNewFileNameCreated(name);
        setFileContent(aceEditorRef.current.editor.setValue(''));
        setOpenPopupNewList(false);
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
        setFileContent('');
        setOpenPopupInfo(false);
    };

    /**
     * Alert : Cancel create new list
     */
    const cancelCreateListBeforeExit = () => {
        setNewNameFileCreated(false);
        setFileContent('');
        setOpenPopupInfo(false);
    };

    /**
     * Save new list added: submit name and script
     * @param name
     * @param script
     */
    const saveNewList = (name, script) => {
        let currentScript = '';
        if (script) {
            addContingencyList(name, script).then((data) => {
                getContingencyLists().then((data) => {
                    if (data) {
                        setNewNameFileCreated(false);
                        setListsContingency(data);
                        dispatch(updateContingencyList(data));
                        data.find((list) => {
                            if (list.name === name) {
                                currentScript = list.script;
                            }
                            return setFileContent(currentScript);
                        });
                    }
                });
                setDisabledBtnSubmitList(false);
            });
        }
    };

    /**
     * Cancel create list, reset editor and hide new name from list
     */
    const cancelNewList = () => {
        setNewNameFileCreated(false);
        setDisabledBtnSubmitList(false);
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
            return setFileContent(script);
        });
    };

    /**
     * Delete list by name
     */
    const handleDeleteList = () => {
        setAnchorEl(null);
        if (selectedListName) {
            if (listsContingency.length === selectedIndex + 1) {
                setSelectedIndex(selectedIndex - 1);
                fetchScriptByNameList(selectedIndex - 1);
            } else {
                setSelectedIndex(selectedIndex);
                fetchScriptByNameList(selectedIndex + 1);
            }

            deleteListByName(selectedListName).then(() => {
                getContingencyLists().then((data) => {
                    setListsContingency(data);
                    if (data.length > 0) {
                        dispatch(updateContingencyList(data));
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

    /**
     * Get all contingency lists on load page
     **/
    const getAllContingencyLists = useCallback(() => {
        getContingencyLists().then((data) => {
            if (data.length > 0) {
                setFirstItemInList(data[0]);
                setListsContingency(data);
                dispatch(updateContingencyList(data));
            }
        });
    }, [dispatch]);

    useEffect(() => {
        getAllContingencyLists();
    }, [getAllContingencyLists]);

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
                            htmlFor="addfile"
                            style={{ marginTop: '5px' }}
                        >
                            <label className={classes.iconSvg}>
                                <InsertDriveFileOutlinedIcon
                                    aria-label="New file"
                                    style={{ fontSize: 36 }}
                                    onClick={() => handleOpenDialog()}
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
                    {listsContingency.length > 0 ? (
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
                                                    setFileContent(item.script)
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
                            {/* To be replaced width snackbar */}
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
                        {newNameFileCreated && (
                            <NewFileCreatedList>
                                <CustomListItem button selected>
                                    <ListItemText
                                        className={classes.listItemText}
                                        primary={newFileNameCreated}
                                        onClick={() =>
                                            setFileContent(
                                                aceEditorRef.current.editor.getValue()
                                            )
                                        }
                                    />
                                </CustomListItem>
                            </NewFileCreatedList>
                        )}
                    </>

                    <div>
                        {/* Popup for add new list */}
                        <PopupWithInput
                            open={openPopupNewList}
                            onClose={setOpenPopupNewList}
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
                            onClose={setOpenPopupRenameList}
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
                            onClose={setOpenPopupInfo}
                            handleSaveNewList={createListBeforeExit}
                            handleCancelNewList={cancelCreateListBeforeExit}
                        />
                    </div>
                    <div className={classes.containerButtons}>
                        <Button
                            style={{ marginRight: '15px' }}
                            disabled={disabledBtnSubmitList ? false : true}
                            onClick={() =>
                                cancelNewList(
                                    aceEditorRef.current.editor.setValue('')
                                )
                            }
                        >
                            <FormattedMessage id="cancel" />
                        </Button>
                        <Button
                            variant="outlined"
                            disabled={disabledBtnSubmitList ? false : true}
                            onClick={() =>
                                saveNewList(
                                    newFileNameCreated,
                                    aceEditorRef.current.editor.getValue()
                                )
                            }
                        >
                            <FormattedMessage id="save" />
                        </Button>
                    </div>
                </Grid>
                <Grid xs={9} item={true} className={classes.aceEditor}>
                    <AceEditor
                        className={classes.editor}
                        ref={aceEditorRef}
                        mode="groovy"
                        placeholder="Insert your groovy script here"
                        theme={themeForAceEditor()}
                        onChange={(val) => onChangeEditor(val)}
                        value={fileContent}
                        fontSize="18px"
                        editorProps={{ $blockScrolling: true }}
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default Contingency;
