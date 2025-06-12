document.addEventListener('DOMContentLoaded', function () {
    const purchaseForm = document.getElementById('purchaseForm');
    const addItemButton = document.getElementById('addItemButton');
    const purchaseItemsTableBody = document.querySelector('#purchaseItemsTable tbody');
    const termsOfPaymentSelect = document.getElementById('termsOfPayment');
    const newTermInput = document.getElementById('newTermInput');
    const addTermButton = document.getElementById('addTermButton');
    const listButton = document.getElementById('listButton');
    const backToDashboardButton = document.getElementById('backToDashboardButton');
    const printButton = document.getElementById('printButton');
    const confirmClearFormButton = document.getElementById('confirmClearFormButton'); // For the modal's confirm button

    const purchaseListContainer = document.getElementById('purchaseListContainer');
    const purchaseEntriesDiv = document.getElementById('purchaseEntries');
    const noEntriesMessage = document.getElementById('noEntriesMessage');

    // Array to store all submitted purchase records
    let purchaseRecords = [];
    let nextPurchaseId = 1; // Simple ID counter for records

    // Function to add a new row to the purchase items table
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
        updateNetTotals(); // Recalculate after adding a row
    });

    // Event delegation for deleting a row
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
                    updateNetTotals(); // Recalculate after deleting a row
                    Swal.fire(
                        'Deleted!',
                        'Your item has been deleted.',
                        'success'
                    );
                }
            });
        }
    });

    // Event delegation for calculating Net Amount per row
    purchaseItemsTableBody.addEventListener('input', function (event) {
        const target = event.target;
        if (target.classList.contains('item-qty') || target.classList.contains('item-rate')) {
            const row = target.closest('tr');
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
            const netAmount = qty * rate;
            row.querySelector('.item-net-amount').value = netAmount.toFixed(2);
            updateNetTotals(); // Recalculate overall total
        }
    });

    // Function to recalculate and display overall net total (optional, but good for continuous form)
    function updateNetTotals() {
        // This function would typically calculate and display a total for all items in the current form.
        // For example, if you had a <tfoot> or a separate div for totals.
        // For now, it just ensures individual row totals are updated.
    }


    // Add new term to Terms of Payment dropdown
    addTermButton.addEventListener('click', function () {
        const newTerm = newTermInput.value.trim();
        if (newTerm) {
            const newOption = document.createElement('option');
            newOption.value = newTerm;
            newOption.textContent = newTerm;
            termsOfPaymentSelect.appendChild(newOption);
            newTermInput.value = ''; // Clear input
            // Close the modal
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

    // Function to render the list of purchase records
    function renderPurchaseList() {
        purchaseEntriesDiv.innerHTML = ''; // Clear previous entries
        if (purchaseRecords.length === 0) {
            noEntriesMessage.style.display = 'block';
            purchaseEntriesDiv.appendChild(noEntriesMessage); // Ensure it's in the div
            return;
        } else {
            noEntriesMessage.style.display = 'none';
        }

        purchaseRecords.forEach(record => {
            const card = document.createElement('div');
            card.className = 'col-md-6 mb-4'; // Bootstrap grid column
            card.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header bg-light">
                        <strong>Purchase ID: ${record.id}</strong> - Date: ${record.date}
                        <button type="button" class="btn btn-sm btn-danger float-end delete-purchase-record" data-id="${record.id}">Delete</button>
                    </div>
                    <div class="card-body">
                        <p><strong>Vendor:</strong> ${record.vendorName} (${record.vendorCode})</p>
                        <p><strong>Invoice No:</strong> ${record.vendorInvoiceNo}</p>
                        <p><strong>PO No:</strong> ${record.purchaseOrderNo}</p>
                        <p><strong>Terms:</strong> ${record.termsOfPayment}</p>
                        <p><strong>Description (Overall):</strong> ${record.description || 'N/A'}</p>
                        <h6>Items:</h6>
                        <ul class="list-group list-group-flush">
                            ${record.items.map(item => `
                                <li class="list-group-item">
                                    ${item.description} (Code: ${item.itemCode}) - Qty: ${item.qty} ${item.unit} @ ${item.rate.toFixed(2)} = <strong>${item.netAmount.toFixed(2)}</strong>
                                </li>
                            `).join('')}
                        </ul>
                        <p class="mt-3"><strong>Total Net Amount:</strong> ${record.items.reduce((sum, item) => sum + item.netAmount, 0).toFixed(2)}</p>
                    </div>
                </div>
            `;
            purchaseEntriesDiv.appendChild(card);
        });

        // Add event listeners for new delete buttons on rendered cards
        document.querySelectorAll('.delete-purchase-record').forEach(button => {
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
                        renderPurchaseList(); // Re-render the list after deletion
                        Swal.fire(
                            'Deleted!',
                            'The purchase record has been deleted.',
                            'success'
                        );
                    }
                });
            });
        });
    }

    // Form submission handler
    purchaseForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission

        // Collect all the form data
        const formData = {
            id: nextPurchaseId++, // Assign a unique ID
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

        // Collect purchase items
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

        // Basic validation for items
        if (formData.items.some(item => item.qty <= 0 || item.rate < 0 || !item.itemCode || item.description === 'Select Description')) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please ensure all purchase items have valid quantity, rate, item code, and a selected description.'
            });
            return; // Stop submission
        }

        purchaseRecords.push(formData); // Add the new purchase to our records array

        Swal.fire({
            icon: 'success',
            title: 'Purchase Added!',
            text: 'Your purchase has been successfully added to the list.'
        });

        renderPurchaseList(); // Re-render the list to show the new entry
        purchaseForm.reset(); // Reset the form fields for a new entry
        // Reset table to initial single row
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
        // Recalculate initial row's net amount
        const initialQty = parseFloat(purchaseItemsTableBody.querySelector('.item-qty').value) || 0;
        const initialRate = parseFloat(purchaseItemsTableBody.querySelector('.item-rate').value) || 0;
        purchaseItemsTableBody.querySelector('.item-net-amount').value = (initialQty * initialRate).toFixed(2);
        
        // After submission, show the list and hide the form
        purchaseForm.style.display = 'none';
        purchaseListContainer.style.display = 'block';
        listButton.textContent = 'Back to Form'; // Update button text
    });

    // Button functionalities

    // Toggle between form and list view
    listButton.addEventListener('click', function () {
        if (purchaseForm.style.display !== 'none') {
            // Currently showing form, switch to list
            purchaseForm.style.display = 'none';
            purchaseListContainer.style.display = 'block';
            listButton.textContent = 'Back to Form';
            renderPurchaseList(); // Ensure list is up-to-date when switching
        } else {
            // Currently showing list, switch to form
            purchaseForm.style.display = 'block';
            purchaseListContainer.style.display = 'none';
            listButton.textContent = 'View List';
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

    printButton.addEventListener('click', function () {
        Swal.fire({
            title: 'Printing...',
            text: 'Opening print dialog for the current view.',
            icon: 'info',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.print(); // Triggers the browser's print dialog
        });
    });

    // Event listener for the "Confirm Clear Form" button inside the modal
    confirmClearFormButton.addEventListener('click', function () {
        purchaseForm.reset(); // Resets all form fields
        // Clear dynamically added table rows, keeping only the initial one
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
        // Reset the initial row's net amount
        const initialQty = parseFloat(purchaseItemsTableBody.querySelector('.item-qty').value) || 0;
        const initialRate = parseFloat(purchaseItemsTableBody.querySelector('.item-rate').value) || 0;
        purchaseItemsTableBody.querySelector('.item-net-amount').value = (initialQty * initialRate).toFixed(2);

        Swal.fire({
            icon: 'success',
            title: 'Form Cleared!',
            text: 'All form fields have been reset.'
        });

        // Close the confirmation modal after clearing the form
        const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        if (confirmDeleteModal) {
            confirmDeleteModal.hide();
        }
    });

    // Initialize the first row's net amount calculation on page load
    const initialQty = parseFloat(purchaseItemsTableBody.querySelector('.item-qty').value) || 0;
    const initialRate = parseFloat(purchaseItemsTableBody.querySelector('.item-rate').value) || 0;
    purchaseItemsTableBody.querySelector('.item-net-amount').value = (initialQty * initialRate).toFixed(2);

    // Initial render of the list (will show "No entries yet")
    renderPurchaseList();
});