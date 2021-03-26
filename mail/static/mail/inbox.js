document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //create new email
  document.querySelector('#sendNewMail').addEventListener('click', send_new_mail);

});



function send_new_mail() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  // perform basic validation before POST to prescreen simple errors
  // this could be moved to views.py to centralize the logic. 
  var completeSend = true
  if (subject.length === 0) {
      if (confirm('Send without a subject?')){
        completeSend = true
      } else {
        completeSend = false
      }
  } else if (body.length === 0) {
      if (confirm('Send a blank email?')){
        completeSend = true
      } else {
        completeSend = false
      }
  }
 
  // Send mail if valid
  if (completeSend) {
    fetch('/emails', {
      method: 'POST', 
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(data => {     
      if (Object.keys(data) == 'error'){
        alert(Object.values(data))
      } else {
        load_mailbox('sent')
      }
    })
    .catch(err => alert(err))
  } 
}


function compose_email(email) {
// code based on stack overflow at 
// https://stackoverflow.com/questions/48653543/hasownproperty-with-more-than-one-property
var props = ['recipients', 'subject', 'body', 'timestamp'];
var hasAllProps = props.every(prop => email.hasOwnProperty(prop));

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if (hasAllProps){
    document.querySelector('#compose-recipients').value = email.sender;

    //populate subject line
    if( email.subject.includes('Re: ')){
      var reply_subject = email.subject
    } else {
      var reply_subject = `Re: ${email.subject}`
    }
    document.querySelector('#compose-subject').value = reply_subject;

    //populate body
    document.querySelector('#compose-body').value = 
`

------------ 
On ${email.timestamp}  ${email.sender} wrote:

${email.body}`;
  }
}

// document.querySelector('#single-email-view').innerHTML = 
// `<strong>From</strong>: ${email.sender} 
// </br> 
// <strong>To</strong>: ${email.recipients}
// </br>
// <strong>Subject</strong>: ${email.subject}
// </br>
// <strong>Timestamp</strong>: ${email.timestamp}
// </br>
// <hr>
// </br>
// ${email.body}`;



function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Get the data
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails=>{
    console.log(emails)
    if (emails.length === 0) {
      document.querySelector('#emails-view').innerHTML += 'No email found.';
    }
    emails.forEach(add_email_to_view);
  });
}

function add_email_to_view(email){

  const row = document.createElement('div');
  row.classList.add('email-entry');
  

  if (email.read === true) {
    row.classList.add('email-read');
}

  row.innerHTML = `${email.id} <span class='email-sender'>${email.sender}</span>  <span class='email-subject'>${email.subject}</span>  <span class='email-timestamp'>${email.timestamp}</span>`;

  //On email click
  row.addEventListener('click', function() {
    // get the current mailbox name
    const current_mailbox = document.querySelector('h3').innerHTML
    single_email_view(email.id, current_mailbox);  
  });

  document.querySelector('#emails-view').append(row);
}

function single_email_view(id, current_mailbox){
  // Show the single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
    
  //Get the data
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email=>{
    display_email(email)
    add_buttons(email, current_mailbox)
    update_tags(id, 'read');
  })
}

function update_tags(id, tag){
  // This function will update the metadata tag
  // associated with an email.
  var key = ''
  var value = ''
  if (tag === 'read'){
    key = 'read'
    value = true
  } else if (tag === 'archive'){
    key = 'archived'
    value = true
  } else if (tag === 'unarchive'){
    key = 'archived'
    value = false
  } 

  fetch(`emails/${id}`,   
    {method: 'PUT',
    body:  `{"${key}":${value}}`
    }) 
  }

function display_email(email){
  document.querySelector('#single-email-view').innerHTML = 
  `<strong>From</strong>: ${email.sender} 
  </br> 
  <strong>To</strong>: ${email.recipients}
  </br>
  <strong>Subject</strong>: ${email.subject}
  </br>
  <strong>Timestamp</strong>: ${email.timestamp}
  </br>
  <hr>
  </br>
  ${email.body}`;
}

function add_buttons(email, current_mailbox) {
  //reply button
  const reply_button = document.createElement('button'); 
  reply_button.id = 'reply-button';
  reply_button.innerHTML='Reply'; 
  reply_button.addEventListener('click', function() {
      console.log('Reply button clicked')
    });

  //inital state of Archive or unarchive button
  console.log(current_mailbox)
  const archive_toggle = document.createElement('button'); 
  archive_toggle.id = 'archive-toggle';
  if (email.archived === true){
    archive_toggle.innerHTML='Unarchive'
  } else {
    archive_toggle.innerHTML='Archive'
  } 
  
  //Append to screen
  document.querySelector('#single-email-view').append(reply_button);
  if (current_mailbox != 'Sent'){
    document.querySelector('#single-email-view').append(archive_toggle);
  } 

  // Handle archive click
  archive_toggle.addEventListener('click', function() {
      //update button text      
      var archive_state = document.getElementById('archive-toggle').innerHTML;
      if (archive_state==='Unarchive'){
        new_state = 'Archive'
        update_tags(email.id, 'unarchive');
      } else {
        new_state = 'Unarchive'
        update_tags(email.id, 'archive');
      }
      //load inbox
      // NOT refershing the data acuratly
      load_mailbox('inbox');
    });

    // Handle reply click
    reply_button.addEventListener('click', function() {
      //load compose
      compose_email(email);
    });

}

