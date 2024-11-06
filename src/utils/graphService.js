const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const { parse } = require('csv-parse');
const fs = require('fs').promises;

function getGraphClient() {
    const credential = new ClientSecretCredential(
        process.env.TENANT_ID,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET
    );

    return Client.init({
        authProvider: async (done) => {
            try {
                const token = await credential.getToken([
                    'https://graph.microsoft.com/.default'
                ]);
                done(null, token.token);
            } catch (error) {
                done(error, null);
            }
        }
    });
}

async function processWorkItems(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
        parse(content, {
            columns: true,
            skip_empty_lines: true
        }, (err, records) => {
            if (err) reject(err);

            const workItemsByDate = records.reduce((acc, record) => {
                const date = new Date(record['Changed Date']).toISOString().split('T')[0];
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push({
                    id: record.ID,
                    title: record.Title
                });
                return acc;
            }, {});

            resolve(workItemsByDate);
        });
    });
}

async function updateTimesheet(workItemsByDate) {
    const graphClient = getGraphClient();
    
    try {
        // Format data for Excel
        const timesheetData = Object.entries(workItemsByDate).map(([date, items]) => ({
            'Date': date,
            'Time In': '12:00',
            'Time Out': '17:00',
            'Total': '5:00',
            'Deliverable': items.map(item => `#${item.id} - ${item.title}`).join('\n')
        }));

        // Update Excel file
        await graphClient
            .api(`/me/drive/items/${process.env.WORKBOOK_ID}/workbook/worksheets/${process.env.WORKSHEET_NAME}/range(address='A2:E${timesheetData.length + 1}')`)
            .patch({
                values: timesheetData.map(row => [
                    row.Date,
                    row['Time In'],
                    row['Time Out'],
                    row.Total,
                    row.Deliverable
                ])
            });

        return { success: true };
    } catch (error) {
        console.error('Error updating timesheet:', error);
        throw error;
    }
}

module.exports = {
    processWorkItems,
    updateTimesheet
};