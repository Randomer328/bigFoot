function buildEnquiryDraft(input){
 const fields={};
 for(const key of ['name','email','organisation','topic','message'])fields[key]=String(input[key]||'').trim();
 if(!fields.name||!fields.message||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))throw new Error('Please enter your name, a valid email address and your requirements.');
 if(!['General','Cold storage','Warehousing','Dry storage','Handling & delivery'].includes(fields.topic))throw new Error('Please select an enquiry topic.');
 const recipient=fields.topic==='Dry storage'?'drystorage@bigfootindia.in':'coldstorage@bigfootindia.in';
 const subject=`Bigfoot India — ${fields.topic} enquiry`;
 const body=`Name: ${fields.name}\nEmail: ${fields.email}\n${fields.organisation?`Organisation: ${fields.organisation}\n`:''}Topic: ${fields.topic}\n\n${fields.message}`;
 return {recipient,subject,body,href:`mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
if(typeof module!=='undefined'&&module.exports)module.exports={buildEnquiryDraft};
