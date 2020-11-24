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
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import { useSelector } from 'react-redux';

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

const CustomDialogContent = withStyles((theme) => ({
    root: {
        padding: '15px',
    },
}))(DialogContent);

const CustomDialogActions = withStyles((theme) => ({
    root: {
        margin: '0',
        padding: '15px',
    },
}))(DialogActions);

const DialogContainer = withStyles((theme) => ({
    paper: {
        width: '500px',
        height: '250px',
    },
}))(Dialog);

const PopupWithInput = ({
    open,
    onClose,
    inputLabelText,
    title,
    customTextValidationBtn,
    customTextCancelBtn,
    handleSaveNewList,
    handleRenameExistList,
    selectedListName,
    newList,
}) => {
    const contingencyLists = useSelector((state) => state.contingencyLists);
    const [disableBtnRenameList, setDisableBtnRenameList] = useState(true);
    const [newNameList, setNewNameList] = useState(false);

    /**
     * on change input popup check if name already exist
     * @param name
     */
    const onChangeInputName = (name) => {
        if (name.length === 0) {
            setDisableBtnRenameList(true);
        } else {
            if (contingencyLists.length > 0) {
                if (contingencyLists.some((list) => list.name === name)) {
                    setDisableBtnRenameList(true);
                } else {
                    setNewNameList(name);
                    setDisableBtnRenameList(false);
                }
            } else {
                setDisableBtnRenameList(false);
                setNewNameList(name);
            }
        }
    };

    const handleSave = () => {
        if (newList) {
            handleSaveNewList(newNameList);
        } else {
            handleRenameExistList(selectedListName, newNameList);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <DialogContainer open={open} onClose={handleClose}>
            <CustomDialogTitle onClose={handleClose}>{title}</CustomDialogTitle>
            <CustomDialogContent dividers>
                <TextField
                    defaultValue={newList ? '' : selectedListName}
                    onChange={(event) => onChangeInputName(event.target.value)}
                    label={inputLabelText}
                />
            </CustomDialogContent>
            <CustomDialogActions>
                <Button autoFocus size="small" onClick={handleClose}>
                    {customTextCancelBtn}
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSave}
                    disabled={disableBtnRenameList}
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
    selectedListName: PropTypes.string,
    newList: PropTypes.bool.isRequired,
};

const PopupInfo = ({
    open,
    onClose,
    handleSaveNewList,
    handleCancelNewList,
}) => {
    const handleClose = () => {
        onClose();
    };

    const handleSaveList = () => {
        handleSaveNewList();
    };

    const handleCancel = () => {
        handleCancelNewList();
    };

    return (
        <DialogContainer open={open} onClose={handleClose}>
            <CustomDialogTitle onClose={handleClose}>
                <FormattedMessage id="saveNewListTitle" />
            </CustomDialogTitle>
            <CustomDialogContent dividers>
                <FormattedMessage id="saveNewListMsg" />
            </CustomDialogContent>
            <CustomDialogActions>
                <Button autoFocus size="small" onClick={handleCancel}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSaveList}
                >
                    <FormattedMessage id="create" />
                </Button>
            </CustomDialogActions>
        </DialogContainer>
    );
};

PopupInfo.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    handleSaveNewList: PropTypes.func.isRequired,
    handleCancelNewList: PropTypes.func.isRequired,
};

export { PopupInfo, PopupWithInput };
