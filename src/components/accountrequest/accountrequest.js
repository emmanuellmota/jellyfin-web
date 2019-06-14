define(['dialogHelper', 'loading', 'require', 'scrollHelper', 'layoutManager', 'focusManager', 'browser', 'emby-input', 'emby-select', 'paper-icon-button-light', 'css!./../formdialog', 'material-icons', 'cardStyle'], function (dialogHelper, loading, require, scrollHelper, layoutManager, focusManager, browser) {
    'use strict';

    var currentResolve;
    var currentReject;
    var hasChanges = false;

    function showEditor() {
        loading.show();

        require(['text!./accountrequest.template.html'], function (template) {
            var dialogOptions = {
                size: 'fullscreen-border',
                removeOnClose: true,
                scrollY: false
            };

            if (layoutManager.tv) {
                dialogOptions.size = 'fullscreen';
            }

            var dlg = dialogHelper.createDialog(dialogOptions);

            dlg.classList.add('formDialog');
            dlg.classList.add('recordingDialog');

            dlg.innerHTML = template;

            if (layoutManager.tv) {
                scrollHelper.centerFocus.on(dlg.querySelector('.formDialogContent'), false);
            }

            dialogHelper.open(dlg);

            dlg.querySelector('.popupAccountRequestForm').addEventListener('submit', function (e) {
                currentResolve({
                    reference: dlg.querySelector('#txtReference').value,
                    groupId: dlg.querySelector('#selectGroupId').value,
                    plainId: dlg.querySelector('#selectPlainId').value
                });

                dialogHelper.close(dlg);

                e.preventDefault();
                e.stopPropagation();
                return false;
            });

            dlg.querySelector('.btnCancel').addEventListener('click', function (e) {
                dialogHelper.close(dlg);
            });

            dlg.classList.add('accountRequestDialog');

            loading.hide();
        });
    }

    return {
        show: function () {
            return new Promise(function (resolve, reject) {
                currentResolve = resolve;
                currentReject = reject;

                showEditor();
            });
        }
    };
});
