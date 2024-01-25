# Readme

Crude tool for importing data.

Copy the `env.example` and rename as `.env`

Set your API key.

See `package.json` for tasks.

## Create Tickets

Accepts a CSV file containing customer and ticket information
Attempts to find customer
If customer does not exist, creates customer
Then creates ticket for each row per ticket

## Column headers

```
Created,Email,First name,Last name,Event Notes,Event Name,EventId,Ticket Type,TicketSkuId,Pay1,Pay2,Pay3,TicketStatus,Quantity,Payment Type,EDD Question?
```

### Columns that matter?

+ Email
+ First name
+ Last name
+ TicketSkuId
+ TicketStatus
+ Quantity

Everything else is ignored, but was useful when verifying the data before import.

## Example build output

```
Customer found for {email}
Ticket {id} created for {email} 

Success:  10
Not found:  0
Error:  0
Done in 2.44s.
```