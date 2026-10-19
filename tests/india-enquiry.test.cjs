const test=require('node:test');
const assert=require('node:assert/strict');
const {buildEnquiryDraft}=require('../india/enquiry.js');
const valid={name:'  Priya  ',email:'priya@example.com',organisation:'A & B',topic:'Cold storage',message:'Store produce & arrange delivery?'};
test('draft preserves and encodes enquiry details without sending',()=>{
 const draft=buildEnquiryDraft(valid);
 assert.equal(draft.recipient,'coldstorage@bigfootindia.in');
 const url=new URL(draft.href);
 assert.equal(url.searchParams.get('subject'),'Bigfoot India — Cold storage enquiry');
 assert.match(url.searchParams.get('body'),/Name: Priya\n/);
 assert.match(url.searchParams.get('body'),/Organisation: A & B/);
 assert.match(url.searchParams.get('body'),/Store produce & arrange delivery\?/);
});
test('explicit dry storage enquiries reach the published dry storage address',()=>assert.equal(buildEnquiryDraft({...valid,topic:'Dry storage'}).recipient,'drystorage@bigfootindia.in'));
test('rejects missing fields, invalid email, and unrecognised enquiry topics',()=>{
 for(const data of [{...valid,name:' '},{...valid,email:'bad'},{...valid,message:''},{...valid,topic:'attacker@example.com'}])assert.throws(()=>buildEnquiryDraft(data));
});

