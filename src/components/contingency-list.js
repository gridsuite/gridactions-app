/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useRef, useEffect } from 'react';
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
import { grey } from '@material-ui/core/colors';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';

import IconButton from '@material-ui/core/IconButton';
import SaveAltOutlinedIcon from '@material-ui/icons/SaveAltOutlined';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ImportExportOutlinedIcon from '@material-ui/icons/ImportExportOutlined';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import { updateContingencyList } from '../redux/actions';

import {
    makeStyles,
    ThemeProvider,
    createMuiTheme,
} from '@material-ui/core/styles';

import { FormattedMessage } from 'react-intl';
import { getContingencyLists, addContingencyList } from '../utils/api';

const useStyles = makeStyles((theme) => ({
    root: {
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
        height: '100%',
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
        margin: '0',
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
    uploadFile: {
        opacity: 0,
        position: 'absolute',
        pointerEvents: 'none',
        width: '1px',
        height: '1px',
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
}));

const CustomListItem = withStyles((theme) => ({
    root: {
        margin: '0',
    },
    selected: {
        backgroundColor: '#000',
        margin: '0',
    },
}))(ListItem);

const theme = createMuiTheme({
    palette: {
        primary: grey,
    },
});

const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    selected: {
        background: '#000',
    },
});

const DialogContainer = withStyles((theme) => ({
    paper: {
        width: '500px',
        height: '250px',
    },
}))(Dialog);

const NewFileCreatedList = withStyles((theme) => ({
    root: {
        paddingTop: '0',
        paddingBottom: '0',
        marginTop: '-10px',
    },
}))(List);

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

const Contingency = () => {
    const classes = useStyles();
    const aceEditorRef = useRef();
    const dispatch = useDispatch();
    const selectedTheme = useSelector((state) => state.theme);

    const [openDialog, setOpenDialog] = useState(false);
    const [newNameFileUploaded, setNewNameFileUploaded] = useState(false);
    const [newNameFileCreated, setNewNameFileCreated] = useState(false);
    const [disabledBtnSubmitList, setDisabledBtnSubmitList] = useState(false);
    const [alertEmptyList, setAlertEmptyList] = useState(true);

    const [firstItemInList, setFirstItemInList] = useState([]);
    const [listsContingency, setListsContingency] = useState([]);
    const [fileContent, setFileContent] = useState('');
    // const [fileNameUploaded, setFileNameUploaded] = useState('');
    const [selectedIndex, setSelectedIndex] = useState('');

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
        if (newNameFileCreated) {
            setOpenDialog(true);
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
        setOpenDialog(true);
    };

    /**
     * Handler close dialog
     */
    const handleCloseDialog = () => {
        if (newNameFileCreated) {
            setNewNameFileCreated(false);
            setFileContent('');
            setOpenDialog(false);
        } else {
            setOpenDialog(false);
        }
    };

    /**
     * Handler click to upload new external file
     * @param e
     * @param val
     */
    const handleChangeUploadFile = (e, val) => {
        const fileReader = new FileReader();
        setFileContent('');
        fileReader.readAsText(e.target.files[0], 'UTF-8');
        // setFileNameUploaded(e.target.files[0].name);
        setNewNameFileUploaded(e.target.files[0].name);
        fileReader.onload = (e) => {
            setFileContent(e.target.result);
        };
    };

    /**
     *
     * @param newValue
     * @returns {*}
     */
    const onChange = (newValue) => {
        if ((newFileNameCreated && newValue) || newValue !== fileNameContent) {
            setDisabledBtnSubmitList(true);
        }
        return newValue;
    };

    /**
     * Save name of new file added from dialog
     * @param name
     * @param script
     */
    const saveNewFileName = (name, script) => {
        if (newNameFileCreated) {
            setFileContent('');
            setOpenDialog(false);
        } else if (name) {
            aceEditorRef.current.editor.setValue('');
            setAlertEmptyList(false);
            setSelectedIndex('');
            setNewNameFileCreated(true);
            setFileContent(script);
            setOpenDialog(false);
        }
    };

    /**
     * Save new list added: submit name and script
     * @param name
     * @param script
     */
    const saveNewList = (name, script) => {
        if (script) {
            addContingencyList(name, script).then((data) => {
                getContingencyLists().then((data) => {
                    if (data) {
                        setNewNameFileCreated(false);
                        setListsContingency(data);
                        dispatch(updateContingencyList(data));
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

    useEffect(() => {
        /**
         * Get all contingency lists on load page
         **/
        getContingencyLists().then((data) => {
            if (data) {
                setFirstItemInList(data[0]);
                setListsContingency(data);
                dispatch(updateContingencyList(data));
            }
        });
    }, [dispatch]);

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
                        <Grid xs={3} item={true} className={classes.iconButton}>
                            <label className={classes.iconSvg}>
                                <ImportExportOutlinedIcon
                                    aria-label="New folder"
                                    color="disabled"
                                    style={{
                                        fontSize: 42,
                                        cursor: 'not-allowed',
                                    }}
                                />
                            </label>
                            <span className={classes.iconLabel}>
                                <FormattedMessage id="exportList" />
                            </span>
                        </Grid>
                        <Grid xs={3} item={true} className={classes.iconButton}>
                            <label className={classes.iconSvg}>
                                <SaveAltOutlinedIcon
                                    aria-label="New folder"
                                    color="disabled"
                                    style={{
                                        fontSize: 42,
                                        cursor: 'not-allowed',
                                    }}
                                />
                            </label>
                            <span className={classes.iconLabel}>
                                <FormattedMessage id="uploadList" />
                            </span>
                        </Grid>
                        <Grid xs={3} item={true} className={classes.iconButton}>
                            <label className={classes.iconSvg}>
                                <DeleteOutlineOutlinedIcon
                                    aria-label="New folder"
                                    color="disabled"
                                    style={{
                                        fontSize: 42,
                                        cursor: 'not-allowed',
                                    }}
                                />
                            </label>
                            <span className={classes.iconLabel}>
                                <FormattedMessage id="deleteList" />
                            </span>
                        </Grid>
                    </Grid>
                    <input
                        className={classes.uploadFile}
                        type="file"
                        id="uploadfile"
                        onChange={handleChangeUploadFile}
                    />
                    <h3 className={classes.contingencyTitle}>
                        <FormattedMessage id="contingencyTitle" />
                    </h3>
                    {listsContingency.length > 0 ? (
                        <List className={classes.root}>
                            {listsContingency.map((item, index) => (
                                <CustomListItem
                                    button
                                    key={item.name}
                                    selected={selectedIndex === index}
                                    onClick={() =>
                                        handleListItemClick(item, index)
                                    }
                                >
                                    <ListItemIcon>
                                        <ChevronRightIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.name}
                                        key={item.name}
                                        onClick={() =>
                                            setFileContent(item.script)
                                        }
                                    />
                                </CustomListItem>
                            ))}
                        </List>
                    ) : alertEmptyList ? (
                        <Alert severity="error" className={classes.alert}>
                            <FormattedMessage id="contingencyListIsEmpty" />
                        </Alert>
                    ) : (
                        ''
                    )}

                    {/* Temporary list : new file created */}
                    {newNameFileCreated && (
                        <NewFileCreatedList>
                            <CustomListItem button selected>
                                <ListItemIcon>
                                    <ChevronRightIcon />
                                </ListItemIcon>
                                <ListItemText
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

                    {/* Temporary list : new file uploaded  */}
                    {newNameFileUploaded && (
                        <List>
                            <CustomListItem button>
                                <ListItemIcon>
                                    <ChevronRightIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={newNameFileUploaded}
                                    onClick={() => setFileContent(fileContent)}
                                />
                            </CustomListItem>
                        </List>
                    )}

                    <div>
                        <DialogContainer
                            onClose={handleCloseDialog}
                            aria-labelledby="customized-dialog-title"
                            open={openDialog}
                        >
                            <DialogTitle id="customized-dialog-title">
                                {newNameFileCreated ? (
                                    <FormattedMessage id="saveNewListTitle" />
                                ) : (
                                    <FormattedMessage id="addNewContencyFile" />
                                )}
                            </DialogTitle>
                            <DialogContent dividers>
                                <div style={{ paddingLeft: '12px' }}>
                                    {!newNameFileCreated ? (
                                        <ThemeProvider theme={theme}>
                                            <TextField
                                                onChange={(event) =>
                                                    setNewFileNameCreated(
                                                        event.target.value
                                                    )
                                                }
                                                className={classes.margin}
                                                label={
                                                    <FormattedMessage id="listName" />
                                                }
                                            />
                                        </ThemeProvider>
                                    ) : (
                                        <FormattedMessage id="saveNewListMsg" />
                                    )}
                                </div>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    size="small"
                                    style={{ marginRight: '15px' }}
                                    onClick={handleCloseDialog}
                                >
                                    <FormattedMessage id="cancel" />
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={newFileNameCreated ? false : true}
                                    onClick={() =>
                                        saveNewFileName(
                                            newFileNameCreated,
                                            aceEditorRef.current.editor.setValue(
                                                ''
                                            )
                                        )
                                    }
                                >
                                    <FormattedMessage id="create" />
                                </Button>
                            </DialogActions>
                        </DialogContainer>
                    </div>
                    <div className={classes.containerButtons}>
                        <Button
                            style={{ marginRight: '15px' }}
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
                        onChange={(val) => onChange(val)}
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
