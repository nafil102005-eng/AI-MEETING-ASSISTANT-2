// js/pdf.js

const PDFExport = {
    exportCurrentMeeting() {
        const title = document.getElementById('meetingTitle').innerText;
        
        // We will create a temporary container to format the PDF nicely
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.color = 'black';
        container.style.background = 'white';
        
        // Add Title
        const h1 = document.createElement('h1');
        h1.innerText = title;
        h1.style.borderBottom = '2px solid #ccc';
        h1.style.paddingBottom = '10px';
        container.appendChild(h1);

        // Add Date
        const dateStr = new Date().toLocaleString();
        const dateEl = document.createElement('p');
        dateEl.innerText = `Date: ${dateStr}`;
        dateEl.style.color = '#555';
        dateEl.style.marginBottom = '20px';
        container.appendChild(dateEl);

        // Helper to add sections
        const addSection = (heading, htmlContent) => {
            if (!htmlContent || htmlContent.trim() === '') return;
            const h2 = document.createElement('h2');
            h2.innerText = heading;
            h2.style.color = '#333';
            h2.style.marginTop = '20px';
            container.appendChild(h2);
            
            const contentDiv = document.createElement('div');
            contentDiv.innerHTML = htmlContent;
            contentDiv.style.fontSize = '14px';
            contentDiv.style.lineHeight = '1.5';
            container.appendChild(contentDiv);
        };

        // Get contents from DOM
        const transcriptText = document.getElementById('transcriptContent').innerText;
        const summaryHtml = document.getElementById('summaryContent').innerHTML;
        const pointsHtml = document.getElementById('pointsContent').innerHTML;
        const actionsHtml = document.getElementById('actionsContent').innerHTML;
        const decisionsHtml = document.getElementById('decisionsContent').innerHTML;

        addSection('Meeting Summary', summaryHtml);
        addSection('Key Discussion Points', pointsHtml);
        addSection('Action Items', actionsHtml);
        addSection('Important Decisions', decisionsHtml);
        
        // Add transcript as pre-formatted text
        const h2 = document.createElement('h2');
        h2.innerText = 'Full Transcript';
        h2.style.color = '#333';
        h2.style.marginTop = '20px';
        container.appendChild(h2);
        
        const transcriptPre = document.createElement('pre');
        transcriptPre.innerText = transcriptText;
        transcriptPre.style.whiteSpace = 'pre-wrap';
        transcriptPre.style.fontFamily = 'inherit';
        transcriptPre.style.fontSize = '12px';
        transcriptPre.style.color = '#444';
        transcriptPre.style.background = '#f9f9f9';
        transcriptPre.style.padding = '10px';
        transcriptPre.style.border = '1px solid #eee';
        container.appendChild(transcriptPre);

        // Settings for html2pdf
        const opt = {
            margin:       10,
            filename:     `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(container).save();
    }
};

window.PDFExport = PDFExport;
