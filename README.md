# Purchase Form Application 📝🛍️

This is a simple, single-page Purchase Form application built with HTML, CSS, and JavaScript. It allows users to input purchase details, add multiple items, manage terms of payment, and view a continuous list of submitted purchases. The application uses Bootstrap 5 for styling and SweetAlert2 for enhanced user feedback.

## Features ✨

* **Responsive Form Layout:** 📱 Built with Bootstrap for a clean and responsive design.
* **Dynamic Item Addition:** ➕ Users can add multiple purchase items to a table within the form.
* **Automatic Net Amount Calculation:** 셈️ Calculates the net amount for each item based on quantity and rate.
* **Dynamic Terms of Payment:** 📆 An "Add" button next to "Terms of Payment" allows users to add new terms via a modal, which are then added to the dropdown.
* **Continuous Form View:** 📄➡️📄 Submitted purchases are rendered as a list of "cards" directly on the same page, providing a continuous view of entries.
* **Toggle Form/List View:** 🔄 A "View List" / "Back to Form" button allows switching between the purchase entry form and the list of submitted purchases.
* **Confirmation Modals:** ✅❌ Uses SweetAlert2 for beautiful and interactive alerts and confirmations for actions like deleting items or clearing the form.
* **Print Functionality:** 🖨️ A "Print" button triggers the browser's print dialog for the current view.
* **Clear Form:** 🧹 A "Clear Form" button (with confirmation) resets all fields in the current purchase form.
* **Delete Individual Purchase Records:** 🗑️ Each submitted purchase record in the list has a "Delete" button with a confirmation prompt.
* **Poppins Font:** ✍️ Modern and clean typography using Google Fonts.

## Technologies Used 🛠️

* **HTML5:** 🌐 Structure of the web page.
* **CSS3:** 🎨 Custom styling (`purchaseForm.css`).
* **JavaScript (ES6+):** 🧠 All interactive functionality (`purchaseForm.js`).
* **Bootstrap 5:** 🚀 CSS framework for responsive design, form elements, table styling, and modals.
* **Bootstrap Icons:** 🖌️ For various icons used in buttons.
* **SweetAlert2:** ✨ For custom, attractive alert and confirmation dialogs.
* **Google Fonts (Poppins):** 🔠 For custom typography.

## File Structure 📁
Ah, I see! You're asking for the file structure to be provided in a **code block that *looks* like a file system tree**, rather than just listing the files.

My apologies for the previous confusion. I understand now that you want the visual representation of the file structure.

Here's the file structure for your Purchase Form application, presented in a format that resembles a directory tree:

```
.
├── purchaseForm.html
├── purchaseForm.css
├── purchaseForm.js
└── README.md
```

## How to Run ▶️

1.  **Clone or Download:** ⬇️ Download or clone this repository to your local machine.
2.  **Open `purchaseForm.html`:** 💻 Simply open the `purchaseForm.html` file in your web browser.

No server environment is required to run this application, as all operations are client-side (in-browser JavaScript).

## Usage Guide 📋

1.  **Fill the Form:** 🖊️ Enter the purchase details in the respective fields.
2.  **Add Items:** ➕ Use the "Add Item" button to add rows to the purchase items table. Fill in "Item Code", "Description", "Qty", "Unit", and "Rate". The "Net Amount" will be calculated automatically.
3.  **Add Terms of Payment:** ➕📆 Click the "Add" button next to "Terms of Payment" to add new terms via the modal. These will appear in the dropdown.
4.  **Submit Purchase:** ✅ Click "Submit Purchase" to add the current form's data to the continuous list below. The form will reset, and the list will update.
5.  **View List:** ➡️📜 Click the "View List" button (top right) to toggle between the input form and the list of submitted purchases.
6.  **Clear Form:** 🧹 Click "Clear Form" at the bottom to reset all current form fields (a confirmation modal will appear).
7.  **Print:** 🖨️ Click "Print" to open your browser's print dialog for the current view.
8.  **Back to Dashboard:** 🏠 Click "Back to Dashboard" (placeholder functionality) to simulate navigation.
9.  **Delete Records:** 🗑️ Click the "Delete" button next to any submitted purchase record in the list to remove it (with confirmation).
```
