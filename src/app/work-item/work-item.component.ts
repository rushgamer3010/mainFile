import { Component, OnInit } from '@angular/core';
import { WorkItemService } from '../work-item.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-work-item',
  templateUrl: './work-item.component.html',
  styleUrls: ['./work-item.component.css'],
})
export class WorkItemComponent implements OnInit {
  cosmicId: string = ''; // cosmicId entered by the user
  selectedWorkItem: any = null; // Store the selected work item
  workItems: any[] = []; // Array to hold all work items fetched from JSON
  showModal: boolean = false; // Flag to control modal display

  constructor(private workItemService: WorkItemService) {}

  ngOnInit() {
    // Fetch all work items when the component initializes
    this.workItemService.getAllWorkItems().subscribe((data) => {
      this.workItems = data.cosmicData; // Store the fetched cosmic data
    });
  }

  // Preview work item details based on entered cosmicId
  preview() {
    this.selectedWorkItem = this.workItemService.getDetailsByCosmicId(this.cosmicId, this.workItems);
    if (this.selectedWorkItem) {
      this.showModal = true; // Open the modal if work item found
    } else {
      alert('CosmicId not found!'); // Handle case if cosmicId is not found
    }
  }

  // Close the modal
  closeModal() {
    this.showModal = false;
  }

  // Function to draw borders around sections in PDF
  drawBorder(doc: jsPDF, startX: number, startY: number, endX: number, endY: number) {
    doc.setLineWidth(0.5);
    doc.rect(startX, startY, endX - startX, endY - startY); // Draw rectangle for border
  }

  // Function to check if a new page is needed
  checkPageOverflow(doc: jsPDF, startY: number) {
    const pageHeight = doc.internal.pageSize.height; // Get the height of the page
    if (startY + 10 > pageHeight) { // Check if adding 10 units exceeds the page height
      doc.addPage(); // Add a new page
      return 10; // Reset startY to a small margin
    }
    return startY; // Return the current startY if no new page is needed
  }

  // Download the selected data as a PDF using jsPDF
  downloadPDF() {
    const doc = new jsPDF();
    let startY = 10;

    // Title
    doc.setFontSize(16);
    doc.text('Details for Cosmic ID: ' + this.cosmicId, 10, startY);
    startY += 10;

    // Function to add spacing between sections
    const addSpacing = (spacing: number) => {
      startY += spacing;
    };

    // 1. Cosmic Work Item Table
    doc.setFontSize(12);
    doc.text('Cosmic Work Item:', 10, startY);
    startY += 10;
    const workItemDetails = [
      ['Item ID:', this.selectedWorkItem.cosmicId],
      ['Parent Case ID:', this.selectedWorkItem.parentCaseId],
      ['Sharing Category:', this.selectedWorkItem.summary[0].sharingCategory],
      ['Sending Bank:', this.selectedWorkItem.summary[0].sendingBank.label],
      ['Business Unit:', this.selectedWorkItem.businessUnit],
    ];
    this.addTable(doc, workItemDetails, startY);
    startY += (workItemDetails.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 2. Cosmic Case Item Details Table
    doc.setFontSize(12);
    doc.text('Cosmic Case Item Details:', 10, startY);
    startY += 10;
    const cosmicCaseDetails = [
      ['Item ID:', this.selectedWorkItem.cosmicId],
      ['Receiving Bank:', this.selectedWorkItem.summary[0].receivingBank.label],
      ['Focus Name:', this.selectedWorkItem.focusName],
      ['Red Flags Identified:', this.selectedWorkItem.summary[0].redFlags.length.toString()],
      ['Focus ID:', this.selectedWorkItem.focusIdentifier],
      ['Type of Risk:', this.selectedWorkItem.summary[0].redFlags[0].redFlagType],
      ['Business Unit:', this.selectedWorkItem.businessUnit],
      ['Sharing Category:', this.selectedWorkItem.summary[0].sharingCategory],
      ['Sending Bank:', this.selectedWorkItem.summary[0].sendingBank.label],
    ];
    this.addTable(doc, cosmicCaseDetails, startY);
    startY += (cosmicCaseDetails.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 3. Summary Information Table
    doc.setFontSize(12);
    doc.text('Summary:', 10, startY);
    startY += 10;
    const summaryDetails = [
      ['Type of Risk:', this.selectedWorkItem.summary[0].redFlags[0].redFlagType],
      ['Sharing Category:', this.selectedWorkItem.summary[0].sharingCategory],
      ['Red Flags Identified:', this.selectedWorkItem.summary[0].redFlags.length.toString()],
      ['Sending Bank:', this.selectedWorkItem.summary[0].sendingBank.label],
      ['Receiving Bank:', this.selectedWorkItem.summary[0].receivingBank.label],
      ['Existing Ticket Reason:', this.selectedWorkItem.summary[0].existingTicketReason],
    ];
    this.addTable(doc, summaryDetails, startY);
    startY += (summaryDetails.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 4. Red Flags Table
    doc.setFontSize(12);
    doc.text('List of Red Flags Identified:', 10, startY);
    startY += 10;
    this.addRedFlagsTable(doc, this.selectedWorkItem.summary[0].redFlags, startY);
    startY += (this.selectedWorkItem.summary[0].redFlags.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 5. Entity and Account Information Table
    doc.setFontSize(12);
    doc.text('Entity and Account Information:', 10, startY);
    startY += 10;
    const entityAccountDetails = [
      ['Category:', this.selectedWorkItem.entityInformation[0].category],
      ['Entity Type:', this.selectedWorkItem.entityInformation[0].type],
      ['Entity Name:', this.selectedWorkItem.entityInformation[0].name],
      ['Date of Birth/Incorporation:', this.selectedWorkItem.entityInformation[0].dateofBirthIncorporatedDate],
      ['Country of Incorporation:', this.selectedWorkItem.entityInformation[0].countryOfIncorporation],
      ['Corporate Registry Number:', this.selectedWorkItem.entityInformation[0].corporateRegistryNumber],
      ['Included in Alert:', this.selectedWorkItem.entityInformation[0].includedInAlert],
      ['Alert Justification:', this.selectedWorkItem.entityInformation[0].alertJustification],
    ];
    this.addTable(doc, entityAccountDetails, startY);
    startY += (entityAccountDetails.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 6. Nationality Table
    doc.setFontSize(12);
    doc.text('Nationality:', 10, startY);
    startY += 10;
    const nationalityDetails = [
      ['Country Code:', this.selectedWorkItem.entityInformation[0].countryOfIncorporation],
      ['Identification Type:', this.selectedWorkItem.entityInformation[0].alertJustification],
    ];
    this.addTable(doc, nationalityDetails, startY);
    startY += (nationalityDetails.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 7. Telephone Number Table
    doc.setFontSize(12);
    doc.text('Telephone Number:', 10, startY);
    startY += 10;
    const telephoneDetails = [
      ['Telephone Type:', this.selectedWorkItem.entityInformation[0].telephoneNumbers[0].telephoneType.label],
      ['Country Code:', this.selectedWorkItem.entityInformation[0].telephoneNumbers[0].countryCode],
      ['Area Code:', this.selectedWorkItem.entityInformation[0].telephoneNumbers[0].areaCode],
      ['Number:', this.selectedWorkItem.entityInformation[0].telephoneNumbers[0].number],
    ];
    this.addTable(doc, telephoneDetails, startY);
    startY += (telephoneDetails.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 8. Address Table
    doc.setFontSize(12);
    doc.text('Address:', 10, startY);
    startY += 10;
    const addressDetails = [
      ['Structured:', this.selectedWorkItem.entityInformation[0].addressess[0].isStructured],
      ['Address Type:', this.selectedWorkItem.entityInformation[0].addressess[0].addressType.label],
      ['Country Code:', this.selectedWorkItem.entityInformation[0].addressess[0].countryCode],
      ['Address Line 1:', this.selectedWorkItem.entityInformation[0].addressess[0].addressLine1],
      ['Address Line 2:', this.selectedWorkItem.entityInformation[0].addressess[0].addressLine2],
      ['Address Line 3:', this.selectedWorkItem.entityInformation[0].addressess[0].addressLine3],
      ['Address Line 4:', this.selectedWorkItem.entityInformation[0].addressess[0].addressLine4],
      ['Address Line 5:', this.selectedWorkItem.entityInformation[0].addressess[0].addressLine5],
    ];
    this.addTable(doc, addressDetails, startY);
    startY += (addressDetails.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 9. Entity Accounts Table
    doc.setFontSize(12);
    doc.text('Entity Accounts:', 10, startY);
    startY += 10;
    const entityAccountsDetails = [
      ['Account Number:', this.selectedWorkItem.accounts[0].accountNumber],
      ['Account Type:', this.selectedWorkItem.accounts[0].accountType.label],
      ['Account Open Date:', this.selectedWorkItem.accounts[0].accountOpenDate],
      ['Account Status:', this.selectedWorkItem.accounts[0].accountStatus.label],
    ];
    this.addTable(doc, entityAccountsDetails, startY);
    startY += (entityAccountsDetails.length + 1) * 7 + 10; // Update startY
    startY = this.checkPageOverflow(doc, startY); // Check for page overflow

    // Add spacing
    addSpacing(10);

    // 10. Transactions Table
    doc.setFontSize(12);
    doc.text('Transactions:', 10, startY);
    startY += 10;
    const transactionDetails = [
      ['Transaction Reference ID:', this.selectedWorkItem.transaction[0].transactionReferenceId],
      ['Transaction Date:', this.selectedWorkItem.transaction[0].transactionDate],
      ['Originator Name:', this.selectedWorkItem.transaction[0].originatorName],
      ['Originating Account No:', this.selectedWorkItem.transaction[0].originatingAccountNo],
      ['Originating Bank Code:', this.selectedWorkItem.transaction[0].originatingBankCode.label],
      ['Amount:', this.selectedWorkItem.transaction[0].amount],
      ['Currency Code:', this.selectedWorkItem.transaction[0].currencyCode.label],
      ['SGD-equivalent:', this.selectedWorkItem.transaction[0].sgdEquivalentAmount],
      ['Beneficiary Name:', this.selectedWorkItem.transaction[0].beneficiaryName],
      ['Beneficiary Account No:', this.selectedWorkItem.transaction[0].beneficiaryAccountNo],
      ['Beneficiary Bank Code:', this.selectedWorkItem.transaction[0].beneficiaryBankCode.label],
      ['Summary of Observation:', this.selectedWorkItem.summary[0].summaryDescription],
    ];
    this.addTable(doc, transactionDetails, startY);

    // Save the PDF with Cosmic ID in the filename
    doc.save(`Cosmic_${this.cosmicId}.pdf`);
  }

  // Function to add a custom table without using autoTable
  addTable(doc: jsPDF, data: any[], startY: number) {
    const rowHeight = 7;
    const startX = 10;
    const endX = 200; // Right edge of the page

    // Draw the border for the table
    this.drawBorder(doc, startX, startY, endX, startY + (data.length + 1) * rowHeight); // +1 for the header

    // Add header
    doc.setFontSize(10);
    doc.text(data[0][0], startX + 2, startY + 5); // Label
    doc.text(data[0][1], startX + 70, startY + 5); // Value

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      startY += rowHeight; // Move to the next row

      // Draw the border for the row
      this.drawBorder(doc, startX, startY, endX, startY + rowHeight);

      // Add the text
      doc.text(row[0], startX + 2, startY + 5); // Label
      doc.text(row[1], startX + 70, startY + 5); // Value
    }
  }

  // Function to add a red flags table
  addRedFlagsTable(doc: jsPDF, redFlags: any[], startY: number) {
    const rowHeight = 7;
    const startX = 10;
    const endX = 200; // Right edge of the page

    // Draw the header
    this.drawBorder(doc, startX, startY, endX, startY + rowHeight);
    doc.text('S No.', startX + 2, startY + 5);
    doc.text('Red Flag', startX + 30, startY + 5);
    startY += rowHeight;

    // Draw the border for the red flags table
    this.drawBorder(doc, startX, startY, endX, startY + (redFlags.length + 1) * rowHeight);

    // Loop through red flags and draw each row
    redFlags.forEach((redFlag, index) => {
      // Draw the border for the row
      this.drawBorder(doc, startX, startY, endX, startY + rowHeight);
      doc.text((index + 1).toString(), startX + 2, startY + 5); // S No.
      doc.text(redFlag.redFlag, startX + 30, startY + 5); // Red Flag Description
      startY += rowHeight; // Move to the next row
    });
  }
}
