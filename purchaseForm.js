document.addEventListener('DOMContentLoaded', function () {
    const purchaseForm = document.getElementById('purchaseForm');
    const addItemButton = document.getElementById('addItemButton');
    const purchaseItemsTableBody = document.querySelector('#purchaseItemsTable tbody');
    const termsOfPaymentSelect = document.getElementById('termsOfPayment');
    const newTermInput = document.getElementById('newTermInput');
    const addTermButton = document.getElementById('addTermButton');
    const listButton = document.getElementById('listButton');
    const backToDashboardButton = document.getElementById('backToDashboardButton');
    const printFormButton = document.getElementById('printFormButton'); 
    const confirmClearFormButton = document.getElementById('confirmClearFormButton');
    const submitPurchaseButton = document.getElementById('submitPurchaseButton'); 
    const updatePurchaseButton = document.getElementById('updatePurchaseButton');
    const clearFormButton = document.getElementById('clearFormButton'); 

    const purchaseListContainer = document.getElementById('purchaseListContainer');
    const purchaseListTableBody = document.getElementById('purchaseListTableBody');
    const noEntriesMessage = document.getElementById('noEntriesMessage');

    let purchaseRecords = [];
    let nextPurchaseId = 1;
    let currentMode = 'add'; 
    let editingRecordId = null;


    function setFormFieldsReadonly(readonly) {
        const formElements = purchaseForm.querySelectorAll('input, select, textarea, button:not(#listButton)');
        formElements.forEach(element => {
            if (element.id === 'addTermButton' || element.id === 'addItemButton' ||
                element.id === 'submitPurchaseButton' || element.id === 'updatePurchaseButton' ||
                element.id === 'backToDashboardButton' || element.id === 'printFormButton' ||
                element.id === 'clearFormButton') {
                return; 
            }

            if (readonly) {
                element.setAttribute('readonly', 'readonly');
                element.setAttribute('tabindex', '-1'); 
                if (element.tagName === 'SELECT') {
                    element.style.pointerEvents = 'none'; 
                }
            } else {
                element.removeAttribute('readonly');
                element.removeAttribute('tabindex');
                if (element.tagName === 'SELECT') {
                    element.style.pointerEvents = 'auto'; 
                }
            }
        });

        const deleteRowButtons = purchaseItemsTableBody.querySelectorAll('.delete-row');
        if (readonly) {
            addItemButton.style.display = 'none';
            deleteRowButtons.forEach(btn => btn.style.display = 'none');
        } else {
            addItemButton.style.display = 'inline-block'; 
            deleteRowButtons.forEach(btn => btn.style.display = 'inline-block');
        }
    }


    function populateFormWithData(record, readonly = false) {
        document.getElementById('date').value = record.date;
        document.getElementById('vendorInvoiceNo').value = record.vendorInvoiceNo;
        document.getElementById('purchaseOrderNo').value = record.purchaseOrderNo;
        document.getElementById('description').value = record.description;
        document.getElementById('vendorCode').value = record.vendorCode;
        document.getElementById('vendorName').value = record.vendorName;
        document.getElementById('vendorAddress').value = record.vendorAddress;
        document.getElementById('telephone').value = record.telephone;
        document.getElementById('termsOfPayment').value = record.termsOfPayment;

        purchaseItemsTableBody.innerHTML = '';
        record.items.forEach(item => {
            const newRow = `
                <tr>
                    <td><input type="text" class="form-control item-code" value="${item.itemCode}" ${readonly ? 'readonly' : ''}></td>
                    <td>
                        <select class="form-select item-description" ${readonly ? 'readonly style="pointer-events: none;"' : ''}>
                            <option>${item.description}</option>
                            <option>Laptop</option>
                            <option>Monitor</option>
                            <option>Keyboard</option>
                            <option>Mouse</option>
                            <option>Printer</option>
                            ${item.description !== 'Laptop' && item.description !== 'Monitor' && item.description !== 'Keyboard' && item.description !== 'Mouse' && item.description !== 'Printer' ? `<option selected>${item.description}</option>` : ''}
                        </select>
                    </td>
                    <td><input type="number" class="form-control item-qty" value="${item.qty}" min="1" ${readonly ? 'readonly' : ''}></td>
                    <td><input type="text" class="form-control item-unit" value="${item.unit}" ${readonly ? 'readonly' : ''}></td>
                    <td><input type="number" class="form-control item-rate" value="${item.rate}" min="0" ${readonly ? 'readonly' : ''}></td>
                    <td><input type="number" class="form-control item-net-amount" readonly value="${item.netAmount.toFixed(2)}"></td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm delete-row" ${readonly ? 'style="display: none;"' : ''}>Delete</button>
                    </td>
                </tr>
            `;
            purchaseItemsTableBody.insertAdjacentHTML('beforeend', newRow);
        });

        purchaseItemsTableBody.querySelectorAll('.item-description').forEach((selectElement, index) => {
            const itemDescription = record.items[index].description;

            let optionExists = false;
            for (let i = 0; i < selectElement.options.length; i++) {
                if (selectElement.options[i].value === itemDescription) {
                    optionExists = true;
                    selectElement.value = itemDescription;
                    break;
                }
            }
            if (!optionExists) {
                const newOption = document.createElement('option');
                newOption.value = itemDescription;
                newOption.textContent = itemDescription;
                selectElement.appendChild(newOption);
                selectElement.value = itemDescription;
            }
        });

        setFormFieldsReadonly(readonly);
    }

    function resetForm() {
        purchaseForm.reset();
        currentMode = 'add';
        editingRecordId = null;

        purchaseItemsTableBody.innerHTML = `
            <tr>
                <td>
                    <input type="text" class="form-control item-code" value="ITM001">
                </td>
                <td>
                    <select class="form-select item-description">
                        <option>Laptop</option>
                        <option>Monitor</option>
                        <option>Keyboard</option>
                        <option selected>Select Description</option>
                    </select>
                </td>
                <td><input type="number" class="form-control item-qty" value="1"></td>
                <td><input type="text" class="form-control item-unit" value="Unit"></td>
                <td><input type="number" class="form-control item-rate" value="1000"></td>
                <td><input type="number" class="form-control item-net-amount" readonly value="1000"></td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm delete-row">Delete</button>
                </td>
            </tr>
        `;
        const initialQty = parseFloat(purchaseItemsTableBody.querySelector('.item-qty').value) || 0;
        const initialRate = parseFloat(purchaseItemsTableBody.querySelector('.item-rate').value) || 0;
        purchaseItemsTableBody.querySelector('.item-net-amount').value = (initialQty * initialRate).toFixed(2);

        setFormFieldsReadonly(false); 
        submitPurchaseButton.style.display = 'inline-block';
        updatePurchaseButton.style.display = 'none';
        clearFormButton.style.display = 'inline-block'; 
        addItemButton.style.display = 'inline-block';
    }


    function setFormMode(mode, record = null) {
        currentMode = mode;
        if (mode === 'add') {
            resetForm();
            purchaseForm.style.display = 'block';
            purchaseListContainer.style.display = 'none';
            listButton.textContent = 'View List';
        } else if (mode === 'edit') {
            if (!record) {
                console.error("Record is required for edit mode.");
                return;
            }
            editingRecordId = record.id;
            populateFormWithData(record, false); 
            purchaseForm.style.display = 'block';
            purchaseListContainer.style.display = 'none';
            listButton.textContent = 'Back to List'; 
            submitPurchaseButton.style.display = 'none';
            updatePurchaseButton.style.display = 'inline-block';
            clearFormButton.style.display = 'inline-block';
            addItemButton.style.display = 'inline-block';
        } else if (mode === 'view') {
            if (!record) {
                console.error("Record is required for view mode.");
                return;
            }
            editingRecordId = record.id; 
            populateFormWithData(record, true); 
            purchaseForm.style.display = 'block';
            purchaseListContainer.style.display = 'none';
            listButton.textContent = 'Back to List';
            submitPurchaseButton.style.display = 'none';
            updatePurchaseButton.style.display = 'none';
            clearFormButton.style.display = 'none'; 
            addItemButton.style.display = 'none'; 
        }
    }


    addItemButton.addEventListener('click', function () {
        const newRow = `
            <tr>
                <td><input type="text" class="form-control item-code" value=""></td>
                <td>
                    <select class="form-select item-description">
                        <option selected>Select Description</option>
                        <option>Laptop</option>
                        <option>Monitor</option>
                        <option>Keyboard</option>
                        <option>Mouse</option>
                        <option>Printer</option>
                    </select>
                </td>
                <td><input type="number" class="form-control item-qty" value="1" min="1"></td>
                <td><input type="text" class="form-control item-unit" value="Unit"></td>
                <td><input type="number" class="form-control item-rate" value="0" min="0"></td>
                <td><input type="number" class="form-control item-net-amount" readonly value="0"></td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm delete-row">Delete</button>
                </td>
            </tr>
        `;
        purchaseItemsTableBody.insertAdjacentHTML('beforeend', newRow);
        updateNetTotals();
    });

    purchaseItemsTableBody.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-row')) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    event.target.closest('tr').remove();
                    updateNetTotals(); 
                    Swal.fire(
                        'Deleted!',
                        'Your item has been deleted.',
                        'success'
                    );
                }
            });
        }
    });

    purchaseItemsTableBody.addEventListener('input', function (event) {
        const target = event.target;
        if (target.classList.contains('item-qty') || target.classList.contains('item-rate')) {
            const row = target.closest('tr');
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
            const netAmount = qty * rate;
            row.querySelector('.item-net-amount').value = netAmount.toFixed(2);
            updateNetTotals(); 
        }
    });


    addTermButton.addEventListener('click', function () {
        const newTerm = newTermInput.value.trim();
        if (newTerm) {
            const newOption = document.createElement('option');
            newOption.value = newTerm;
            newOption.textContent = newTerm;
            termsOfPaymentSelect.appendChild(newOption);
            newTermInput.value = ''; 

            const termsModal = bootstrap.Modal.getInstance(document.getElementById('termsModal'));
            if (termsModal) {
                termsModal.hide();
            }
            Swal.fire({
                icon: 'success',
                title: 'Term Added!',
                text: `"${newTerm}" has been added to terms of payment.`
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Input Error',
                text: 'Please enter a term.'
            });
        }
    });

    function renderPurchaseList() {
        purchaseListTableBody.innerHTML = ''; 
        if (purchaseRecords.length === 0) {
            noEntriesMessage.style.display = 'block'; 
            purchaseListTableBody.innerHTML = ''; 
            return;
        } else {
            noEntriesMessage.style.display = 'none';
        }

        purchaseRecords.forEach(record => {
            const totalBill = record.items.reduce((sum, item) => sum + item.netAmount, 0); 

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${record.id}</td>
                <td>${record.date}</td>
                <td>${record.vendorName || 'N/A'}</td> <td>Rs. ${totalBill.toFixed(2)}</td>
                <td>Rs. ${totalBill.toFixed(2)}</td> <td>
                    <button type="button" class="btn btn-sm btn-success me-1 view-record" data-id="${record.id}"><i class="bi bi-eye"></i> View</button>
                    <button type="button" class="btn btn-sm btn-primary me-1 edit-record" data-id="${record.id}"><i class="bi bi-pencil"></i> Edit</button>
                    <button type="button" class="btn btn-sm btn-info me-1 print-record" data-id="${record.id}"><i class="bi bi-printer"></i> Print</button>
                    <button type="button" class="btn btn-sm btn-danger delete-purchase-record" data-id="${record.id}"><i class="bi bi-trash"></i> Delete</button>
                </td>
            `;
            purchaseListTableBody.appendChild(newRow);
        });

        purchaseListTableBody.querySelectorAll('.delete-purchase-record').forEach(button => {
            button.addEventListener('click', function() {
                const idToDelete = parseInt(this.dataset.id);
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You want to delete this purchase record?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        purchaseRecords = purchaseRecords.filter(record => record.id !== idToDelete);
                        renderPurchaseList(); 
                        Swal.fire(
                            'Deleted!',
                            'The purchase record has been deleted.',
                            'success'
                        );
                    }
                });
            });
        });

        purchaseListTableBody.querySelectorAll('.view-record').forEach(button => {
            button.addEventListener('click', function() {
                const idToView = parseInt(this.dataset.id);
                const recordToView = purchaseRecords.find(record => record.id === idToView);
                if (recordToView) {
                    setFormMode('view', recordToView); 
                } else {
                    Swal.fire('Error', 'Record not found for viewing.', 'error');
                }
            });
        });

        purchaseListTableBody.querySelectorAll('.edit-record').forEach(button => {
            button.addEventListener('click', function() {
                const idToEdit = parseInt(this.dataset.id);
                const recordToEdit = purchaseRecords.find(record => record.id === idToEdit);
                if (recordToEdit) {
                    setFormMode('edit', recordToEdit); 
                } else {
                    Swal.fire('Error', 'Record not found for editing.', 'error');
                }
            });
        });

        purchaseListTableBody.querySelectorAll('.print-record').forEach(button => {
            button.addEventListener('click', function() {
                const idToPrint = parseInt(this.dataset.id);
                printPurchaseRecord(idToPrint);
            });
        });
    }


    function printPurchaseRecord(recordId) {
        const record = purchaseRecords.find(rec => rec.id === recordId);
        if (!record) {
            Swal.fire('Error', 'Purchase record not found for printing.', 'error');
            return;
        }

        const totalBill = record.items.reduce((sum, item) => sum + item.netAmount, 0);

        let printContent = `
            <html>
            <head>
                <title>Purchase Record #${record.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h2 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .details p { margin: 5px 0; }
                    .total { font-weight: bold; text-align: right; padding-right: 10px; }
                </style>
            </head>
            <body>
                <h2>Purchase Record Details - ID: ${record.id}</h2>
                <div class="details">
                    <p><strong>Date:</strong> ${record.date}</p>
                    <p><strong>Vendor Invoice No:</strong> ${record.vendorInvoiceNo || 'N/A'}</p>
                    <p><strong>Purchase Order No:</strong> ${record.purchaseOrderNo || 'N/A'}</p>
                    <p><strong>Description (Overall):</strong> ${record.description || 'N/A'}</p>
                    <p><strong>Vendor Name:</strong> ${record.vendorName || 'N/A'} (Code: ${record.vendorCode || 'N/A'})</p>
                    <p><strong>Vendor Address:</strong> ${record.vendorAddress || 'N/A'}</p>
                    <p><strong>Telephone:</strong> ${record.telephone || 'N/A'}</p>
                    <p><strong>Terms of Payment:</strong> ${record.termsOfPayment || 'N/A'}</p>
                </div>

                <h3>Purchase Items:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item Code</th>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit</th>
                            <th>Rate</th>
                            <th>Net Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${record.items.map(item => `
                            <tr>
                                <td>${item.itemCode}</td>
                                <td>${item.description}</td>
                                <td>${item.qty}</td>
                                <td>${item.unit}</td>
                                <td>${item.rate.toFixed(2)}</td>
                                <td>${item.netAmount.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5" class="total">Total Net Amount:</td>
                            <td>Rs. ${totalBill.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }



    submitPurchaseButton.addEventListener('click', function (e) {
        e.preventDefault(); 

        const formData = {
            id: nextPurchaseId++, 
            date: document.getElementById('date').value,
            vendorInvoiceNo: document.getElementById('vendorInvoiceNo').value,
            purchaseOrderNo: document.getElementById('purchaseOrderNo').value,
            description: document.getElementById('description').value,
            vendorCode: document.getElementById('vendorCode').value,
            vendorName: document.getElementById('vendorName').value,
            vendorAddress: document.getElementById('vendorAddress').value,
            telephone: document.getElementById('telephone').value,
            termsOfPayment: document.getElementById('termsOfPayment').value,
            items: []
        };

        purchaseItemsTableBody.querySelectorAll('tr').forEach(row => {
            const item = {
                itemCode: row.querySelector('.item-code').value,
                description: row.querySelector('.item-description').value,
                qty: parseFloat(row.querySelector('.item-qty').value) || 0,
                unit: row.querySelector('.item-unit').value,
                rate: parseFloat(row.querySelector('.item-rate').value) || 0,
                netAmount: parseFloat(row.querySelector('.item-net-amount').value) || 0
            };
            formData.items.push(item);
        });

        if (formData.items.some(item => item.qty <= 0 || item.rate < 0 || !item.itemCode || item.description === 'Select Description')) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please ensure all purchase items have valid quantity, rate, item code, and a selected description.'
            });
            return; 
        }

        purchaseRecords.push(formData); 

        Swal.fire({
            icon: 'success',
            title: 'Purchase Added!',
            text: 'Your purchase has been successfully added to the list.'
        });

        purchaseForm.style.display = 'none';
        purchaseListContainer.style.display = 'block';
        listButton.textContent = 'Back to Form'; 

        renderPurchaseList(); 
        resetForm();
    });


    updatePurchaseButton.addEventListener('click', function () {
        if (currentMode !== 'edit' || editingRecordId === null) {
            Swal.fire('Error', 'No record is currently being edited.', 'error');
            return;
        }

        const recordIndex = purchaseRecords.findIndex(record => record.id === editingRecordId);
        if (recordIndex === -1) {
            Swal.fire('Error', 'Record not found for update.', 'error');
            return;
        }

        const updatedData = {
            id: editingRecordId, 
            date: document.getElementById('date').value,
            vendorInvoiceNo: document.getElementById('vendorInvoiceNo').value,
            purchaseOrderNo: document.getElementById('purchaseOrderNo').value,
            description: document.getElementById('description').value,
            vendorCode: document.getElementById('vendorCode').value,
            vendorName: document.getElementById('vendorName').value,
            vendorAddress: document.getElementById('vendorAddress').value,
            telephone: document.getElementById('telephone').value,
            termsOfPayment: document.getElementById('termsOfPayment').value,
            items: []
        };

        purchaseItemsTableBody.querySelectorAll('tr').forEach(row => {
            const item = {
                itemCode: row.querySelector('.item-code').value,
                description: row.querySelector('.item-description').value,
                qty: parseFloat(row.querySelector('.item-qty').value) || 0,
                unit: row.querySelector('.item-unit').value,
                rate: parseFloat(row.querySelector('.item-rate').value) || 0,
                netAmount: parseFloat(row.querySelector('.item-net-amount').value) || 0
            };
            updatedData.items.push(item);
        });

        if (updatedData.items.some(item => item.qty <= 0 || item.rate < 0 || !item.itemCode || item.description === 'Select Description')) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please ensure all purchase items have valid quantity, rate, item code, and a selected description.'
            });
            return;
        }

        purchaseRecords[recordIndex] = updatedData;

        Swal.fire({
            icon: 'success',
            title: 'Purchase Updated!',
            text: 'Your purchase has been successfully updated.'
        });

        purchaseForm.style.display = 'none';
        purchaseListContainer.style.display = 'block';
        listButton.textContent = 'Back to Form'; 

        renderPurchaseList(); 
        resetForm(); 
    });



    listButton.addEventListener('click', function () {
        if (purchaseForm.style.display !== 'none') {

            purchaseForm.style.display = 'none';
            purchaseListContainer.style.display = 'block';
            listButton.textContent = 'Back to Form';
            renderPurchaseList();
        } else {

            setFormMode('add'); 
        }
    });

    backToDashboardButton.addEventListener('click', function () {
        Swal.fire({
            title: 'Redirecting...',
            text: 'You will be taken back to the dashboard.',
            icon: 'info',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            // Example: window.location.href = 'dashboard.html';
        });
    });

    printFormButton.addEventListener('click', function () { 
        Swal.fire({
            title: 'Printing...',
            text: 'Opening print dialog for the current form view.',
            icon: 'info',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.print();
        });
    });

    confirmClearFormButton.addEventListener('click', function () {
        resetForm(); 

        Swal.fire({
            icon: 'success',
            title: 'Form Cleared!',
            text: 'All form fields have been reset.'
        });

        const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        if (confirmDeleteModal) {
            confirmDeleteModal.hide();
        }
    });



    const initialQty = parseFloat(purchaseItemsTableBody.querySelector('.item-qty').value) || 0;
    const initialRate = parseFloat(purchaseItemsTableBody.querySelector('.item-rate').value) || 0;
    purchaseItemsTableBody.querySelector('.item-net-amount').value = (initialQty * initialRate).toFixed(2);

    renderPurchaseList();

    setFormMode('add'); 
});