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


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none'
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

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
    single_email_view(email.id);  
  });

  document.querySelector('#emails-view').append(row);
}

function single_email_view(id){
  // Show the single email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
    
  //Get the data
  fetch(`emails/${id}`)
  .then(response => response.json())
  .then(email=>{
    add_buttons(email)
  })
}

function add_buttons(email) {
  //reply button
  const reply_button = document.createElement('button'); 
  reply_button.innerHTML='Reply'; 
  reply_button.addEventListener('click', function() {
      console.log('Reply button clicked')
    });

  //Archive or unarchive button
  const archive_toggle = document.createElement('button'); 
  if (email.archived === true){
    archive_toggle.innerHTML='Unarchive'
  } else {
    archive_toggle.innerHTML='Archive'
  } 
  
  archive_toggle.addEventListener('click', function() {
      console.log('Archive/Unarchive button clicked')
    });

  document.querySelector('#single-email-view').append(reply_button);
  document.querySelector('#single-email-view').append(archive_toggle); 
}
