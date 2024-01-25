import * as fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import https from 'https';

require('dotenv').config();

/**
 * Disable only in development mode
 */
if (process.env.NODE_ENV === 'development') {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  })
  axios.defaults.httpsAgent = httpsAgent;
  // eslint-disable-next-line no-console
  console.log(process.env.NODE_ENV, `RejectUnauthorized is disabled.`)
}
axios.defaults.headers.common.Authorization = process.env.API_KEY;

type CsvRow = {
  Created: string;
  Email: string,
  ["First name"]: string, 
  ["Last name"]: string, 
  ["Event notes"]: string, 
  ["Event name"]: string, 
  ["EventId"]: string, 
  ["Ticket Type"]: string, 
  ["TicketSkuId"]: string, 
  ["Pay 1"]: string, 
  ["Pay 2"]: string, 
  ["Pay 3"]: string, 
  TicketStatus: string, 
  ["Quantity"]: string, 
  ["PaymentType"]: string,
  ["EDD Questions"]: string, 
}

const apiUrl = process.env.API_URL || "https://localhost:7265";

/**
 * Create Tickets
 * @param csvFilePath 
 */
const createTickets = async (csvFilePath: string) => {
  const rows: CsvRow[] = [];
  
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      rows.push(row);
    })
    .on('end', async () => {

      let successCount = 0;
      let errorCount = 0;
      let notFoundCount = 0;

      // Loop over CSV rows
      for (const profile of rows) {
        const { Created, Email, ["First name"]: FirstName, ["Last name"]: LastName, EventId, TicketSkuId, ["TicketStatus"]: TicketStatus, Quantity } = profile;
        if (!Email) return;
        try {
          const { data: customers, ...rest } = await axios.get(`${apiUrl}/customers?Email=${encodeURIComponent(Email)}`);
          let customerId;
          if (customers && customers?.length === 0) {
            // create a new customer
            const customer = { email: Email, firstName: FirstName, lastName: LastName };
            const { data: newCustomer } = await axios.post(`${apiUrl}/customers`, customer);
            customerId = newCustomer.id;
            console.log(`Customer created for ${Email}`);
          } 
          else {
            customerId = customers[0].id;
            console.log(`Customer found for ${Email}`);
          }
          if (customerId) {
            const ticket = {
              customer: {
                id: customerId,
              },
              ticketSku: {
                id: TicketSkuId,
              },
              status: TicketStatus,
            };

            for (let i = 0; i < Number.parseInt(Quantity); i++) {
              const { data: newTicket } = await axios.post(`${apiUrl}/tickets`, ticket);
              console.log(`Ticket ${newTicket.id} created for ${Email} (${customerId})`);
            };

            successCount++;
          } else {
            console.log(`Ticket not created for ${Email}, ${customerId}`);
            notFoundCount++;
          }
        } catch (error) {
          console.error(`Error creating ticket for ${Email}: ${error}`);
          errorCount++;
        }
      }

      console.log("\n")
      console.log("Success: ", successCount);
      console.log("Not found: ", notFoundCount);
      console.log("Error: ", errorCount);
    });


};

// Specify the path to your CSV file
const csvFilePath = process.env.CSV_PATH || "";

// Run the updateKlaviyoProfiles function
createTickets(csvFilePath);