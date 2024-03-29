/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Grid from '@material-ui/core/Grid';

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
});

const CustomDialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <DialogTitle
            disableTypography
            className={classes.root}
            {...other}
            style={{ padding: '15px' }}
        >
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
        </DialogTitle>
    );
});

const CustomDialogContent = withStyles(() => ({
    root: {
        padding: '15px',
    },
}))(DialogContent);

const CustomDialogActions = withStyles(() => ({
    root: {
        margin: '0',
        padding: '15px',
    },
}))(DialogActions);

const DialogContainer = withStyles(() => ({
    paper: {
        width: '600px',
    },
}))(Dialog);

const PopupWithInput = ({
    open,
    existingList,
    onClose,
    inputLabelText,
    title,
    customTextValidationBtn,
    customTextCancelBtn,
    handleSaveNewList,
    handleRenameExistList,
    handleCopyToScriptList,
    selectedListName,
    newList,
    action,
}) => {
    const intl = useIntl();
    const [disableBtnSave, setDisableBtnSave] = useState(true);
    const [showError, setShowError] = useState(false);
    const [newNameList, setNewListName] = useState(false);
    const [newListType, setNewListType] = useState('SCRIPT');

    /**
     * on change input popup check if name already exist
     * @param name
     */
    const onChangeInputName = (name) => {
        if (name.length === 0) {
            setDisableBtnSave(true);
        } else {
            if (existingList.length > 0) {
                if (
                    existingList.some(
                        (list) => list.name.toLowerCase() === name.toLowerCase()
                    )
                ) {
                    setDisableBtnSave(true);
                    setShowError(true);
                } else {
                    setNewListName(name);
                    setDisableBtnSave(false);
                    setShowError(false);
                }
            } else {
                setDisableBtnSave(false);
                setShowError(false);
                setNewListName(name);
            }
        }
    };

    const handleSave = () => {
        if (action) {
            action({ name: newNameList, type: newListType });
            onClose();
        } else if (newList) {
            handleSaveNewList(newNameList, newListType, true);
        } else {
            if (handleRenameExistList) {
                handleRenameExistList(newNameList);
            } else if (handleCopyToScriptList) {
                handleCopyToScriptList(newNameList);
            }
        }
    };

    const handleClose = () => {
        if (showError) {
            setShowError(false);
        }
        onClose();
    };

    return (
        <DialogContainer open={open} onClose={handleClose}>
            <CustomDialogTitle onClose={handleClose}>{title}</CustomDialogTitle>
            <CustomDialogContent dividers>
                <Grid container direction="row" spacing={1}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            style={{ width: '100%' }}
                            defaultValue={newList ? '' : selectedListName}
                            error={showError}
                            helperText={
                                showError
                                    ? intl.formatMessage({
                                          id: 'nameAlreadyExist',
                                      })
                                    : ''
                            }
                            onChange={(event) =>
                                onChangeInputName(event.target.value)
                            }
                            label={inputLabelText}
                        />
                    </Grid>
                    {newList && (
                        <Grid item xs={12} sm={4}>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    aria-label="gender"
                                    name="gender1"
                                    value={newListType}
                                    onChange={(e) =>
                                        setNewListType(e.target.value)
                                    }
                                    style={{ paddingLeft: '10px' }}
                                >
                                    <FormControlLabel
                                        value="SCRIPT"
                                        control={<Radio />}
                                        label={<FormattedMessage id="SCRIPT" />}
                                    />
                                    <FormControlLabel
                                        value="FILTERS"
                                        control={<Radio />}
                                        label={
                                            <FormattedMessage id="FILTERS" />
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    )}
                </Grid>
            </CustomDialogContent>
            <CustomDialogActions>
                <Button autoFocus size="small" onClick={handleClose}>
                    {customTextCancelBtn}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSave}
                    disabled={disableBtnSave}
                >
                    {customTextValidationBtn}
                </Button>
            </CustomDialogActions>
        </DialogContainer>
    );
};

PopupWithInput.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    inputLabelText: PropTypes.object.isRequired,
    title: PropTypes.object.isRequired,
    customTextValidationBtn: PropTypes.object.isRequired,
    customTextCancelBtn: PropTypes.object.isRequired,
    handleSaveNewList: PropTypes.func,
    handleRenameExistList: PropTypes.func,
    handleCopyToScriptList: PropTypes.func,
    selectedListName: PropTypes.string,
    newList: PropTypes.bool.isRequired,
};

const PopupInfo = ({
    open,
    onClose,
    title,
    customAlertMessage,
    customTextValidationBtn,
    handleBtnOk,
    handleBtnCancel,
}) => {
    const handleClose = () => {
        onClose();
    };

    const handleOk = () => {
        handleBtnOk();
    };

    const handleCancel = () => {
        handleBtnCancel();
    };

    return (
        <DialogContainer open={open} onClose={handleClose}>
            <CustomDialogTitle onClose={handleClose}>{title}</CustomDialogTitle>
            <CustomDialogContent dividers>
                {customAlertMessage}
            </CustomDialogContent>
            <CustomDialogActions>
                <Button autoFocus size="small" onClick={handleCancel}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button variant="outlined" size="small" onClick={handleOk}>
                    {customTextValidationBtn}
                </Button>
            </CustomDialogActions>
        </DialogContainer>
    );
};

PopupInfo.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.object.isRequired,
    customAlertMessage: PropTypes.object.isRequired,
    customTextValidationBtn: PropTypes.object.isRequired,
    handleBtnOk: PropTypes.func.isRequired,
    handleBtnCancel: PropTypes.func.isRequired,
};

export { PopupInfo, PopupWithInput };
